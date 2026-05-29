'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Building2, CheckCircle, Clock } from 'lucide-react';

function EtapeSixContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profil = searchParams.get('profil') ?? 'entreprise';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex justify-center">
          <div className="inline-flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle className="size-10" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Étape 6 / 6</p>
          <h1 className="text-3xl font-bold tracking-tight">Inscription terminée !</h1>
          <p className="text-muted-foreground">
            Votre compte {profil === 'entreprise' ? 'entreprise' : 'apporteur d\'affaires'} a été créé avec succès.
          </p>
        </div>

        <div className="border rounded-xl p-6 space-y-4 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Compte créé</p>
              <p className="text-xs text-muted-foreground">Vos identifiants sont actifs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Informations enregistrées</p>
              <p className="text-xs text-muted-foreground">Vos données légales et bancaires ont été sauvegardées.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="size-5 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Vérification KYC en cours</p>
              <p className="text-xs text-muted-foreground">Nos équipes vérifient vos documents sous 24-48h. Vous recevrez un email de confirmation.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accéder au tableau de bord
          </button>

          {profil === 'entreprise' && (
            <div className="flex items-center gap-2 rounded-lg border p-4 text-left">
              <Building2 className="size-5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Pendant la vérification, vous pouvez déjà explorer votre tableau de bord et inviter vos apporteurs d'affaires.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function EtapeSixPage() {
  return (
    <Suspense>
      <EtapeSixContent />
    </Suspense>
  );
}
