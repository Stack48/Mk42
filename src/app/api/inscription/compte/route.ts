import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
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
      unsafeMetadata: { profil, telephone, fonction },
    });

    try {
      await prisma.utilisateur.create({
        data: { clerkId: clerkUser.id, email },
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
      expiresInSeconds: 300,
    });

    return Response.json({ ticket: tokenRes.token }, { status: 201 });
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
