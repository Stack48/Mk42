"use client";
// ↑ "use client" nécessaire : on utilise useState (filtre interactif) et useTransition (actions).
// Même pattern que CommissionTable.tsx.

import { useState, useTransition } from "react";
import Link from "next/link";
import { ContratStatusBadge } from "./ContratStatusBadge";
import {
  sendContratLink,
  validateContrat,
  rejectContrat,
} from "@/lib/actions/contrat.actions";
import type { ContratWithRelations, ContratStatut } from "@/types/contrat.types";

interface Props {
  contrats: ContratWithRelations[];
}

export function ContratTable({ contrats }: Props) {
  const [filtre, setFiltre] = useState<ContratStatut | "ALL">("ALL");
  const [isPending, startTransition] = useTransition();
  // useTransition permet d'appeler une Server Action sans bloquer l'UI.
  // isPending = true pendant l'exécution → on peut griser les boutons.

  const filtered = contrats.filter(
    (c) => filtre === "ALL" || c.statut === filtre
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSendLink(contratId: string) {
    startTransition(async () => {
      const res = await sendContratLink(contratId, "admin");
      if (!res.success) {
        alert(res.error);
      } else {
        alert(`Lien copié (simulation) :\n${res.linkUrl}`);
      }
    });
  }

  function handleValidate(contratId: string) {
    startTransition(async () => {
      const res = await validateContrat(contratId, "admin");
      if (!res.success) alert(res.error);
    });
  }

  function handleReject(contratId: string) {
    // prompt() = dialogue natif du navigateur — simple et sans dépendance externe.
    // Pour une meilleure UX en production, utiliser une modale (voir ContratDetail.tsx).
    const reason = prompt("Motif du rejet (obligatoire) :");
    if (!reason || reason.trim() === "") return; // annulé ou vide → on ne fait rien
    startTransition(async () => {
      const res = await rejectContrat(contratId, "admin", reason.trim());
      if (!res.success) alert(res.error);
    });
  }

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const total      = contrats.length;
  const envoyes    = contrats.filter((c) => c.statut === "SENT").length;
  const enAttente  = contrats.filter((c) => c.statut === "UPLOADED").length;
  const valides    = contrats.filter((c) => c.statut === "VALIDATED").length;

  const kpis = [
    { label: "Total",                  value: total,     color: "text-[#0F1117]" },
    { label: "Envoyés",                value: envoyes,   color: "text-[#1D4ED8]" },
    { label: "En attente validation",  value: enAttente, color: "text-[#D97706]" },
    { label: "Validés",                value: valides,   color: "text-[#059669]" },
  ];

  // ── Libellés des filtres ───────────────────────────────────────────────────
  const FILTRES: { value: ContratStatut | "ALL"; label: string }[] = [
    { value: "ALL",       label: "Tous" },
    { value: "DRAFT",     label: "Brouillon" },
    { value: "SENT",      label: "Envoyé" },
    { value: "UPLOADED",  label: "En attente" },
    { value: "VALIDATED", label: "Validé" },
    { value: "REJECTED",  label: "Rejeté" },
  ];

  return (
    <div className="space-y-6">

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100"
          >
            <p className="text-sm text-[#6B7280]">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtres par statut */}
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

      {/* Tableau */}
      <div className="overflow-hidden rounded-[12px] border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-[#6B7280] text-left">
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Apporteur</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date création</th>
              <th className="px-4 py-3 font-medium">Expiration token</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[#6B7280]"
                >
                  Aucun contrat pour ce filtre.
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const tokenExpire = new Date() > new Date(c.tokenExpiresAt);
              return (
                <tr
                  key={c.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Deal — lien vers la page détail */}
                  <td className="px-4 py-3 font-medium text-[#0F1117]">
                    <Link
                      href={`/contrats/${c.id}`}
                      className="hover:text-[#4F6EF7] hover:underline"
                    >
                      {c.deal.titre}
                    </Link>
                  </td>

                  {/* Apporteur */}
                  <td className="px-4 py-3 text-[#6B7280]">
                    {c.apporteur.nom}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <ContratStatusBadge statut={c.statut} />
                  </td>

                  {/* Date création */}
                  <td className="px-4 py-3 text-[#6B7280]">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>

                  {/* Expiration token */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs ${
                        tokenExpire
                          ? "text-[#DC2626] font-medium"
                          : "text-[#6B7280]"
                      }`}
                    >
                      {new Date(c.tokenExpiresAt).toLocaleDateString("fr-FR")}
                      {tokenExpire && " (expiré)"}
                    </span>
                  </td>

                  {/* Actions selon statut */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.statut === "DRAFT" && (
                        <button
                          disabled={isPending}
                          onClick={() => handleSendLink(c.id)}
                          className="px-2 py-1 text-xs bg-[#DBEAFE] text-[#1D4ED8] rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          Envoyer le lien
                        </button>
                      )}

                      {c.statut === "UPLOADED" && (
                        <>
                          <button
                            disabled={isPending}
                            onClick={() => handleValidate(c.id)}
                            className="px-2 py-1 text-xs bg-[#D1FAE5] text-[#059669] rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            Valider ✓
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleReject(c.id)}
                            className="px-2 py-1 text-xs bg-[#FEE2E2] text-[#DC2626] rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            Rejeter ✗
                          </button>
                        </>
                      )}

                      {c.statut === "SENT" && (
                        <span className="text-xs text-[#6B7280]">
                          En attente de signature
                        </span>
                      )}

                      {c.statut === "VALIDATED" && (
                        <span className="text-xs text-[#059669]">
                          Validé le{" "}
                          {c.validatedAt
                            ? new Date(c.validatedAt).toLocaleDateString("fr-FR")
                            : "—"}
                        </span>
                      )}

                      {c.statut === "REJECTED" && (
                        <span className="text-xs text-[#DC2626]">
                          Rejeté
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
