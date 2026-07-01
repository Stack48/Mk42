import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfilEntrepriseForm from "./ProfilEntrepriseForm";
import ProfilApporteurForm from "./ProfilApporteurForm";

export const metadata = { title: "Paramètres du profil — Opus" };

export default async function ProfilPage() {
  const { userId } = await auth();
  if (!userId) redirect("/connexion");

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: {
      email: true,
      profil: true,
      entreprise: {
        select: {
          telephone: true,
          raisonSociale: true,
          siret: true,
          adresseSiege: true,
          iban: true,
          bic: true,
          nomTitulaireIban: true,
          statutKyc: true,
          logoUrl: true,
          bannerUrl: true,
        },
      },
      apporteur: {
        select: {
          prenom: true,
          nom: true,
          telephone: true,
          iban: true,
          bic: true,
          type: true,
          raisonSociale: true,
          siret: true,
          statutKyc: true,
        },
      },
    },
  });

  if (!utilisateur) redirect("/inscription");

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1117]">Paramètres du profil</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Gérez vos informations personnelles, professionnelles et bancaires pour garantir la conformité de vos commissions.
        </p>
      </div>

      {utilisateur.entreprise ? (
        <ProfilEntrepriseForm
          email={utilisateur.email}
          telephone={utilisateur.entreprise.telephone}
          raisonSociale={utilisateur.entreprise.raisonSociale}
          siret={utilisateur.entreprise.siret}
          adresseSiege={utilisateur.entreprise.adresseSiege}
          iban={utilisateur.entreprise.iban}
          bic={utilisateur.entreprise.bic}
          nomTitulaireIban={utilisateur.entreprise.nomTitulaireIban}
          statutKyc={utilisateur.entreprise.statutKyc}
          logoUrl={utilisateur.entreprise.logoUrl}
          bannerUrl={utilisateur.entreprise.bannerUrl}
        />
      ) : utilisateur.apporteur ? (
        <ProfilApporteurForm
          email={utilisateur.email}
          prenom={utilisateur.apporteur.prenom}
          nom={utilisateur.apporteur.nom}
          telephone={utilisateur.apporteur.telephone}
          iban={utilisateur.apporteur.iban}
          bic={utilisateur.apporteur.bic}
          isProfessionnel={utilisateur.apporteur.type === "PROFESSIONNEL"}
          raisonSociale={utilisateur.apporteur.raisonSociale}
          siret={utilisateur.apporteur.siret}
          statutKyc={utilisateur.apporteur.statutKyc}
        />
      ) : (
        redirect("/inscription")
      )}
    </div>
  );
}
