// LOCAL STORAGE SERVICE — lib/storage/local.storage.ts
//
// Implémentation "développement" du StorageService.
// Les fichiers sont stockés sur le disque local dans /storage/contrats/.
//
// En Symfony, c'est l'équivalent d'un service taggé qui implémente une interface :
//   class LocalStorageService implements StorageServiceInterface { ... }
//
// Pour le chiffrement : chaque fichier est chiffré avant écriture sur disque.
// Le chemin retourné par save() est le nom du fichier chiffré.

import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { StorageService } from "./storage.interface";
import { encrypt, decrypt, serializePayload, deserializePayload } from "@/lib/crypto/encryption";

export class LocalStorageService implements StorageService {
  // Dossier racine pour le stockage local.
  // Configurable via LOCAL_STORAGE_PATH dans .env (défaut : ./storage/contrats)
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH ?? join(process.cwd(), "storage", "contrats");
  }

  /** S'assure que le dossier de stockage existe (équivalent de mkdir -p). */
  private async ensureDir(): Promise<void> {
    if (!existsSync(this.basePath)) {
      await mkdir(this.basePath, { recursive: true });
    }
  }

  async save(filename: string, data: Buffer): Promise<string> {
    await this.ensureDir();

    // Chiffrement AES-256 avant écriture — le fichier sur disque est illisible sans la clé
    const payload = encrypt(data);
    const serialized = serializePayload(payload);

    // On ajoute .enc pour signaler que le fichier est chiffré
    const encFilename = `${filename}.enc`;
    const fullPath = join(this.basePath, encFilename);
    await writeFile(fullPath, serialized, "utf-8");

    // On retourne uniquement le nom de fichier, pas le chemin absolu
    // (plus portable si le basePath change)
    return encFilename;
  }

  async read(path: string): Promise<Buffer> {
    const fullPath = join(this.basePath, path);
    const serialized = await readFile(fullPath, "utf-8");
    const payload = deserializePayload(serialized);
    return decrypt(payload);
  }

  async delete(path: string): Promise<void> {
    const fullPath = join(this.basePath, path);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    // En local, on retourne une route API Next.js qui servira le fichier déchiffré.
    // /api/contrats/download?file=... sera créé si nécessaire.
    return `/api/contrats/download?file=${encodeURIComponent(path)}`;
  }
}
