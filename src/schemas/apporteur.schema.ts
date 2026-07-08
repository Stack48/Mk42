import { z } from "zod";

export const apporteurSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis"),
  nom: z.string().trim().min(1, "Nom requis"),
  telephone: z.string().trim().min(1, "Téléphone requis"),
  adresse: z.string().trim().min(1, "Adresse requise"),
  ville: z.string().trim().min(1, "Ville requise"),
  codePostal: z.string().trim().min(1, "Code postal requis"),
  pays: z.string().trim(),
  profession: z.string().trim().nullable().optional(),
  iban: z.string().trim(),
  bic: z.string().trim(),
  raisonSociale: z.string().trim().nullable().optional(),
});
