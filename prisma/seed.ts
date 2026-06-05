// SEED — Données de démonstration réalistes BTP
//
// Ce script peuple la base avec des données de test.
// Commande : npm run db:seed
//
// Prisma seed = équivalent des Fixtures Symfony (alice/foundry).
// On utilise "upsert" (update or insert) pour pouvoir relancer le seed
// sans doublon : si l'entrée existe déjà (par email/id), elle est mise à jour.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // ── APPORTEURS ────────────────────────────────────────────────────────────
  const jean = await prisma.apporteur.upsert({
    where: { email: "jean.dupont@btp-apport.fr" },
    update: {},
    create: { nom: "Jean Dupont", email: "jean.dupont@btp-apport.fr" },
  });

  const marc = await prisma.apporteur.upsert({
    where: { email: "marc.leblanc@reseau-btp.fr" },
    update: {},
    create: { nom: "Marc Leblanc", email: "marc.leblanc@reseau-btp.fr" },
  });

  const sarah = await prisma.apporteur.upsert({
    where: { email: "sarah.martin@constructions.fr" },
    update: {},
    create: { nom: "Sarah Martin", email: "sarah.martin@constructions.fr" },
  });

  console.log("✅ Apporteurs créés : Jean, Marc, Sarah");

  // ── DEALS ─────────────────────────────────────────────────────────────────
  const deal1 = await prisma.deal.upsert({
    where: { id: "deal-renovation-mairie" },
    update: {},
    create: {
      id: "deal-renovation-mairie",
      titre: "Rénovation Mairie de Villefranche",
      montant: 280000,
      statut: "SIGNED",
    },
  });

  const deal2 = await prisma.deal.upsert({
    where: { id: "deal-logements-sociaux" },
    update: {},
    create: {
      id: "deal-logements-sociaux",
      titre: "Construction 24 logements sociaux — Bordeaux",
      montant: 1200000,
      statut: "SIGNED",
    },
  });

  const deal3 = await prisma.deal.upsert({
    where: { id: "deal-parking-souterrain" },
    update: {},
    create: {
      id: "deal-parking-souterrain",
      titre: "Parking souterrain Centre Commercial Nantes",
      montant: 450000,
      statut: "SIGNED",
    },
  });

  const deal4 = await prisma.deal.upsert({
    where: { id: "deal-ecole-primaire" },
    update: {},
    create: {
      id: "deal-ecole-primaire",
      titre: "Extension école primaire Saint-Étienne",
      montant: 175000,
      statut: "DRAFT",
    },
  });

  const deal5 = await prisma.deal.upsert({
    where: { id: "deal-ehpad" },
    update: {},
    create: {
      id: "deal-ehpad",
      titre: "EHPAD Les Pins — 80 chambres",
      montant: 3200000,
      statut: "DRAFT",
    },
  });

  console.log("✅ Deals créés : 3 signés, 2 en brouillon");

  // ── COMMISSIONS ───────────────────────────────────────────────────────────
  // commission1 : PAID (deal1, jean, taux 5%)
  await prisma.commission.upsert({
    where: { dealId: deal1.id },
    update: {},
    create: {
      montant: 14000, // 280 000 × 5%
      taux: 5,
      statut: "PAID",
      entrepriseId: "entreprise-btpro",
      paidAt: new Date("2024-03-15"),
      auditTrail: [
        { from: null,       to: "PENDING", at: "2024-01-10T09:00:00Z" },
        { from: "PENDING",  to: "TO_PAY",  at: "2024-02-01T14:30:00Z", by: "comptabilité" },
        { from: "TO_PAY",   to: "PAID",    at: "2024-03-15T11:00:00Z", by: "entreprise" },
      ],
      deal:      { connect: { id: deal1.id } },
      apporteur: { connect: { id: jean.id } },
    },
  });

  // commission2 : TO_PAY (deal2, marc, taux 4%)
  await prisma.commission.upsert({
    where: { dealId: deal2.id },
    update: {},
    create: {
      montant: 48000, // 1 200 000 × 4%
      taux: 4,
      statut: "TO_PAY",
      entrepriseId: "entreprise-btpro",
      auditTrail: [
        { from: null,      to: "PENDING", at: "2024-02-20T10:00:00Z" },
        { from: "PENDING", to: "TO_PAY",  at: "2024-04-05T16:00:00Z", by: "comptabilité" },
      ],
      deal:      { connect: { id: deal2.id } },
      apporteur: { connect: { id: marc.id } },
    },
  });

  // commission3 : PENDING (deal3, sarah, taux 5%)
  await prisma.commission.upsert({
    where: { dealId: deal3.id },
    update: {},
    create: {
      montant: 22500, // 450 000 × 5%
      taux: 5,
      statut: "PENDING",
      entrepriseId: "entreprise-btpro",
      auditTrail: [
        { from: null, to: "PENDING", at: "2024-05-01T08:30:00Z" },
      ],
      deal:      { connect: { id: deal3.id } },
      apporteur: { connect: { id: sarah.id } },
    },
  });

  console.log("✅ Commissions créées : 1 PAID, 1 TO_PAY, 1 PENDING");
  console.log("");
  console.log("📊 Résumé :");
  console.log(`   Jean    → commission PAID   : 14 000 €`);
  console.log(`   Marc    → commission TO_PAY : 48 000 €`);
  console.log(`   Sarah   → commission PENDING: 22 500 €`);
  console.log(`   Deal 4 & 5 : en DRAFT, pas encore de commission`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
