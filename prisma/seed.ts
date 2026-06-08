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
      auditTrail: JSON.stringify([
        { from: null,       to: "PENDING", at: "2024-01-10T09:00:00Z" },
        { from: "PENDING",  to: "TO_PAY",  at: "2024-02-01T14:30:00Z", by: "comptabilité" },
        { from: "TO_PAY",   to: "PAID",    at: "2024-03-15T11:00:00Z", by: "entreprise" },
      ]),
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
      auditTrail: JSON.stringify([
        { from: null,      to: "PENDING", at: "2024-02-20T10:00:00Z" },
        { from: "PENDING", to: "TO_PAY",  at: "2024-04-05T16:00:00Z", by: "comptabilité" },
      ]),
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
      auditTrail: JSON.stringify([
        { from: null, to: "PENDING", at: "2024-05-01T08:30:00Z" },
      ]),
      deal:      { connect: { id: deal3.id } },
      apporteur: { connect: { id: sarah.id } },
    },
  });

  console.log("✅ Commissions créées : 1 PAID, 1 TO_PAY, 1 PENDING");

  // ── CONTRATS [13-BE] ──────────────────────────────────────────────────────
  // Contrat VALIDATED : deal2 (logements sociaux), apporteur Marc
  const contratValide = await prisma.contrat.upsert({
    where: { token: "seed-token-validated-marc-logements" },
    update: {},
    create: {
      token: "seed-token-validated-marc-logements",
      tokenExpiresAt: new Date("2099-12-31"), // loin dans le futur pour les seeds
      statut: "VALIDATED",
      templateData: JSON.stringify({
        entrepriseNom: "OPUS BTP SAS",
        entrepriseSiret: "123 456 789 00010",
        apporteurNom: "Marc Leblanc",
        apporteurEmail: "marc.leblanc@reseau-btp.fr",
        dealTitre: "Construction 24 logements sociaux — Bordeaux",
        dealMontant: 1200000,
        tauxCommission: 4,
        dateGeneration: "2024-02-01",
        numeroContrat: "CTR-2024-001",
      }),
      fileOriginalPath: "seed-contrat-logements.pdf.enc",
      fileSignedPath: "seed-contrat-logements-signe.pdf.enc",
      validatedAt: new Date("2024-04-10"),
      validatedBy: "admin-seed",
      deal: { connect: { id: deal2.id } },
      apporteur: { connect: { id: marc.id } },
    },
  });

  await prisma.contratAccessLog.createMany({
    data: [
      { contratId: contratValide.id, action: "GENERATED",       ip: "192.168.1.1", createdAt: new Date("2024-02-01T09:00:00Z") },
      { contratId: contratValide.id, action: "LINK_OPENED",     ip: "88.12.45.67", createdAt: new Date("2024-02-05T14:23:00Z") },
      { contratId: contratValide.id, action: "SIGNED_UPLOADED", ip: "88.12.45.67", createdAt: new Date("2024-02-06T10:11:00Z") },
      { contratId: contratValide.id, action: "VALIDATED",       ip: "192.168.1.1", createdAt: new Date("2024-04-10T11:30:00Z") },
    ],
  });

  // Contrat UPLOADED : deal3 (parking souterrain), apporteur Sarah
  const contratUploaded = await prisma.contrat.upsert({
    where: { token: "seed-token-uploaded-sarah-parking" },
    update: {},
    create: {
      token: "seed-token-uploaded-sarah-parking",
      tokenExpiresAt: new Date("2099-12-31"),
      statut: "UPLOADED",
      templateData: JSON.stringify({
        entrepriseNom: "OPUS BTP SAS",
        entrepriseSiret: "123 456 789 00010",
        apporteurNom: "Sarah Martin",
        apporteurEmail: "sarah.martin@constructions.fr",
        dealTitre: "Parking souterrain Centre Commercial Nantes",
        dealMontant: 450000,
        tauxCommission: 5,
        dateGeneration: "2024-05-10",
        numeroContrat: "CTR-2024-002",
      }),
      fileOriginalPath: "seed-contrat-parking.pdf.enc",
      fileSignedPath: "seed-contrat-parking-signe.pdf.enc",
      deal: { connect: { id: deal3.id } },
      apporteur: { connect: { id: sarah.id } },
    },
  });

  await prisma.contratAccessLog.createMany({
    data: [
      { contratId: contratUploaded.id, action: "GENERATED",       ip: "192.168.1.1",  createdAt: new Date("2024-05-10T08:00:00Z") },
      { contratId: contratUploaded.id, action: "LINK_OPENED",     ip: "77.201.33.99", createdAt: new Date("2024-05-12T16:45:00Z") },
      { contratId: contratUploaded.id, action: "SIGNED_UPLOADED", ip: "77.201.33.99", createdAt: new Date("2024-05-13T09:22:00Z") },
    ],
  });

  console.log("✅ Contrats [13-BE] créés : 1 VALIDATED (Marc), 1 UPLOADED (Sarah)");

  // ── INVITATIONS CLIENT [17-FE] ────────────────────────────────────────────
  // Invitation 1 : VALIDATED — deal1 (Mairie Villefranche), client Marie Dupont
  // Représente un client qui a consulté et validé son dossier.
  const invitationValidee = await prisma.clientInvitation.upsert({
    where: { token: "seed-token-validated-marie-mairie" },
    update: {},
    create: {
      token:          "seed-token-validated-marie-mairie",
      email:          "marie.dupont@villefranche.fr",
      nom:            "Marie Dupont",
      tokenExpiresAt: new Date("2099-12-31"),
      statut:         "VALIDATED",
      deal: { connect: { id: deal1.id } },
    },
  });

  await prisma.clientEvenement.createMany({
    data: [
      {
        invitationId: invitationValidee.id,
        type:         "INVITATION_ENVOYEE",
        metadata:     JSON.stringify({ email: "marie.dupont@villefranche.fr", dealId: deal1.id }),
        createdAt:    new Date("2024-01-12T09:00:00Z"),
      },
      {
        invitationId: invitationValidee.id,
        type:         "DOSSIER_CONSULTE",
        ip:           "90.45.120.33",
        userAgent:    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        createdAt:    new Date("2024-01-13T14:22:00Z"),
      },
      {
        invitationId: invitationValidee.id,
        type:         "ETAPE_VALIDEE",
        metadata:     JSON.stringify({ etapeId: `deal-${deal1.id}` }),
        ip:           "90.45.120.33",
        createdAt:    new Date("2024-01-13T14:35:00Z"),
      },
    ],
  });

  // Invitation 2 : PENDING — deal5 (EHPAD Les Pins), client Pierre Lambert
  // Représente une invitation récente pas encore ouverte par le client.
  const invitationPending = await prisma.clientInvitation.upsert({
    where: { token: "seed-token-pending-pierre-ehpad" },
    update: {},
    create: {
      token:          "seed-token-pending-pierre-ehpad",
      email:          "pierre.lambert@ehpad-lespins.fr",
      nom:            "Pierre Lambert",
      tokenExpiresAt: new Date("2099-12-31"),
      statut:         "PENDING",
      deal: { connect: { id: deal5.id } },
    },
  });

  await prisma.clientEvenement.createMany({
    data: [
      {
        invitationId: invitationPending.id,
        type:         "INVITATION_ENVOYEE",
        metadata:     JSON.stringify({ email: "pierre.lambert@ehpad-lespins.fr", dealId: deal5.id }),
        createdAt:    new Date("2024-06-01T10:00:00Z"),
      },
    ],
  });

  console.log("✅ Invitations client [17-FE] créées : 1 VALIDATED (Marie), 1 PENDING (Pierre)");

  // ── NOTIFICATIONS [18-FE] ─────────────────────────────────────────────────
  // 3 notifications non lues pour Jean (dont 2 récentes)
  await prisma.notification.createMany({
    data: [
      {
        userId:    jean.id,
        type:      "NOUVEAU_DEAL",
        titre:     "Nouveau client invité sur votre deal",
        message:   "Un client a été invité à consulter le dossier \"Rénovation Mairie de Villefranche\".",
        lu:        false,
        metadata:  JSON.stringify({ dealId: "deal-renovation-mairie" }),
        createdAt: new Date("2024-06-01T09:00:00Z"),
      },
      {
        userId:    jean.id,
        type:      "COMMISSION_CALCULEE",
        titre:     "Commission calculée",
        message:   "Votre commission de 14 000 € a été calculée et est en attente de validation.",
        lu:        false,
        metadata:  JSON.stringify({ montant: 14000 }),
        createdAt: new Date("2024-06-02T10:30:00Z"),
      },
      {
        userId:    jean.id,
        type:      "COMMISSION_PAYEE",
        titre:     "Commission payée ! 🎉",
        message:   "Votre commission de 14 000 € a été versée.",
        lu:        false,
        metadata:  JSON.stringify({ montant: 14000 }),
        createdAt: new Date("2024-06-03T14:00:00Z"),
      },
    ],
  });

  // 2 notifications lues pour Marc
  await prisma.notification.createMany({
    data: [
      {
        userId:    marc.id,
        type:      "COMMISSION_CALCULEE",
        titre:     "Commission calculée",
        message:   "Votre commission de 48 000 € a été calculée et est en attente de validation.",
        lu:        true,
        metadata:  JSON.stringify({ montant: 48000 }),
        createdAt: new Date("2024-04-01T09:00:00Z"),
      },
      {
        userId:    marc.id,
        type:      "NOUVEAU_DEAL",
        titre:     "Nouveau client invité sur votre deal",
        message:   "Un client a été invité à consulter le dossier \"Construction 24 logements sociaux\".",
        lu:        true,
        metadata:  JSON.stringify({ dealId: "deal-logements-sociaux" }),
        createdAt: new Date("2024-04-05T11:00:00Z"),
      },
    ],
  });

  console.log("✅ Notifications [18-FE] créées : 3 non lues (Jean), 2 lues (Marc)");

  // ── KANBAN DEALS [11-FE] ──────────────────────────────────────────────────
  // 2 PROSPECT, 1 CONTACTE, 1 SIGNE (avec documents), 1 PAYE, 1 ANNULE

  const dealProspect1 = await prisma.kanbanDeal.upsert({
    where: { id: "kd-prospect-bureau-nantes" },
    update: {},
    create: {
      id: "kd-prospect-bureau-nantes", titre: "Rénovation bureaux Nantes Centre",
      montant: 95000, clientNom: "SCI Nantes Immo", clientEmail: "contact@sci-nantes.fr",
      statut: "PROSPECT", position: 0, apporteur: { connect: { id: jean.id } },
    },
  });

  await prisma.kanbanDeal.upsert({
    where: { id: "kd-prospect-lycee-rennes" },
    update: {},
    create: {
      id: "kd-prospect-lycee-rennes", titre: "Extension Lycée Rennes Nord",
      montant: 420000, clientNom: "Région Bretagne", mission: "Ajout 8 salles de cours",
      statut: "PROSPECT", position: 1, apporteur: { connect: { id: sarah.id } },
    },
  });

  const dealContacte = await prisma.kanbanDeal.upsert({
    where: { id: "kd-contacte-hotel-lyon" },
    update: {},
    create: {
      id: "kd-contacte-hotel-lyon", titre: "Réhabilitation hôtel Lyon Presqu'île",
      montant: 1800000, clientNom: "Groupe Hôtelier Lumière", clientEmail: "dg@lumiere-hotels.fr",
      clientTel: "04 72 XX XX XX", mission: "Réhabilitation complète 45 chambres",
      statut: "CONTACTE", position: 0, apporteur: { connect: { id: marc.id } },
    },
  });

  const dealSigne = await prisma.kanbanDeal.upsert({
    where: { id: "kd-signe-parking-bordeaux" },
    update: {},
    create: {
      id: "kd-signe-parking-bordeaux", titre: "Parking souterrain Bordeaux Victoire",
      montant: 2200000, clientNom: "Bordeaux Métropole", mission: "250 places + locaux vélos",
      statut: "SIGNE", position: 0, apporteur: { connect: { id: jean.id } },
    },
  });

  await prisma.kanbanDeal.upsert({
    where: { id: "kd-paye-clinique-toulouse" },
    update: {},
    create: {
      id: "kd-paye-clinique-toulouse", titre: "Extension clinique Toulouse Sud",
      montant: 670000, clientNom: "Groupe Santé Occitanie",
      statut: "PAYE", position: 0, apporteur: { connect: { id: sarah.id } },
    },
  });

  await prisma.kanbanDeal.upsert({
    where: { id: "kd-annule-entrepot-lille" },
    update: {},
    create: {
      id: "kd-annule-entrepot-lille", titre: "Entrepôt logistique Lille Est",
      montant: 550000, clientNom: "LogiNord SARL",
      statut: "ANNULE", commissionGelee: true, position: 0,
      apporteur: { connect: { id: marc.id } },
    },
  });

  // 3 documents sur le deal SIGNE
  await prisma.dealDocument.createMany({
    data: [
      { dealId: dealSigne.id, nom: "Devis-Bordeaux-v1.pdf", type: "DEVIS",
        filePath: "seed-devis-bordeaux-v1.pdf.enc", fileSize: 245000,
        mimeType: "application/pdf", uploadedBy: "admin",
        createdAt: new Date("2024-05-01T09:00:00Z") },
      { dealId: dealSigne.id, nom: "Devis-Bordeaux-v2.pdf", type: "DEVIS",
        filePath: "seed-devis-bordeaux-v2.pdf.enc", fileSize: 262000,
        mimeType: "application/pdf", uploadedBy: "admin",
        createdAt: new Date("2024-05-10T14:00:00Z") },
      { dealId: dealSigne.id, nom: "Facture-acompte-30pct.pdf", type: "FACTURE",
        filePath: "seed-facture-acompte.pdf.enc", fileSize: 88000,
        mimeType: "application/pdf", uploadedBy: "admin",
        createdAt: new Date("2024-06-01T10:00:00Z") },
    ],
  });

  // 4 messages sur le deal CONTACTE
  await prisma.dealMessage.createMany({
    data: [
      { dealId: dealContacte.id, auteurId: "admin", auteurType: "ENTREPRISE",
        contenu: "Bonjour Marc, nous avons reçu les premières demandes du client. Pouvez-vous nous confirmer votre disponibilité pour une visite la semaine prochaine ?",
        lu: true, createdAt: new Date("2024-04-10T09:15:00Z") },
      { dealId: dealContacte.id, auteurId: marc.id, auteurType: "APPORTEUR",
        contenu: "Bonjour, je suis disponible jeudi ou vendredi après-midi. Le client préfère le jeudi matin si possible.",
        lu: true, createdAt: new Date("2024-04-10T11:30:00Z") },
      { dealId: dealContacte.id, auteurId: "admin", auteurType: "ENTREPRISE",
        contenu: "Parfait, visite fixée au jeudi 18 avril à 10h. J'envoie la confirmation au client.",
        lu: true, createdAt: new Date("2024-04-10T14:00:00Z") },
      { dealId: dealContacte.id, auteurId: marc.id, auteurType: "APPORTEUR",
        contenu: "Visite effectuée, très bon accueil. Le client demande un devis détaillé sous 10 jours.",
        lu: false, createdAt: new Date("2024-04-18T17:45:00Z") },
    ],
  });

  console.log("✅ Kanban Deals [11-FE] créés : 2 PROSPECT, 1 CONTACTE (4 msg), 1 SIGNE (3 docs), 1 PAYE, 1 ANNULE");
  console.log("");
  console.log("📊 Résumé :");
  console.log(`   Jean    → commission PAID   : 14 000 €`);
  console.log(`   Marc    → commission TO_PAY : 48 000 € | contrat VALIDATED`);
  console.log(`   Sarah   → commission PENDING: 22 500 € | contrat UPLOADED`);
  console.log(`   Deal 4 & 5 : en DRAFT, pas encore de commission`);
  console.log(`   Marie   → invitation VALIDATED (deal Mairie Villefranche)`);
  console.log(`   Pierre  → invitation PENDING (deal EHPAD Les Pins)`);
  console.log(`   Jean    → 3 notifications non lues`);
  console.log(`   Marc    → 2 notifications lues`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
