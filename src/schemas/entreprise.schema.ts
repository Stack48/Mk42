import { z } from "zod";

export const entrepriseSchema = z.object({
  telephone: z.string().trim().min(1, "Téléphone requis"),
  raisonSociale: z.string().trim().min(1, "Raison sociale requise"),
  adresseSiege: z.string().trim().min(1, "Adresse requise"),
  iban: z.string().trim(),
  bic: z.string().trim(),
  nomTitulaireIban: z.string().trim(),
});
