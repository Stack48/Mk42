// DAS2 EDI generator — EDIFACT TD/Bilatéral (DGFiP)
// Ref: Cahier technique DAPD (Déclaration Annuelle Paiements à Des tiers)
// Nature BC = Commissions, courtages, ristournes

export interface BeneficiaireDAS2 {
  id: string;
  type: "pro" | "particulier";
  nomOuRS: string;
  siret?: string;
  dateNaissance?: string; // JJMMAAAA
  lieuNaissance?: string;
  adresse?: string;
  montantBrutAnnuel: number; // en euros, arrondi à l'entier
  reference: string;
}

interface GenerateOptions {
  expediteurSiret: string;
  expediteurNom: string;
}

// EDIFACT segment separator and terminators
const SEG_TERM = "'";
const ELEM_SEP = "+";
const COMP_SEP = ":";

function seg(...parts: string[]): string {
  return parts.join(ELEM_SEP) + SEG_TERM + "\n";
}

function formatMontant(euros: number): string {
  return Math.round(euros).toString();
}

// Pad or truncate a string to exact length (EDIFACT positional fields)
function fixLen(value: string, length: number, padChar = " "): string {
  if (value.length > length) return value.slice(0, length);
  return value.padEnd(length, padChar);
}

export function generateDAS2EDI(
  beneficiaires: BeneficiaireDAS2[],
  annee: number,
  opts: GenerateOptions
): string {
  if (beneficiaires.length === 0) {
    throw new Error("Aucun bénéficiaire fourni pour la DAS2");
  }

  const dateGeneration = new Date();
  const dateStr = dateGeneration
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ""); // YYYYMMDD
  const timeStr = dateGeneration.toISOString().slice(11, 16).replace(":", ""); // HHMM
  const interchangeRef = `DAS2-${annee}-${dateStr}`;

  let lines = "";
  let segmentCount = 0;

  // UNA — Service String Advice (fixed 9-char header defining delimiters)
  // UNA:+.? '
  lines += "UNA:+.? '\n";

  // UNB — Interchange Control Header
  // UNB+UNOC:3+{sender}:{qualifier}+{receiver}:{qualifier}+{date}:{time}+{ref}++++1'
  lines += seg(
    "UNB",
    `UNOC${COMP_SEP}3`,
    `${opts.expediteurSiret}${COMP_SEP}14`, // 14 = SIRET qualifier
    `DGFIP${COMP_SEP}ZZZ`,
    `${dateStr}${COMP_SEP}${timeStr}`,
    interchangeRef,
    "",
    "",
    "",
    process.env.NODE_ENV === 'production' ? "0" : "1"
  );
  segmentCount++;

  // UNH — Message Header
  const messageRef = `MSG-${annee}-001`;
  lines += seg(
    "UNH",
    messageRef,
    `DAPD${COMP_SEP}D${COMP_SEP}96A${COMP_SEP}UN`
  );
  segmentCount++;

  // BGM — Beginning of Message (DAPD = Déclaration annuelle paiements à des tiers)
  lines += seg("BGM", "DAPD", `DAS2-${annee}`, "9");
  segmentCount++;

  // DTM — Date of message + period
  lines += seg("DTM", `137${COMP_SEP}${dateStr}${COMP_SEP}102`); // 102 = CCYYMMDD
  segmentCount++;
  lines += seg("DTM", `194${COMP_SEP}${annee}${COMP_SEP}804`); // 804 = CCYY (année déclarée)
  segmentCount++;

  // NAD — Déclarant (émetteur)
  lines += seg(
    "NAD",
    "MS", // Message Sender
    `${opts.expediteurSiret}${COMP_SEP}${COMP_SEP}14`,
    "",
    fixLen(opts.expediteurNom, 35).trimEnd()
  );
  segmentCount++;

  // Loop bénéficiaires
  for (const b of beneficiaires) {
    // NAD — Bénéficiaire
    if (b.type === "pro" && b.siret) {
      lines += seg(
        "NAD",
        "BEN",
        `${b.siret}${COMP_SEP}${COMP_SEP}14`,
        "",
        fixLen(b.nomOuRS, 35).trimEnd(),
        b.adresse ? fixLen(b.adresse, 35).trimEnd() : ""
      );
    } else {
      // Particulier — identified by name + date/lieu naissance
      lines += seg(
        "NAD",
        "BEN",
        "",
        "",
        fixLen(b.nomOuRS, 35).trimEnd(),
        b.adresse ? fixLen(b.adresse, 35).trimEnd() : ""
      );
      if (b.dateNaissance) {
        lines += seg("DTM", `329${COMP_SEP}${b.dateNaissance}${COMP_SEP}102`);
        segmentCount++;
      }
      if (b.lieuNaissance) {
        // LOC — place of birth
        lines += seg("LOC", "178", b.lieuNaissance);
        segmentCount++;
      }
    }
    segmentCount++;

    // MOA — Montant brut déclaré (nature BC = Commissions/courtages)
    lines += seg(
      "MOA",
      `BC${COMP_SEP}${formatMontant(b.montantBrutAnnuel)}${COMP_SEP}EUR`
    );
    segmentCount++;
  }

  // UNT — Message Trailer
  segmentCount++; // count UNT itself
  lines += seg("UNT", segmentCount.toString(), messageRef);

  // UNZ — Interchange Control Trailer
  lines += seg("UNZ", "1", interchangeRef);

  // Encode UTF-8 without BOM (Buffer.from with 'utf8' never adds BOM)
  return Buffer.from(lines, "utf8").toString("utf8");
}
