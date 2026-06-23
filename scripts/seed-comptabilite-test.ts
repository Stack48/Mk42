// Seed de test pour le module Comptabilité (ticket 14-FE).
//
// Pré-requis : s'être inscrit sur /inscription avec cet email, puis avoir
// appelé POST /api/dev/seed (connecté) pour créer Utilisateur + Apporteur.
//
// Usage (depuis le container mk42_app) :
//   docker exec -it mk42_app npx ts-node --project tsconfig.seed.json scripts/seed-comptabilite-test.ts <email>

import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

// Siret @unique en base mais sans contrainte de format réel (test only) :
// dérivé de l'email pour rester stable entre deux exécutions du script.
function siretFromEmail(email: string): string {
  const hash = crypto.createHash("sha256").update(email).digest("hex");
  const digits = hash.replace(/[a-f]/g, (c) => String(c.charCodeAt(0) % 10));
  return digits.slice(0, 14);
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error(
      "Usage: npx ts-node --project tsconfig.seed.json scripts/seed-comptabilite-test.ts <email>"
    );
    process.exit(1);
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { email },
    include: { apporteur: true },
  });

  if (!utilisateur) {
    throw new Error(
      `Aucun Utilisateur pour ${email}. Inscris-toi sur /inscription puis appelle POST /api/dev/seed avec ce compte.`
    );
  }
  if (!utilisateur.apporteur) {
    throw new Error(
      `Utilisateur ${email} trouvé mais sans Apporteur. Relance POST /api/dev/seed connecté avec ce compte.`
    );
  }

  const apporteurId = utilisateur.apporteur.id;

  const entreprise = await prisma.entreprise.upsert({
    where: { utilisateurId: utilisateur.id },
    update: {},
    create: {
      utilisateurId: utilisateur.id,
      raisonSociale: "Entreprise Test BTP",
      siret: siretFromEmail(email),
      adresseSiege: "1 rue du Test, 75000 Paris",
      email,
      telephone: "0600000000",
    },
  });

  const aujourdHui = new Date();
  const prefixeNumero = `TEST-${entreprise.id.slice(0, 8)}`;

  for (const [i, montantHT] of [1000, 2500].entries()) {
    const tauxTva = 20;
    const montantTva = montantHT * (tauxTva / 100);
    await prisma.facture.upsert({
      where: { numero: `${prefixeNumero}-FACT-${i + 1}` },
      update: {},
      create: {
        numero: `${prefixeNumero}-FACT-${i + 1}`,
        apporteurId,
        entrepriseId: entreprise.id,
        statut: "PAYEE",
        montantHT,
        tauxTva,
        montantTva,
        montantTTC: montantHT + montantTva,
        dateEmission: aujourdHui,
      },
    });
  }

  for (const [i, montant] of [600, 1200].entries()) {
    await prisma.recu.upsert({
      where: { numero: `${prefixeNumero}-RECU-${i + 1}` },
      update: {},
      create: {
        numero: `${prefixeNumero}-RECU-${i + 1}`,
        apporteurId,
        entrepriseId: entreprise.id,
        montant,
        dateVersement: aujourdHui,
      },
    });
  }

  console.log("OK — données de test créées :");
  console.log({ email, apporteurId, entrepriseId: entreprise.id });
}

main()
  .catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
