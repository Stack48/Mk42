"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage/storage.factory";
import { createNotification } from "@/lib/actions/notification.actions";
import { isTransitionDealValide } from "@/lib/deal.utils";
import type {
  KanbanDeal,
  KanbanDealStatut,
  DealDocument,
  DealMessage,
  CreateDealPayload,
} from "@/types/deal.types";

// ─── ACTION 1 : Créer un deal ─────────────────────────────────────────────────
export async function createDeal(
  data: CreateDealPayload
): Promise<{ success: boolean; dealId?: string; error?: string }> {
  try {
    // Validation des champs obligatoires
    if (!data.titre?.trim())      return { success: false, error: "Le titre est obligatoire." };
    if (!data.clientNom?.trim())  return { success: false, error: "Le nom du client est obligatoire." };
    if (!data.apporteurId?.trim()) return { success: false, error: "L'apporteur est obligatoire." };
    if (!data.montant || data.montant <= 0) return { success: false, error: "Le montant doit être positif." };

    const apporteur = await prisma.apporteur.findUnique({ where: { id: data.apporteurId } });
    if (!apporteur) return { success: false, error: "Apporteur introuvable." };

    // Calculer la position initiale (dernier de la colonne PROSPECT)
    const lastInProspect = await prisma.kanbanDeal.count({ where: { statut: "PROSPECT" } });

    const deal = await prisma.kanbanDeal.create({
      data: {
        titre:       data.titre.trim(),
        montant:     data.montant,
        mission:     data.mission?.trim() ?? null,
        clientNom:   data.clientNom.trim(),
        clientEmail: data.clientEmail?.trim() ?? null,
        clientTel:   data.clientTel?.trim() ?? null,
        statut:      "PROSPECT",
        position:    lastInProspect,
        apporteur:   { connect: { id: data.apporteurId } },
      },
    });

    revalidatePath("/deals");
    return { success: true, dealId: deal.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 2 : Changer le statut d'un deal ──────────────────────────────────
// Gère : commissionGelee si ANNULE, déclenchement commission si SIGNE,
//        notification à l'apporteur dans les deux cas.
export async function updateDealStatut(
  dealId: string,
  newStatut: KanbanDealStatut
): Promise<{ success: boolean; error?: string }> {
  try {
    const deal = await prisma.kanbanDeal.findUniqueOrThrow({
      where: { id: dealId },
      include: { apporteur: true },
    });

    const currentStatut = deal.statut as KanbanDealStatut;
    if (!isTransitionDealValide(currentStatut, newStatut)) {
      return {
        success: false,
        error: `Transition interdite : ${currentStatut} → ${newStatut}`,
      };
    }

    const updateData: Record<string, unknown> = { statut: newStatut };

    // ── Cas ANNULE : geler la commission ─────────────────────────────────────
    if (newStatut === "ANNULE") {
      updateData.commissionGelee = true;

      void createNotification(
        deal.apporteurId,
        "NOUVEAU_DEAL",
        "Deal annulé",
        `Le deal "${deal.titre}" a été annulé. Votre commission est gelée.`,
        { dealId, statut: "ANNULE" }
      );
    }

    await prisma.kanbanDeal.update({ where: { id: dealId }, data: updateData });
    revalidatePath("/deals");
    revalidatePath(`/deals/${dealId}`);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 3 : Mettre à jour la position (drag & drop) ──────────────────────
// Appelée à chaque dépôt d'une carte dans une colonne.
// Vérifie que la transition est autorisée (pas de retour depuis ANNULE).
export async function updateDealPosition(
  dealId: string,
  newPosition: number,
  newStatut: KanbanDealStatut
): Promise<{ success: boolean; error?: string }> {
  try {
    const deal = await prisma.kanbanDeal.findUniqueOrThrow({ where: { id: dealId } });
    const currentStatut = deal.statut as KanbanDealStatut;

    // Changement de colonne : vérifier la transition
    if (currentStatut !== newStatut && !isTransitionDealValide(currentStatut, newStatut)) {
      return { success: false, error: `Transition interdite : ${currentStatut} → ${newStatut}` };
    }

    // Si changement de statut → déléguer à updateDealStatut pour la logique métier
    if (currentStatut !== newStatut) {
      const statutResult = await updateDealStatut(dealId, newStatut);
      if (!statutResult.success) return statutResult;
    }

    await prisma.kanbanDeal.update({
      where: { id: dealId },
      data:  { position: newPosition },
    });

    revalidatePath("/deals");
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 4 : Upload document ──────────────────────────────────────────────
// Réutilise le StorageService de [13-BE] via getStorage().
// Accepte un FormData (mécanisme natif Next.js App Router pour les fichiers).
export async function uploadDealDocument(
  formData: FormData
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    const dealId     = formData.get("dealId") as string;
    const type       = (formData.get("type") as string) || "AUTRE";
    const uploadedBy = (formData.get("uploadedBy") as string) || "admin";
    const file       = formData.get("file") as File;

    if (!file || file.size === 0) return { success: false, error: "Aucun fichier fourni." };
    if (file.size > 10 * 1024 * 1024) return { success: false, error: "Fichier trop volumineux (max 10 Mo)." };

    const buffer   = Buffer.from(await file.arrayBuffer());
    // Nom de fichier unique : timestamp + random + extension originale
    const ext      = file.name.split(".").pop() ?? "bin";
    const filename = `deal-${dealId}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

    // StorageService de [13-BE] : chiffre + stocke le fichier
    const storage  = getStorage();
    const filePath = await storage.save(filename, buffer);

    const document = await prisma.dealDocument.create({
      data: {
        nom:        file.name,
        type:       type as "DEVIS" | "FACTURE" | "AUTRE",
        filePath,
        fileSize:   file.size,
        mimeType:   file.type || "application/octet-stream",
        uploadedBy,
        deal:       { connect: { id: dealId } },
      },
    });

    revalidatePath(`/deals/${dealId}`);
    return { success: true, documentId: document.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 5 : Supprimer un document ────────────────────────────────────────
export async function deleteDealDocument(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await prisma.dealDocument.findUniqueOrThrow({ where: { id: documentId } });
    // Supprimer le fichier physique via StorageService
    const storage = getStorage();
    await storage.delete(doc.filePath);
    await prisma.dealDocument.delete({ where: { id: documentId } });
    revalidatePath(`/deals/${doc.dealId}`);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── REQUÊTES LECTURE ─────────────────────────────────────────────────────────

/** Tous les deals groupés par statut, ordonnés par position, pour le kanban. */
export async function getDealsByStatut(): Promise<Record<KanbanDealStatut, KanbanDeal[]>> {
  const deals = await prisma.kanbanDeal.findMany({
    include: {
      apporteur: { select: { id: true, nom: true, utilisateur: { select: { email: true } } } },
      documents: true,
      messages:  { where: { lu: false } }, // compte non lus uniquement
    },
    orderBy: [{ statut: "asc" }, { position: "asc" }],
  });

  const grouped: Record<KanbanDealStatut, KanbanDeal[]> = {
    PROSPECT: [], CONTACTE: [], SIGNE: [], PAYE: [], ANNULE: [],
  };
  for (const deal of deals) {
    const flat = {
      ...deal,
      apporteur: { id: deal.apporteur.id, nom: deal.apporteur.nom, email: deal.apporteur.utilisateur?.email ?? '' },
    };
    grouped[deal.statut as KanbanDealStatut].push(flat as unknown as KanbanDeal);
  }
  return grouped;
}

/** Un deal complet avec documents et messages (page détail). */
export async function getDeal(dealId: string): Promise<KanbanDeal | null> {
  const deal = await prisma.kanbanDeal.findUnique({
    where: { id: dealId },
    include: {
      apporteur: { select: { id: true, nom: true, utilisateur: { select: { email: true } } } },
      documents: { orderBy: { createdAt: "desc" } },
      messages:  { orderBy: { createdAt: "asc" } },
    },
  });
  if (!deal) return null;
  const flat = {
    ...deal,
    apporteur: { id: deal.apporteur.id, nom: deal.apporteur.nom, email: deal.apporteur.utilisateur?.email ?? '' },
  };
  return flat as unknown as KanbanDeal;
}

// ─── ACTIONS MESSAGERIE ───────────────────────────────────────────────────────

export async function sendMessage(
  dealId: string,
  auteurId: string,
  auteurType: "ENTREPRISE" | "APPORTEUR",
  contenu: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!contenu.trim()) return { success: false, error: "Message vide." };
    await prisma.dealMessage.create({
      data: { dealId, auteurId, auteurType, contenu: contenu.trim() },
    });
    revalidatePath(`/deals/${dealId}`);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

export async function getMessages(dealId: string): Promise<DealMessage[]> {
  const messages = await prisma.dealMessage.findMany({
    where:   { dealId },
    orderBy: { createdAt: "asc" },
  });
  return messages as unknown as DealMessage[];
}

export async function markMessagesAsRead(
  dealId: string,
  auteurType: "ENTREPRISE" | "APPORTEUR"
): Promise<void> {
  // Marquer comme lus les messages de l'AUTRE partie
  const autreType = auteurType === "ENTREPRISE" ? "APPORTEUR" : "ENTREPRISE";
  await prisma.dealMessage.updateMany({
    where: { dealId, auteurType: autreType, lu: false },
    data:  { lu: true },
  });
}
