import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { prenom, nom, email, motDePasse, profil } = await req.json();

    if (!prenom || !nom || !email || !motDePasse) {
      return Response.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }

    const client = await clerkClient();

    const clerkUser = await client.users.createUser({
      firstName: prenom,
      lastName: nom,
      emailAddress: [email],
      password: motDePasse,
      unsafeMetadata: { profil },
    });

    await prisma.utilisateur.create({
      data: { clerkId: clerkUser.id, email },
    });

    const tokenRes = await client.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 300,
    });

    return Response.json({ ticket: tokenRes.token }, { status: 201 });
  } catch (err: unknown) {
    const clerkErr = err as { errors?: { code: string; message: string; longMessage?: string }[] };
    const detail = clerkErr.errors?.[0];
    if (detail) {
      return Response.json({ error: detail.longMessage ?? detail.message }, { status: 422 });
    }
    console.error('[POST /api/inscription/compte]', err);
    return Response.json({ error: 'Erreur serveur interne.' }, { status: 500 });
  }
}
