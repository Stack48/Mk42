// PAGE PUBLIQUE /contrats/signer/[token]
//
// Cette page est SANS authentification : l'apporteur y accède via un lien
// envoyé par email. Elle utilise le layout racine existant (app/layout.tsx)
// qui inclut la Navbar — comportement normal de Next.js App Router.
//
// SERVER COMPONENT : calcule l'état (token expiré, déjà uploadé) côté serveur
// avant d'envoyer le rendu au client. L'apporteur ne voit jamais de "flash"
// de chargement — les données sont déjà prêtes à l'affichage.
//
// Note sécurité : cette page n'expose pas de données sensibles via le token.
// Le token donne accès uniquement aux infos nécessaires pour signer
// (nom apporteur, deal, pas de données financières confidentielles).

import type { Metadata } from "next";
import { getContratByToken } from "@/lib/actions/contrat.actions";
import { SignerUpload } from "@/components/contrats/SignerUpload";
import type { ContratWithRelations } from "@/types/contrat.types";

export const metadata: Metadata = {
  title: "Signature de contrat — OPUS",
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SignerPage({ params }: Props) {
  const { token } = await params;

  // Récupérer le contrat par token (inclut deal + apporteur)
  const contrat = await getContratByToken(token);

  // Calculer les états CÔTÉ SERVEUR pour éviter tout flash côté client
  const tokenExpired = contrat
    ? new Date() > new Date(contrat.tokenExpiresAt)
    : false;

  // "Déjà uploadé" = l'apporteur ne peut plus rien faire, quel que soit le sous-statut
  const alreadyUploaded = contrat
    ? ["UPLOADED", "VALIDATED", "REJECTED"].includes(contrat.statut)
    : false;

  return (
    // La page utilise le layout racine (Navbar incluse).
    // Si tu veux une page vraiment standalone sans Navbar,
    // il faudrait créer un layout spécifique dans app/contrats/signer/layout.tsx
    // qui n'inclut pas <Navbar />. Hors scope ici.
    <SignerUpload
      contrat={contrat as unknown as ContratWithRelations | null}
      tokenExpired={tokenExpired}
      alreadyUploaded={alreadyUploaded}
    />
  );
}
