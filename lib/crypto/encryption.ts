// CHIFFREMENT AES-256 — lib/crypto/encryption.ts
//
// On utilise le module "crypto" natif de Node.js (pas d'installation supplémentaire).
// AES-256-GCM est le standard actuel pour le chiffrement symétrique :
//   - AES-256 = taille de clé 256 bits (très robuste)
//   - GCM = mode d'opération qui garantit à la fois la confidentialité ET l'intégrité
//           (si quelqu'un modifie le fichier chiffré, le déchiffrement échoue)
//
// Analogie Symfony : c'est l'équivalent d'un service de chiffrement que tu injecterais
// via autowiring, sauf qu'ici c'est un module statique (pas de DI container en Next.js).

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

// La clé doit être exactement 32 octets (256 bits) pour AES-256.
// Elle est lue depuis les variables d'environnement — JAMAIS hardcodée dans le code.
function getKey(): Buffer {
  const raw = process.env.AES_ENCRYPTION_KEY;
  if (!raw) throw new Error("AES_ENCRYPTION_KEY manquante dans .env");
  const buf = Buffer.from(raw, "hex");
  if (buf.length !== 32) throw new Error("AES_ENCRYPTION_KEY doit faire 32 octets (64 caractères hex)");
  return buf;
}

// Structure du résultat de chiffrement.
// On stocke iv + authTag + données chiffrées ensemble pour pouvoir déchiffrer plus tard.
export interface EncryptedPayload {
  iv: string;       // vecteur d'initialisation (16 octets, hex) — unique par chiffrement
  authTag: string;  // tag d'authentification GCM (16 octets, hex) — vérifie l'intégrité
  data: string;     // données chiffrées (hex)
}

/** Chiffre un Buffer et retourne { iv, authTag, data } en hex. */
export function encrypt(input: Buffer): EncryptedPayload {
  // IV = Initialization Vector : valeur aléatoire unique pour chaque chiffrement.
  // Même fichier chiffré deux fois → deux résultats différents (sécurité renforcée).
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  const authTag = cipher.getAuthTag(); // spécifique au mode GCM

  return {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

/** Déchiffre un payload { iv, authTag, data } et retourne le Buffer original. */
export function decrypt(payload: EncryptedPayload): Buffer {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(payload.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.data, "hex")),
    decipher.final(),
  ]);
}

/** Sérialise un EncryptedPayload en une seule chaîne stockable (iv:authTag:data). */
export function serializePayload(p: EncryptedPayload): string {
  return `${p.iv}:${p.authTag}:${p.data}`;
}

/** Désérialise la chaîne stockée en EncryptedPayload. */
export function deserializePayload(s: string): EncryptedPayload {
  const [iv, authTag, data] = s.split(":");
  return { iv, authTag, data };
}
