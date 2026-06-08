"use client";
// CENTRE DE NOTIFICATIONS — dropdown qui s'ouvre au clic sur la cloche.
// useTransition pour appeler les Server Actions sans bloquer l'UI.
// useRouter pour la redirection après clic sur une notification.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
// ↑ useRouter (App Router) = navigation programmatique côté client.
// Équivalent de window.location.href = "..." mais sans rechargement de page.

import { markAsRead, markAllAsRead } from "@/lib/actions/notification.actions";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/types/notification.types";

interface Props {
  notifications: Notification[];
  userId: string;
  onClose: () => void;
}

// Destination selon le type de notification — vers quelle page rediriger
function getRedirectUrl(notification: Notification): string {
  const meta = notification.metadata ?? {};
  switch (notification.type) {
    case "NOUVEAU_DEAL":
      return meta.dealId ? `/clients` : "/notifications";
    case "COMMISSION_CALCULEE":
    case "COMMISSION_PAYEE":
      return "/commissions";
    default:
      return "/notifications";
  }
}

export function NotificationCenter({ notifications, userId, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const recent      = notifications.slice(0, 10); // max 10 dans le dropdown
  const unreadCount = notifications.filter((n) => !n.lu).length;

  function handleClickNotification(notification: Notification) {
    startTransition(async () => {
      // Marquer comme lu si pas encore lue, puis rediriger
      if (!notification.lu) {
        await markAsRead(notification.id);
      }
      onClose();
      router.push(getRedirectUrl(notification));
    });
  }

  function handleMarkAllAsRead() {
    startTransition(async () => {
      await markAllAsRead(userId);
    });
  }

  return (
    // stopPropagation : empêche la fermeture du dropdown au clic intérieur
    <div
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-[12px] border border-gray-200 shadow-xl z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#0F1117]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-[#4F6EF7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="text-xs text-[#4F6EF7] hover:underline disabled:opacity-50"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
            Aucune notification.
          </p>
        ) : (
          recent.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={handleClickNotification}
            />
          ))
        )}
      </div>

      {/* Pied : lien vers la page complète */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        <button
          onClick={() => { onClose(); router.push("/notifications"); }}
          className="w-full text-center text-xs text-[#4F6EF7] hover:underline"
        >
          Voir toutes les notifications →
        </button>
      </div>
    </div>
  );
}
