"use client";
// ITEM DE NOTIFICATION — une ligne dans le centre de notifications
// Composant pur : reçoit la notification + un handler de clic.

import { NOTIFICATION_CONFIG } from "@/types/notification.types";
import type { Notification } from "@/types/notification.types";

interface Props {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick = () => {} }: Props) {
  const config = NOTIFICATION_CONFIG[notification.type];

  return (
    <button
      onClick={() => onClick(notification)}
      className={`w-full text-left px-4 py-3 transition-colors hover:bg-[#F0F4FF] ${
        notification.lu
          ? "bg-white"
          : "bg-[#F0F4FF] border-l-[3px] border-[#4F6EF7]"
        // ↑ Notification non lue : fond bleu pâle + barre gauche bleue (spec OPUS)
        // Notification lue : fond blanc standard
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icône du type d'événement */}
        <span className="text-base mt-0.5 flex-shrink-0">{config.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-medium truncate ${
              notification.lu ? "text-[#6B7280]" : "text-[#0F1117]"
            }`}>
              {notification.titre}
            </p>
            {/* Pastille verte si non lue */}
            {!notification.lu && (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[#4F6EF7]" />
            )}
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            {new Date(notification.createdAt).toLocaleString("fr-FR", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </button>
  );
}
