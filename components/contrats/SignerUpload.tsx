"use client";
// ↑ "use client" : drag & drop, états d'upload, appel fetch → tout interactif.

import { useState, useRef } from "react";
import type { ContratWithRelations } from "@/types/contrat.types";

interface Props {
  contrat: ContratWithRelations | null;
  tokenExpired: boolean;
  alreadyUploaded: boolean;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo
const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];
const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png"];

export function SignerUpload({ contrat, tokenExpired, alreadyUploaded }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Cas d'erreur / état final ─────────────────────────────────────────────

  if (!contrat) {
    return (
      <PageShell>
        <ErrorCard
          title="Lien invalide"
          message="Ce lien de signature est invalide. Vérifiez l'URL ou contactez l'entreprise."
        />
      </PageShell>
    );
  }

  if (tokenExpired) {
    return (
      <PageShell>
        <ErrorCard
          title="Lien expiré"
          message="Ce lien de signature a expiré (valable 72h). Contactez l'entreprise pour obtenir un nouveau lien."
        />
      </PageShell>
    );
  }

  if (alreadyUploaded) {
    const messages: Record<string, string> = {
      UPLOADED:  "Votre document signé a bien été reçu. L'équipe va le vérifier et vous recontacter.",
      VALIDATED: "Votre contrat a été validé. Merci !",
      REJECTED:  "Votre contrat a été rejeté. Contactez l'entreprise pour plus d'informations.",
    };
    return (
      <PageShell>
        <div className="bg-[#D1FAE5] border border-green-200 rounded-[12px] p-6 text-center">
          <p className="text-2xl mb-3">✓</p>
          <h2 className="text-lg font-bold text-[#059669] mb-2">Document déjà reçu</h2>
          <p className="text-sm text-[#065F46]">
            {messages[contrat.statut] ?? "Votre document a déjà été envoyé."}
          </p>
        </div>
      </PageShell>
    );
  }

  const templateData = contrat.templateData;

  // ── Validation fichier ────────────────────────────────────────────────────
  function validateFile(file: File): string | null {
    if (!ACCEPTED_MIME.includes(file.type)) {
      return `Format non accepté. Formats valides : ${ACCEPTED_TYPES.join(", ")}`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 10 Mo.`;
    }
    return null;
  }

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setUploadState("dragging");
  }

  function handleDragLeave() {
    if (uploadState === "dragging") setUploadState("idle");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setUploadState("idle");
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setSelectedFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrorMsg(err); setSelectedFile(null); return; }
    setErrorMsg("");
    setSelectedFile(file);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) { setErrorMsg("Veuillez sélectionner un fichier."); return; }

    setUploadState("uploading");
    setErrorMsg("");

    // On utilise une route API (/api/contrats/signer) plutôt qu'une Server Action
    // car les Server Actions gèrent moins bien les binaires volumineux (FormData + Buffer).
    // La route API Next.js (route handler) est plus adaptée pour les uploads de fichiers.
    const formData = new FormData();
    formData.append("token", contrat.token);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/contrats/signer", {
        method: "POST",
        body: formData,
      });

      const json = await res.json() as { success: boolean; error?: string };

      if (!res.ok || !json.success) {
        setUploadState("error");
        setErrorMsg(json.error ?? "Erreur lors de l'envoi. Réessayez.");
        return;
      }

      setUploadState("success");
    } catch {
      setUploadState("error");
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
    }
  }

  // ── Rendu succès ──────────────────────────────────────────────────────────
  if (uploadState === "success") {
    return (
      <PageShell>
        <div className="bg-[#D1FAE5] border border-green-200 rounded-[12px] p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-xl font-bold text-[#059669] mb-2">
            Document envoyé avec succès !
          </h2>
          <p className="text-sm text-[#065F46]">
            Votre contrat signé a bien été reçu. L&apos;équipe va le vérifier
            et vous recontactera si nécessaire.
          </p>
        </div>
      </PageShell>
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="text-center">
          <p className="text-[#4F6EF7] font-bold text-xl mb-1">OPUS</p>
          <h1 className="text-2xl font-bold text-[#0F1117]">
            Signature de contrat
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Bonjour {templateData.apporteurNom}, veuillez signer et uploader votre contrat.
          </p>
        </div>

        {/* Récapitulatif contrat */}
        <div className="bg-[#F8F9FF] rounded-[12px] border border-gray-100 p-5 space-y-2">
          <h2 className="text-sm font-bold text-[#0F1117] uppercase tracking-wide mb-3">
            Détails du contrat
          </h2>
          <InfoRow label="N° contrat"  value={templateData.numeroContrat} />
          <InfoRow label="Chantier"    value={templateData.dealTitre} />
          <InfoRow label="Entreprise"  value={templateData.entrepriseNom} />
          <InfoRow label="Commission"  value={`${templateData.tauxCommission} % — ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Math.round((templateData.dealMontant * templateData.tauxCommission) / 100))}`} />
          <InfoRow
            label="Expire le"
            value={new Date(contrat.tokenExpiresAt).toLocaleString("fr-FR")}
          />
        </div>

        {/* Télécharger le contrat original */}
        {contrat.fileOriginalPath && (
          <div className="bg-[#EFF6FF] rounded-[12px] border border-blue-100 p-5">
            <p className="text-sm font-medium text-[#1D4ED8] mb-2">
              Étape 1 — Téléchargez le contrat, imprimez-le et signez-le
            </p>
            <a
              href={`/api/contrats/download?file=${encodeURIComponent(contrat.fileOriginalPath)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F6EF7] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Télécharger le contrat PDF →
            </a>
          </div>
        )}

        {/* Zone d'upload */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-medium text-[#0F1117]">
            Étape 2 — Uploadez le contrat signé (scan ou photo)
          </p>

          {/* Zone drag & drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-[12px] p-8 text-center cursor-pointer transition-colors ${
              uploadState === "dragging"
                ? "border-[#4F6EF7] bg-[#EFF6FF]"
                : "border-gray-200 bg-white hover:border-[#4F6EF7] hover:bg-[#F8F9FF]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-[#059669]">
                  Fichier sélectionné :
                </p>
                <p className="text-sm text-[#0F1117] mt-1">{selectedFile.name}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl mb-2">📎</p>
                <p className="text-sm font-medium text-[#0F1117]">
                  Glissez votre fichier ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  PDF, JPG, PNG · max 10 Mo
                </p>
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {(errorMsg || uploadState === "error") && (
            <p className="text-sm text-[#DC2626] bg-[#FEE2E2] rounded-lg px-4 py-2">
              {errorMsg || "Une erreur est survenue."}
            </p>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={!selectedFile || uploadState === "uploading"}
            className="w-full py-3 bg-[#4F6EF7] text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadState === "uploading"
              ? "Envoi en cours..."
              : "Envoyer le contrat signé"}
          </button>
        </form>

      </div>
    </PageShell>
  );
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[16px] shadow-sm border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center space-y-3">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-xl font-bold text-[#0F1117]">{title}</h2>
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-[#6B7280] shrink-0">{label}</span>
      <span className="text-xs text-[#0F1117] text-right">{value}</span>
    </div>
  );
}
