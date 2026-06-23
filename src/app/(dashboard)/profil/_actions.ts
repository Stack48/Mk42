"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type ActionState = { success?: boolean; error?: string };

const entrepriseSchema = z.object({
  telephone: z.string().trim().min(1, "Téléphone requis"),
  raisonSociale: z.string().trim().min(1, "Raison sociale requise"),
  adresseSiege: z.string().trim().min(1, "Adresse requise"),
  iban: z.string().trim(),
  bic: z.string().trim(),
  nomTitulaireIban: z.string().trim(),
});

const apporteurSchema = z.object({
  prenom: z.string().trim().min(1, "Prénom requis"),
  nom: z.string().trim().min(1, "Nom requis"),
  telephone: z.string().trim().min(1, "Téléphone requis"),
  iban: z.string().trim(),
  bic: z.string().trim(),
  raisonSociale: z.string().trim().optional(),
});

export async function updateEntrepriseProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await auth();
  if (!userId) return { error: "Non authentifié" };

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { entreprise: { select: { id: true } } },
  });
  if (!utilisateur?.entreprise) return { error: "Utilisateur introuvable" };

  const parsed = entrepriseSchema.safeParse({
    telephone: formData.get("telephone"),
    raisonSociale: formData.get("raisonSociale"),
    adresseSiege: formData.get("adresseSiege"),
    iban: formData.get("iban"),
    bic: formData.get("bic"),
    nomTitulaireIban: formData.get("nomTitulaireIban"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.entreprise.update({
    where: { id: utilisateur.entreprise.id },
    data: parsed.data,
  });

  revalidatePath("/profil");
  return { success: true };
}

export async function updateApporteurProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await auth();
  if (!userId) return { error: "Non authentifié" };

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { apporteur: { select: { id: true } } },
  });
  if (!utilisateur?.apporteur) return { error: "Utilisateur introuvable" };

  const parsed = apporteurSchema.safeParse({
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    telephone: formData.get("telephone"),
    iban: formData.get("iban"),
    bic: formData.get("bic"),
    raisonSociale: formData.get("raisonSociale") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.apporteur.update({
    where: { id: utilisateur.apporteur.id },
    data: parsed.data,
  });

  revalidatePath("/profil");
  return { success: true };
}
