"use client";
// Vue admin — liste des invitations avec statut, client, deal associé.
// Même pattern que ContratTable.tsx : Client Component avec useState + useTransition.

import { useState, Fragment } from "react";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientEvenementTimeline } from "./ClientEvenementTimeline";
import { InviterClientModal } from "./InviterClientModal";
import type { InvitationWithDeal, InvitationStatut } from "@/types/client.types";

interface Props {
  invitations: InvitationWithDeal[];
  deals: { id: string; titre: string }[];
}

const FILTRES: { value: InvitationStatut | "ALL"; label: string }[] = [
  { value: "ALL",       label: "Toutes" },
  { value: "PENDING",   label: "En attente" },
  { value: "ACCESSED",  label: "Consultées" },
  { value: "VALIDATED", label: "Validées" },
  { value: "REFUSED",   label: "Refusées" },
];

export function ClientTable({ invitations, deals }: Props) {
  const [filtre, setFiltre]           = useState<InvitationStatut | "ALL">("ALL");
  const [expanded, setExpanded]       = useState<string | null>(null); // ID invitation timeline ouverte
  const [showModal, setShowModal]     = useState(false);

  const filtered = invitations.filter(
    (inv) => filtre === "ALL" || inv.statut === filtre
  );

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const total     = invitations.length;
  const pending   = invitations.filter((i) => i.statut === "PENDING").length;
  const accessed  = invitations.filter((i) => i.statut === "ACCESSED").length;
  const validated = invitations.filter((i) => i.statut === "VALIDATED").length;

  const kpis = [
    { label: "Total",      value: total,     color: "text-[#0F1117]" },
    { label: "En attente", value: pending,   color: "text-[#6B7280]" },
    { label: "Consultées", value: accessed,  color: "text-[#1D4ED8]" },
    { label: "Validées",   value: validated, color: "text-[#059669]" },
  ];

  return (
    <div className="space-y-6">

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, color }) => (
          <div key={label} className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
            <p className="text-sm text-[#6B7280]">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Barre d'actions + filtres */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-[#6B7280]">Filtrer :</span>
          {FILTRES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFiltre(value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filtre === value
                  ? "bg-[#4F6EF7] text-white"
                  : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-medium bg-[#4F6EF7] text-white rounded-lg hover:bg-[#3B55D9] transition-colors"
        >
          + Inviter un client
        </button>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-[12px] border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-[#6B7280] text-left">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Dossier</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Envoyée le</th>
              <th className="px-4 py-3 font-medium">Expiration</th>
              <th className="px-4 py-3 font-medium">Historique</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">
                  Aucune invitation pour ce filtre.
                </td>
              </tr>
            )}
            {filtered.map((inv) => {
              const tokenExpire = new Date() > new Date(inv.tokenExpiresAt);
              const isOpen = expanded === inv.id;

              return (
                <Fragment key={inv.id}>
                  <tr className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F1117]">{inv.nom}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{inv.email}</td>
                    <td className="px-4 py-3 text-[#0F1117]">{inv.deal.titre}</td>
                    <td className="px-4 py-3">
                      <ClientStatusBadge statut={inv.statut} />
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${tokenExpire ? "text-[#DC2626] font-medium" : "text-[#6B7280]"}`}>
                        {new Date(inv.tokenExpiresAt).toLocaleDateString("fr-FR")}
                        {tokenExpire && " (expiré)"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(isOpen ? null : inv.id)}
                        className="text-xs text-[#4F6EF7] hover:underline"
                      >
                        {isOpen ? "Masquer" : `${inv.evenements.length} événement${inv.evenements.length > 1 ? "s" : ""}`}
                      </button>
                    </td>
                  </tr>

                  {/* Ligne déroulante : timeline des événements */}
                  {isOpen && (
                    <tr key={`${inv.id}-timeline`}>
                      <td colSpan={7} className="px-6 py-4 bg-[#F8F9FF]">
                        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">
                          Historique des événements
                        </p>
                        <ClientEvenementTimeline evenements={inv.evenements} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modale d'invitation */}
      {showModal && (
        <InviterClientModal deals={deals} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
