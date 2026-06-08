// PAGE /commissions/apporteur/[id] — Vue apporteur
//
// [id] = segment dynamique (comme {id} dans une route Symfony).
// Next.js passe automatiquement params.id via les props du composant.
//
// SERVER COMPONENT : fetch des données personnalisées pour cet apporteur.

import { CommissionCard } from "@/components/commissions/CommissionCard";
import { prisma } from "@/lib/prisma/client";
import type { CommissionWithRelations } from "@/types/commission.types";
import Link from "next/link";
import { notFound } from "next/navigation";

// generateMetadata dynamique : le <title> inclut le nom de l'apporteur
// Next.js appelle cette fonction AVANT de rendre la page (côté serveur).
export async function generateMetadata({ params }: { params: { id: string } }) {
  const apporteur = await prisma.apporteur.findUnique({ where: { id: params.id } });
  return { title: `${apporteur?.nom ?? "Apporteur"} — OPUS` };
}

export default async function ApporteurPage({
  params,
}: {
  params: { id: string };
}) {
  // Vérifier que l'apporteur existe
  const apporteur = await prisma.apporteur.findUnique({
    where: { id: params.id },
  });

  // notFound() = renvoie une 404 Next.js (déclenche le fichier not-found.tsx si présent)
  if (!apporteur) notFound();

  const commissions: CommissionWithRelations[] = [];

  // Calculs côté serveur — pas besoin de useState pour ça
  const totalDu = commissions
    .filter((c) => c.statut !== "PAID")
    .reduce((s, c) => s + c.montant, 0);
  const totalPaid = commissions
    .filter((c) => c.statut === "PAID")
    .reduce((s, c) => s + c.montant, 0);

  const formatEur = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117]">{apporteur.nom}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{apporteur.email}</p>
        </div>
        <Link href="/commissions" className="text-sm text-[#4F6EF7] hover:underline">
          ← Toutes les commissions
        </Link>
      </div>

      {/* KPI résumé */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
          <p className="text-sm text-[#6B7280]">Total à percevoir</p>
          <p className="text-2xl font-bold text-[#D97706] mt-1">{formatEur(totalDu)}</p>
        </div>
        <div className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
          <p className="text-sm text-[#6B7280]">Total déjà perçu</p>
          <p className="text-2xl font-bold text-[#059669] mt-1">{formatEur(totalPaid)}</p>
        </div>
      </div>

      {/* Liste des commissions */}
      <h2 className="text-lg font-semibold text-[#0F1117]">
        Historique ({commissions.length})
      </h2>

      {commissions.length === 0 ? (
        <p className="text-[#6B7280] py-8 text-center">Aucune commission pour cet apporteur.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {commissions.map((c) => (
            <CommissionCard
              key={c.id}
              commission={c as unknown as CommissionWithRelations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
