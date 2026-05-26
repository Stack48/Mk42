import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  // Bucket privé — retourner la clé S3, pas une URL publique
  return key;
}

// Génère une URL signée valable `expiresIn` secondes (défaut 1h)
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Convention de nommage des clés S3
export const s3Keys = {
  kyc: (userId: string, type: string, filename: string) =>
    `kyc/${userId}/${type}/${filename}`,
  contrat: (chantierId: string, filename: string) =>
    `contrats/${chantierId}/${filename}`,
  facture: (chantierId: string, filename: string) =>
    `factures/${chantierId}/${filename}`,
  recu: (chantierId: string, filename: string) =>
    `recus/${chantierId}/${filename}`,
  das2: (entrepriseId: string, annee: number, filename: string) =>
    `das2/${entrepriseId}/${annee}/${filename}`,
};
