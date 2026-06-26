"use client";

import { useActionState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import { updateEntrepriseProfile, type ActionState } from "./_actions";
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
};

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
}: ProfilEntrepriseFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateEntrepriseProfile,
    {} as ActionState
  );
  const { openUserProfile } = useClerk();

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
