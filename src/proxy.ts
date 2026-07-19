import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/connexion(.*)',
  '/inscription(.*)',
  '/api/webhooks(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) return NextResponse.next();

  const { userId, orgId, orgRole } = await auth.protect();

  // La vérification de l'utilisateur en base (emailVerified, profil complet)
  // est gérée par chaque page — Prisma n'est pas compatible avec l'Edge Runtime.

  if (isAdminRoute(request)) {
    if (!orgId || orgRole !== 'org:admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
