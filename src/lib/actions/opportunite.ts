'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import {
  stepInfosClientProSchema,
  stepInfosClientParticulierSchema,
  stepDetailsChantierSchema,
} from '@/lib/validations/opportunite'
import type { OpportuniteFormData } from '@/app/(dashboard)/opportunites/nouvelle/page'
import { formatClientLabel } from '@/lib/opportunite.utils'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return (_resend ??= new Resend(process.env.RESEND_API_KEY))
}

export type CreateOpportuniteResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function createOpportunite(
  formData: OpportuniteFormData
): Promise<CreateOpportuniteResult> {
  // 1. Vérification auth
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Non authentifié' }

  // 2. Retrouver l'apporteur via clerkId
  const user = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
  })
  if (!user) {
    return { success: false, error: 'Compte introuvable — veuillez contacter le support' }
  }

  const apporteur = await prisma.apporteur.findUnique({
    where: { utilisateurId: user.id },
  })
  if (!apporteur) {
    return { success: false, error: 'Profil apporteur incomplet — veuillez finaliser votre inscription' }
  }

  // 3. Valider les données du formulaire
  const clientSchema =
    formData.clientType === 'PRO'
      ? stepInfosClientProSchema
      : stepInfosClientParticulierSchema

  const clientResult = clientSchema.safeParse(formData)
  if (!clientResult.success) {
    return { success: false, error: clientResult.error.issues[0]?.message ?? 'Données client invalides' }
  }

  const chantierResult = stepDetailsChantierSchema.safeParse(formData)
  if (!chantierResult.success) {
    return { success: false, error: chantierResult.error.issues[0]?.message ?? 'Données chantier invalides' }
  }

  if (!formData.entrepriseId) {
    return { success: false, error: 'Veuillez sélectionner une entreprise' }
  }

  // 4. Créer le Client en base
  const client = await prisma.client.create({
    data: {
      estProfessionnel: formData.clientType === 'PRO',
      nom:           formData.clientType === 'PARTICULIER' ? formData.clientLastname   || null : null,
      prenom:        formData.clientType === 'PARTICULIER' ? formData.clientFirstname || null : null,
      raisonSociale: formData.clientType === 'PRO'         ? formData.clientRaisonSociale || null : null,
      siret:         formData.clientType === 'PRO'         ? formData.clientSiret || null : null,
      telephone:     formData.clientPhoneNumber,
      email:         formData.clientEmail,
      adresseChantier: formData.adresseChantier || null,
    },
  })

  // 5. Créer l'Opportunite en base
  // MVP mono-entreprise : une seule Entreprise existe, les apporteurs lui soumettent
  // toutes leurs opportunités (pas encore de sélection d'entreprise au formulaire).
  const opportunite = await prisma.opportunite.create({
    data: {
      apporteurId:   apporteur.id,
      entrepriseId:  formData.entrepriseId,
      clientId:      client.id,
      statut:        'SOUMISE',
      typeTravaux:   formData.typesTravaux,
      description:   formData.description   || null,
      delaiSouhaite: formData.delai         || null,
    },
  })

  // 6. Notification email (non bloquante — n'annule pas la soumission si Resend échoue)
  const clerkUser = await currentUser()
  const apporteurNom = clerkUser
    ? `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim()
    : `${apporteur.prenom} ${apporteur.nom}`

  await sendNotificationEntreprise({ opportunite, apporteur: { nom: apporteurNom }, client, formData })

  return { success: true, id: opportunite.id }
}

// ── Email Resend ─────────────────────────────────────────────────────────────

interface NotifPayload {
  opportunite: { id: string }
  apporteur:   { nom: string }
  client:      { telephone: string; email: string; nom?: string | null; prenom?: string | null; raisonSociale?: string | null }
  formData:    OpportuniteFormData
}

async function sendNotificationEntreprise({
  opportunite,
  apporteur,
  client,
  formData,
}: NotifPayload) {
  const resend = getResend()
  if (!resend) {
    console.log('[Resend] Clé absente — email non envoyé pour opportunite', opportunite.id)
    return
  }

  const to = process.env.ENTREPRISE_EMAIL_FALLBACK ?? 'contact@entreprise-btp.fr'
  const clientLabel = formData.clientType === 'PRO'
    ? formData.clientRaisonSociale
    : `${formData.clientFirstname} ${formData.clientLastname}`.trim()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lienOpportunite = `${appUrl}/opportunites/${opportunite.id}`

  const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Nouvelle opportunité reçue — ${formData.typesTravaux}`,
      html: buildEmailHtml({
        clientLabel,
        typeTravaux: formData.typesTravaux,
        delai: formData.delai,
        adresse: formData.adresseChantier,
        apporteurNom: apporteur.nom,
        lienOpportunite,
      }),
    })
  } catch (err) {
    // Erreur Resend non bloquante — l'opportunite est déjà créée en base
    console.error('[Resend] Échec envoi notification:', err)
  }
}

