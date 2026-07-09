// PAGE /apporteurs — Vue entreprise
//
// SERVER COMPONENT : liste des apporteurs ayant déjà généré une commission
// avec l'entreprise connectée, avec leurs statistiques.

import { getApporteursEntreprise } from "@/lib/actions/apporteur.actions";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { ApporteurTable } from "@/components/apporteurs/ApporteurTable";

export const metadata = { title: "Apporteurs — OPUS" };

export default async function ApporteursPage() {
  const entrepriseId = await getCurrentEntrepriseId();
  const apporteurs = await getApporteursEntreprise(entrepriseId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1117]">Apporteurs</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {apporteurs.length} apporteur{apporteurs.length > 1 ? "s" : ""}
        </p>
      </div>

      <ApporteurTable apporteurs={apporteurs} />
    </div>
  );
}
