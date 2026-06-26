import { prisma } from "@/lib/prisma";
import { apporteurSchema } from "@/schemas/apporteur.schema";

export async function updateApporteurProfile(
  apporteurId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const parsed = apporteurSchema.safeParse({
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    telephone: formData.get("telephone"),
    iban: formData.get("iban"),
    bic: formData.get("bic"),
    // Fix: `|| null` converts both null (absent field) and "" (cleared field)
    // to null so Prisma explicitly sets the column to NULL instead of skipping it.
    raisonSociale: (formData.get("raisonSociale") as string | null) || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.apporteur.update({
    where: { id: apporteurId },
    data: parsed.data,
  });

  return { success: true };
}
