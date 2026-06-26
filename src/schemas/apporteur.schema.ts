import { z } from "zod";

export const apporteurSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis"),
  nom: z.string().trim().min(1, "Nom requis"),
  telephone: z.string().trim().min(1, "Téléphone requis"),
  iban: z.string().trim(),
  bic: z.string().trim(),
  raisonSociale: z.string().trim().nullable().optional(),
});
