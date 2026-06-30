"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { updateEntrepriseProfile as updateEntrepriseController } from "@/server/entreprise/controller";
import { updateApporteurProfile as updateApporteurController } from "@/server/apporteur/controller";

export type ActionState = { success?: boolean; error?: string };

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

  const result = await updateEntrepriseController(utilisateur.entreprise.id, formData);

  if (result.success) revalidatePath("/profil");
  return result;
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

  const result = await updateApporteurController(utilisateur.apporteur.id, formData);

  if (result.success) revalidatePath("/profil");
  return result;
}
