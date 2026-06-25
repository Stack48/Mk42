// PDF generator — Server Action only, jamais en SSR côté client
// @react-pdf/renderer runs in Node.js context via renderToBuffer()

import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export interface EntrepriseInfo {
  raisonSociale: string;
  siret: string;
  adresse: string;
  email: string;
  telephone?: string;
  numeroTVA?: string;
  formeJuridique?: string;
  capitalSocial?: number;
  rcsVille?: string;
}

export interface ApporteurInfo {
  nom: string;
  email: string;
  type: "pro" | "particulier";
  siret?: string;
  adresse?: string;
  dateNaissance?: string;
}

export interface FactureInput {
  type: "facture";
  numFacture: string;
  dateEmission: Date;
  dateEcheance?: Date;
  entreprise: EntrepriseInfo;
  apporteur: ApporteurInfo;
  montantHT: number;
  tauxTVA: number;
  montantTVA: number;
  montantTTC: number;
  referenceChantier?: string;
}

export interface RecuInput {
  type: "recu";
  numRecu: string;
  dateEmission: Date;
  entreprise: EntrepriseInfo;
  apporteur: ApporteurInfo;
  montantBrut: number;
  periodeDebut?: Date;
  periodeFin?: Date;
}

export type PDFInput = FactureInput | RecuInput;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 50,
    color: "#1a1a2e",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#4648D4",
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#4648D4",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#4648D4",
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 140,
    color: "#666",
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
  },
  tableRowLast: {
    flexDirection: "row",
    padding: 8,
  },
  colLibelle: { flex: 3 },
  colMontant: { flex: 1, textAlign: "right" },
  bold: { fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#4648D4",
  },
  totalLabel: {
    flex: 3,
    color: "white",
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    flex: 1,
    color: "white",
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  footer: {
    marginTop: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  mention: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    fontSize: 8,
    color: "#666",
  },
});

function formatMontant(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMentionsLegales(e: EntrepriseInfo): string | null {
  const parts: string[] = [];
  if (e.formeJuridique) {
    parts.push(
      e.capitalSocial !== undefined
        ? `${e.formeJuridique} au capital de ${formatMontant(e.capitalSocial)}`
        : e.formeJuridique
    );
  }
  if (e.rcsVille) parts.push(`RCS ${e.rcsVille} ${e.siret}`);
  return parts.length > 0 ? parts.join(" — ") : null;
}

function FacturePDF({ input }: { input: FactureInput }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // En-tête
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, "FACTURE"),
        React.createElement(
          Text,
          { style: styles.headerSubtitle },
          `N° ${input.numFacture} — Émise le ${formatDate(input.dateEmission)}` +
            (input.dateEcheance
              ? ` — Échéance le ${formatDate(input.dateEcheance)}`
              : " — Paiement à réception")
        )
      ),
      // Émetteur
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Émetteur"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Raison sociale :"),
          React.createElement(Text, { style: styles.value }, input.entreprise.raisonSociale)
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "SIRET :"),
          React.createElement(Text, { style: styles.value }, input.entreprise.siret)
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Adresse :"),
          React.createElement(Text, { style: styles.value }, input.entreprise.adresse)
        ),
        input.entreprise.numeroTVA &&
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "N° TVA Intracom :"),
            React.createElement(Text, { style: styles.value }, input.entreprise.numeroTVA)
          ),
        formatMentionsLegales(input.entreprise) &&
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Mentions légales :"),
            React.createElement(
              Text,
              { style: styles.value },
              formatMentionsLegales(input.entreprise)!
            )
          )
      ),
      // Destinataire
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Destinataire"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Nom / RS :"),
          React.createElement(Text, { style: styles.value }, input.apporteur.nom)
        ),
        input.apporteur.siret &&
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "SIRET :"),
            React.createElement(Text, { style: styles.value }, input.apporteur.siret)
          ),
        input.apporteur.adresse &&
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Adresse :"),
            React.createElement(Text, { style: styles.value }, input.apporteur.adresse)
          )
      ),
      // Tableau montants
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.colLibelle, styles.bold] }, "Libellé"),
          React.createElement(Text, { style: [styles.colMontant, styles.bold] }, "Montant")
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(
            Text,
            { style: styles.colLibelle },
            `Commission d'apport d'affaires${input.referenceChantier ? ` — ${input.referenceChantier}` : ""} (Montant HT)`
          ),
          React.createElement(Text, { style: styles.colMontant }, formatMontant(input.montantHT))
        ),
        React.createElement(
          View,
          { style: styles.tableRow },
          React.createElement(Text, { style: styles.colLibelle }, `TVA ${input.tauxTVA}%`),
          React.createElement(Text, { style: styles.colMontant }, formatMontant(input.montantTVA))
        ),
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(Text, { style: styles.totalLabel }, "TOTAL TTC"),
          React.createElement(Text, { style: styles.totalValue }, formatMontant(input.montantTTC))
        )
      ),
      // Mentions légales
      React.createElement(
        View,
        { style: styles.mention },
        React.createElement(
          Text,
          null,
          "Pénalités de retard applicables au taux légal en vigueur en cas de non-paiement à l'échéance. Indemnité forfaitaire pour frais de recouvrement : 40 €."
        )
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          null,
          `${input.entreprise.raisonSociale} — SIRET ${input.entreprise.siret} — ${input.entreprise.email}`
        )
      )
    )
  );
}

function RecuPDF({ input }: { input: RecuInput }) {
  const periode =
    input.periodeDebut && input.periodeFin
      ? `${formatDate(input.periodeDebut)} au ${formatDate(input.periodeFin)}`
      : null;

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, "REÇU DE COMMISSION"),
        React.createElement(
          Text,
          { style: styles.headerSubtitle },
          `N° ${input.numRecu} — Émis le ${formatDate(input.dateEmission)}`
        )
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Versement"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "Reçu par :"),
          React.createElement(Text, { style: styles.value }, input.entreprise.raisonSociale)
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, "De la part de :"),
          React.createElement(Text, { style: styles.value }, input.apporteur.nom)
        ),
        input.apporteur.dateNaissance &&
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Date de naissance :"),
            React.createElement(Text, { style: styles.value }, input.apporteur.dateNaissance)
          ),
        periode &&
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, "Période :"),
            React.createElement(Text, { style: styles.value }, periode)
          )
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(Text, { style: styles.totalLabel }, "Commission versée"),
          React.createElement(
            Text,
            { style: styles.totalValue },
            formatMontant(input.montantBrut)
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.mention },
        React.createElement(
          Text,
          null,
          "Ce document est un justificatif de versement pour comptabilité personnelle. Il ne constitue pas une facture au sens fiscal du terme. Les commissions perçues sont à déclarer dans la catégorie BNC (Bénéfices Non Commerciaux) pour les particuliers."
        )
      ),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          null,
          `${input.entreprise.raisonSociale} — SIRET ${input.entreprise.siret} — ${input.entreprise.email}`
        )
      )
    )
  );
}

export async function generatePDF(input: PDFInput): Promise<Buffer> {
  const element =
    input.type === "facture"
      ? React.createElement(FacturePDF, { input })
      : React.createElement(RecuPDF, { input });

  // renderToBuffer works in Node.js (Server Action context), never in browser SSR
  return renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
}
