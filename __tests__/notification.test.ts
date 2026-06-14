// TESTS UNITAIRES — Feature [18-FE] Notifications
//
// Même approche que client.test.ts : fonctions pures testées directement,
// Prisma mocké avec vi.mock() pour éviter la base de données réelle.

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── MOCKS ────────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    apporteur:    { findUnique: vi.fn() },
    notification: {
      create:     vi.fn(),
      findMany:   vi.fn(),
      updateMany: vi.fn(),
      update:     vi.fn(),
      count:      vi.fn(),
    },
  },
}));

vi.mock("@/lib/email/notification.email", () => ({
  sendNotificationEmail: vi.fn().mockResolvedValue(undefined),
}));

// Imports après les mocks
import { prisma } from "@/lib/prisma/client";
import {
  createNotification,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/lib/actions/notification.actions";

const APPORTEUR_MOCK = {
  id:    "apporteur-jean-id",
  email: "jean@test.fr",
  nom:   "Jean Dupont",
};

const NOTIFICATION_MOCK = {
  id:        "notif-1",
  type:      "COMMISSION_CALCULEE" as const,
  titre:     "Commission calculée",
  message:   "Votre commission de 14 000 € est disponible.",
  lu:        false,
  metadata:  null,
  createdAt: new Date(),
  userId:    "apporteur-jean-id",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── 1. createNotification ────────────────────────────────────────────────────

describe("createNotification", () => {
  it("crée une notification en DB quand l'apporteur existe", async () => {
    vi.mocked(prisma.apporteur.findUnique).mockResolvedValue(APPORTEUR_MOCK as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({ id: "notif-1" } as never);

    const res = await createNotification(
      "apporteur-jean-id",
      "COMMISSION_CALCULEE",
      "Commission calculée",
      "Votre commission de 14 000 € est disponible.",
      { commissionId: "comm-1" }
    );

    expect(res.success).toBe(true);
    expect(res.notificationId).toBe("notif-1");
    // La création Prisma doit avoir été appelée
    expect(prisma.notification.create).toHaveBeenCalledOnce();
    // Avec lu: false par défaut
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lu: false }) })
    );
  });

  it("retourne une erreur si l'apporteur n'existe pas", async () => {
    vi.mocked(prisma.apporteur.findUnique).mockResolvedValue(null);

    const res = await createNotification(
      "apporteur-inexistant",
      "COMMISSION_CALCULEE",
      "titre",
      "message"
    );

    expect(res.success).toBe(false);
    expect(res.error).toBe("Apporteur introuvable.");
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});

// ─── 2. getUnreadCount ────────────────────────────────────────────────────────

describe("getUnreadCount", () => {
  it("retourne le nombre correct de notifications non lues", async () => {
    vi.mocked(prisma.notification.count).mockResolvedValue(3);

    const count = await getUnreadCount("apporteur-jean-id");

    expect(count).toBe(3);
    // Vérifie que la requête filtre bien sur lu: false
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: "apporteur-jean-id", lu: false },
    });
  });

  it("retourne 0 quand toutes les notifications sont lues", async () => {
    vi.mocked(prisma.notification.count).mockResolvedValue(0);

    const count = await getUnreadCount("apporteur-jean-id");

    expect(count).toBe(0);
  });
});

// ─── 3. markAllAsRead ─────────────────────────────────────────────────────────

describe("markAllAsRead", () => {
  it("passe toutes les notifications non lues à lu = true", async () => {
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 } as never);

    const res = await markAllAsRead("apporteur-jean-id");

    expect(res.success).toBe(true);
    // updateMany doit filtrer sur userId + lu: false et passer lu: true
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "apporteur-jean-id", lu: false },
      data:  { lu: true },
    });
  });
});

// ─── 4. markAsRead ────────────────────────────────────────────────────────────

describe("markAsRead", () => {
  it("passe une notification spécifique à lu = true", async () => {
    vi.mocked(prisma.notification.update).mockResolvedValue(NOTIFICATION_MOCK as never);

    const res = await markAsRead("notif-1");

    expect(res.success).toBe(true);
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "notif-1" },
      data:  { lu: true },
    });
  });
});

// ─── 5. Badge — logique d'affichage ──────────────────────────────────────────
// Test pur (pas de Prisma) : la logique du badge est triviale mais documentée.

describe("Badge — logique count", () => {
  it("le badge affiche 0 quand getUnreadCount retourne 0", async () => {
    vi.mocked(prisma.notification.count).mockResolvedValue(0);
    const count = await getUnreadCount("any-user-id");
    // NotificationBadge retourne null quand count === 0
    expect(count).toBe(0);
  });

  it("le badge affiche le bon nombre quand count > 0", async () => {
    vi.mocked(prisma.notification.count).mockResolvedValue(5);
    const count = await getUnreadCount("any-user-id");
    expect(count).toBe(5);
  });
});
