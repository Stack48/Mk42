import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generatePDF } from "../src/server/documents/pdf-generator.js";

const dateEmission = new Date("2026-06-11");
const dateEcheance = new Date("2026-07-11");

const buffer = await generatePDF({
  type: "facture",
  numFacture: "FAC-2026-0042",
  dateEmission,
  dateEcheance,
  entreprise: {
    raisonSociale: "Opus BTP SAS",
    siret: "84432156700019",
    adresse: "12 rue de la Construction, 75009 Paris",
    email: "compta@opus-btp.fr",
    telephone: "01 23 45 67 89",
    numeroTVA: "FR12844321567",
    formeJuridique: "SAS",
    capitalSocial: 10000,
    rcsVille: "Paris",
  },
  apporteur: {
    nom: "Marc Dubois",
    email: "marc@dubois-conseil.fr",
    type: "pro",
    siret: "75312345600028",
    adresse: "8 avenue des Champs, 75008 Paris",
  },
  montantHT: 5000,
  tauxTVA: 20,
  montantTVA: 1000,
  montantTTC: 6000,
  referenceChantier: "Chantier Bâtiment B — Levallois",
});

const out = resolve(process.cwd(), "test-facture.pdf");
writeFileSync(out, buffer);
console.log(`PDF généré : ${out} (${buffer.length} bytes)`);
