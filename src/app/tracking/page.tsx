import { prisma } from "@/lib/prisma";

function fmt(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default async function TrackingDashboard() {
  const links = await prisma.trackingLink.findMany({
    include: { logs: { select: { id: true, rfc3161Hash: true }, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const totalClics = links.reduce((acc, l) => acc + l.logs.length, 0);
  const linksAvecClic = links.filter((l) => l.logs.length > 0).length;
  const taux =
    links.length > 0 ? Math.round((linksAvecClic / links.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Attribution & preuves de mise en relation
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Liens actifs" value={links.length} />
          <StatCard label="Total clics" value={totalClics} />
          <StatCard label="Liens cliqués" value={linksAvecClic} />
          <StatCard label="Taux de clic" value={`${taux}%`} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Apporteur
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mission
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Clics
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  RFC3161
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Créé le
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {links.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    Aucun lien de tracking généré.
                  </td>
                </tr>
              ) : (
                links.map((link) => {
                  const certified = link.logs.filter((l) => l.rfc3161Hash).length;
                  return (
                    <tr key={link.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-700">
                        {link.apporteurId}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-700">
                        {link.missionId}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            link.statut === "ACTIF"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {link.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {link.logs.length}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {certified}/{link.logs.length}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {fmt(link.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`/api/export/tracking/${link.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                          Export PDF
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
