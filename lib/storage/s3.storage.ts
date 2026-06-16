// S3 STORAGE SERVICE — lib/storage/s3.storage.ts
//
// Implémentation "production" du StorageService pour AWS S3.
// Les fichiers sont chiffrés avant upload et déchiffrés après download.
//
// Analogie Symfony (injection de dépendance / service taggé) :
// En Symfony, tu aurais :
//   services.yaml:
//     App\Storage\S3StorageService:
//       tags: ['app.storage_service']
//       arguments: ['%env(AWS_S3_BUCKET)%']
//
// Ici, c'est une classe TypeScript simple qui implémente l'interface StorageService.
// La "sélection" de l'implémentation se fait dans storage.factory.ts (pattern Factory).
//
// Variables d'env requises :
//   AWS_REGION          — ex: "eu-west-3"
//   AWS_ACCESS_KEY_ID   — clé d'accès IAM
//   AWS_SECRET_ACCESS_KEY — secret IAM
//   AWS_S3_BUCKET       — nom du bucket S3

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageService } from "./storage.interface";
import {
  encrypt,
  decrypt,
  serializePayload,
  deserializePayload,
} from "@/lib/crypto/encryption";

export class S3StorageService implements StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_S3_BUCKET;

    if (!region) throw new Error("AWS_REGION manquante dans .env");
    if (!bucket) throw new Error("AWS_S3_BUCKET manquant dans .env");

    // Le SDK S3 lit automatiquement AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY
    // depuis les variables d'environnement — pas besoin de les passer explicitement.
    this.client = new S3Client({ region });
    this.bucket = bucket;
  }

  /**
   * Chiffre le fichier et l'uploade sur S3.
   * La clé S3 (= "chemin" dans le bucket) est le nom de fichier + ".enc".
   *
   * Pourquoi chiffrer avant S3 ?
   * Même si le bucket est privé, chiffrer côté client garantit que le fichier
   * est illisible même si quelqu'un accède directement au bucket (defense in depth).
   */
  async save(filename: string, data: Buffer): Promise<string> {
    // Chiffrement AES-256 avant upload
    const payload = encrypt(data);
    const serialized = serializePayload(payload);
    const encFilename = `${filename}.enc`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: encFilename,
        // Le contenu chiffré est une chaîne texte (iv:authTag:data en hex)
        Body: serialized,
        ContentType: "text/plain",
        // On marque le fichier comme privé (non accessible publiquement)
        // Les URLs de téléchargement seront générées via getSignedUrl()
        ServerSideEncryption: "AES256",
      })
    );

    // On retourne uniquement la clé S3, pas l'URL complète
    return encFilename;
  }

  /**
   * Télécharge depuis S3 et déchiffre.
   */
  async read(path: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: path })
    );

    // response.Body est un stream ReadableStream — on le convertit en Buffer
    if (!response.Body) throw new Error(`Fichier introuvable sur S3 : ${path}`);

    // transformToByteArray() est fourni par le SDK AWS v3 pour éviter la gestion manuelle du stream
    const bytes = await (response.Body as { transformToByteArray(): Promise<Uint8Array> }).transformToByteArray();
    const serialized = Buffer.from(bytes).toString("utf-8");
    const encPayload = deserializePayload(serialized);
    return decrypt(encPayload);
  }

  /**
   * Supprime un objet S3.
   */
  async delete(path: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: path })
    );
  }

  /**
   * Génère une URL présignée S3 valide pour une durée limitée.
   *
   * Une URL présignée = une URL temporaire qui donne accès à un objet S3 privé.
   * Elle contient une signature HMAC qui expire après `expiresInSeconds`.
   * Après expiration, l'URL renvoie une erreur 403.
   *
   * Note : l'URL pointe vers le fichier CHIFFRÉ. Pour servir le fichier déchiffré,
   * il faudrait une route API intermédiaire (comme /api/contrats/download en local).
   * En production, on peut soit déchiffrer à la volée via une Lambda, soit accepter
   * que le client reçoive le fichier chiffré (à déchiffrer côté client).
   *
   * Pour ce projet : l'URL présignée sert le fichier chiffré tel quel sur S3.
   * Si tu veux servir le déchiffré, crée une route API qui fait read() + stream.
   *
   * @param expiresInSeconds Défaut 15 minutes (900 secondes)
   */
  async getDownloadUrl(path: string, expiresInSeconds = 900): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: path });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
