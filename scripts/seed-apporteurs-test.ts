// Seed de test pour la liste apporteurs (vue entreprise, /apporteurs).
//
// prisma/seed.ts est obsolète par rapport au schéma actuel (Apporteur n'a plus
// de champ `email` propre, `entrepriseId` y est un literal qui ne correspond à
// aucune Entreprise réelle) : ce script suit plutôt le pattern de
// seed-comptabilite-test.ts, en créant des Deal + Commission pour de vrais
// comptes Entreprise/Apporteur déjà existants en base (créés via /inscription).
//
// Usage :
//   npx tsx -r dotenv/config scripts/seed-apporteurs-test.ts dotenv_config_path=.env.local

import { prisma } from "../src/lib/prisma";

async function main() {
  const entreprises = await prisma.entreprise.findMany({ select: { id: true, raisonSociale: true } });
  const apporteurs = await prisma.apporteur.findMany({ select: { id: true, nom: true, prenom: true } });

  if (entreprises.length === 0) {
    throw new Error("Aucune Entreprise en base. Inscris-toi sur /inscription (profil entreprise) d'abord.");
  }
  if (apporteurs.length === 0) {
    throw new Error("Aucun Apporteur en base. Inscris-toi sur /inscription (profil particulier) d'abord.");
  }

  let compteur = 0;

  for (const entreprise of entreprises) {
    for (const apporteur of apporteurs) {
      compteur += 1;
      const dealId = `seed-apporteurs-test-${entreprise.id.slice(0, 6)}-${apporteur.id.slice(0, 6)}`;
      const montant = 100000 + compteur * 25000;
      const taux = 5;

      const deal = await prisma.deal.upsert({
        where: { id: dealId },
        update: {},
        create: {
          id: dealId,
          titre: `Deal test #${compteur} (${apporteur.prenom} ${apporteur.nom})`,
          montant,
          statut: "SIGNED",
        },
      });

      await prisma.commission.upsert({
        where: { dealId: deal.id },
        update: {},
        create: {
          montant: montant * (taux / 100),
          taux,
          statut: "PENDING",
          entrepriseId: entreprise.id,
          auditTrail: [{ from: null, to: "PENDING", at: new Date().toISOString() }],
          deal: { connect: { id: deal.id } },
          apporteur: { connect: { id: apporteur.id } },
        },
      });

      console.log(`OK — ${entreprise.raisonSociale} <-> ${apporteur.prenom} ${apporteur.nom}`);
    }
  }
}

main()
  .catch((err) => {
    console.error("Erreur :", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
