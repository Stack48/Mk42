import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient, TypeApporteur } from "../src/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ANNEE_ACTUELLE = new Date().getFullYear();
const ANNEES = [ANNEE_ACTUELLE - 2, ANNEE_ACTUELLE - 1, ANNEE_ACTUELLE];

async function upsertApporteur(input: {
  slug: string;
  type: (typeof TypeApporteur)[keyof typeof TypeApporteur];
  nom: string;
  prenom: string;
  raisonSociale?: string;
  siret?: string;
  dateNaissance?: Date;
  lieuNaissance?: string;
}) {
  const email = `seed-das2-${input.slug}@test.local`;
  const clerkId = `seed-das2-${input.slug}`;

  const utilisateur = await prisma.utilisateur.upsert({
    where: { email },
    update: {},
    create: { clerkId, email },
  });

  const donnees = {
    type: input.type,
    nom: input.nom,
    prenom: input.prenom,
    telephone: "0600000000",
    adresse: "1 rue de Test",
    ville: "Paris",
    codePostal: "75001",
    pays: "France",
    raisonSociale: input.raisonSociale,
    siret: input.siret,
    dateNaissance: input.dateNaissance,
    lieuNaissance: input.lieuNaissance,
  };

  return prisma.apporteur.upsert({
    where: { utilisateurId: utilisateur.id },
    update: donnees,
    create: { utilisateurId: utilisateur.id, ...donnees },
  });
}

async function main() {
  const entreprise = await prisma.entreprise.findFirst({ orderBy: { createdAt: "asc" } });
  if (!entreprise) {
    throw new Error(
      "Aucune entreprise trouvée. Connectez-vous une première fois via /inscription " +
        "(profil entreprise) avant de lancer ce seed."
    );
  }

  const pro1 = await upsertApporteur({
    slug: "pro1",
    type: TypeApporteur.PROFESSIONNEL,
    nom: "Dupont",
    prenom: "Constructions",
    raisonSociale: "Constructions Dupont SARL",
    siret: "12345678900012",
  });

  const pro2 = await upsertApporteur({
    slug: "pro2",
    type: TypeApporteur.PROFESSIONNEL,
    nom: "Plus",
    prenom: "Rénov",
    raisonSociale: "Rénov Plus EURL",
    siret: "98765432100019",
  });

  const particulier1 = await upsertApporteur({
    slug: "particulier1",
    type: TypeApporteur.PARTICULIER,
    nom: "Martin",
    prenom: "Paul",
    dateNaissance: new Date("1985-03-12"),
    lieuNaissance: "Lyon",
  });

  const particulier2 = await upsertApporteur({
    slug: "particulier2",
    type: TypeApporteur.PARTICULIER,
    nom: "Bernard",
    prenom: "Julie",
    dateNaissance: new Date("1990-07-22"),
    lieuNaissance: "Marseille",
  });

  console.log(`🌱 Seed DAS2 sur l'entreprise "${entreprise.raisonSociale}" (${entreprise.id})`);

  for (const annee of ANNEES) {
    // pro1 cumule 2100€ HT = 2520€ TTC → dépasse le seuil DAS2 (2400€ TTC), éligible.
    // pro2 reste à 800€ HT = 960€ TTC → sous le seuil, exclu de la DAS2.
    const facturesAnnee = [
      { apporteur: pro1, montantHT: 1200 },
      { apporteur: pro2, montantHT: 800 },
      { apporteur: pro1, montantHT: 900 },
    ];

    for (const [i, { apporteur, montantHT }] of facturesAnnee.entries()) {
      const numero = `SEED-DAS2-FAC-${apporteur.id}-${annee}-${i}`;
      const montantTva = Math.round(montantHT * 0.2 * 100) / 100;
      const montantTTC = Math.round((montantHT + montantTva) * 100) / 100;

      await prisma.facture.upsert({
        where: { numero },
        update: {
          statut: "PAYEE",
          montantHT,
          tauxTva: 20,
          montantTva,
          montantTTC,
          dateEmission: new Date(`${annee}-06-15`),
          datePaiement: new Date(`${annee}-06-20`),
        },
        create: {
          numero,
          apporteurId: apporteur.id,
          entrepriseId: entreprise.id,
          statut: "PAYEE",
          montantHT,
          tauxTva: 20,
          montantTva,
          montantTTC,
          dateEmission: new Date(`${annee}-06-15`),
          datePaiement: new Date(`${annee}-06-20`),
        },
      });
    }

    // particulier1 dépasse le seuil DAS2 (2400€), éligible. particulier2 reste en dessous, exclu.
    const recusAnnee = [
      { apporteur: particulier1, montant: 2500 },
      { apporteur: particulier2, montant: 550 },
    ];

    for (const [i, { apporteur, montant }] of recusAnnee.entries()) {
      const numero = `SEED-DAS2-REC-${apporteur.id}-${annee}-${i}`;

      await prisma.recu.upsert({
        where: { numero },
        update: {
          montant,
          dateVersement: new Date(`${annee}-09-10`),
        },
        create: {
          numero,
          apporteurId: apporteur.id,
          entrepriseId: entreprise.id,
          montant,
          dateVersement: new Date(`${annee}-09-10`),
        },
      });
    }

    console.log(
      `  ✅ Année ${annee} : 3 factures PAYEE (pros) + 2 reçus versés (particuliers) — pro1 et particulier1 dépassent le seuil DAS2`
    );
  }

  console.log("");
  console.log("📊 Rendez-vous sur /comptabilite pour voir la grille DAS2.");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed DAS2 :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
