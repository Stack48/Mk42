// GÉNÉRATEUR PDF — lib/pdf/contrat.generator.ts
//
// Ce fichier orchestre la génération du PDF côté serveur.
//
// renderToBuffer() vs rendu HTML :
//   - Le rendu HTML classique (ReactDOM.renderToString) produit une chaîne HTML
//     qui sera ensuite interprétée par le navigateur.
//   - renderToBuffer() de @react-pdf/renderer contourne complètement le DOM :
//     il parcourt l'arbre React et génère DIRECTEMENT un fichier PDF binaire (Buffer).
//     Aucun navigateur n'est impliqué — tout se passe côté serveur Node.js.
//   - Le Buffer retourné peut être écrit sur disque, uploadé sur S3, ou envoyé
//     directement dans une réponse HTTP.
//
// Analogie Symfony : équivalent d'un service qui utilise KnpSnappyBundle (wkhtmltopdf)
// ou DomPDF, sauf qu'ici React fait le rendu au lieu d'un moteur de template HTML.

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContratTemplate } from "./contrat.template";
import type { ContratTemplateData } from "@/types/contrat.types";

/**
 * Génère le PDF du contrat d'apport d'affaires et retourne un Buffer.
 *
 * @param data Données du template (noms des parties, montants, taux, etc.)
 * @returns Buffer contenant le fichier PDF binaire
 *
 * @example
 * const buffer = await generateContratPDF(templateData);
 * await storage.save("contrat-abc123.pdf", buffer);
 */
export async function generateContratPDF(data: ContratTemplateData): Promise<Buffer> {
  // React.createElement crée l'arbre de composants React (JSX compilé).
  // renderToBuffer() parcourt cet arbre et produit le PDF binaire.
  // C'est un appel asynchrone car la génération PDF peut être longue
  // pour des documents complexes (images, polices custom, etc.).
  const buffer = await renderToBuffer(
    React.createElement(ContratTemplate, { data })
  );

  // renderToBuffer retourne un Buffer Node.js natif
  return buffer as Buffer;
}
