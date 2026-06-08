// STORAGE FACTORY — lib/storage/storage.factory.ts
//
// Le pattern Factory retourne la bonne implémentation selon la configuration.
// C'est l'équivalent d'un ServiceLocator en Symfony :
//
//   // Symfony
//   $storage = $locator->get($env === 'prod' ? 's3' : 'local');
//
//   // Ici (TypeScript)
//   const storage = getStorage(); // lit STORAGE_DRIVER depuis .env
//
// Avantage : tout le reste du code (Server Actions, composants) ne connaît que
// l'interface StorageService. Pour passer de local à S3, tu changes UNE variable
// d'environnement. Zéro modification de code applicatif.
//
// Variable d'env : STORAGE_DRIVER = "local" | "s3"  (défaut : "local")

import type { StorageService } from "./storage.interface";
import { LocalStorageService } from "./local.storage";
// S3StorageService est chargé dynamiquement (require conditionnel) pour éviter
// que Turbopack/webpack essaie de bundler @aws-sdk quand STORAGE_DRIVER=local.

/**
 * Retourne l'instance de StorageService configurée via STORAGE_DRIVER.
 */
export function getStorage(): StorageService {
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "s3") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { S3StorageService } = require("./s3.storage");
    return new S3StorageService();
  }

  return new LocalStorageService();
}
