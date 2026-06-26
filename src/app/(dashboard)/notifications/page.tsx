// PAGE /notifications — Vue complète paginée
//
// SERVER COMPONENT : charge les données côté serveur.
// La pagination et le filtre passent par les searchParams (paramètres d'URL).
// Ex: /notifications?filtre=non-lues&page=2
//
// searchParams = l'équivalent de $_GET en PHP ou Request::query() en Symfony.
// Next.js injecte automatiquement les paramètres d'URL dans les props de la page.

import { prisma } from "@/lib/prisma";
import { getNotifications, markAllAsRead } from "@/lib/actions/notification.actions";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NotificationPageActions } from "@/components/notifications/NotificationPageActions";
import type { Notification } from "@/types/notification.types";

export const metadata = { title: "Notifications — OPUS" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ filtre?: string; page?: string }>;
}

export default async function NotificationsPage({ searchParams }: Props) {
  const params = await searchParams;

  // Récupérer le premier apporteur (démo sans auth)
  const demoUser = await prisma.apporteur.findFirst({ orderBy: { createdAt: "asc" } });
  if (!demoUser) {
    return (
      <div className="text-center py-12 text-[#6B7280]">
        Aucun apporteur trouvé.
      </div>
    );
  }

  const filtre     = params.filtre === "non-lues" ? "non-lues" : "toutes";
  const page       = Math.max(1, Number(params.page ?? 1));
  const allNotifs  = await getNotifications(demoUser.id);

  // Filtrage
  const filtered = filtre === "non-lues"
    ? allNotifs.filter((n) => !n.lu)
    : allNotifs;

  // Pagination manuelle (simple, sans Prisma skip/take pour garder l'ordre non-lues-en-premier)
  const total    = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paged    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = allNotifs.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117]">Notifications</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Tout est à jour"}
          </p>
        </div>
        {/* Bouton "Tout marquer comme lu" — Client Component pour useTransition */}
        <NotificationPageActions userId={demoUser.id} hasUnread={unreadCount > 0} />
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {(["toutes", "non-lues"] as const).map((f) => (
          <a
            key={f}
            href={`/notifications?filtre=${f}`}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtre === f
                ? "bg-[#4F6EF7] text-white"
                : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
            }`}
          >
            {f === "toutes" ? "Toutes" : "Non lues"}
          </a>
        ))}
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-[12px] border border-gray-200 bg-white divide-y divide-gray-50">
        {paged.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
            {filtre === "non-lues" ? "Aucune notification non lue." : "Aucune notification."}
          </p>
        ) : (
          paged.map((n) => (
            // Sur la page complète, le clic marque comme lu (via Client Component dédié)
            <NotificationItem
              key={n.id}
              notification={n as Notification}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/notifications?filtre=${filtre}&page=${p}`}
              className={`px-3 py-1 rounded text-sm ${
                p === page
                  ? "bg-[#4F6EF7] text-white"
                  : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
