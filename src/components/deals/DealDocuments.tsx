"use client";
// DOCUMENTS D'UN DEAL — upload + liste avec téléchargement.
// Réutilise le StorageService de [13-BE] via la Server Action uploadDealDocument.
// useRef sur l'input file = déclencher le sélecteur sans bouton <input> visible.

import { useRef, useState, useTransition } from "react";
import { uploadDealDocument, deleteDealDocument } from "@/lib/actions/deal.actions";
import type { DealDocument, DealDocumentType } from "@/types/deal.types";

const TYPE_LABELS: Record<DealDocumentType, string> = {
  DEVIS:    "Devis",
  FACTURE:  "Facture",
  AUTRE:    "Autre",
};

const TYPE_COLORS: Record<DealDocumentType, string> = {
  DEVIS:   "bg-[#DBEAFE] text-[#1D4ED8]",
  FACTURE: "bg-[#D1FAE5] text-[#059669]",
  AUTRE:   "bg-[#F3F4F6] text-[#6B7280]",
};

interface Props {
  dealId:    string;
  documents: DealDocument[];
}

export function DealDocuments({ dealId, documents: initialDocs }: Props) {
  const [docs, setDocs]           = useState(initialDocs);
  const [docType, setDocType]     = useState<DealDocumentType>("AUTRE");
  const [error, setError]         = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef                  = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("dealId",     dealId);
      formData.append("type",       docType);
      formData.append("uploadedBy", "admin");
      formData.append("file",       file);

      const res = await uploadDealDocument(formData);
      if (res.success) {
        // Recharger en simulant l'ajout local (évite un full page refresh)
        const newDoc: DealDocument = {
          id:         res.documentId!,
          nom:        file.name,
          type:       docType,
          filePath:   "",
          fileSize:   file.size,
          mimeType:   file.type,
          uploadedBy: "admin",
          createdAt:  new Date(),
          dealId,
        };
        setDocs((prev) => [newDoc, ...prev]);
      } else {
        setError(res.error ?? "Erreur lors de l'upload.");
      }
      // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete(docId: string) {
    startTransition(async () => {
      const res = await deleteDealDocument(docId);
      if (res.success) {
        setDocs((prev) => prev.filter((d) => d.id !== docId));
      }
    });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024)       return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
        Documents ({docs.length})
      </h3>

      {/* Zone d'upload */}
      <div className="flex items-center gap-3">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as DealDocumentType)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-[#0F1117] focus:ring-2 focus:ring-[#4F6EF7] focus:outline-none"
        >
          <option value="DEVIS">Devis</option>
          <option value="FACTURE">Facture</option>
          <option value="AUTRE">Autre</option>
        </select>

        {/* Input file caché — déclenché par le bouton ci-dessous */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-[#F8F9FF] text-[#4F6EF7] border border-[#4F6EF7] rounded-lg hover:bg-[#EEF2FF] disabled:opacity-50 transition-colors"
        >
          {isPending ? "Upload…" : "+ Ajouter un document"}
        </button>
      </div>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      {/* Liste des documents */}
      {docs.length === 0 ? (
        <p className="text-sm text-[#6B7280]">Aucun document joint.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-[#F8F9FF] rounded-[12px] px-3 py-2 border border-gray-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${TYPE_COLORS[doc.type]}`}>
                  {TYPE_LABELS[doc.type]}
                </span>
                <span className="text-sm text-[#0F1117] truncate">{doc.nom}</span>
                <span className="text-xs text-[#6B7280] flex-shrink-0">
                  {formatSize(doc.fileSize)}
                </span>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={isPending}
                className="text-xs text-[#DC2626] hover:underline ml-3 flex-shrink-0 disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
