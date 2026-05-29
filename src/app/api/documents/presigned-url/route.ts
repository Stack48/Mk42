import { auth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const { nomFichier, contentType } = await req.json();
    if (!nomFichier || !contentType) {
      return Response.json({ error: 'nomFichier et contentType requis' }, { status: 400 });
    }

    const ext = nomFichier.split('.').pop();
    const key = `kyc/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    return Response.json({ url, key }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/documents/presigned-url]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
