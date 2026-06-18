"use client";
// ↑ "use client" car on utilise useRef (pour la modale <dialog>) et useTransition.

import { useRef, useTransition } from "react";
import { ContratStatusBadge } from "./ContratStatusBadge";
import { AccessLogTimeline } from "./AccessLogTimeline";
import { validateContrat, rejectContrat } from "@/lib/actions/contrat.actions";
import type { ContratWithRelations } from "@/types/contrat.types";

interface Props {
  contrat: ContratWithRelations;
}

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function ContratDetail({ contrat }: Props) {
  const [isPending, startTransition] = useTransition();
  // useRef pour accéder à l'élément <dialog> natif HTML.
  // <dialog> est l'élément HTML natif pour les modales — pas de librairie externe nécessaire.
  // dialog.showModal() ouvre la modale, dialog.close() la ferme.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const tokenExpire = new Date() > new Date(contrat.tokenExpiresAt);
  const templateData = contrat.templateData;

  function handleValidate() {
    startTransition(async () => {
      const res = await validateContrat(contrat.id, "admin");
      if (!res.success) alert(res.error);
    });
  }

  function handleOpenRejectDialog() {
    dialogRef.current?.showModal();
  }

  function handleCloseDialog() {
    dialogRef.current?.close();
  }

  function handleConfirmReject() {
    const reason = reasonRef.current?.value.trim();
    if (!reason) {
      alert("Le motif du rejet est obligatoire.");
      return;
    }
    dialogRef.current?.close();
    startTransition(async () => {
      const res = await rejectContrat(contrat.id, "admin", reason);
      if (!res.success) alert(res.error);
    });
  }

  return (
    <div className="space-y-6">

      {/* ── En-tête avec statut ── */}
      <div className="bg-[#F8F9FF] rounded-[12px] border border-gray-100 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F1117]">
              {contrat.deal.titre}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Apporteur : <span className="font-medium text-[#0F1117]">{contrat.apporteur.nom}</span>
              {" · "}{contrat.apporteur.email}
            </p>
          </div>
          <ContratStatusBadge statut={contrat.statut} />
        </div>
      </div>

      {/* ── Grille d'infos ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Infos contrat */}
        <div className="bg-[#F8F9FF] rounded-[12px] border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#0F1117] uppercase tracking-wide">
            Informations
          </h3>
          <Row label="N° contrat" value={templateData.numeroContrat} />
          <Row label="Montant deal" value={formatEur(contrat.deal.montant)} />
          <Row label="Taux commission" value={`${templateData.tauxCommission} %`} />
          <Row
            label="Commission estimée"
            value={formatEur(Math.round((contrat.deal.montant * templateData.tauxCommission) / 100))}
          />
          <Row
            label="Créé le"
            value={new Date(contrat.createdAt).toLocaleDateString("fr-FR")}
          />
          <Row
            label="Token expire le"
            value={
              <span className={tokenExpire ? "text-[#DC2626] font-medium" : ""}>
                {new Date(contrat.tokenExpiresAt).toLocaleString("fr-FR")}
                {tokenExpire && " (expiré)"}
              </span>
            }
          />
          {contrat.validatedAt && (
            <Row
              label="Validé le"
              value={new Date(contrat.validatedAt).toLocaleDateString("fr-FR")}
            />
          )}
          {contrat.validatedBy && (
            <Row label="Validé par" value={contrat.validatedBy} />
          )}
          {contrat.rejectedReason && (
            <Row
              label="Motif rejet"
              value={
                <span className="text-[#DC2626]">{contrat.rejectedReason}</span>
              }
            />
          )}
        </div>

        {/* Fichiers */}
        <div className="bg-[#F8F9FF] rounded-[12px] border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#0F1117] uppercase tracking-wide">
            Fichiers
          </h3>
          <div className="space-y-2">
            <p className="text-xs text-[#6B7280]">PDF original (généré)</p>
            {contrat.fileOriginalPath ? (
              <a
                href={`/api/contrats/download?file=${encodeURIComponent(contrat.fileOriginalPath)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#4F6EF7] hover:underline"
              >
                Télécharger le contrat original →
              </a>
            ) : (
              <p className="text-sm text-[#9CA3AF] italic">Non disponible</p>
            )}
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-[#6B7280]">PDF signé (uploadé par l&apos;apporteur)</p>
            {contrat.fileSignedPath ? (
              <a
                href={`/api/contrats/download?file=${encodeURIComponent(contrat.fileSignedPath)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#4F6EF7] hover:underline"
              >
                Télécharger le contrat signé →
              </a>
            ) : (
              <p className="text-sm text-[#9CA3AF] italic">Pas encore uploadé</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions admin (seulement si UPLOADED) ── */}
      {contrat.statut === "UPLOADED" && (
        <div className="bg-[#FEF3C7] rounded-[12px] border border-yellow-200 p-5">
          <p className="text-sm font-medium text-[#D97706] mb-4">
            Le contrat signé est disponible. Vérifiez-le avant de valider ou rejeter.
          </p>
          <div className="flex gap-3">
            <button
              disabled={isPending}
              onClick={handleValidate}
              className="px-4 py-2 bg-[#4F6EF7] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Valider le contrat ✓
            </button>
            <button
              disabled={isPending}
              onClick={handleOpenRejectDialog}
              className="px-4 py-2 bg-white text-[#DC2626] text-sm font-medium rounded-lg border border-[#DC2626] hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Rejeter ✗
            </button>
          </div>
        </div>
      )}

      {/* ── Timeline d'audit ── */}
      <div className="bg-[#F8F9FF] rounded-[12px] border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-[#0F1117] uppercase tracking-wide mb-4">
          Historique des actions
        </h3>
        <AccessLogTimeline logs={contrat.accessLogs} />
      </div>

      {/* ── Modale de rejet (dialog HTML natif) ── */}
      {/* <dialog> est l'élément HTML natif pour les modales.
          Avantages vs librairie : zéro dépendance, accessible nativement (focus trap, Escape),
          disponible dans tous les navigateurs modernes.
          showModal() positionne la modale en haut du z-index et crée un ::backdrop. */}
      <dialog
        ref={dialogRef}
        className="rounded-[12px] border border-gray-200 p-6 shadow-xl w-full max-w-md backdrop:bg-black/40"
      >
        <h3 className="text-lg font-bold text-[#0F1117] mb-2">
          Rejeter le contrat
        </h3>
        <p className="text-sm text-[#6B7280] mb-4">
          Indiquez le motif du rejet. Ce motif sera enregistré et consultable
          dans l&apos;historique.
        </p>
        <textarea
          ref={reasonRef}
          rows={4}
          placeholder="Ex : La signature est illisible, veuillez re-signer le document..."
          className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0F1117] resize-none focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]"
        />
        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={handleCloseDialog}
            className="px-4 py-2 text-sm text-[#6B7280] bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            disabled={isPending}
            onClick={handleConfirmReject}
            className="px-4 py-2 text-sm text-white bg-[#DC2626] rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Confirmer le rejet
          </button>
        </div>
      </dialog>

    </div>
  );
}

// ── Composant utilitaire Row ────────────────────────────────────────────────
function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-[#6B7280] shrink-0">{label}</span>
      <span className="text-xs text-[#0F1117] text-right">{value}</span>
    </div>
  );
}
