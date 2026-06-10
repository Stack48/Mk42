import { clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  if (!token || !userId) return redirect('/inscription/etape-6?error=lien-invalide');

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.privateMetadata as Record<string, unknown>;

    if (
      meta.emailVerifToken !== token ||
      typeof meta.emailVerifExpiresAt !== 'number' ||
      Date.now() > meta.emailVerifExpiresAt
    ) {
      return redirect('/inscription/etape-6?error=lien-expire');
    }

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

    return redirect('/dashboard');
  } catch (err) {
    console.error('[GET /api/inscription/verify-email/confirm]', err);
    return redirect('/inscription/etape-6?error=erreur-serveur');
  }
}
