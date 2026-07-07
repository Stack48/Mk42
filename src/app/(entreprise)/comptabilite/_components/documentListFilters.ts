export interface DocumentItem {
  id: string;
  reference: string;
  apporteur: string;
  montant: number;
  date: string;
  statut: string;
}

export function getAnneesDisponibles(items: DocumentItem[]): number[] {
  const annees = new Set(items.map((item) => new Date(item.date).getUTCFullYear()));
  return Array.from(annees).sort((a, b) => b - a);
}

export function filterItems(
  items: DocumentItem[],
  recherche: string,
  anneeFiltre: number | "TOUTES"
): DocumentItem[] {
  const q = recherche.trim().toLowerCase();
  return items.filter((item) => {
    const matchAnnee =
      anneeFiltre === "TOUTES" || new Date(item.date).getUTCFullYear() === anneeFiltre;
    const matchRecherche =
      q === "" ||
      item.apporteur.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q);
    return matchAnnee && matchRecherche;
  });
}
