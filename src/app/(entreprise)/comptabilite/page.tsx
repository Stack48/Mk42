import { prisma } from "@/lib/prisma";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { DocumentList } from "./_components/DocumentList";
import { DAS2YearGrid } from "./_components/DAS2YearGrid";
import { getDAS2Overview } from "@/server/documents/das2-aggregation";

export default async function ComptabilitePage() {
  const entrepriseId = await getCurrentEntrepriseId();

  const [entreprise, factures, recus, das2Overview] = await Promise.all([
    prisma.entreprise.findUniqueOrThrow({ where: { id: entrepriseId } }),
    prisma.facture.findMany({
      where: { entrepriseId },
      include: { apporteur: true },
      orderBy: { dateEmission: "desc" },
    }),
    prisma.recu.findMany({
      where: { entrepriseId },
      include: { apporteur: true },
      orderBy: { dateVersement: "desc" },
    }),
    getDAS2Overview(entrepriseId),
  ]);

  return (
    <main className="max-w-275 mx-auto px-6 py-8 flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-[1.75rem] font-bold text-[#1a1a2e]">Comptabilité</h1>
        <p className="text-[0.9rem] text-[#888]">{entreprise.raisonSociale}</p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.1rem] font-semibold text-[#1a1a2e]">DAS2 — Déclaration annuelle</h2>
        </div>
        <DAS2YearGrid entrepriseId={entrepriseId} annees={das2Overview} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.1rem] font-semibold text-[#1a1a2e]">Factures</h2>
        </div>
        <DocumentList
          type="facture"
          items={factures.map((f) => ({
            id: f.id,
            reference: f.numero,
            apporteur: f.apporteur.nom,
            montant: f.montantTTC,
            date: f.dateEmission.toISOString(),
            statut: f.statut,
          }))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.1rem] font-semibold text-[#1a1a2e]">Reçus de commission</h2>
        </div>
        <DocumentList
          type="recu"
          items={recus.map((r) => ({
            id: r.id,
            reference: r.numero,
            apporteur: r.apporteur.nom,
            montant: r.montant,
            date: (r.dateVersement ?? r.createdAt).toISOString(),
            statut: r.dateVersement ? "PAYE" : "EN_ATTENTE",
          }))}
        />
      </section>
    </main>
  );
}
