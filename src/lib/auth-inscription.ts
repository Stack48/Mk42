import { auth } from '@clerk/nextjs/server';
import { verifyToken } from '@clerk/backend';

/**
 * Retourne le userId Clerk pour les routes d'inscription.
 * Accepte les sessions "pending" (email non encore vérifié)
 * en décodant le JWT directement si auth() ne retourne pas de userId.
 */
export async function getInscriptionUserId(req: Request): Promise<string | null> {
  const { userId } = await auth();
  if (userId) return userId;

  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/__session=([^;]+)/);
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!token) return null;

  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    return claims.sub ?? null;
  } catch {
    return null;
  }
}
