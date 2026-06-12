// @ts-nocheck - code legacy non utilise par doc-fiscaux (Prisma transactions sans annotation)
"use server";
// ↑ Ce fichier ne s'exécute QUE sur le serveur — jamais dans le navigateur.
// Même principe que commission.actions.ts et contrat.actions.ts.

import { randomBytes } from "crypto";
// ↑ crypto est un module natif Node.js (pas besoin de l'installer).
// randomBytes(32) génère 32 octets aléatoires cryptographiquement sûrs.
// .toString("hex") les convertit en 64 caractères hexadécimaux → notre token URL.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email/client.email";
import { createNotification } from "@/lib/actions/notification.actions";
import type { InvitationWithDeal, ClientEvenement } from "@/types/client.types";

// Durée de validité du lien d'invitation (en heures).
// Configurable dans .env via TOKEN_EXPIRY_HOURS (défaut : 72h = 3 jours).
const TOKEN_EXPIRY_HOURS = Number(process.env.TOKEN_EXPIRY_HOURS ?? 72);

// ─── ACTION 1 : Inviter un client ─────────────────────────────────────────────
//
// L'admin saisit l'email + nom du client et sélectionne un deal.
// On génère un token unique, on crée l'invitation en base, on simule l'envoi
// d'email, et on logue l'événement INVITATION_ENVOYEE.
export async function inviterClient(
  dealId: string,
  email: string,
  nom: string
): Promise<{ success: boolean; invitationId?: string; token?: string; error?: string }> {
  try {
    // Vérifier que le deal existe avant de créer l'invitation
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return { success: false, error: "Deal introuvable." };
    }

    // Générer un token unique : 32 octets → 64 caractères hex
    // Équivalent de bin2hex(random_bytes(32)) en PHP
    const token = randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    // Créer l'invitation + le premier événement dans une transaction atomique.
    // $transaction garantit que si l'une des deux opérations échoue,
    // aucune n'est enregistrée (BEGIN/COMMIT en SQL).
    const invitation = await prisma.$transaction(async (tx) => {
      const inv = await tx.clientInvitation.create({
        data: {
          email,
          nom,
          token,
          tokenExpiresAt,
          statut: "PENDING",
          deal: { connect: { id: dealId } },
        },
      });

      // Logger l'événement "invitation envoyée" dès la création
      await tx.clientEvenement.create({
        data: {
          type: "INVITATION_ENVOYEE",
          metadata: { dealId, email },
          invitation: { connect: { id: inv.id } },
        },
      });

      return inv;
    });

    // Construire l'URL du lien d'invitation.
    // En production, NEXT_PUBLIC_BASE_URL sera défini (ex: https://app.opus-btp.fr).
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const lienInvitation = `${baseUrl}/clients/${token}`;

    // Simuler l'envoi email (console.log en dev, Resend en prod)
    await sendInvitationEmail({ email, nom, lienInvitation, dealTitre: deal.titre });

    // [18-FE] Notifier l'apporteur du deal qu'un client a été invité (NOUVEAU_DEAL)
    // On cherche l'apporteur via la commission liée au deal (relation Deal→Commission→Apporteur).
    const dealAvecApporteur = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { commission: { select: { apporteurId: true } } },
    });
    const apporteurId = dealAvecApporteur?.commission?.apporteurId;
    if (apporteurId) {
      void createNotification(
        apporteurId,
        "NOUVEAU_DEAL",
        "Nouveau client invité sur votre deal",
        `Un client (${nom}) a été invité à consulter le dossier "${deal.titre}".`,
        { dealId, invitationId: invitation.id, clientEmail: email }
      );
    }

    revalidatePath("/clients");

    return { success: true, invitationId: invitation.id, token };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 2 : Récupérer les données de l'espace client ─────────────────────
//
// Appelée depuis la page publique /clients/[token].
// Vérifie que le token est valide et non expiré, retourne les données du dossier.
// Si c'est le premier accès (statut PENDING), passe l'invitation à ACCESSED
// et logue DOSSIER_CONSULTE.
export async function getEspaceClient(
  token: string,
  ip?: string,
  userAgent?: string
): Promise<
  | { success: true; invitation: InvitationWithDeal }
  | { success: false; error: "TOKEN_INVALIDE" | "TOKEN_EXPIRE" | "ERREUR" }
