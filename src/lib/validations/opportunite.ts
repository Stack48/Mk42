import { z } from 'zod'

export const stepInfosClientProSchema = z.object({
  clientSiret: z.string().min(14, 'SIRET invalide (14 chiffres requis)'),
  clientRaisonSociale: z.string().min(1, 'Raison sociale requise'),
  clientTelephone: z.string().min(10, 'Numéro de téléphone invalide'),
  clientEmail: z.string().email('Adresse email invalide'),
  adresseChantier: z.string().optional(),
})

export const stepInfosClientParticulierSchema = z.object({
  clientNom: z.string().min(1, 'Nom requis'),
  clientPrenom: z.string().min(1, 'Prénom requis'),
  clientTelephone: z.string().min(10, 'Numéro de téléphone invalide'),
  clientEmail: z.string().email('Adresse email invalide'),
  adresseChantier: z.string().min(1, 'Adresse du chantier requise'),
})

export const stepDetailsChantierSchema = z.object({
  typesTravaux: z.string().min(1, 'Type de travaux requis'),
  adresseChantier: z.string().min(1, 'Adresse du chantier requise'),
  description: z.string().optional(),
  delai: z.string().optional(),
})
