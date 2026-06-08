// ROUTE API — app/api/contrats/download/route.ts
//
// Sert les fichiers chiffrés stockés en local (utilisé par LocalStorageService).
// Cette route déchiffre le fichier à la volée et le retourne au navigateur.
//
// Pourquoi cette route est nécessaire en local :
//   - Les fichiers sont stockés chiffrés sur disque (./storage/contrats/*.enc)
//   - On ne peut pas servir ces fichiers directement (chiffrés, illisibles)
//   - Cette route appelle storage.read() qui déchiffre → envoie le binaire propre
//
// En production avec S3 :
//   - getDownloadUrl() retourne une URL présignée S3 directement
//   - Cette route n'est pas utilisée (mais ne pose pas de problème si elle existe)
//
// Analogie Symfony : un Controller FileController::download() qui appelle
//   $decrypted = $encryptionService->decrypt($file);
//   return new BinaryFileResponse($decrypted);

import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage/storage.factory";

// Table de correspondance extension → type MIME
const MIME_TYPES: Record<string, string> = {
  pdf:  "application/pdf",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Paramètre 'file' manquant." },
        { status: 400 }
      );
    }

    // Sécurité basique : interdire les path traversals (../../etc/passwd)
    if (file.includes("..") || file.includes("/") || file.includes("\\")) {
      return NextResponse.json(
        { error: "Nom de fichier invalide." },
        { status: 400 }
      );
    }

    // Lire et déchiffrer le fichier via le service de stockage
    const storage = getStorage();
    const buffer = await storage.read(file);

    // Détecter le type MIME depuis l'extension du nom de fichier
    // Les fichiers sont stockés avec .enc à la fin (ex: contrat-abc.pdf.enc)
    // On enlève .enc pour retrouver l'extension d'origine
    const baseName = file.endsWith(".enc") ? file.slice(0, -4) : file;
    const ext = baseName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    // Nom de fichier pour le téléchargement (sans .enc)
    const downloadName = baseName;

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        // inline = afficher dans le navigateur (PDF viewer, image)
        // attachment = forcer le téléchargement
        "Content-Disposition": `inline; filename="${downloadName}"`,
        "Content-Length": buffer.length.toString(),
        // Pas de cache public — les fichiers sont privés
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne.";
    console.error("[download] Erreur :", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
