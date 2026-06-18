// PAGE /contrats — Vue admin
//
// SERVER COMPONENT : s'exécute côté serveur, appelle Prisma directement.
// Même pattern que app/commissions/page.tsx.
//
// Analogie Symfony : un Controller qui fait $repo->findAll() et rend un template.
// Ici, le "template" est le composant ContratTable passé en JSX.

import { getContrats } from "@/lib/actions/contrat.actions";
import { ContratTable } from "@/components/contrats/ContratTable";
import type { ContratWithRelations } from "@/types/contrat.types";

export const metadata = { title: "Contrats — OPUS" };

export default async function ContratsPage() {
  // Appel direct à Prisma via la Server Action de lecture — zéro fetch() nécessaire
  const contrats = await getContrats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117]">Contrats</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Vue admin · {contrats.length} contrat{contrats.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ContratTable est un Client Component : il reçoit les données du serveur
          via les props et gère les interactions côté navigateur.
          Le cast as unknown as ContratWithRelations[] est nécessaire car Prisma retourne
          ses propres types générés (JsonValue pour templateData, etc.) qui ne correspondent
          pas exactement à notre type manuel. En production, on pourrait mapper explicitement. */}
      <ContratTable contrats={contrats as unknown as ContratWithRelations[]} />
    </div>
  );
}
