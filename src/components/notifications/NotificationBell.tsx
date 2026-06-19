"use client";
// CLOCHE DE NOTIFICATIONS — à intégrer dans la Navbar.
//
// POURQUOI LE POLLING ET PAS WEBSOCKET ?
// ───────────────────────────────────────
// Polling = toutes les 30s, on demande au serveur : "combien de notifs non lues ?"
//   → Simple, zéro infrastructure supplémentaire, fonctionne avec Next.js standard.
//   → Légèrement en retard (max 30s) mais acceptable pour un compteur.
//
// WebSocket = connexion persistante : le serveur pousse les données instantanément.
//   → Nécessite un serveur Node.js qui tourne en permanence (pas compatible avec
//     le déploiement "serverless" de Vercel / App Router).
//   → À préférer pour : chat, notifications critiques < 1s, curseurs collaboratifs.
//   → Ici, 30s de délai est largement acceptable pour un badge de compteur.
//
// useEffect + setInterval = mise en place du polling au montage du composant,
// nettoyage automatique au démontage (clearInterval dans le return du useEffect).

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
// ↑ Bell = icône cloche de lucide-react. lucide-react est la bibliothèque d'icônes
// utilisée par shadcn/ui — même look, SVG optimisé, tree-shakeable.

import { getNotifications, getUnreadCount } from "@/lib/actions/notification.actions";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationCenter } from "./NotificationCenter";
import type { Notification } from "@/types/notification.types";

interface Props {
  userId: string;
  initialCount: number;
}

// NOTIFICATION_POLLING_INTERVAL : configurable via env, défaut 30 000 ms
const POLLING_INTERVAL =
  Number(process.env.NEXT_PUBLIC_NOTIFICATION_POLLING_INTERVAL ?? 30_000);

export function NotificationBell({ userId, initialCount }: Props) {
  const [count, setCount]                   = useState(initialCount);
  const [isOpen, setIsOpen]                 = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [loadingList, setLoadingList]       = useState(false);
  const containerRef                        = useRef<HTMLDivElement>(null);

  // ── Polling du compteur (toutes les 30s) ─────────────────────────────────
  // useEffect s'exécute après le rendu. Le tableau vide [] = une seule fois au montage.
  // On retourne une fonction de nettoyage : quand le composant est retiré du DOM,
  // clearInterval stoppe le polling (évite les fuites mémoire).
  useEffect(() => {
    const interval = setInterval(async () => {
      const newCount = await getUnreadCount(userId);
      setCount(newCount);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [userId]);

  // ── Fermer le dropdown au clic extérieur ──────────────────────────────────
  // useRef pointe vers le div conteneur. L'event listener sur document détecte
  // les clics en dehors de ce div et ferme le dropdown.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Ouvrir le dropdown et charger les notifications ───────────────────────
  async function handleToggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setLoadingList(true);
    const list = await getNotifications(userId);
    setNotifications(list);
    // Mettre à jour le compteur après chargement (peut avoir changé entre-temps)
    const newCount = list.filter((n) => !n.lu).length;
    setCount(newCount);
    setLoadingList(false);
  }

  // Quand NotificationCenter ferme le dropdown, rafraîchir le compteur
  async function handleClose() {
    setIsOpen(false);
    const newCount = await getUnreadCount(userId);
    setCount(newCount);
  }

  return (
    // position: relative → le dropdown (position: absolute) se positionne par rapport à ce div
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-[#6B7280] hover:text-[#0F1117] hover:bg-[#F8F9FF] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        <NotificationBadge count={count} />
      </button>

      {isOpen && (
        loadingList ? (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[12px] border border-gray-200 shadow-xl z-50 px-4 py-6 text-center text-sm text-[#6B7280]">
            Chargement…
          </div>
        ) : (
          <NotificationCenter
            notifications={notifications}
            userId={userId}
            onClose={handleClose}
          />
        )
      )}
    </div>
  );
}
