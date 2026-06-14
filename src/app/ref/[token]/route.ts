import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { certifyLog } from "@/lib/rfc3161";

async function hashIp(ip: string): Promise<string> {
  const encoded = new TextEncoder().encode(ip);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const link = await prisma.trackingLink.findUnique({
    where: { token },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const userAgent = request.headers.get("user-agent") ?? "";

  // Log + certification RFC 3161 sans bloquer la redirection
  hashIp(ip).then(async (ipHash) => {
    try {
      const log = await prisma.trackingLog.create({
        data: { trackingLinkId: link.id, ipHash, userAgent },
      });
      const { token: rfc3161Hash } = await certifyLog({
        id: log.id,
        trackingLinkId: log.trackingLinkId,
        ipHash: log.ipHash,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      });
      await prisma.trackingLog.update({
        where: { id: log.id },
        data: { rfc3161Hash },
      });
    } catch (err) {
      console.error("[TrackingLog]", err);
    }
  });

  return NextResponse.redirect(
    new URL(`/mission/${link.missionId}`, request.url)
  );
}
