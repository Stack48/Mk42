// src/components/Sidebar.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SidebarClient } from "@/components/SidebarClient";
import IconDashboardGrid from "@/components/icons/IconDashboardGrid";
import IconBuilding from "@/components/icons/IconBuilding";
import IconUsers from "@/components/icons/IconUsers";
import IconBriefClip from "@/components/icons/IconBriefClip";
import IconChartLine from "@/components/icons/IconChartLine";
import IconDocList from "@/components/icons/IconDocList";
import IconFileContract from "@/components/icons/IconFileContract";
import IconBell from "@/components/icons/IconBell";
import IconGridOutline from "@/components/icons/IconGridOutline";

const ICON_CLS = "w-4 h-4 shrink-0";

const NAV_ENTREPRISE = [
  { href: "/dashboard",    label: "Dashboard",         icon: <IconDashboardGrid className={ICON_CLS} /> },
  { href: "/opportunites", label: "Mes Opportunités",  icon: <IconDocList className={ICON_CLS} /> },
  { href: "/clients",      label: "Mes Clients",       icon: <IconBuilding className={ICON_CLS} /> },
  { href: "/apporteurs",   label: "Apporteurs",        icon: <IconUsers className={ICON_CLS} /> },
  { href: "/deals",        label: "Deals",             icon: <IconBriefClip className={ICON_CLS} /> },
  { href: "/comptabilite", label: "Comptabilité",      icon: <IconChartLine className={ICON_CLS} /> },
];

const NAV_APPORTEUR = [
  { href: "/dashboard",    label: "Dashboard",         icon: <IconDashboardGrid className={ICON_CLS} /> },
  { href: "/discovery",    label: "Discovery",         icon: <IconGridOutline className={ICON_CLS} /> },
  { href: "/opportunites", label: "Mes Opportunités",  icon: <IconDocList className={ICON_CLS} /> },
  { href: "/contrats",     label: "Mes Contrats",      icon: <IconFileContract className={ICON_CLS} /> },
];

const NAV_COMMUN_BAS = [
  { href: "/notifications", label: "Notifications", icon: <IconBell className={ICON_CLS} /> },
];

export async function Sidebar() {
  const { userId } = await auth();
  if (!userId) return null;

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { profil: true, email: true, entreprise: { select: { raisonSociale: true } }, apporteur: { select: { prenom: true, nom: true } } },
  });

  const isEntreprise = utilisateur?.profil === "entreprise";
  const navItems = isEntreprise ? NAV_ENTREPRISE : NAV_APPORTEUR;

  const displayName = isEntreprise
    ? (utilisateur?.entreprise?.raisonSociale ?? utilisateur?.email ?? "Entreprise")
    : utilisateur?.apporteur
      ? `${utilisateur.apporteur.prenom} ${utilisateur.apporteur.nom}`
      : (utilisateur?.email ?? "Utilisateur");

  const initiales = displayName.slice(0, 2).toUpperCase();

  return (
    <SidebarClient
      navItems={navItems}
      navCommunBas={NAV_COMMUN_BAS}
      displayName={displayName}
      initiales={initiales}
    />
  );
}