// ── Actions entreprise ───────────────────────────────────────────────────────

export async function accepterOpportunite(
  id: string,
  montant: number
): Promise<{ success: true } | { success: false; error: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Non authentifié' }

  if (!montant || montant <= 0) {
    return { success: false, error: 'Le montant doit être positif.' }
  }

  const user = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    include: { entreprise: { select: { id: true } } },
  })
  if (!user?.entreprise) return { success: false, error: 'Profil entreprise introuvable' }

  const opportunite = await prisma.opportunite.findUnique({
    where: { id },
    include: { client: true },
  })
  if (!opportunite) return { success: false, error: 'Opportunité introuvable' }
  if (opportunite.entrepriseId !== user.entreprise.id) return { success: false, error: 'Non autorisé' }
  if (opportunite.statut !== 'SOUMISE') return { success: false, error: 'Cette opportunité a déjà été traitée' }

  const clientLabel = formatClientLabel(opportunite.client)
  const titre = `${opportunite.typeTravaux} — ${clientLabel}`

  await prisma.$transaction(async (tx) => {
    await tx.opportunite.update({ where: { id }, data: { statut: 'ACCEPTEE' } })

    const position = await tx.kanbanDeal.count({ where: { statut: 'PROSPECT' } })

    await tx.kanbanDeal.create({
      data: {
        titre,
        montant,
        clientNom: clientLabel,
        clientEmail: opportunite.client.email,
        clientTel: opportunite.client.telephone,
        statut: 'PROSPECT',
        position,
        apporteurId: opportunite.apporteurId,
        opportuniteId: opportunite.id,
      },
    })
  })

  return { success: true }
}

export async function refuserOpportunite(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Non authentifié' }

  const user = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    include: { entreprise: { select: { id: true } } },
  })
  if (!user?.entreprise) return { success: false, error: 'Profil entreprise introuvable' }

  const opportunite = await prisma.opportunite.findUnique({ where: { id } })
  if (!opportunite) return { success: false, error: 'Opportunité introuvable' }
  if (opportunite.entrepriseId !== user.entreprise.id) return { success: false, error: 'Non autorisé' }
  if (opportunite.statut !== 'SOUMISE') return { success: false, error: 'Cette opportunité a déjà été traitée' }

  await prisma.opportunite.update({ where: { id }, data: { statut: 'REFUSEE' } })
  return { success: true }
}

function buildEmailHtml(p: {
  clientLabel: string
  typeTravaux: string
  delai: string
  adresse: string
  apporteurNom: string
  lienOpportunite: string
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Nouvelle opportunité</title></head>
<body style="font-family: Arial, sans-serif; color: #1E293B; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 22px; color: #4648D4; margin-bottom: 8px;">Nouvelle opportunité reçue</h1>
  <p style="color: #64748B; margin-bottom: 24px;">Un apporteur vient de soumettre une opportunité via Opus.</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-weight: 600; width: 40%;">Client</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0;">${p.clientLabel}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Type de travaux</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0;">${p.typeTravaux}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Délai souhaité</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0;">${p.delai || 'Non défini'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-weight: 600;">Adresse chantier</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E2E8F0;">${p.adresse || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; font-weight: 600;">Apporteur</td>
      <td style="padding: 10px 0;">${p.apporteurNom}</td>
    </tr>
  </table>

  <a href="${p.lienOpportunite}"
     style="display: inline-block; background: #4648D4; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Voir l'opportunité →
  </a>

  <p style="margin-top: 32px; font-size: 12px; color: #94A3B8;">
    Cet email a été envoyé automatiquement par Opus BTP. Ne pas répondre à cet email.
  </p>
</body>
</html>
`
}
