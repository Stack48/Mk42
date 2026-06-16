// ROUTE API — app/api/contrats/signer/route.ts
//
// Route API Next.js (App Router) pour recevoir le fichier signé de l'apporteur.
//
// Pourquoi une route API plutôt qu'une Server Action ?
// Les Server Actions fonctionnent bien avec FormData simple (texte, petits fichiers),
// mais pour les uploads binaires volumineux (PDF, images jusqu'à 10 Mo),
// les route handlers Next.js sont plus robustes :
//   - Accès direct à req.formData() avec contrôle total
//   - Pas de sérialisation/désérialisation JSON intermédiaire
//   - Headers de requête accessibles (IP, User-Agent pour le log d'audit)
//
// Analogie Symfony : c'est l'équivalent d'un Controller avec une route POST
//   #[Route('/api/contrats/signer', methods: ['POST'])]
//   public function uploadSigne(Request $request): JsonResponse

import { NextRequest, NextResponse } from "next/server";
import { uploadSignedContrat } from "@/lib/actions/contrat.actions";

export async function POST(req: NextRequest) {
  try {
    // Récupérer le FormData — contient "token" (string) et "file" (File)
    const formData = await req.formData();
    const token = formData.get("token");
    const file = formData.get("file");

    // Validation des champs obligatoires
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Token manquant." },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Fichier manquant." },
        { status: 400 }
      );
    }

    // Vérification de la taille côté serveur (défense en profondeur — le client vérifie aussi)
    const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Fichier trop lourd. Maximum 10 Mo." },
        { status: 413 }
      );
    }

    // Convertir le File en Buffer Node.js
    // File.arrayBuffer() retourne un ArrayBuffer → Buffer.from() le convertit en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Récupérer l'IP et le User-Agent pour le log d'audit
    // x-forwarded-for : IP réelle derrière un proxy/CDN
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    // Appeler la Server Action d'upload
    const result = await uploadSignedContrat(
      token,
      buffer,
      file.name,
      ip,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
