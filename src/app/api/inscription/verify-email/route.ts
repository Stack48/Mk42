import { clerkClient } from '@clerk/nextjs/server';
import { getInscriptionUserId } from '@/lib/auth-inscription';
import { getResend } from '@/lib/resend';
import { randomUUID } from 'crypto';

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
      unsafeMetadata: {
        ...user.unsafeMetadata,
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
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@opus-btp.fr',
        to: email,
        subject: 'Vérifiez votre adresse email — Opus BTP',
        html: `
          <p>Bonjour ${user.firstName ?? ''},</p>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email et accéder à votre tableau de bord :</p>
          <p><a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Vérifier mon adresse email</a></p>
          <p>Ce lien expire dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
        `,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/inscription/verify-email]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
