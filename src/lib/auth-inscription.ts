import { auth } from '@clerk/nextjs/server';
import { verifyToken } from '@clerk/backend';
import { cookies } from 'next/headers';

export async function getInscriptionUserId(req: Request): Promise<string | null> {
  const { userId } = await auth();
  if (userId) return userId;

  const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '') ?? null;

  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get('__session')?.value ??
    cookieStore.get('__clerk_db_jwt')?.value ??
    null;

  const token = bearerToken ?? sessionCookie;
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
