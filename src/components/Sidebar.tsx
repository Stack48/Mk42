// src/components/Sidebar.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import IconLogo from "@/components/icons/IconLogo";
import IconDashboardGrid from "@/components/icons/IconDashboardGrid";
import IconBuilding from "@/components/icons/IconBuilding";
import IconBriefClip from "@/components/icons/IconBriefClip";
import IconChartLine from "@/components/icons/IconChartLine";
import IconDocList from "@/components/icons/IconDocList";
import IconFileContract from "@/components/icons/IconFileContract";
import IconBell from "@/components/icons/IconBell";

const ICON_CLS = "w-4 h-4 shrink-0";

const NAV_ENTREPRISE = [
  { href: "/dashboard",    label: "Dashboard",         icon: <IconDashboardGrid className={ICON_CLS} /> },
  { href: "/clients",      label: "Mes Clients",       icon: <IconBuilding className={ICON_CLS} /> },
  { href: "/deals",        label: "Deals",             icon: <IconBriefClip className={ICON_CLS} /> },
  { href: "/comptabilite", label: "Comptabilité",      icon: <IconChartLine className={ICON_CLS} /> },
];

const NAV_APPORTEUR = [
  { href: "/dashboard",    label: "Dashboard",         icon: <IconDashboardGrid className={ICON_CLS} /> },
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
    <aside className="w-55 shrink-0 flex flex-col bg-white border-r border-[#E5E7EB] min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2 text-[#0F1117] no-underline">
          <span className="w-7 h-7 rounded-[7px] bg-opus-primary flex items-center justify-center">
            <IconLogo />
          </span>
          <span className="font-bold text-[17px] tracking-[0.01em]">Opus</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors font-medium"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <div className="pt-3 border-t border-[#E5E7EB] mt-3">
          {NAV_COMMUN_BAS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors font-medium"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Profil utilisateur + déconnexion */}
      <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-2">
        <Link
          href="/profil"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#374151] shrink-0">
            {initiales}
          </div>
          <span className="text-sm font-medium text-[#0F1117] truncate">{displayName}</span>
        </Link>
        <SignOutButton redirectUrl="/connexion">
          <button className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors">
            <span>↩</span> Déconnexion
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
