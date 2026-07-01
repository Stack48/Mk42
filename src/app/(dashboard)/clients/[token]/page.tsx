// PAGE /clients/[token] — Espace client public SANS authentification
//
// Cette page est accessible via un lien sécurisé envoyé par email.
// Elle ne fait partie d'AUCUN middleware d'authentification (voir NOTES.md).
//
// [token] = segment dynamique Next.js : quand l'URL est /clients/abc123,
// Next.js injecte automatiquement { params: { token: "abc123" } } dans les props.
// Équivalent d'un paramètre de route Symfony : /clients/{token}

import { headers } from "next/headers";
import { getEspaceClient } from "@/lib/actions/client.actions";
import { EspaceClientView } from "@/components/clients/EspaceClientView";
import IconLock from "@/components/icons/IconLock";
import IconClock from "@/components/icons/IconClock";
import IconAlertTriangle from "@/components/icons/IconAlertTriangle";
import type { InvitationWithDeal } from "@/types/client.types";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EspaceClientPage({ params }: Props) {
  const { token } = await params;

  const headersList = await headers();
  const ip        = headersList.get("x-forwarded-for")?.split(",")[0] ?? undefined;
  const userAgent = headersList.get("user-agent") ?? undefined;

  const result = await getEspaceClient(token, ip, userAgent);

  // ── Cas d'erreur : token inconnu ─────────────────────────────────────────
  if (!result.success && result.error === "TOKEN_INVALIDE") {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-[12px] p-8 border border-gray-200 text-center max-w-sm">
          <IconLock className="w-10 h-10 text-[#6B7280] mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-[#0F1117] mb-2">Lien invalide</h1>
          <p className="text-sm text-[#6B7280]">
            Ce lien d'accès n'existe pas ou a été révoqué.
            Contactez l'équipe OPUS pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  // ── Cas d'erreur : token expiré ───────────────────────────────────────────
  if (!result.success && result.error === "TOKEN_EXPIRE") {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-[12px] p-8 border border-gray-200 text-center max-w-sm">
          <IconClock className="w-10 h-10 text-[#6B7280] mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-[#0F1117] mb-2">Lien expiré</h1>
          <p className="text-sm text-[#6B7280]">
            Ce lien d'accès a expiré. Contactez l'équipe OPUS pour
            recevoir un nouveau lien d'invitation.
          </p>
        </div>
      </div>
    );
  }

  // ── Cas d'erreur générique ────────────────────────────────────────────────
  if (!result.success) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-4">
        <div className="bg-white rounded-[12px] p-8 border border-gray-200 text-center max-w-sm">
          <IconAlertTriangle className="w-10 h-10 text-[#6B7280] mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-[#0F1117] mb-2">Une erreur est survenue</h1>
          <p className="text-sm text-[#6B7280]">
            Impossible de charger votre espace. Réessayez dans quelques instants.
          </p>
        </div>
      </div>
    );
  }

  // ── Cas nominal : afficher l'espace client ────────────────────────────────
  return (
    <EspaceClientView invitation={result.invitation as unknown as InvitationWithDeal} />
  );
}
