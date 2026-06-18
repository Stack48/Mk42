import { clerkClient } from '@clerk/nextjs/server';
import { getInscriptionUserId } from '@/lib/auth-inscription';
import { getResend } from '@/lib/resend';
import { randomUUID } from 'crypto';
import { validationEmailHtml } from '@/emails/validation-email';

export async function POST(req: Request) {
  const userId = await getInscriptionUserId(req);
  if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return Response.json({ error: 'Aucune adresse email trouvée' }, { status: 400 });

    const token = randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        emailVerifToken: token,
        emailVerifExpiresAt: expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const verifyUrl = `${appUrl}/api/inscription/verify-email/confirm?token=${token}&userId=${userId}`;

    if (!process.env.RESEND_API_KEY) {
      console.log('\n[verify-email] MODE DEV — lien de vérification :');
      console.log(verifyUrl);
      console.log('');
    } else {
      const resend = getResend();
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@opus-btp.fr',
        to: email,
        subject: 'Vérifiez votre adresse email — Opus BTP',
        html: validationEmailHtml({ url: verifyUrl, prenom: user.firstName ?? undefined }),
      });

      if (error) {
        console.error('[verify-email] Resend error:', error);
        return Response.json({ error: error.message }, { status: 500 });
      }

      console.log('[verify-email] Email envoyé, id:', data?.id);
    }

    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/inscription/verify-email]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
