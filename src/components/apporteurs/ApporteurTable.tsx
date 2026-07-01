"use client";
// ↑ Nécessaire pour useState (recherche interactive côté navigateur).

import { useState } from "react";

export type ApporteurRow = {
  id: string;
  nom: string;
  email: string;
  nombreCommissions: number;
  montantApporte: number;
};

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function ApporteurTable({ apporteurs }: { apporteurs: ApporteurRow[] }) {
  const [recherche, setRecherche] = useState("");

  const q = recherche.trim().toLowerCase();
  const filtres = q
    ? apporteurs.filter(
        (a) => a.nom.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      )
    : apporteurs;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un apporteur (nom ou email)"
        className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4F6EF7]"
      />

      <div className="overflow-hidden rounded-[12px] border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-[#6B7280] text-left">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Commissions</th>
              <th className="px-4 py-3 font-medium">Montant apporté</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {apporteurs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#6B7280]">
                  Aucun apporteur pour l&apos;instant.
                </td>
              </tr>
            )}
            {apporteurs.length > 0 && filtres.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#6B7280]">
                  Aucun apporteur ne correspond à votre recherche.
                </td>
              </tr>
            )}
            {filtres.map((a) => (
              <tr key={a.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0F1117]">{a.nom}</td>
                <td className="px-4 py-3 text-[#6B7280]">{a.email}</td>
                <td className="px-4 py-3 text-[#6B7280]">{a.nombreCommissions}</td>
                <td className="px-4 py-3 font-semibold text-[#0F1117]">
                  {formatEur(a.montantApporte)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
