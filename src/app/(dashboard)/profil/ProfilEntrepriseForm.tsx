"use client";

import { useActionState, useState, useRef, useTransition } from "react";
import { useClerk } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import { updateEntrepriseProfile, updateEntrepriseImages, type ActionState } from "./_actions";
import KycBadge from "./KycBadge";

export type ProfilEntrepriseFormProps = {
  email: string;
  telephone: string;
  raisonSociale: string;
  siret: string;
  adresseSiege: string;
  iban: string | null;
  bic: string | null;
  nomTitulaireIban: string | null;
  statutKyc: "EN_ATTENTE" | "VALIDE" | "REFUSE";
  logoUrl: string | null;
  bannerUrl: string | null;
};

async function uploadImage(file: File, kind: "logo" | "banner"): Promise<string> {
  const res = await fetch("/api/entreprise/images/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, kind }),
  });
  if (!res.ok) throw new Error("Impossible d'obtenir l'URL d'upload");
  const { presignedUrl, publicUrl } = await res.json();

  const upload = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!upload.ok) throw new Error("Échec de l'upload");

  return publicUrl as string;
}

function ImageUploadField({
  label,
  kind,
  currentUrl,
  onUploaded,
}: {
  label: string;
  kind: "logo" | "banner";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format non supporté (JPEG, PNG ou WebP uniquement)");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, kind);
      setPreview(url);
      onUploaded(url);
    } catch {
      setError("Échec de l'upload, veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#374151]">{label}</label>
      <div
        className="relative flex items-center justify-center border-2 border-dashed border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4648D4] transition-colors overflow-hidden"
        style={{ height: kind === "banner" ? 100 : 72 }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-[#9CA3AF]">
            {uploading ? "Upload en cours…" : "Cliquer pour choisir une image"}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-[#6B7280]">
            Upload en cours…
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export default function ProfilEntrepriseForm({
  email,
  telephone,
  raisonSociale,
  siret,
  adresseSiege,
  iban,
  bic,
  nomTitulaireIban,
  statutKyc,
  logoUrl,
  bannerUrl,
}: ProfilEntrepriseFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateEntrepriseProfile,
    {} as ActionState
  );
  const { openUserProfile } = useClerk();
  const [imageState, setImageState] = useState<{ logoUrl?: string; bannerUrl?: string }>({});
  const [imageSaving, startImageSave] = useTransition();
  const [imageSaved, setImageSaved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  function handleImageUploaded(kind: "logo" | "banner", url: string) {
    const updated = { ...imageState, [`${kind}Url`]: url };
    setImageState(updated);
    setImageSaved(false);
    startImageSave(async () => {
      const res = await updateEntrepriseImages(updated);
      if (res.success) setImageSaved(true);
      else setImageError(res.error ?? "Erreur lors de la sauvegarde");
    });
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Modifications enregistrées avec succès.
        </div>
      )}

      {/* Informations Personnelles */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#0F1117]">Informations Personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#374151]">Email Professionnel</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="telephone" className="text-sm font-medium text-[#374151]">
              Numéro de Téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              defaultValue={telephone}
              required
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-opus-primary focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Informations Professionnelles */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0F1117]">Informations Professionnelles</h2>
          <KycBadge statut={statutKyc} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="raisonSociale" className="text-sm font-medium text-[#374151]">
              Nom de l&apos;entreprise
            </label>
            <input
              id="raisonSociale"
              name="raisonSociale"
              type="text"
              defaultValue={raisonSociale}
              required
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-opus-primary focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#374151]">Numéro SIRET</label>
            <input
              type="text"
              value={siret}
              disabled
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="adresseSiege" className="text-sm font-medium text-[#374151]">
            Adresse Professionnelle
          </label>
          <textarea
            id="adresseSiege"
            name="adresseSiege"
            defaultValue={adresseSiege}
            rows={2}
            required
            className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-opus-primary focus:border-transparent resize-none"
          />
        </div>
      </section>

      {/* Coordonnées Bancaires */}
      <section className="bg-white rounded-xl border-l-4 border-l-opus-primary border border-[#E5E7EB] p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#0F1117]">Coordonnées Bancaires (IBAN)</h2>
        <p className="text-xs text-[#6B7280]">Nécessaire pour le versement automatique de vos commissions.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="iban" className="text-sm font-medium text-[#374151]">IBAN</label>
            <input
              id="iban"
              name="iban"
              type="text"
              defaultValue={iban ?? ""}
              placeholder="FR76 3000 6000 0112 3456 7890 123"
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-opus-primary focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="bic" className="text-sm font-medium text-[#374151]">Code BIC/SWIFT</label>
            <input
              id="bic"
              name="bic"
              type="text"
              defaultValue={bic ?? ""}
              placeholder="BNPAFRPPXXX"
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-opus-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="nomTitulaireIban" className="text-sm font-medium text-[#374151]">Nom du titulaire</label>
          <input
            id="nomTitulaireIban"
            name="nomTitulaireIban"
            type="text"
            defaultValue={nomTitulaireIban ?? ""}
            className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-opus-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-start gap-2 text-xs text-[#6B7280] bg-blue-50 rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
          Vos données sont chiffrées selon les standards bancaires les plus élevés pour garantir la sécurité de vos transactions.
        </div>
      </section>

      {/* Visuels Discovery */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#0F1117]">Visuels Discovery</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Ces images apparaissent sur votre fiche dans la page Discovery des rapporteurs d&apos;affaires.
          </p>
        </div>
        {imageError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {imageError}
          </div>
        )}
        {imageSaved && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            Images mises à jour.
          </div>
        )}
        {imageSaving && (
          <p className="text-xs text-[#6B7280]">Sauvegarde en cours…</p>
        )}
        <ImageUploadField
          label="Bannière (image de couverture)"
          kind="banner"
          currentUrl={bannerUrl}
          onUploaded={(url) => handleImageUploaded("banner", url)}
        />
        <ImageUploadField
          label="Logo (affiché en rond sur la carte)"
          kind="logo"
          currentUrl={logoUrl}
          onUploaded={(url) => handleImageUploaded("logo", url)}
        />
      </section>

      {/* Sécurité */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-3">
        <h2 className="text-base font-semibold text-[#0F1117]">Sécurité</h2>
        <p className="text-sm text-[#6B7280]">Gérez votre mot de passe et l&apos;authentification à deux facteurs.</p>
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="text-sm font-medium text-opus-primary hover:underline"
        >
          Gérer mon mot de passe et la 2FA →
        </button>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-[#6B7280]">{isPending ? "Enregistrement…" : ""}</span>
        <div className="flex items-center gap-3">
          <button
            type="reset"
            className="px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-opus-primary hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </form>
  );
}
