import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardEntreprise } from "./_components/DashboardEntreprise";
import { DashboardApporteur } from "./_components/DashboardApporteur";

export const metadata = { title: "Dashboard — Opus" };

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/connexion");

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: {
      profil: true,
      entreprise: { select: { id: true } },
      apporteur:  { select: { id: true } },
    },
  });

  if (!utilisateur) redirect("/inscription");

  if (utilisateur.profil === "entreprise" && utilisateur.entreprise) {
    return <DashboardEntreprise entrepriseId={utilisateur.entreprise.id} />;
  }

  if (utilisateur.apporteur) {
    return <DashboardApporteur apporteurId={utilisateur.apporteur.id} />;
  }

  // Profil incomplet — rediriger vers inscription
  redirect("/inscription");
}
