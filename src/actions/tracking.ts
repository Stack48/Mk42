"use server";

import { prisma } from "@/lib/prisma";

type ActionResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function generateTrackingLink(
  apporteurId: string,
  missionId: string
): Promise<ActionResult> {
  try {
    const token = crypto.randomUUID();

    await prisma.trackingLink.create({
      data: { token, apporteurId, missionId },
    });

    return { success: true, url: `/ref/${token}` };
  } catch (err) {
    console.error("[generateTrackingLink]", err);
    return { success: false, error: "Impossible de générer le lien." };
  }
}
