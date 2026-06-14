// CSV encodé UTF-8 avec BOM pour compatibilité Excel

export interface LigneCommission {
  date: Date;
  reference: string;
  type: "Facture" | "Reçu";
  apporteur: string;
  montantTTC: number;
  statut: string;
}

export interface CSVInput {
  lignes: LigneCommission[];
  entrepriseNom: string;
  dateDebut: Date;
  dateFin: Date;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCommissionsCSV(input: CSVInput): string {
  const BOM = "﻿"; // UTF-8 BOM — Excel autodetect encoding
  const header = "Date,Reference,Type,Apporteur,MontantTTC,Statut";

  const rows = input.lignes.map((l) =>
    [
      formatDate(l.date),
      escapeCsvField(l.reference),
      escapeCsvField(l.type),
      escapeCsvField(l.apporteur),
      l.montantTTC.toFixed(2),
      escapeCsvField(l.statut),
    ].join(",")
  );

  return BOM + [header, ...rows].join("\n");
}
