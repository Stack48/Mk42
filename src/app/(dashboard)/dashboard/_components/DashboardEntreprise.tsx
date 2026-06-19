import { getDashboardEntreprise } from "@/lib/actions/dashboard.actions";
import { KpiCard } from "./KpiCard";
import { ActionsRapides } from "./ActionsRapides";
import { ActionsRecentes } from "./ActionsRecentes";
import { DernieresTransactions } from "./DernieresTransactions";
import { AffairesRecentesTable } from "./AffairesRecentesTable";

const ACTIONS_ENTREPRISE = [
  { label: "Suivre mes gains",        href: "/commissions",  icon: "💰" },
  { label: "Signer un contrat",       href: "/contrats",     icon: "✍️" },
  { label: "Télécharger mes factures",href: "/comptabilite", icon: "⬇️" },
  { label: "Exporter Documents",      href: "/comptabilite", icon: "📤" },
];

export async function DashboardEntreprise({ entrepriseId }: { entrepriseId: string }) {
  const data = await getDashboardEntreprise(entrepriseId);

  const montantMoisStr   = `${data.montantMois.toLocaleString("fr-FR")} €`;
  const montantAnnuelStr = `${data.montantAnnuel.toLocaleString("fr-FR")} €`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1117]">Tableau de bord</h1>
      </div>

      {/* Actions rapides */}
      <ActionsRapides actions={ACTIONS_ENTREPRISE} />

      {/* KPI Cards */}
      <div className="flex gap-4 flex-wrap">
        <KpiCard valeur={montantMoisStr}              label="Montant généré ce mois"   bg="bg-[#E0F2FE]" textColor="text-[#0369A1]" />
        <KpiCard valeur={montantAnnuelStr}            label="Montant annuel"           bg="bg-[#D1FAE5]" textColor="text-[#065F46]" />
        <KpiCard valeur={String(data.dealsEnAttente)} label="En attente"              bg="bg-[#FEF3C7]" textColor="text-[#92400E]" />
        <KpiCard valeur={String(data.opportunitesAcceptees)} label="Opportunités acceptées" bg="bg-[#F5F0E8]" textColor="text-[#78350F]" />
      </div>

      {/* Actions récentes + Dernières transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-base font-semibold text-[#0F1117] mb-4">Actions récentes</h2>
          <ActionsRecentes items={data.actionsRecentes} />
        </section>
        <section>
          <h2 className="text-base font-semibold text-[#0F1117] mb-4">Dernières transactions</h2>
          <DernieresTransactions items={data.dernieresTransactions} />
        </section>
      </div>

      {/* Affaires récentes */}
      <section>
        <h2 className="text-base font-semibold text-[#0F1117] mb-4">Affaires récentes</h2>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-4 py-2">
          <AffairesRecentesTable items={data.affairesRecentes} />
        </div>
      </section>
    </div>
  );
}
