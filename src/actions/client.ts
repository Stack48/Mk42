"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "../generated/prisma/client";

type ActionResult =
  | { success: true; clientId: string }
  | { success: false; error: string };

export async function submitClient(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email")?.toString().trim();
  const nom = formData.get("nom")?.toString().trim() || null;

  if (!email) {
    return { success: false, error: "L'email est requis." };
  }

  // TODO: remplacer par l'ID de l'utilisateur connecté (Clerk)
  const APPORTEUR_ID = "cmbk000000000000000000001";

  try {
    const client = await prisma.client.create({
      data: {
        email,
        nom,
        apporteurId: APPORTEUR_ID,
        history: {
          create: { action: "Prospect soumis" },
        },
      },
    });

    return { success: true, clientId: client.id };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { success: false, error: "Cet email existe déjà." };
    }
    console.error(err);
    return { success: false, error: "Une erreur est survenue." };
  }
}
