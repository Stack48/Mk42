// SERVER COMPONENT — Dashboard ROI par apporteur
import type { ApporteurROI } from "@/types/commission.types";

interface Props {
  data: ApporteurROI[];
}

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function DashboardROI({ data }: Props) {
  const totalGenere = data.reduce((s, a) => s + a.montantTotalGenere, 0);
  const totalCommissions = data.reduce((s, a) => s + a.commissionsTotal, 0);
  const totalPaid = data.reduce((s, a) => s + a.commissionsPaid, 0);

  return (
    <div className="space-y-6">
      {/* KPI globaux */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
          <p className="text-sm text-[#6B7280]">CA total généré</p>
          <p className="text-2xl font-bold text-[#0F1117] mt-1">{formatEur(totalGenere)}</p>
        </div>
        <div className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
          <p className="text-sm text-[#6B7280]">Commissions dues</p>
          <p className="text-2xl font-bold text-[#D97706] mt-1">{formatEur(totalCommissions)}</p>
        </div>
        <div className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
          <p className="text-sm text-[#6B7280]">Commissions payées</p>
          <p className="text-2xl font-bold text-[#059669] mt-1">{formatEur(totalPaid)}</p>
        </div>
      </div>

      {/* Tableau ROI par apporteur */}
      <div className="overflow-hidden rounded-[12px] border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-[#6B7280] text-left">
              <th className="px-4 py-3 font-medium">Apporteur</th>
              <th className="px-4 py-3 font-medium">Deals</th>
              <th className="px-4 py-3 font-medium">Signés</th>
              <th className="px-4 py-3 font-medium">Taux conversion</th>
              <th className="px-4 py-3 font-medium">CA généré</th>
              <th className="px-4 py-3 font-medium">Commissions</th>
              <th className="px-4 py-3 font-medium">Payées</th>
              <th className="px-4 py-3 font-medium">Restant dû</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((row) => (
              <tr key={row.apporteur.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[#0F1117]">{row.apporteur.nom}</p>
                    <p className="text-xs text-[#6B7280]">{row.apporteur.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#6B7280]">{row.totalDeals}</td>
                <td className="px-4 py-3 text-[#6B7280]">{row.dealsSignes}</td>
                <td className="px-4 py-3">
                  {/* Barre de progression du taux de conversion */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4F6EF7] rounded-full"
                        style={{ width: `${row.tauxConversion}%` }}
                      />
                    </div>
                    <span className="text-[#0F1117] font-medium">{row.tauxConversion}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-[#0F1117]">
                  {formatEur(row.montantTotalGenere)}
                </td>
                <td className="px-4 py-3 text-[#D97706] font-medium">
                  {formatEur(row.commissionsTotal)}
                </td>
                <td className="px-4 py-3 text-[#059669] font-medium">
                  {formatEur(row.commissionsPaid)}
                </td>
                <td className="px-4 py-3 text-[#0F1117] font-semibold">
                  {formatEur(row.commissionsPending)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
