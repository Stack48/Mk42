import { clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  if (!token || !userId) return redirect('/inscription?step=6&error=lien-invalide');

  // redirect() lève une exception interne (NEXT_REDIRECT) pour fonctionner —
  // elle ne doit jamais être appelée à l'intérieur de ce try/catch, sinon le
  // catch ci-dessous l'intercepte et écrase la redirection par une erreur.
  let target = '/dashboard';

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.privateMetadata as Record<string, unknown>;

    if (
      meta.emailVerifToken !== token ||
      typeof meta.emailVerifExpiresAt !== 'number' ||
      Date.now() > meta.emailVerifExpiresAt
    ) {
      target = '/inscription?step=6&error=lien-expire';
    } else {
      await Promise.all([
        client.users.updateUserMetadata(userId, {
          privateMetadata: {
            ...meta,
            emailVerifToken: null,
            emailVerifExpiresAt: null,
          },
        }),
        prisma.utilisateur.update({
          where: { clerkId: userId },
          data: { emailVerified: true },
        }),
      ]);
    }
  } catch (err) {
    console.error('[GET /api/inscription/verify-email/confirm]', err);
    target = '/inscription?step=6&error=erreur-serveur';
  }

  return redirect(target);
}
