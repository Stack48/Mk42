'use client';

import { useRouter } from 'next/navigation';
import { Building2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const profils = [
  {
    id: 'entreprise',
    titre: 'Entreprise BTP',
    description: 'Vous êtes une entreprise du bâtiment. Gérez vos apporteurs, signez des contrats et automatisez vos commissions.',
    icon: Building2,
  },
  {
    id: 'apporteur',
    titre: 'Apporteur d\'affaires',
    description: 'Vous apportez des chantiers à des entreprises BTP. Suivez vos opportunités et recevez vos commissions.',
    icon: UserCheck,
  },
];

export default function EtapeUnPage() {
  const router = useRouter();

  function choisirProfil(id: string) {
    router.push(`/inscription/etape-2?profil=${id}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Étape 1 / 6</p>
          <h1 className="text-3xl font-bold tracking-tight">Quel est votre profil ?</h1>
          <p className="text-muted-foreground">Choisissez le type de compte que vous souhaitez créer.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profils.map((profil) => {
            const Icon = profil.icon;
            return (
              <button
                key={profil.id}
                onClick={() => choisirProfil(profil.id)}
                className="text-left group"
              >
                <Card className="h-full border-2 transition-all duration-200 group-hover:border-primary group-hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="text-xl">{profil.titre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{profil.description}</CardDescription>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <a href="/connexion" className="font-medium text-primary underline-offset-4 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
