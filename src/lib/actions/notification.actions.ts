"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email/notification.email";
import type { Notification, NotificationType } from "@/types/notification.types";

// ─── ACTION 1 : Créer une notification ───────────────────────────────────────
// Appelée depuis commission.actions.ts et client.actions.ts après chaque événement métier.
// Crée l'entrée en DB ET simule l'envoi email en une seule opération.
export async function createNotification(
  userId: string,
  type: NotificationType,
  titre: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // Vérifier que l'apporteur existe avant de créer la notification
    const apporteur = await prisma.apporteur.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nom: true },
    });
    if (!apporteur) return { success: false, error: "Apporteur introuvable." };

    const notification = await prisma.notification.create({
      data: {
        type,
        titre,
        message,
        lu: false,
        metadata: metadata ?? null,
        apporteur: { connect: { id: userId } },
      },
    });

    // Simuler l'envoi email (console.log en dev, Resend en prod)
    await sendNotificationEmail({
      email:     apporteur.email,
      nom:       apporteur.nom,
      type,
      titre,
      message,
    });

    revalidatePath("/notifications");
    return { success: true, notificationId: notification.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 2 : Toutes les notifications d'un utilisateur ────────────────────
// Non lues en premier, puis par date décroissante.
export async function getNotifications(userId: string): Promise<Notification[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: [
      { lu: "asc" },          // false (non lues) avant true (lues)
      { createdAt: "desc" },
    ],
  });
  return rows as unknown as Notification[];
}

// ─── ACTION 3 : Marquer une notification comme lue ───────────────────────────
export async function markAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data:  { lu: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 4 : Tout marquer comme lu ────────────────────────────────────────
// updateMany = UPDATE ... WHERE userId = X  (une seule requête SQL)
export async function markAllAsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.notification.updateMany({
      where: { userId, lu: false },
      data:  { lu: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: msg };
  }
}

// ─── ACTION 5 : Nombre de notifications non lues (pour le badge) ─────────────
// count() = SELECT COUNT(*) — très rapide, aucune donnée inutile chargée.
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, lu: false },
  });
}
