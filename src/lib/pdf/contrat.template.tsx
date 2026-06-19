// TEMPLATE PDF CONTRAT — lib/pdf/contrat.template.tsx
//
// Ce fichier utilise @react-pdf/renderer pour générer un PDF côté serveur.
//
// ⚠️ ATTENTION — @react-pdf/renderer est DIFFÉRENT du HTML/CSS :
//
//   HTML/CSS                      | @react-pdf/renderer
//   ------------------------------|------------------------------------------
//   <div>, <p>, <span>            | <View>, <Text> (pas de balises HTML)
//   CSS via className/style       | StyleSheet.create() — subset de Flexbox
//   Cascade CSS (héritage)        | PAS de cascade — chaque élément a ses propres styles
//   display: block (défaut)       | display: flex (défaut dans react-pdf !)
//   Rendu dans le DOM navigateur  | Rendu côté serveur → fichier .pdf binaire
//
// StyleSheet.create() ressemble à du CSS-in-JS (comme React Native),
// mais c'est un subset très limité : pas de pseudo-classes, pas de media queries,
// pas d'animations, pas d'héritage de couleur.
//
// Analogie Symfony : ce composant = un template Twig spécialisé PDF,
// sauf que c'est React qui génère le PDF directement (pas de wkhtmltopdf).

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ContratTemplateData } from "@/types/contrat.types";

// ─── STYLES ──────────────────────────────────────────────────────────────────
// StyleSheet.create() groupe les styles pour la lisibilité.
// Attention : les valeurs numériques sont en points PDF (1pt ≈ 1.33px).
const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0F1117",
    backgroundColor: "#FFFFFF",
  },

  // ── En-tête ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLogo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#4F6EF7",
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0F1117",
    textAlign: "right",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F6EF7",
    marginBottom: 20,
    marginTop: 8,
  },

  // ── Référence contrat ──
  refRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  refItem: {
    flexDirection: "row",
    gap: 4,
  },
  refLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontFamily: "Helvetica-Bold",
  },
  refValue: {
    fontSize: 9,
    color: "#0F1117",
  },

  // ── Sections ──
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#4F6EF7",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
    marginBottom: 10,
  },

  // ── Blocs parties (côte à côte) ──
  partiesRow: {
    flexDirection: "row",
    gap: 16,
  },
  partieBox: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    borderRadius: 6,
    padding: 12,
  },
  partieLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  partieNom: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0F1117",
    marginBottom: 3,
  },
  partieDetail: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },

  // ── Texte courant ──
  bodyText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },

  // ── Rémunération ──
  remuRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  remuCard: {
    flex: 1,
    backgroundColor: "#F0F4FF",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  remuCardLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 4,
  },
  remuCardValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#4F6EF7",
  },

  // ── Signatures ──
  signaturesRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 12,
    minHeight: 80,
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    marginBottom: 4,
  },
  signatureNom: {
    fontSize: 10,
    color: "#0F1117",
    marginBottom: 32, // espace pour la signature manuscrite
  },
  signatureLigne: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    marginTop: 4,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9CA3AF",
  },
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
interface Props {
  data: ContratTemplateData;
}

/**
 * Template du contrat d'apport d'affaires BTP.
 * Utilisé par generateContratPDF() pour produire le Buffer PDF.
 *
 * Document et Page sont les composants racines de react-pdf.
 * Sans eux, rien ne s'affiche — ils sont obligatoires.
 */
