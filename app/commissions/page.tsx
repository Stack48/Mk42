// PAGE /commissions — Vue entreprise
//
// SERVER COMPONENT : cette fonction async s'exécute côté serveur.
// Elle appelle directement Prisma (via les Server Actions de lecture),
// SANS passer par une API REST. C'est la grande nouveauté de Next.js App Router :
// le composant serveur est à la fois le "Controller" et la "Vue" en un seul fichier.
//
// Équivalent Symfony : un Controller qui fait $repo->findAll() et passe les données
// à un template Twig — sauf qu'ici tout est dans le même fichier TypeScript.

import { getCommissions } from "@/lib/actions/commission.actions";
import { CommissionTable } from "@/components/commissions/CommissionTable";
import type { CommissionWithRelations } from "@/types/commission.types";

// generateMetadata (optionnel) : titre de page dynamique côté serveur
export const metadata = { title: "Commissions — OPUS" };

export default async function CommissionsPage() {
  // Appel direct à Prisma (via la Server Action de lecture) — zéro fetch() nécessaire
  const commissions = await getCommissions();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117]">Commissions</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Vue entreprise · {commissions.length} commission{commissions.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Tableau interactif (Client Component) */}
      {/* On passe les données depuis le serveur vers le composant client via les props.
          C'est le pattern "Server → Client boundary" : le serveur fetch les données,
          le client gère l'interactivité (filtres, boutons). */}
      <CommissionTable commissions={commissions as unknown as CommissionWithRelations[]} />
    </div>
  );
}
