// PAGE /contrats/[id] — Détail admin d'un contrat
//
// SERVER COMPONENT avec route dynamique.
// [id] dans le nom du dossier = paramètre de route dynamique Next.js.
// Équivalent Symfony : #[Route('/contrats/{id}')]
//
// generateMetadata : fonction spéciale Next.js pour définir le <title> dynamiquement
// côté serveur. Elle reçoit les mêmes params que le composant page.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContratById } from "@/lib/actions/contrat.actions";
import { ContratDetail } from "@/components/contrats/ContratDetail";
import type { ContratWithRelations } from "@/types/contrat.types";

interface Props {
  params: Promise<{ id: string }>;
}

// generateMetadata s'exécute AVANT le rendu de la page pour injecter les balises <head>.
// Next.js appelle cette fonction en parallèle avec le composant si possible.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const contrat = await getContratById(id);
  if (!contrat) return { title: "Contrat introuvable — OPUS" };
  const data = contrat.templateData as { numeroContrat?: string };
  return {
    title: `Contrat ${data.numeroContrat ?? id} — OPUS`,
  };
}

export default async function ContratDetailPage({ params }: Props) {
  const { id } = await params;
  const contrat = await getContratById(id);

  // notFound() = déclenche la page 404 de Next.js (not-found.tsx ou page 404 par défaut)
  // Équivalent Symfony : throw new NotFoundHttpException();
  if (!contrat) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1117]">Détail du contrat</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Gestion et suivi du contrat d&apos;apport d&apos;affaires
        </p>
      </div>

      {/* Composant Client pour les interactions (validation, rejet, modale) */}
      <ContratDetail contrat={contrat as unknown as ContratWithRelations} />
    </div>
  );
}
