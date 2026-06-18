"use client";
// Bouton "Tout marquer comme lu" sur la page /notifications.
// Séparé en Client Component pour useTransition, la page reste Server Component.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllAsRead } from "@/lib/actions/notification.actions";

interface Props {
  userId: string;
  hasUnread: boolean;
}

export function NotificationPageActions({ userId, hasUnread }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!hasUnread) return null;

  function handleMarkAll() {
    startTransition(async () => {
      await markAllAsRead(userId);
      router.refresh();
      // router.refresh() = demande à Next.js de re-fetch les données Server Component
      // sans rechargement complet de la page. Équivalent d'un F5 intelligent.
    });
  }

  return (
    <button
      onClick={handleMarkAll}
      disabled={isPending}
      className="px-4 py-2 text-sm font-medium bg-[#4F6EF7] text-white rounded-lg hover:bg-[#3B55D9] disabled:opacity-50 transition-colors"
    >
      {isPending ? "En cours…" : "Tout marquer comme lu"}
    </button>
  );
}
