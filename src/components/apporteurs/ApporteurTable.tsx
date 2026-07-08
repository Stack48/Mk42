"use client";
// ↑ Nécessaire pour useState (recherche interactive côté navigateur).

import { useState } from "react";

export type ApporteurRow = {
  id: string;
  nom: string;
  email: string;
  ville: string | null;
  nombreCommissions: number;
  montantApporte: number;
};

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

// Palette pastel pour les avatars — la couleur est dérivée du nom (déterministe).
const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
];

function getInitials(nom: string) {
  const parts = nom.trim().split(/\s+/);
  const premiere = parts[0]?.[0] ?? "";
  const derniere = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (premiere + derniere).toUpperCase();
}

function getAvatarColor(nom: string) {
  let hash = 0;
  for (let i = 0; i < nom.length; i++) {
    hash = (hash << 5) - hash + nom.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ApporteurTable({ apporteurs }: { apporteurs: ApporteurRow[] }) {
  const [recherche, setRecherche] = useState("");

  const q = recherche.trim().toLowerCase();
  const filtres = q
    ? apporteurs.filter(
        (a) => a.nom.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      )
    : apporteurs;

  // Grille partagée par l'en-tête et les lignes pour aligner les colonnes.
  const COLS =
    "grid grid-cols-[minmax(180px,1.6fr)_minmax(200px,1.8fr)_minmax(90px,0.8fr)_minmax(110px,0.9fr)_minmax(120px,1fr)] items-center gap-6";

  return (
    <div className="space-y-5">
      <input
        type="text"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un apporteur (nom ou email)"
        className="w-full max-w-md px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#4F6EF7] focus:ring-2 focus:ring-[#4F6EF7]/15 transition"
      />

      {apporteurs.length === 0 && (
        <p className="py-8 text-center text-sm text-[#6B7280]">
          Aucun apporteur pour l&apos;instant.
        </p>
      )}
      {apporteurs.length > 0 && filtres.length === 0 && (
        <p className="py-8 text-center text-sm text-[#6B7280]">
          Aucun apporteur ne correspond à votre recherche.
        </p>
      )}

      {filtres.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-190">
            {/* En-tête de colonnes */}
            <div
              className={`${COLS} px-4 pb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]`}
            >
              <span>Nom</span>
              <span>Email</span>
              <span>Ville</span>
              <span className="text-center">Commissions</span>
              <span className="text-right">Montant</span>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {filtres.map((a) => {
                const couleur = getAvatarColor(a.nom);
                return (
                  <div
                    key={a.id}
                    className={`${COLS} px-4 py-4 hover:bg-[#F9FAFB] transition-colors`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${couleur.bg} ${couleur.text}`}
                      >
                        {getInitials(a.nom)}
                      </div>
                      <p className="truncate font-semibold text-[#0F1117]">{a.nom}</p>
                    </div>

                    <p className="truncate text-sm text-[#6B7280]">{a.email}</p>
                    <p className="truncate text-sm text-[#6B7280]">{a.ville ?? "—"}</p>

                    <p className="text-center text-sm font-medium text-[#0F1117]">
                      {a.nombreCommissions}
                    </p>
                    <p className="whitespace-nowrap text-right text-sm font-semibold text-[#0F1117]">
                      {formatEur(a.montantApporte)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
