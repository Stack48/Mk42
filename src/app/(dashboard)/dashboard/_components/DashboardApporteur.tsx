import { getDashboardApporteur } from "@/lib/actions/dashboard.actions";
import { KpiCard } from "./KpiCard";
import { ActionsRapides } from "./ActionsRapides";
import { ActionsRecentes } from "./ActionsRecentes";
import { DernieresTransactions } from "./DernieresTransactions";
import { AffairesRecentesTable } from "./AffairesRecentesTable";
import IconPlus from "@/components/icons/IconPlus";
import IconFileContract from "@/components/icons/IconFileContract";
import IconChartLine from "@/components/icons/IconChartLine";

const ICON_CLS = "w-4 h-4 shrink-0";

const ACTIONS_APPORTEUR = [
  { label: "Soumettre une opportunité", href: "/opportunites/nouvelle", icon: <IconPlus className={ICON_CLS} /> },
  { label: "Voir mes contrats",         href: "/contrats",              icon: <IconFileContract className={ICON_CLS} /> },
  { label: "Mes relevés",               href: "/commissions",           icon: <IconChartLine className={ICON_CLS} /> },
];

export async function DashboardApporteur({ apporteurId }: { apporteurId: string }) {
  const data = await getDashboardApporteur(apporteurId);

  const commissionsMoisStr   = `${data.commissionsMois.toLocaleString("fr-FR")} €`;
  const commissionsAnnuelStr = `${data.commissionsAnnuel.toLocaleString("fr-FR")} €`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1117]">Tableau de bord</h1>
      </div>

      {/* Actions rapides */}
      <ActionsRapides actions={ACTIONS_APPORTEUR} />

      {/* KPI Cards */}
      <div className="flex gap-4 flex-wrap">
        <KpiCard valeur={commissionsMoisStr}   label="Commissions ce mois"       bg="bg-[#E0F2FE]" textColor="text-[#0369A1]" />
        <KpiCard valeur={commissionsAnnuelStr} label="Total commissions annuelles" bg="bg-[#D1FAE5]" textColor="text-[#065F46]" />
        <KpiCard valeur={String(data.opportunitesEnAttente)}  label="Opportunités en attente"  bg="bg-[#FEF3C7]" textColor="text-[#92400E]" />
        <KpiCard valeur={String(data.opportunitesAcceptees)}  label="Opportunités acceptées"   bg="bg-[#F5F0E8]" textColor="text-[#78350F]" />
      </div>

      {/* Actions récentes + Dernières transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-base font-semibold text-[#0F1117] mb-4">Mes commissions récentes</h2>
          <ActionsRecentes items={data.actionsRecentes} />
        </section>
        <section>
          <h2 className="text-base font-semibold text-[#0F1117] mb-4">Dernières opportunités</h2>
          <DernieresTransactions items={data.dernieresTransactions} />
        </section>
      </div>

      {/* Affaires récentes */}
      <section>
        <h2 className="text-base font-semibold text-[#0F1117] mb-4">Mes affaires récentes</h2>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-4 py-2">
          <AffairesRecentesTable items={data.affairesRecentes} />
        </div>
      </section>
    </div>
  );
}
