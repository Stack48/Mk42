"use client";
// CHAT INTERNE — messagerie entre l'entreprise et l'apporteur sur un deal.
// Polling toutes les 10s pour simuler le temps réel (pas de WebSocket).
// useEffect + setInterval = même pattern que NotificationBell.tsx ([18-FE]).

import { useState, useEffect, useRef, useTransition } from "react";
import { sendMessage, getMessages, markMessagesAsRead } from "@/lib/actions/deal.actions";
import { ChatMessage } from "./ChatMessage";
import type { DealMessage, MessageAuteurType } from "@/types/deal.types";

interface Props {
  dealId:    string;
  auteurId:  string;               // ID de l'utilisateur connecté (admin ou apporteur)
  auteurType: MessageAuteurType;   // rôle de l'utilisateur courant
  initialMessages: DealMessage[];
}

const POLLING_INTERVAL =
  Number(process.env.NEXT_PUBLIC_DEAL_CHAT_POLLING_INTERVAL ?? 10_000);

export function DealChat({ dealId, auteurId, auteurType, initialMessages }: Props) {
  const [messages, setMessages]   = useState<DealMessage[]>(initialMessages);
  const [contenu, setContenu]     = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // ── Polling des messages (toutes les 10s) ────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await getMessages(dealId);
      setMessages(fresh);
    }, POLLING_INTERVAL);

    // Marquer les messages de l'autre partie comme lus à l'ouverture
    void markMessagesAsRead(dealId, auteurType);

    return () => clearInterval(interval);
  }, [dealId, auteurType]);

  // ── Scroll automatique vers le bas à chaque nouveau message ──────────────
  // useRef pointe vers un div invisible tout en bas de la liste.
  // scrollIntoView() = l'équivalent de window.scrollTo() mais pour un élément spécifique.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!contenu.trim()) return;
    startTransition(async () => {
      const res = await sendMessage(dealId, auteurId, auteurType, contenu.trim());
      if (res.success) {
        setContenu("");
        const fresh = await getMessages(dealId);
        setMessages(fresh);
      }
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#0F1117]">Messages</h3>
        <p className="text-xs text-[#6B7280]">
          Échange interne · rafraîchi toutes les {POLLING_INTERVAL / 1000}s
        </p>
      </div>

      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[#6B7280] py-8">
            Aucun message pour l'instant.
          </p>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {/* Div invisible en bas : cible du scrollIntoView */}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Votre message…"
          disabled={isPending}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F6EF7] text-[#0F1117] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !contenu.trim()}
          className="px-4 py-2 text-sm font-medium bg-[#4F6EF7] text-white rounded-lg hover:bg-[#3B55D9] disabled:opacity-50 transition-colors"
        >
          {isPending ? "…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
