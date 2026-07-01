// SEED DISCOVERY — 12 entreprises BTP de démonstration
// Commande : npx ts-node --transpile-only -P tsconfig.seed.json scripts/seed-discovery.ts

import { PrismaClient } from "../src/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter } as never);

const ENTREPRISES = [
  {
    clerkId: "seed_clerk_001",
    email: "contact@batisseurs-lyon.fr",
    raisonSociale: "Les Bâtisseurs Lyonnais",
    siret: "41234567800011",
    adresseSiege: "12 Rue de la République, 69001 Lyon",
    telephone: "04 72 11 22 33",
    codeApe: "4120A",
    representantLegal: "Pierre Renard",
    tauxCommissionDefaut: 5.0,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_002",
    email: "info@maconnerie-provence.fr",
    raisonSociale: "Maçonnerie Provence & Fils",
    siret: "41234567800022",
    adresseSiege: "8 Avenue du Prado, 13008 Marseille",
    telephone: "04 91 33 44 55",
    codeApe: "4312A",
    representantLegal: "Michel Fabre",
    tauxCommissionDefaut: 4.5,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_003",
    email: "contact@toiture-nord.fr",
    raisonSociale: "Toiture & Charpente du Nord",
    siret: "41234567800033",
    adresseSiege: "22 Rue Nationale, 59000 Lille",
    telephone: "03 20 55 66 77",
    codeApe: "4391A",
    representantLegal: "Sophie Lecomte",
    tauxCommissionDefaut: null,
    montantFixeDefaut: 800,
  },
  {
    clerkId: "seed_clerk_004",
    email: "devis@elec-paris.fr",
    raisonSociale: "Électricité Générale Parisienne",
    siret: "41234567800044",
    adresseSiege: "45 Boulevard Haussmann, 75009 Paris",
    telephone: "01 42 11 33 55",
    codeApe: "4321A",
    representantLegal: "Laurent Dubois",
    tauxCommissionDefaut: 6.0,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_005",
    email: "contact@plomberie-atlantique.fr",
    raisonSociale: "Plomberie Atlantique SARL",
    siret: "41234567800055",
    adresseSiege: "3 Rue du Commerce, 44000 Nantes",
    telephone: "02 40 22 44 66",
    codeApe: "4322A",
    representantLegal: "Éric Moreau",
    tauxCommissionDefaut: 5.5,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_006",
    email: "info@isolation-occitanie.fr",
    raisonSociale: "Isolation Occitanie",
    siret: "41234567800066",
    adresseSiege: "18 Allée Jean Jaurès, 31000 Toulouse",
    telephone: "05 61 77 88 99",
    codeApe: "4391B",
    representantLegal: "Isabelle Vidal",
    tauxCommissionDefaut: null,
    montantFixeDefaut: 600,
  },
  {
    clerkId: "seed_clerk_007",
    email: "contact@menuiserie-alsace.fr",
    raisonSociale: "Menuiserie Alsacienne EURL",
    siret: "41234567800077",
    adresseSiege: "6 Rue du Général de Gaulle, 67000 Strasbourg",
    telephone: "03 88 44 55 66",
    codeApe: "4332A",
    representantLegal: "Thomas Keller",
    tauxCommissionDefaut: 4.0,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_008",
    email: "pro@carrelage-sud.fr",
    raisonSociale: "Carrelage & Sols du Sud",
    siret: "41234567800088",
    adresseSiege: "27 Chemin des Fenouillères, 06200 Nice",
    telephone: "04 93 66 77 88",
    codeApe: "4333Z",
    representantLegal: "Aurélien Rossi",
    tauxCommissionDefaut: 5.0,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_009",
    email: "contact@peinture-idf.fr",
    raisonSociale: "Peinture Ile-de-France Pro",
    siret: "41234567800099",
    adresseSiege: "14 Rue des Lilas, 93100 Montreuil",
    telephone: "01 48 99 11 22",
    codeApe: "4334Z",
    representantLegal: "Christophe Petit",
    tauxCommissionDefaut: null,
    montantFixeDefaut: 500,
  },
  {
    clerkId: "seed_clerk_010",
    email: "info@gros-oeuvre-bretagne.fr",
    raisonSociale: "Gros Œuvre Bretagne SAS",
    siret: "41234567800100",
    adresseSiege: "9 Place de la Mairie, 35000 Rennes",
    telephone: "02 99 33 44 55",
    codeApe: "4120B",
    representantLegal: "Yann Le Goff",
    tauxCommissionDefaut: 6.5,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_011",
    email: "contact@renovation-bordeaux.fr",
    raisonSociale: "Rénovation Bordeaux Métropole",
    siret: "41234567800111",
    adresseSiege: "33 Cours Victor Hugo, 33000 Bordeaux",
    telephone: "05 56 88 99 00",
    codeApe: "4120A",
    representantLegal: "Marie-Claire Dupont",
    tauxCommissionDefaut: 5.0,
    montantFixeDefaut: null,
  },
  {
    clerkId: "seed_clerk_012",
    email: "devis@charpente-auvergne.fr",
    raisonSociale: "Charpente Auvergne Bois",
    siret: "41234567800122",
    adresseSiege: "5 Rue Blatin, 63000 Clermont-Ferrand",
    telephone: "04 73 55 66 77",
    codeApe: "4391A",
    representantLegal: "François Girard",
    tauxCommissionDefaut: null,
    montantFixeDefaut: 1000,
  },
];

async function main() {
  console.log("🌱 Seed Discovery — création de 12 entreprises BTP...\n");

  for (const data of ENTREPRISES) {
    const utilisateur = await (prisma as any).utilisateur.upsert({
      where: { clerkId: data.clerkId },
      update: {},
      create: {
        clerkId: data.clerkId,
        email: data.email,
        profil: "entreprise",
        emailVerified: true,
      },
    });

    await (prisma as any).entreprise.upsert({
      where: { siret: data.siret },
      update: {},
      create: {
        utilisateurId: utilisateur.id,
        raisonSociale: data.raisonSociale,
        siret: data.siret,
        adresseSiege: data.adresseSiege,
        email: data.email,
        telephone: data.telephone,
        codeApe: data.codeApe,
        representantLegal: data.representantLegal,
        tauxCommissionDefaut: data.tauxCommissionDefaut,
        montantFixeDefaut: data.montantFixeDefaut,
        statutKyc: "VALIDE",
      },
    });

    console.log(`  ✅ ${data.raisonSociale}`);
  }

  console.log("\n✔ 12 entreprises créées. Rafraîchis /discovery.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => (prisma as any).$disconnect());
