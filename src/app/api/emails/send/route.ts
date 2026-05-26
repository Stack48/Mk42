import { getResend } from '@/lib/resend';
import { validationEmailHtml } from '@/emails/validation-email';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const to = body.to ?? 'test@example.com';

  const { data, error } = await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Confirmez votre email — Opus",
    html: validationEmailHtml({ url: 'https://opus-btp.fr/confirm', prenom: body.prenom }),
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ data });
}
