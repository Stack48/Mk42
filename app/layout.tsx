// LAYOUT RACINE — App Router Next.js
//
// Ce fichier est le "gabarit" de toutes les pages (équivalent du base.html.twig en Symfony).
// Il s'exécute côté serveur et enveloppe TOUTES les pages de l'app.
// Le {children} reçoit la page courante automatiquement via le système de routing.

import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

// Metadata = balises <title> et <meta> générées côté serveur (bon pour le SEO).
// En Symfony, tu ferais ça dans le Controller ou le template Twig.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OPUS — CommissionPro BTP",
  description: "Suivi des commissions apporteurs BTP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
