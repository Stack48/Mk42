// SIMULATION EMAIL — Feature [18-FE] Notifications
//
// Même pattern que client.email.ts : console.log structuré en dev,
// remplacer par resend.emails.send() en production.
// L'interface des fonctions ne change pas lors du branchement Resend.

import type { NotificationType } from "@/types/notification.types";

type NotificationEmailPayload = {
  email:   string;
  nom:     string;
  type:    NotificationType;
  titre:   string;
  message: string;
};

export async function sendNotificationEmail(payload: NotificationEmailPayload): Promise<void> {
  const { email, nom, type, titre, message } = payload;

  const subjects: Record<NotificationType, string> = {
    NOUVEAU_DEAL:        "🤝 Un nouveau deal vous a été assigné — OPUS BTP",
    COMMISSION_CALCULEE: "💰 Votre commission a été calculée — OPUS BTP",
    COMMISSION_PAYEE:    "✅ Votre commission a été payée — OPUS BTP",
  };

  const emailData = {
    from:    "OPUS BTP <noreply@opus-btp.fr>",
    to:      email,
    subject: subjects[type],
    html:    buildNotificationHtml({ nom, titre, message }),
  };

  // ── SIMULATION — remplacer par resend.emails.send(emailData) en production ──
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📧 [SIMULATION EMAIL] Notification — ${type}`);
  console.log(`   De      : ${emailData.from}`);
  console.log(`   À       : ${emailData.to} (${nom})`);
  console.log(`   Sujet   : ${emailData.subject}`);
  console.log(`   Titre   : ${titre}`);
  console.log(`   Message : ${message}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await Promise.resolve();
}

function buildNotificationHtml(params: { nom: string; titre: string; message: string }): string {
  const { nom, titre, message } = params;
  return `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family: Inter, Arial, sans-serif; background: #F8F9FF; margin: 0; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; padding: 40px; border: 1px solid #E5E7EB;">
    <h1 style="color: #4F6EF7; font-size: 24px; margin: 0 0 24px;">OPUS BTP</h1>
    <h2 style="color: #0F1117; font-size: 18px; margin: 0 0 12px;">${titre}</h2>
    <p style="color: #0F1117; line-height: 1.6; margin: 0 0 24px;">Bonjour ${nom},<br/><br/>${message}</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/notifications"
       style="display: inline-block; background: #4F6EF7; color: #FFFFFF; text-decoration: none;
              font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
      Voir mes notifications
    </a>
    <p style="color: #6B7280; font-size: 12px; margin: 32px 0 0;">
      CommissionPro BTP — OPUS
    </p>
  </div>
</body>
</html>`.trim();
}
