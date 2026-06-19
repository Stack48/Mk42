// src/lib/actions/dashboard.actions.ts
"use server";

import { prisma } from "@/lib/prisma";

export type ActionRecente = {
  id: string;
  label: string;
  sousTitre: string;
  dateRelative: string;
  couleur: string; // Tailwind bg class ex: "bg-emerald-500"
};

export type Transaction = {
  id: string;
  label: string;
  statut: string;
  couleur: string; // Tailwind bg class ex: "bg-amber-400"
};

export type AffaireRecente = {
  id: string;
  clientNom: string;
  typeTravaux: string;
  statut: string;
  statutLabel: string;
  statutCouleur: "green" | "yellow" | "red" | "gray";
};

export type DashboardEntrepriseData = {
  montantMois: number;
  montantAnnuel: number;
  dealsEnAttente: number;
  opportunitesAcceptees: number;
  actionsRecentes: ActionRecente[];
  dernieresTransactions: Transaction[];
  affairesRecentes: AffaireRecente[];
};

export type DashboardApporteurData = {
  commissionsMois: number;
  commissionsAnnuel: number;
  opportunitesEnAttente: number;
  opportunitesAcceptees: number;
  actionsRecentes: ActionRecente[];
  dernieresTransactions: Transaction[];
  affairesRecentes: AffaireRecente[];
};

function dateRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Il y a ${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heures`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} jours`;
}

const DEAL_STATUT_COULEUR: Record<string, string> = {
  PROSPECT:  "bg-gray-400",
  CONTACTE:  "bg-blue-500",
  NEGOCIE:   "bg-violet-500",
  SIGNE:     "bg-emerald-500",
  PAYE:      "bg-emerald-600",
  ANNULE:    "bg-red-500",
};

const OPPORTUNITE_STATUT: Record<string, { label: string; couleur: "green" | "yellow" | "red" | "gray" }> = {
  SOUMISE:       { label: "En Attente",    couleur: "yellow" },
  ACCEPTEE:      { label: "Terminé",       couleur: "green"  },
  REFUSEE:       { label: "Refusé",        couleur: "red"    },
  EN_NEGOCIATION:{ label: "En Négociation",couleur: "gray"   },
};

export async function getDashboardEntreprise(entrepriseId: string): Promise<DashboardEntrepriseData> {
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const debutAnnee = new Date(now.getFullYear(), 0, 1);

  const [commissionsMois, commissionsAnnuel, dealsEnAttente, opportunitesAcceptees, derniersDeals, dernieresOpportunites] = await Promise.all([
    prisma.commission.aggregate({
      where: { entrepriseId, createdAt: { gte: debutMois } },
      _sum: { montant: true },
    }),
    prisma.commission.aggregate({
      where: { entrepriseId, createdAt: { gte: debutAnnee } },
      _sum: { montant: true },
    }),
    prisma.kanbanDeal.count({
      where: { apporteur: { opportunites: { some: { entrepriseId } } }, statut: { in: ["PROSPECT", "CONTACTE", "NEGOCIE"] } },
    }),
    prisma.opportunite.count({
      where: { entrepriseId, statut: "ACCEPTEE" },
    }),
    prisma.kanbanDeal.findMany({
      where: { apporteur: { opportunites: { some: { entrepriseId } } } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { apporteur: { select: { nom: true, prenom: true } } },
    }),
    prisma.opportunite.findMany({
      where: { entrepriseId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { client: { select: { nom: true } } },
    }),
  ]);

  const actionsRecentes: ActionRecente[] = derniersDeals.map((d) => ({
    id: d.id,
    label: `Deal avec ${d.apporteur.prenom} ${d.apporteur.nom}`,
    sousTitre: d.titre,
    dateRelative: dateRelative(d.createdAt),
    couleur: DEAL_STATUT_COULEUR[d.statut] ?? "bg-gray-400",
  }));

  const dernieresTransactions: Transaction[] = dernieresOpportunites.map((o) => ({
    id: o.id,
    label: o.typeTravaux,
    statut: OPPORTUNITE_STATUT[o.statut]?.label ?? o.statut,
    couleur: o.statut === "ACCEPTEE" ? "bg-emerald-500" : o.statut === "REFUSEE" ? "bg-red-500" : "bg-amber-400",
  }));

  const affairesRecentes: AffaireRecente[] = dernieresOpportunites.map((o) => ({
    id: o.id,
    clientNom: o.client.nom ?? "",
    typeTravaux: o.typeTravaux,
    statut: o.statut,
    statutLabel: OPPORTUNITE_STATUT[o.statut]?.label ?? o.statut,
    statutCouleur: OPPORTUNITE_STATUT[o.statut]?.couleur ?? "gray",
  }));

  return {
    montantMois: commissionsMois._sum.montant ?? 0,
    montantAnnuel: commissionsAnnuel._sum.montant ?? 0,
    dealsEnAttente,
    opportunitesAcceptees,
    actionsRecentes,
    dernieresTransactions,
    affairesRecentes,
  };
}

export async function getDashboardApporteur(apporteurId: string): Promise<DashboardApporteurData> {
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const debutAnnee = new Date(now.getFullYear(), 0, 1);

  const [commissionsMois, commissionsAnnuel, opportunitesEnAttente, opportunitesAcceptees, dernieresCommissions, dernieresOpportunites] = await Promise.all([
    prisma.commission.aggregate({
      where: { apporteurId, createdAt: { gte: debutMois } },
      _sum: { montant: true },
    }),
    prisma.commission.aggregate({
      where: { apporteurId, createdAt: { gte: debutAnnee } },
      _sum: { montant: true },
    }),
    prisma.opportunite.count({
      where: { apporteurId, statut: "SOUMISE" },
    }),
    prisma.opportunite.count({
      where: { apporteurId, statut: "ACCEPTEE" },
    }),
    prisma.commission.findMany({
      where: { apporteurId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { deal: { select: { titre: true } } },
    }),
    prisma.opportunite.findMany({
      where: { apporteurId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { client: { select: { nom: true } } },
    }),
  ]);

  const actionsRecentes: ActionRecente[] = dernieresCommissions.map((c) => ({
    id: c.id,
    label: `Commission — ${c.deal.titre}`,
    sousTitre: `${c.montant.toLocaleString("fr-FR")} €`,
    dateRelative: dateRelative(c.createdAt),
    couleur: c.statut === "PAID" ? "bg-emerald-500" : "bg-amber-400",
  }));

  const dernieresTransactions: Transaction[] = dernieresOpportunites.map((o) => ({
    id: o.id,
    label: o.typeTravaux,
    statut: OPPORTUNITE_STATUT[o.statut]?.label ?? o.statut,
    couleur: o.statut === "ACCEPTEE" ? "bg-emerald-500" : o.statut === "REFUSEE" ? "bg-red-500" : "bg-amber-400",
  }));

  const affairesRecentes: AffaireRecente[] = dernieresOpportunites.map((o) => ({
    id: o.id,
    clientNom: o.client.nom ?? "",
    typeTravaux: o.typeTravaux,
    statut: o.statut,
    statutLabel: OPPORTUNITE_STATUT[o.statut]?.label ?? o.statut,
    statutCouleur: OPPORTUNITE_STATUT[o.statut]?.couleur ?? "gray",
  }));

  return {
    commissionsMois: commissionsMois._sum.montant ?? 0,
    commissionsAnnuel: commissionsAnnuel._sum.montant ?? 0,
    opportunitesEnAttente,
    opportunitesAcceptees,
    actionsRecentes,
    dernieresTransactions,
    affairesRecentes,
  };
}