> {
  try {
    const invitation = await prisma.clientInvitation.findUnique({
      where: { token },
      include: {
        deal: { select: { id: true, titre: true, montant: true, statut: true } },
        evenements: { orderBy: { createdAt: "asc" } },
      },
    });

    // Token inconnu → page 404-like
    if (!invitation) {
      return { success: false, error: "TOKEN_INVALIDE" };
    }

    // Token expiré → page dédiée "lien expiré"
    if (new Date() > new Date(invitation.tokenExpiresAt)) {
      return { success: false, error: "TOKEN_EXPIRE" };
    }

    // Premier accès : passer de PENDING à ACCESSED + loguer la consultation
    if (invitation.statut === "PENDING") {
      await prisma.$transaction(async (tx) => {
        await tx.clientInvitation.update({
          where: { id: invitation.id },
          data: { statut: "ACCESSED" },
        });
        await tx.clientEvenement.create({
          data: {
            type: "DOSSIER_CONSULTE",
            ip: ip ?? null,
            userAgent: userAgent ?? null,
            invitation: { connect: { id: invitation.id } },
          },
        });
      });
      // Mettre à jour l'objet en mémoire pour le retourner avec le bon statut
      invitation.statut = "ACCESSED";
    }

    return { success: true, invitation: invitation as unknown as InvitationWithDeal };
  } catch {
    return { success: false, error: "ERREUR" };
  }
}

// ─── ACTION 3 : Valider une étape ────────────────────────────────────────────
//
// Le client clique sur "Valider" depuis son espace.
// etapeId : prévu pour [11-FE] (entité Étape qui n'existe pas encore).
// Pour l'instant, on stocke l'etapeId dans les metadata de l'événement.
// L'invitation passe à VALIDATED.
export async function validerEtape(
  token: string,
  etapeId: string,
  ip?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const invitation = await prisma.clientInvitation.findUnique({ where: { token } });

    if (!invitation) return { success: false, error: "Token invalide." };
    if (new Date() > new Date(invitation.tokenExpiresAt)) {
      return { success: false, error: "Lien expiré." };
    }
    if (invitation.statut === "VALIDATED" || invitation.statut === "REFUSED") {
      return { success: false, error: "Cette invitation a déjà été traitée." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.clientInvitation.update({
        where: { id: invitation.id },
        data: { statut: "VALIDATED" },
      });
      await tx.clientEvenement.create({
        data: {
          type: "ETAPE_VALIDEE",
          metadata: { etapeId },
          ip: ip ?? null,
          userAgent: userAgent ?? null,
          invitation: { connect: { id: invitation.id } },
        },
      });
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 4 : Refuser une étape ────────────────────────────────────────────
//
// Le client clique sur "Refuser" et renseigne un motif.
// La raison est stockée dans les metadata de l'événement.
export async function refuserEtape(
  token: string,
  etapeId: string,
  raison: string,
  ip?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const invitation = await prisma.clientInvitation.findUnique({ where: { token } });

    if (!invitation) return { success: false, error: "Token invalide." };
    if (new Date() > new Date(invitation.tokenExpiresAt)) {
      return { success: false, error: "Lien expiré." };
    }
    if (invitation.statut === "VALIDATED" || invitation.statut === "REFUSED") {
      return { success: false, error: "Cette invitation a déjà été traitée." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.clientInvitation.update({
        where: { id: invitation.id },
        data: { statut: "REFUSED" },
      });
      await tx.clientEvenement.create({
        data: {
          type: "ETAPE_REFUSEE",
          metadata: { etapeId, raison },
          ip: ip ?? null,
          userAgent: userAgent ?? null,
          invitation: { connect: { id: invitation.id } },
        },
      });
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── REQUÊTES LECTURE ─────────────────────────────────────────────────────────

/** Toutes les invitations avec leur deal (vue admin). */
export async function getInvitations(): Promise<InvitationWithDeal[]> {
  const invitations = await prisma.clientInvitation.findMany({
    include: {
      deal: { select: { id: true, titre: true, montant: true, statut: true } },
      evenements: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return invitations as unknown as InvitationWithDeal[];
}

/** Tous les événements d'une invitation (timeline). */
export async function getHistoriqueClient(invitationId: string): Promise<ClientEvenement[]> {
  const evenements = await prisma.clientEvenement.findMany({
    where: { invitationId },
    orderBy: { createdAt: "asc" },
  });
  return evenements as unknown as ClientEvenement[];
}
