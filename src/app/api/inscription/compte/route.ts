import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client/client';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 });
  }

  try {
    const { prenom, nom, email, motDePasse, profil, telephone, fonction } = await req.json();

    if (!prenom || !nom || !email || !motDePasse) {
      return Response.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }

    const client = await clerkClient();

    const clerkUser = await client.users.createUser({
      firstName: prenom,
      lastName: nom,
      emailAddress: [email],
      password: motDePasse,
      unsafeMetadata: { telephone, fonction },
    });

    try {
      await prisma.utilisateur.create({
        data: { clerkId: clerkUser.id, email, profil },
      });
    } catch (prismaErr) {
      await client.users.deleteUser(clerkUser.id).catch(() => {});

      if (
        prismaErr instanceof Prisma.PrismaClientKnownRequestError &&
        prismaErr.code === 'P2002'
      ) {
        return Response.json(
          { error: 'Un compte avec cet email existe déjà. Veuillez vous connecter.' },
          { status: 409 },
        );
      }
      throw prismaErr;
    }

    const tokenRes = await client.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 120,
    });

    return Response.json({ success: true, ticket: tokenRes.token }, { status: 201 });
  } catch (err: unknown) {
    const clerkErr = err as {
      errors?: { code?: string; message?: string; longMessage?: string }[];
      message?: string;
      code?: string;
    };

    const detail = clerkErr.errors?.[0];
    if (detail) {
      return Response.json({ error: detail.longMessage ?? detail.message ?? 'Erreur de validation Clerk.' }, { status: 422 });
    }

    console.error('[POST /api/inscription/compte]', err);

    return Response.json({ error: 'Erreur serveur interne.' }, { status: 500 });
  }
}
