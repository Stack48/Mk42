// INTERFACE STORAGE — lib/storage/storage.interface.ts
//
// Ce fichier définit un "contrat" que toutes les implémentations de stockage
// doivent respecter. C'est exactement le pattern Interface en Symfony/PHP :
//
//   interface StorageServiceInterface {
//     public function save(string $path, string $content): string;
//     ...
//   }
//
// En TypeScript, une interface décrit la FORME d'un objet (ses méthodes et leurs
// signatures) sans implémenter quoi que ce soit. Les classes concrètes
// (LocalStorageService, S3StorageService) implémentent ensuite cette interface.
//
// Avantage : le reste du code (Server Actions, composants) ne connaît que
// StorageService — il ignore si les fichiers vont en local ou sur S3.
// Pour changer d'implémentation, tu modifies une seule ligne dans storage.factory.ts.

export interface StorageService {
  /**
   * Sauvegarde un fichier et retourne le chemin/clé de stockage.
   * @param filename Nom de fichier souhaité (ex: "contrat-abc123.pdf")
   * @param data Contenu du fichier sous forme de Buffer
   * @returns Le chemin/clé pour retrouver le fichier plus tard
   */
  save(filename: string, data: Buffer): Promise<string>;

  /**
   * Lit un fichier et retourne son contenu.
   * @param path Chemin/clé retourné par save()
   */
  read(path: string): Promise<Buffer>;

  /**
   * Supprime un fichier.
   * @param path Chemin/clé retourné par save()
   */
  delete(path: string): Promise<void>;

  /**
   * Retourne une URL de téléchargement temporaire (signée pour S3, chemin local sinon).
   * @param path Chemin/clé retourné par save()
   * @param expiresInSeconds Durée de validité en secondes (pertinent pour S3)
   */
  getDownloadUrl(path: string, expiresInSeconds?: number): Promise<string>;
}
