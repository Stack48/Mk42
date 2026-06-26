"use server";
// ↑ Toutes les fonctions de ce fichier s'exécutent UNIQUEMENT sur le serveur.
// Elles peuvent accéder à Prisma, au système de fichiers, aux secrets d'env.
// Les Client Components les importent et les appellent comme des fonctions normales,
// mais Next.js intercepte l'appel et l'envoie au serveur via une requête HTTP interne.
//
// Analogie Symfony : ce fichier = un Controller + Service combinés.
// Les fonctions = des "endpoints" implicites, sans avoir à définir des routes.

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage/storage.factory";
import { generateContratPDF } from "@/lib/pdf/contrat.generator";
import { isContratTransitionValide } from "@/lib/contrat.utils";
import type { ContratStatut } from "@/types/contrat.types";

// ─── FONCTION PRIVÉE : LOG D'ACCÈS ───────────────────────────────────────────
// Crée une entrée dans ContratAccessLog.
// "Privée" = non exportée, utilisée uniquement dans ce fichier.
// Chaque action importante sur un contrat est loggée ici (audit trail immuable).
async function logAction(
  contratId: string,
  action: "GENERATED" | "LINK_OPENED" | "SIGNED_UPLOADED" | "VALIDATED" | "REJECTED",
  userId?: string | null,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await prisma.contratAccessLog.create({
    data: {
      contratId,
      action,
      userId: userId ?? null,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
}

// ─── ACTION 1 : Générer le contrat PDF ───────────────────────────────────────
/**
 * Génère le PDF du contrat, le chiffre et le sauvegarde.
 * Crée l'entrée Contrat en base avec statut DRAFT.
 *
 * Pourquoi PAS de transaction Prisma ici ?
 * La génération PDF et le stockage sont des opérations externes à la DB.
 * Une transaction Prisma ne couvre que les opérations Prisma (SQL).
 * Si le PDF génère bien mais que le stockage échoue, on catche l'erreur
 * et on ne crée pas l'entrée DB → cohérence assurée par le try/catch.
 * Pour une cohérence parfaite (ex: rollback du fichier si la DB échoue),
 * il faudrait un pattern "saga" ou un système de compensation — hors scope ici.
 */
export async function generateContrat(
  dealId: string,
  adminId: string
): Promise<{ success: boolean; contratId?: string; error?: string }> {
  try {
    // 1. Récupérer le deal avec sa commission et son apporteur
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        commission: {
          include: { apporteur: true },
        },
      },
    });

    if (!deal) {
      return { success: false, error: "Deal introuvable." };
    }

    if (!deal.commission || !deal.commission.apporteur) {
      return {
        success: false,
        error: "Ce deal n'a pas encore de commission associée.",
      };
    }

    const apporteur = deal.commission.apporteur;
    const taux = deal.commission.taux;

    // 2. Générer un token unique et sécurisé (64 caractères hex = 256 bits d'entropie)
    // randomBytes de Node.js crypto = cryptographiquement sûr (pas Math.random !)
    const token = randomBytes(32).toString("hex");

    // 3. Le token expire dans 72 heures
    const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // 4. Construire le numéro de contrat : CTR-YYYY-NNN
    const now = new Date();
    const annee = now.getFullYear();
    const count = await prisma.contrat.count({
      where: { createdAt: { gte: new Date(`${annee}-01-01`) } },
    });
    const numeroContrat = `CTR-${annee}-${String(count + 1).padStart(3, "0")}`;

    // 5. Préparer les données du template
    const templateData = {
      entrepriseNom: "OPUS BTP SAS",
      entrepriseSiret: "123 456 789 00010",
      apporteurNom: apporteur.nom,
      apporteurEmail: apporteur.email,
      dealTitre: deal.titre,
      dealMontant: deal.montant,
      tauxCommission: taux,
      dateGeneration: now.toISOString().split("T")[0],
      numeroContrat,
    };

    // 6. Générer le PDF → Buffer
    const pdfBuffer = await generateContratPDF(templateData);

    // 7. Sauvegarder le fichier via le service de stockage (local ou S3)
    const storage = getStorage();
    const filename = `contrat-${numeroContrat}-${token.slice(0, 8)}.pdf`;
    const fileOriginalPath = await storage.save(filename, pdfBuffer);

    // 8. Créer l'entrée Contrat en base (statut DRAFT)
    const contrat = await prisma.contrat.create({
      data: {
        token,
        tokenExpiresAt,
        statut: "DRAFT",
        // templateData est stocké en JSON pour régénérer le PDF à la demande
        templateData: templateData as object,
        fileOriginalPath,
        deal: { connect: { id: dealId } },
        apporteur: { connect: { id: apporteur.id } },
      },
    });

    // 9. Logger l'action GENERATED
    await logAction(contrat.id, "GENERATED", adminId);

    // 10. Invalider le cache de la page /contrats
    revalidatePath("/contrats");

    return { success: true, contratId: contrat.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 2 : Envoyer le lien à l'apporteur ────────────────────────────────
/**
 * Passe le contrat de DRAFT à SENT et simule l'envoi d'email.
 * (L'envoi réel d'email nécessiterait Resend, Nodemailer, etc. — hors scope)
 */
export async function sendContratLink(
  contratId: string,
  adminId: string
): Promise<{ success: boolean; linkUrl?: string; error?: string }> {
  try {
    const contrat = await prisma.contrat.findUnique({ where: { id: contratId } });

    if (!contrat) return { success: false, error: "Contrat introuvable." };

    // Vérifier que la transition DRAFT → SENT est autorisée
    if (!isContratTransitionValide(contrat.statut as ContratStatut, "SENT")) {
      return {
        success: false,
        error: `Transition interdite : ${contrat.statut} → SENT`,
      };
    }

    // Mettre à jour le statut en SENT
    await prisma.contrat.update({
      where: { id: contratId },
      data: { statut: "SENT" },
    });

    // Construire l'URL du lien de signature
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const linkUrl = `${baseUrl}/contrats/signer/${contrat.token}`;

    // Simulation de l'envoi d'email — en production, utiliser Resend ou Nodemailer
    console.log("📧 [SIMULATION] Lien de signature envoyé à l'apporteur :");
    console.log(`   URL : ${linkUrl}`);
    console.log(`   Expire le : ${contrat.tokenExpiresAt.toLocaleString("fr-FR")}`);

    revalidatePath("/contrats");

    return { success: true, linkUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 3 : Upload du contrat signé (route publique) ─────────────────────
/**
 * Reçoit le fichier signé de l'apporteur via son token.
 * Cette action est appelée depuis la route API /api/contrats/signer.
 * L'apporteur n'est pas connecté → userId = null dans le log.
 */
export async function uploadSignedContrat(
  token: string,
  fileBuffer: Buffer,
  filename: string,
  ip?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Trouver le contrat par son token
    const contrat = await prisma.contrat.findUnique({ where: { token } });

    if (!contrat) {
      return { success: false, error: "Lien invalide ou expiré." };
    }

    // 2. Vérifier que le token n'est pas expiré
    if (new Date() > contrat.tokenExpiresAt) {
      return { success: false, error: "Ce lien de signature a expiré. Contactez l'entreprise." };
    }

    // 3. Vérifier la transition SENT → UPLOADED
    if (!isContratTransitionValide(contrat.statut as ContratStatut, "UPLOADED")) {
      return {
        success: false,
        error: `Statut actuel incompatible : ${contrat.statut}`,
      };
    }

    // 4. Sauvegarder le fichier signé
    const storage = getStorage();
    const signedFilename = `signe-${filename}`;
    const fileSignedPath = await storage.save(signedFilename, fileBuffer);

    // 5. Mettre à jour le contrat
    await prisma.contrat.update({
      where: { id: contrat.id },
      data: {
        statut: "UPLOADED",
        fileSignedPath,
      },
    });

    // 6. Logger l'action (userId = null car apporteur non connecté)
    await logAction(contrat.id, "SIGNED_UPLOADED", null, ip, userAgent);

    revalidatePath("/contrats");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 4 : Valider le contrat ───────────────────────────────────────────
export async function validateContrat(
  contratId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const contrat = await prisma.contrat.findUnique({ where: { id: contratId } });

    if (!contrat) return { success: false, error: "Contrat introuvable." };

    if (!isContratTransitionValide(contrat.statut as ContratStatut, "VALIDATED")) {
      return {
        success: false,
        error: `Transition interdite : ${contrat.statut} → VALIDATED. Le contrat doit être au statut UPLOADED.`,
      };
    }

    await prisma.contrat.update({
      where: { id: contratId },
      data: {
        statut: "VALIDATED",
        validatedAt: new Date(),
        validatedBy: adminId,
      },
    });

    await logAction(contratId, "VALIDATED", adminId);

    revalidatePath("/contrats");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 5 : Rejeter le contrat ───────────────────────────────────────────
export async function rejectContrat(
  contratId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const contrat = await prisma.contrat.findUnique({ where: { id: contratId } });

    if (!contrat) return { success: false, error: "Contrat introuvable." };

    if (!isContratTransitionValide(contrat.statut as ContratStatut, "REJECTED")) {
      return {
        success: false,
        error: `Transition interdite : ${contrat.statut} → REJECTED. Le contrat doit être au statut UPLOADED.`,
      };
    }

    await prisma.contrat.update({
      where: { id: contratId },
      data: {
        statut: "REJECTED",
        rejectedReason: reason,
      },
    });

    await logAction(contratId, "REJECTED", adminId);

    revalidatePath("/contrats");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── REQUÊTES (lecture seule) ─────────────────────────────────────────────────

/** Tous les contrats avec leurs relations (pour la vue admin). */
export async function getContrats(filtreStatut?: ContratStatut) {
  return prisma.contrat.findMany({
    where: filtreStatut ? { statut: filtreStatut } : undefined,
    include: {
      deal: true,
      apporteur: true,
      accessLogs: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Contrats d'un deal spécifique. */
export async function getContratsByDeal(dealId: string) {
  return prisma.contrat.findMany({
    where: { dealId },
    include: {
      deal: true,
      apporteur: true,
      accessLogs: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Contrats d'un apporteur spécifique. */
export async function getContratsByApporteur(apporteurId: string) {
  return prisma.contrat.findMany({
    where: { apporteurId },
    include: {
      deal: true,
      apporteur: true,
      accessLogs: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Contrat par token (page publique de signature). */
export async function getContratByToken(token: string) {
  return prisma.contrat.findUnique({
    where: { token },
    include: {
      deal: true,
      apporteur: true,
    },
  });
}

/** Contrat par ID avec toutes les relations (page détail admin). */
export async function getContratById(id: string) {
  return prisma.contrat.findUnique({
    where: { id },
    include: {
      deal: true,
      apporteur: true,
      accessLogs: { orderBy: { createdAt: "asc" } },
    },
  });
}
