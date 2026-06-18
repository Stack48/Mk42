// BADGE COMPTEUR — petit cercle rouge sur la cloche
// Composant pur : pas d'état, pas d'effet de bord.

interface Props {
  count: number;
}

export function NotificationBadge({ count }: Props) {
  if (count === 0) return null; // badge invisible si aucune notif non lue

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4F6EF7] text-white text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
