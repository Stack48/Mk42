// SIMULATION EMAIL — Feature [17-FE] Espace Client
//
// POURQUOI RESEND ET PAS UN SIMPLE MAILTO ?
// ─────────────────────────────────────────
// Un mailto: ouvre le client email de l'utilisateur → l'email part du PC de l'admin,
// pas de votre serveur. Ça ne scale pas, ça ne log pas, et le client reçoit un email
// qui ressemble à du spam.
//
// Resend (resend.com) est un service d'envoi d'emails transactionnels via API HTTP :
//   - L'email part de vos serveurs avec votre domaine (@opus-btp.fr par ex.)
//   - Vous avez des logs de livraison, d'ouverture, de clics
//   - Vous contrôlez le HTML/CSS de l'email
//   - SPF/DKIM/DMARC configurés → meilleure délivrabilité (moins de spam)
//
// Alternatives : SendGrid, Mailgun, Amazon SES — même principe, API différente.
//
// POUR BRANCHER RESEND QUAND L'ÉQUIPE EST PRÊTE :
//   1. npm install resend
//   2. Ajouter RESEND_API_KEY=re_xxx dans .env
//   3. Remplacer les console.log ci-dessous par :
//      import { Resend } from "resend";
//      const resend = new Resend(process.env.RESEND_API_KEY);
//      await resend.emails.send({ from, to, subject, html });

// ─── TYPES ────────────────────────────────────────────────────────────────────

type InvitationEmailPayload = {
  email: string;       // destinataire
  nom: string;         // prénom/nom du client (pour personnaliser)
  lienInvitation: string; // URL complète avec token
  dealTitre: string;   // titre du chantier/projet (contexte pour le client)
};

// ─── SIMULATION D'ENVOI ───────────────────────────────────────────────────────

/**
 * Simule l'envoi d'un email d'invitation à un client.
 *
 * En production, remplacer le console.log par resend.emails.send().
 * La structure de la fonction ne change pas — seule l'implémentation interne évolue.
 */
export async function sendInvitationEmail(payload: InvitationEmailPayload): Promise<void> {
  const { email, nom, lienInvitation, dealTitre } = payload;

  // L'objet "emailData" représente ce qu'on enverrait à l'API Resend.
  // On le logge ici pour pouvoir tester sans service réel.
  const emailData = {
    from: "OPUS BTP <noreply@opus-btp.fr>",   // expéditeur (doit être vérifié sur Resend)
    to: email,
    subject: `Votre dossier ${dealTitre} — Accès à votre espace client`,
    html: buildInvitationHtml({ nom, lienInvitation, dealTitre }),
  };

  // ── SIMULATION (remplacer par resend.emails.send(emailData) en production) ──
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 [SIMULATION EMAIL] Invitation client");
  console.log(`   De      : ${emailData.from}`);
  console.log(`   À       : ${emailData.to}`);
  console.log(`   Sujet   : ${emailData.subject}`);
  console.log(`   Lien    : ${lienInvitation}`);
  console.log("   Corps   :");
  console.log(`   Bonjour ${nom},`);
  console.log(`   Votre dossier "${dealTitre}" est disponible.`);
  console.log(`   Accédez à votre espace : ${lienInvitation}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Simuler une latence réseau réaliste (comme le ferait un vrai appel API)
  await Promise.resolve();
}

// ─── TEMPLATE HTML ────────────────────────────────────────────────────────────
// Construit le corps HTML de l'email.
// En production, ce template peut être remplacé par un composant React Email
// (https://react.email) pour un rendu plus riche avec prévisualisation.

function buildInvitationHtml(params: {
  nom: string;
  lienInvitation: string;
  dealTitre: string;
}): string {
  const { nom, lienInvitation, dealTitre } = params;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre espace client OPUS BTP</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; background: #F8F9FF; margin: 0; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; padding: 40px; border: 1px solid #E5E7EB;">
    <h1 style="color: #4F6EF7; font-size: 24px; margin: 0 0 8px;">OPUS BTP</h1>
    <p style="color: #6B7280; font-size: 14px; margin: 0 0 32px;">CommissionPro</p>

    <h2 style="color: #0F1117; font-size: 18px; margin: 0 0 16px;">
      Bonjour ${nom},
    </h2>

    <p style="color: #0F1117; line-height: 1.6; margin: 0 0 16px;">
      Votre dossier <strong>${dealTitre}</strong> est maintenant disponible
      dans votre espace client sécurisé.
    </p>

    <p style="color: #6B7280; line-height: 1.6; margin: 0 0 32px;">
      Vous pouvez consulter l'avancement, valider ou refuser les étapes du process
      directement depuis ce lien — sans compte ni mot de passe.
    </p>

    <a
      href="${lienInvitation}"
      style="display: inline-block; background: #4F6EF7; color: #FFFFFF; text-decoration: none;
             font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;"
    >
      Accéder à mon dossier
    </a>

    <p style="color: #6B7280; font-size: 12px; margin: 32px 0 0; line-height: 1.6;">
      Ce lien est personnel et sécurisé. Ne le partagez pas.<br />
      Il expire dans ${process.env.TOKEN_EXPIRY_HOURS ?? 72} heures.
    </p>
  </div>
</body>
</html>
  `.trim();
}
