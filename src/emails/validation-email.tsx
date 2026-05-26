interface ValidationEmailProps {
  url: string;
  prenom?: string;
}

export function validationEmailHtml({ url, prenom }: ValidationEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background-color:#F9FCFF;font-family:Arial,sans-serif;margin:0;padding:40px 0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #D4E6F2;">
    <h2 style="font-size:24px;font-weight:700;color:#131B23;margin:0 0 8px;">Opus</h2>
    <hr style="border-color:#D4E6F2;margin:16px 0 24px;">
    <p style="font-size:16px;color:#2A3A48;line-height:1.6;">
      Bonjour${prenom ? ` ${prenom}` : ''},
    </p>
    <p style="font-size:16px;color:#2A3A48;line-height:1.6;">
      Confirmez votre adresse email pour activer votre compte Opus et commencer à gérer vos apports d'affaires en toute conformité.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}" style="background-color:#2274A5;color:#ffffff;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;">
        Confirmer mon email
      </a>
    </div>
    <p style="font-size:14px;color:#5A6E7C;line-height:1.6;">
      Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte Opus, ignorez cet email.
    </p>
    <hr style="border-color:#D4E6F2;margin:24px 0 16px;">
    <p style="font-size:12px;color:#5A6E7C;">Opus — Gestion des apporteurs d'affaires BTP · Stack 48</p>
  </div>
</body>
</html>`;
}
