import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function validerInteret(clientId: string) {
  "use server";
  await prisma.client.update({
    where: { id: clientId },
    data: {
      statut: "INTERET_VALIDE",
      history: { create: { action: "Intérêt validé" } },
    },
  });
  revalidatePath(`/clients/admin/${clientId}`);
}

const STATUT_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  INTERET_VALIDE: "Intérêt validé",
  REJETE: "Rejeté",
};

const STATUT_COLORS: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  INTERET_VALIDE: "bg-green-100 text-green-700",
  REJETE: "bg-red-100 text-red-700",
};

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      history: { orderBy: { createdAt: "asc" } },
      apporteur: { select: { name: true, email: true } },
    },
  });

  if (!client) notFound();

  const validerAvecId = validerInteret.bind(null, client.id);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {client.nom ?? "—"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{client.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Apporté par {client.apporteur.name ?? client.apporteur.email}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                STATUT_COLORS[client.statut] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUT_LABELS[client.statut] ?? client.statut}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Créé le{" "}
            {new Date(client.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>

          {client.statut === "NOUVEAU" && (
            <form action={validerAvecId} className="mt-5">
              <button
                type="submit"
                className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Valider l'intérêt
              </button>
            </form>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Historique
          </h2>

          {client.history.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune action enregistrée.</p>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-5 pl-5">
              {client.history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                  <p className="text-sm font-medium text-gray-800">
                    {entry.action}
                  </p>
                  <time className="text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}
