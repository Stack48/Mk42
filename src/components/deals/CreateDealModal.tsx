"use client";
// MODAL CRÉATION DEAL — même pattern que InviterClientModal.tsx

import { useState, useTransition } from "react";
import { createDeal } from "@/lib/actions/deal.actions";
import type { CreateDealPayload } from "@/types/deal.types";

type Apporteur = { id: string; nom: string };

interface Props {
  apporteurs: Apporteur[];
  onClose: () => void;
}

export function CreateDealModal({ apporteurs, onClose }: Props) {
  const [form, setForm]           = useState<Partial<CreateDealPayload>>({
    apporteurId: apporteurs[0]?.id ?? "",
  });
  const [message, setMessage]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(key: keyof CreateDealPayload, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createDeal({
        titre:       form.titre ?? "",
        montant:     Number(form.montant ?? 0),
        mission:     form.mission,
        clientNom:   form.clientNom ?? "",
        clientEmail: form.clientEmail,
        clientTel:   form.clientTel,
        apporteurId: form.apporteurId ?? "",
      });
      if (res.success) {
        setMessage({ type: "success", text: "Deal créé avec succès !" });
        setTimeout(onClose, 800);
      } else {
        setMessage({ type: "error", text: res.error ?? "Erreur inconnue." });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-[12px] p-6 w-full max-w-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[#0F1117] mb-4">Nouveau deal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <Field label="Titre du deal *">
            <input type="text" required value={form.titre ?? ""}
              onChange={(e) => set("titre", e.target.value)}
              placeholder="Rénovation Mairie de…" className={inputCls} />
          </Field>

          {/* Montant */}
          <Field label="Montant estimé (€) *">
            <input type="number" required min={1} value={form.montant ?? ""}
              onChange={(e) => set("montant", Number(e.target.value))}
              placeholder="150000" className={inputCls} />
          </Field>

          {/* Apporteur */}
          <Field label="Apporteur *">
            <select value={form.apporteurId ?? ""} required
              onChange={(e) => set("apporteurId", e.target.value)}
              className={inputCls + " bg-white"}>
              {apporteurs.map((a) => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </Field>

          {/* Client */}
          <Field label="Nom du client *">
            <input type="text" required value={form.clientNom ?? ""}
              onChange={(e) => set("clientNom", e.target.value)}
              placeholder="Mairie de Villefranche" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email client">
              <input type="email" value={form.clientEmail ?? ""}
                onChange={(e) => set("clientEmail", e.target.value)}
                placeholder="contact@mairie.fr" className={inputCls} />
            </Field>
            <Field label="Téléphone">
              <input type="tel" value={form.clientTel ?? ""}
                onChange={(e) => set("clientTel", e.target.value)}
                placeholder="04 XX XX XX XX" className={inputCls} />
            </Field>
          </div>

          {/* Mission */}
          <Field label="Description de la mission">
            <textarea value={form.mission ?? ""}
              onChange={(e) => set("mission", e.target.value)}
              rows={2} placeholder="Travaux de rénovation du bâtiment…"
              className={inputCls + " resize-none"} />
          </Field>

          {message && (
            <p className={`text-sm rounded-lg px-3 py-2 ${
              message.type === "success" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"
            }`}>{message.text}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#0F1117]">
              Annuler
            </button>
            <button type="submit" disabled={isPending}
              className="px-4 py-2 text-sm font-medium bg-[#4F6EF7] text-white rounded-lg hover:bg-[#3B55D9] disabled:opacity-50 transition-colors">
              {isPending ? "Création…" : "Créer le deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F6EF7] text-[#0F1117]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F1117] mb-1">{label}</label>
      {children}
    </div>
  );
}
