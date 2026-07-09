"use client";
// COQUILLE CLIENT DE LA SIDEBAR — gère l'état rétracté/déplié.
// Le composant serveur Sidebar.tsx fait le fetch des données (auth, profil)
// et passe tout en props ici, car useState/localStorage exigent "use client".

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IconLogo from "@/components/icons/IconLogo";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

interface Props {
  navItems: NavItem[];
  navCommunBas: NavItem[];
  displayName: string;
  initiales: string;
}

const STORAGE_KEY = "opus-sidebar-collapsed";

export function SidebarClient({ navItems, navCommunBas, displayName, initiales }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  // Restaurer la préférence sauvegardée après le montage (évite le mismatch SSR/client).
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`relative shrink-0 flex flex-col bg-white border-r border-[#E5E7EB] min-h-screen transition-all duration-200 ${
        collapsed ? "w-16" : "w-55"
      }`}
    >
      {/* Bouton rétracter/rouvrir — à cheval sur la bordure droite */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Ouvrir la navigation" : "Réduire la navigation"}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-[#E5E7EB] bg-white shadow-sm flex items-center justify-center text-[#6B7280] hover:text-[#0F1117] hover:bg-[#F3F4F6] transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={`py-5 border-b border-[#E5E7EB] ${collapsed ? "px-3" : "px-5"}`}>
        <Link
          href="/"
          className={`flex items-center gap-2 text-[#0F1117] no-underline ${collapsed ? "justify-center" : ""}`}
        >
          <span className="w-7 h-7 rounded-[7px] bg-opus-primary flex items-center justify-center shrink-0">
            <IconLogo />
          </span>
          {!collapsed && <span className="font-bold text-[17px] tracking-[0.01em]">Opus</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors font-medium ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            {item.icon}
            {!collapsed && item.label}
          </Link>
        ))}

        <div className="pt-3 border-t border-[#E5E7EB] mt-3">
          {navCommunBas.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors font-medium ${
                collapsed ? "justify-center px-0" : ""
              }`}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Profil utilisateur + déconnexion */}
      <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-2">
        <Link
          href="/profil"
          title={collapsed ? displayName : undefined}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#374151] shrink-0">
            {initiales}
          </div>
          {!collapsed && <span className="text-sm font-medium text-[#0F1117] truncate">{displayName}</span>}
        </Link>
        <SignOutButton redirectUrl="/connexion">
          <button
            title={collapsed ? "Déconnexion" : undefined}
            className={`flex items-center gap-2 px-3 py-2 w-full text-sm text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors ${
              collapsed ? "justify-center px-0" : "text-left"
            }`}
          >
            <span>↩</span> {!collapsed && "Déconnexion"}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
