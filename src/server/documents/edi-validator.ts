import type { BeneficiaireDAS2 } from "./edi-generator";

export interface ValidationError {
  type: "syntax" | "semantic" | "encoding";
  message: string;
  segment?: string;
  line?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export function validateDAS2EDI(
  ediContent: string,
  beneficiaires: BeneficiaireDAS2[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // ── Encoding ──────────────────────────────────────────────────────────────

  // UTF-8 without BOM: BOM = 0xEF 0xBB 0xBF = ﻿ at start
  if (ediContent.charCodeAt(0) === 0xfeff) {
    errors.push({
      type: "encoding",
      message: "Fichier contient un BOM UTF-8 (U+FEFF) — rejeté par le serveur DGFiP",
    });
  }

  // ── Syntax — envelope structure ───────────────────────────────────────────

  const lines = ediContent.split("\n").map((l) => l.trim()).filter(Boolean);

  const hasUNA = lines.some((l) => l.startsWith("UNA"));
  const hasUNB = lines.some((l) => l.startsWith("UNB+"));
  const hasUNZ = lines.some((l) => l.startsWith("UNZ+"));
  const hasUNH = lines.some((l) => l.startsWith("UNH+"));
  const hasUNT = lines.some((l) => l.startsWith("UNT+"));
  const hasBGM = lines.some((l) => l.startsWith("BGM+"));

  if (!hasUNA) {
    errors.push({ type: "syntax", message: "Segment UNA manquant (Service String Advice)" });
  }
  if (!hasUNB) {
    errors.push({ type: "syntax", message: "Segment UNB manquant (Interchange Header)" });
  }
  if (!hasUNZ) {
    errors.push({ type: "syntax", message: "Segment UNZ manquant (Interchange Trailer)" });
  }
  if (!hasUNH) {
    errors.push({ type: "syntax", message: "Segment UNH manquant (Message Header)" });
  }
  if (!hasUNT) {
    errors.push({ type: "syntax", message: "Segment UNT manquant (Message Trailer)" });
  }
  if (!hasBGM) {
    errors.push({ type: "syntax", message: "Segment BGM manquant (Beginning of Message)" });
  }

  // UNB/UNZ reference coherence
  const unbLine = lines.find((l) => l.startsWith("UNB+"));
  const unzLine = lines.find((l) => l.startsWith("UNZ+"));
  if (unbLine && unzLine) {
    const unbRef = unbLine.split("+")[5] ?? "";
    const unzRef = unzLine.split("+")[2]?.replace("'", "") ?? "";
    if (unbRef && unzRef && unbRef !== unzRef) {
      errors.push({
        type: "syntax",
        message: `Référence UNB/UNZ incohérente : UNB="${unbRef}" vs UNZ="${unzRef}"`,
        segment: "UNZ",
      });
    }
  }

  // UNT segment count coherence
  const untLine = lines.find((l) => l.startsWith("UNT+"));
  if (untLine) {
    const declared = parseInt(untLine.split("+")[1] ?? "0", 10);
    // Count segments between UNH and UNT inclusive
    const unhIdx = lines.findIndex((l) => l.startsWith("UNH+"));
    const untIdx = lines.findIndex((l) => l.startsWith("UNT+"));
    if (unhIdx !== -1 && untIdx !== -1) {
      const actual = untIdx - unhIdx + 1;
      if (declared !== actual) {
        warnings.push(
          `UNT segment count déclaré=${declared} mais compté=${actual} (peut varier selon parser)`
        );
      }
    }
  }

  // ── Semantic — règles métier ──────────────────────────────────────────────

  // Unicité des identifiants bénéficiaires
  const ids = beneficiaires.map((b) => b.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    errors.push({
      type: "semantic",
      message: "Identifiants bénéficiaires en doublon détectés",
    });
  }

  for (const b of beneficiaires) {
    const label = `Bénéficiaire "${b.nomOuRS}" (id=${b.id})`;

    // Montant > 0
    if (b.montantBrutAnnuel <= 0) {
      errors.push({
        type: "semantic",
        message: `${label} : montant doit être > 0 (reçu ${b.montantBrutAnnuel})`,
      });
    }

    // Montant plafond raisonnable
    if (b.montantBrutAnnuel > 999_999_999) {
      errors.push({
        type: "semantic",
        message: `${label} : montant dépasse le plafond de 999 999 999 €`,
      });
    }

    // Seuil DAS2 600€
    if (b.montantBrutAnnuel < 600) {
      warnings.push(
        `${label} : montant ${b.montantBrutAnnuel} € < 600 € — déclaration non obligatoire mais incluse`
      );
    }

    if (b.type === "pro") {
      // SIRET = exactement 14 chiffres
      if (!b.siret) {
        errors.push({
          type: "semantic",
          message: `${label} (pro) : SIRET manquant`,
        });
      } else if (!/^\d{14}$/.test(b.siret.replace(/\s/g, ""))) {
        errors.push({
          type: "semantic",
          message: `${label} (pro) : SIRET "${b.siret}" invalide — doit être 14 chiffres`,
        });
      }
    } else {
      // Particulier — date + lieu naissance requis
      if (!b.dateNaissance) {
        errors.push({
          type: "semantic",
          message: `${label} (particulier) : dateNaissance manquante`,
        });
      } else {
        // Format JJMMAAAA : jour 01-31, mois 01-12
        const match = b.dateNaissance.match(/^(\d{2})(\d{2})(\d{4})$/);
        if (!match) {
          errors.push({
            type: "semantic",
            message: `${label} : dateNaissance "${b.dateNaissance}" doit être au format JJMMAAAA`,
          });
        } else {
          const [, jj, mm] = match;
          const jour = parseInt(jj, 10);
          const mois = parseInt(mm, 10);
          if (jour < 1 || jour > 31) {
            errors.push({
              type: "semantic",
              message: `${label} : jour naissance ${jj} invalide (01–31)`,
            });
          }
          if (mois < 1 || mois > 12) {
            errors.push({
              type: "semantic",
              message: `${label} : mois naissance ${mm} invalide (01–12)`,
            });
          }
        }
      }

      if (!b.lieuNaissance) {
        errors.push({
          type: "semantic",
          message: `${label} (particulier) : lieuNaissance manquant`,
        });
      }
    }
  }

  // Présence d'au moins un MOA BC dans le fichier EDI
  const hasMOA = lines.some((l) => l.startsWith("MOA+BC"));
  if (beneficiaires.length > 0 && !hasMOA) {
    errors.push({
      type: "semantic",
      message: "Aucun segment MOA BC trouvé dans le fichier — montants absents",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
