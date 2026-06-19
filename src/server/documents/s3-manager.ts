import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const BUCKET = process.env.AWS_S3_BUCKET ?? "opus-btp-documents";
const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 min

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? "eu-west-3",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export type DocumentType = "FACTURE" | "RECU" | "DAS2" | "CSV";

// Mapping vers l'enum Prisma TypeDocument — le CSV est un export ponctuel,
// non centralisé dans le coffre-fort documentaire (pas d'équivalent dans l'enum).
const PRISMA_DOCUMENT_TYPE: Partial<Record<DocumentType, "FACTURE" | "RECU" | "DAS2_EXPORT">> = {
  FACTURE: "FACTURE",
  RECU: "RECU",
  DAS2: "DAS2_EXPORT",
};

const EXT: Record<DocumentType, string> = {
  FACTURE: "pdf",
  RECU: "pdf",
  DAS2: "edi",
  CSV: "csv",
};

const MIME: Record<DocumentType, string> = {
  FACTURE: "application/pdf",
  RECU: "application/pdf",
  DAS2: "text/plain; charset=utf-8",
  CSV: "text/csv; charset=utf-8",
};

export interface UploadInput {
  type: DocumentType;
  contenu: Buffer | string;
  entrepriseId: string;
  apporteurId?: string;
  metadata?: Record<string, unknown>;
}

export interface UploadResult {
  documentId: string;
  s3Key: string;
  lienSigne: string;
  dateExpiration: Date;
}

export async function uploadDocumentS3(input: UploadInput): Promise<UploadResult> {
  const now = new Date();
  const annee = now.getFullYear();
  const uuid = randomUUID();
  const ext = EXT[input.type];
  const filename = `${input.type.toLowerCase()}-${now.toISOString().slice(0, 10)}-${uuid}.${ext}`;
  const s3Key = `${input.entrepriseId}/${annee}/${input.type}/${filename}`;

  const body: Buffer =
    typeof input.contenu === "string"
      ? Buffer.from(input.contenu, "utf8")
      : input.contenu;

  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: body,
      ContentType: MIME[input.type],
    })
  );

  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }),
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  );

  const dateExpiration = new Date(now.getTime() + SIGNED_URL_TTL_SECONDS * 1000);

  const typeDocument = PRISMA_DOCUMENT_TYPE[input.type];

  const documentId = typeDocument
    ? (
        await prisma.document.create({
          data: {
            type: typeDocument,
            s3Key,
            nomFichier: filename,
            entrepriseId: input.entrepriseId,
            apporteurId: input.apporteurId ?? null,
            metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
          },
        })
      ).id
    : uuid;

  return {
    documentId,
    s3Key,
    lienSigne: signedUrl,
    dateExpiration,
  };
}

export async function getSignedDownloadUrl(s3Key: string): Promise<string> {
  const client = getS3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }),
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  );
}
