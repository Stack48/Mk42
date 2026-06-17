import { NextResponse } from "next/server";
import React from "react";
import { renderToStream, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEntrepriseId } from "@/lib/auth";

const ce = React.createElement;

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#555",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontFamily: "Helvetica-Bold",
    width: 120,
    color: "#444",
  },
  value: {
    flex: 1,
    color: "#222",
  },
  logCard: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  logIndex: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#888",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#aaa",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 6,
  },
});

function fmt(date: Date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

type LinkData = {
  id: string;
  token: string;
  apporteurId: string;
  missionId: string;
  statut: string;
  createdAt: Date;
  logs: {
    id: string;
    ipHash: string;
    userAgent: string;
    rfc3161Hash: string | null;
    createdAt: Date;
  }[];
};

function row(label: string, value: string) {
  return ce(View, { style: styles.row },
    ce(Text, { style: styles.label }, label),
    ce(Text, { style: styles.value }, value),
  );
}

function buildPDF(link: LinkData) {
  const logCards = link.logs.map((log, i) =>
    ce(View, { key: log.id, style: styles.logCard },
      ce(Text, { style: styles.logIndex }, `#${i + 1}`),
      row("ID log", log.id),
      row("Date", fmt(log.createdAt)),
      row("IP (hash)", log.ipHash),
      row("User-Agent", log.userAgent),
      ...(log.rfc3161Hash ? [row("Horodatage RFC3161", log.rfc3161Hash)] : []),
    ),
  );

  return ce(Document, { title: `Rapport de tracking — ${link.id}`, author: "Mk42" },
    ce(Page, { size: "A4", style: styles.page },
      ce(Text, { style: styles.title }, "Rapport de tracking"),
      ce(Text, { style: styles.subtitle }, `Généré le ${fmt(new Date())}`),

      ce(View, { style: styles.section },
        ce(Text, { style: styles.sectionTitle }, "Informations du lien"),
        row("ID", link.id),
        row("Token", link.token),
        row("Apporteur", link.apporteurId),
        row("Mission", link.missionId),
        row("Statut", link.statut),
        row("Créé le", fmt(link.createdAt)),
      ),

      ce(View, { style: styles.section },
        ce(Text, { style: styles.sectionTitle }, `Journaux d'accès (${link.logs.length})`),
        ...(link.logs.length === 0
          ? [ce(Text, { style: { color: "#888" } }, "Aucun accès enregistré.")]
          : logCards),
      ),

      ce(Text, { style: styles.footer },
        `Document généré automatiquement par Mk42 — ${fmt(new Date())}`,
      ),
    ),
  );
}

export async function GET(request: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const entrepriseId = await getCurrentEntrepriseId();

    const params = await context.params;
    const linkId = params.linkId;

    const link = await prisma.trackingLink.findFirst({
      where: {
        id: linkId,
        apporteur: {
          contrats: {
            some: { entrepriseId },
          },
        },
      },
      include: { logs: { orderBy: { createdAt: "asc" } } },
    });

    if (!link) {
      return new NextResponse(JSON.stringify({ error: "Lien introuvable" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const nodeStream = await renderToStream(buildPDF(link));
    const webStream = Readable.toWeb(nodeStream as Readable) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tracking-${linkId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Erreur interne du serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
