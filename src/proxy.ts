import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const isPublicRoute = createRouteMatcher([
  '/',
  '/connexion(.*)',
  '/inscription(.*)',
  '/api/webhooks(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  // Les API routes gèrent leur propre authentification (retournent 401 JSON)
  if (request.nextUrl.pathname.startsWith('/api/')) return NextResponse.next();

  const { userId, orgId, orgRole } = await auth.protect();

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { emailVerified: true },
  });
  if (!utilisateur?.emailVerified) {
    return NextResponse.redirect(new URL('/inscription?step=6', request.url));
  }

  if (isAdminRoute(request)) {
    if (!orgId || orgRole !== 'org:admin') {
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }

  if (!userId) {
    const url = new URL('/connexion', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
