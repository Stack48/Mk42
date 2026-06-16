"use client";
// Modal "Inviter un client" — formulaire email + nom + sélection deal.
// useTransition = appeler la Server Action sans bloquer l'UI (même pattern que ContratTable).

import { useState, useTransition } from "react";
import { inviterClient } from "@/lib/actions/client.actions";

type Deal = { id: string; titre: string };

interface Props {
  deals: Deal[];
  onClose: () => void;
}

export function InviterClientModal({ deals, onClose }: Props) {
  const [email, setEmail]     = useState("");
  const [nom, setNom]         = useState("");
  const [dealId, setDealId]   = useState(deals[0]?.id ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !nom || !dealId) return;

    startTransition(async () => {
      const res = await inviterClient(dealId, email.trim(), nom.trim());
      if (res.success) {
        setMessage({ type: "success", text: `Invitation envoyée à ${email} (simulation console).` });
        // Vider le formulaire après succès
        setEmail("");
        setNom("");
      } else {
        setMessage({ type: "error", text: res.error ?? "Erreur inconnue." });
      }
    });
  }

  return (
    // Overlay sombre derrière la modale — clic dessus = fermeture
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {/* Boîte de dialogue — stopPropagation empêche la fermeture au clic intérieur */}
      <div
        className="bg-white rounded-[12px] p-6 w-full max-w-md shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[#0F1117] mb-4">
          Inviter un client
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du client */}
          <div>
            <label className="block text-sm font-medium text-[#0F1117] mb-1">
              Nom du client
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Marie Dupont"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F6EF7] text-[#0F1117]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#0F1117] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie@exemple.fr"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F6EF7] text-[#0F1117]"
            />
          </div>

          {/* Sélection du deal */}
          <div>
            <label className="block text-sm font-medium text-[#0F1117] mb-1">
              Dossier associé
            </label>
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F6EF7] text-[#0F1117] bg-white"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.titre}
                </option>
              ))}
            </select>
          </div>

          {/* Message succès / erreur */}
          {message && (
            <p
              className={`text-sm rounded-lg px-3 py-2 ${
                message.type === "success"
                  ? "bg-[#D1FAE5] text-[#059669]"
                  : "bg-[#FEE2E2] text-[#DC2626]"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium bg-[#4F6EF7] text-white rounded-lg hover:bg-[#3B55D9] disabled:opacity-50 transition-colors"
            >
              {isPending ? "Envoi…" : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
