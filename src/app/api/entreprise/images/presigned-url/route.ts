import { auth } from '@clerk/nextjs/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_KINDS = ['logo', 'banner'] as const

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 })

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { entreprise: { select: { id: true } } },
  })

  if (!utilisateur?.entreprise) {
    return Response.json({ error: 'Accès réservé aux entreprises' }, { status: 403 })
  }

  const { contentType, kind } = await req.json()

  if (!ALLOWED_TYPES.includes(contentType)) {
    return Response.json({ error: 'Type de fichier non autorisé (jpeg, png, webp)' }, { status: 400 })
  }

  if (!ALLOWED_KINDS.includes(kind)) {
    return Response.json({ error: 'Kind invalide (logo ou banner)' }, { status: 400 })
  }

  const ext = contentType.split('/')[1]
  const key = `entreprise-images/${utilisateur.entreprise.id}/${kind}-${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  return Response.json({ presignedUrl, publicUrl, key }, { status: 200 })
}
