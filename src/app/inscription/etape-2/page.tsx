'use client';

import { useSignIn, useAuth, useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EtapeDeuxForm() {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profil = searchParams.get('profil') ?? 'entreprise';

  // Si déjà connecté, passer directement à l'étape suivante
  useEffect(() => {
    if (isSignedIn) router.push(`/inscription/etape-3?profil=${profil}`);
  }, [isSignedIn, profil, router]);

  const [form, setForm] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!signIn) return;
    setChargement(true);
    setErreur('');

    try {
      // 1. Créer le compte côté serveur (bypasse le CAPTCHA)
      const res = await fetch('/api/inscription/compte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, profil }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? 'Erreur lors de la création du compte.');
        return;
      }

      // 2. Sign-in via ticket (bypass CAPTCHA et second facteur)
      await signIn.create({ strategy: 'ticket', ticket: data.ticket });

      if (signIn.status === 'complete') {
        await setActive({ session: signIn.createdSessionId });
        router.push(`/inscription/etape-3?profil=${profil}`);
      } else {
        setErreur(`Statut inattendu: ${signIn.status ?? 'inconnu'}`);
      }
    } catch (err: unknown) {
      const e = err as { errors?: { longMessage?: string; message?: string }[] };
      setErreur(e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? 'Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Étape 2 / 6</p>
          <h1 className="text-3xl font-bold tracking-tight">Informations personnelles</h1>
          <p className="text-muted-foreground">Renseignez vos coordonnées pour créer votre compte.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" name="prenom" value={form.prenom} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" name="nom" value={form.nom} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motDePasse">Mot de passe *</Label>
            <Input id="motDePasse" name="motDePasse" type="password" value={form.motDePasse} onChange={handleChange} />
          </div>

          {erreur && <p className="text-sm text-destructive">{erreur}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={chargement}
            className="w-full h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {chargement ? 'Création du compte...' : 'Continuer'}
          </button>
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

export default function EtapeDeuxPage() {
  return (
    <Suspense>
      <EtapeDeuxForm />
    </Suspense>
  );
}
