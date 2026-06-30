import { prisma } from "@/lib/prisma";
import { entrepriseSchema } from "@/schemas/entreprise.schema";

export async function updateEntrepriseProfile(
  entrepriseId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
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
    where: { id: entrepriseId },
    data: parsed.data,
  });

  return { success: true };
}