export function ContratTemplate({ data }: Props) {
  const montantCommission = Math.round((data.dealMontant * data.tauxCommission) / 100);

  return (
    <Document
      title={`Contrat ${data.numeroContrat} — ${data.apporteurNom}`}
      author="OPUS CommissionPro BTP"
    >
      <Page size="A4" style={styles.page}>

        {/* ── En-tête ── */}
        <View style={styles.header}>
          <Text style={styles.headerLogo}>OPUS</Text>
          <Text style={styles.headerTitle}>CONTRAT D&apos;APPORT D&apos;AFFAIRES</Text>
        </View>
        <View style={styles.divider} />

        {/* ── Référence et date ── */}
        <View style={styles.refRow}>
          <View style={styles.refItem}>
            <Text style={styles.refLabel}>N° Contrat :</Text>
            <Text style={styles.refValue}>{data.numeroContrat}</Text>
          </View>
          <View style={styles.refItem}>
            <Text style={styles.refLabel}>Date :</Text>
            <Text style={styles.refValue}>{data.dateGeneration}</Text>
          </View>
        </View>

        {/* ── Parties ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entre les soussignés</Text>
          <View style={styles.partiesRow}>
            {/* Entreprise */}
            <View style={styles.partieBox}>
              <Text style={styles.partieLabel}>L&apos;entreprise donneur d&apos;ordre</Text>
              <Text style={styles.partieNom}>{data.entrepriseNom}</Text>
              <Text style={styles.partieDetail}>SIRET : {data.entrepriseSiret}</Text>
              <Text style={styles.partieDetail}>Ci-après dénommée « l&apos;Entreprise »</Text>
            </View>
            {/* Apporteur */}
            <View style={styles.partieBox}>
              <Text style={styles.partieLabel}>L&apos;apporteur d&apos;affaires</Text>
              <Text style={styles.partieNom}>{data.apporteurNom}</Text>
              <Text style={styles.partieDetail}>{data.apporteurEmail}</Text>
              <Text style={styles.partieDetail}>Ci-après dénommé(e) « l&apos;Apporteur »</Text>
            </View>
          </View>
        </View>

        {/* ── Objet ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objet de la mission</Text>
          <Text style={styles.bodyText}>
            L&apos;Apporteur s&apos;engage à mettre en relation l&apos;Entreprise avec des clients
            potentiels dans le secteur du bâtiment et des travaux publics (BTP).
            Au titre du présent contrat, l&apos;Apporteur a facilité l&apos;obtention du chantier
            suivant :
          </Text>
          <Text style={[styles.bodyText, { fontFamily: "Helvetica-Bold", marginTop: 6 }]}>
            {data.dealTitre}
          </Text>
          <Text style={[styles.bodyText, { marginTop: 4 }]}>
            Montant du marché : {formatEur(data.dealMontant)} HT
          </Text>
        </View>

        {/* ── Durée ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée</Text>
          <Text style={styles.bodyText}>
            Le présent contrat prend effet à sa signature et est valable pour la durée
            du chantier référencé ci-dessus.
          </Text>
        </View>

        {/* ── Rémunération ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions de rémunération</Text>
          <Text style={styles.bodyText}>
            En contrepartie de l&apos;apport d&apos;affaires réalisé, l&apos;Entreprise versera à
            l&apos;Apporteur une commission calculée sur le montant HT du marché, selon les
            conditions suivantes :
          </Text>
          <View style={styles.remuRow}>
            <View style={styles.remuCard}>
              <Text style={styles.remuCardLabel}>Taux de commission</Text>
              <Text style={styles.remuCardValue}>{data.tauxCommission} %</Text>
            </View>
            <View style={styles.remuCard}>
              <Text style={styles.remuCardLabel}>Montant estimé</Text>
              <Text style={styles.remuCardValue}>{formatEur(montantCommission)}</Text>
            </View>
          </View>
          <Text style={[styles.bodyText, { marginTop: 8, color: "#9CA3AF" }]}>
            Le versement interviendra après encaissement effectif du marché par l&apos;Entreprise.
          </Text>
        </View>

        {/* ── Confidentialité ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clause de confidentialité</Text>
          <Text style={styles.bodyText}>
            Les parties s&apos;engagent à maintenir confidentielles toutes les informations
            échangées dans le cadre du présent contrat, notamment les conditions
            financières, les données clients et les informations techniques relatives
            aux chantiers. Cette obligation de confidentialité s&apos;applique pendant toute
            la durée du contrat et pendant une période de 3 ans après son terme.
          </Text>
        </View>

        {/* ── Signatures ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signaturesRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Lu et approuvé — Pour l&apos;entreprise</Text>
              <Text style={styles.signatureNom}>{data.entrepriseNom}</Text>
              <View style={styles.signatureLigne} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Lu et approuvé — L&apos;apporteur</Text>
              <Text style={styles.signatureNom}>{data.apporteurNom}</Text>
              <View style={styles.signatureLigne} />
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.numeroContrat}</Text>
          <Text style={styles.footerText}>Document généré par OPUS CommissionPro BTP</Text>
        </View>

      </Page>
    </Document>
  );
}
