'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EtapeQuatreForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profil = searchParams.get('profil') ?? 'entreprise';

  const [form, setForm] = useState({
    iban: '',
    bic: '',
    nomTitulaireIban: '',
    tauxCommissionDefaut: '',
    montantFixeDefaut: '',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setChargement(true);
    setErreur('');

    try {
      const res = await fetch('/api/inscription/banque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tauxCommissionDefaut: form.tauxCommissionDefaut ? parseFloat(form.tauxCommissionDefaut) : undefined,
          montantFixeDefaut: form.montantFixeDefaut ? parseFloat(form.montantFixeDefaut) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstError = data.error && typeof data.error === 'object'
          ? Object.values(data.error).flat().join(', ')
          : data.error;
        setErreur(firstError ?? 'Erreur serveur');
        return;
      }

      router.push(`/inscription/etape-5?profil=${profil}`);
    } catch {
      setErreur('Une erreur inattendue est survenue.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Étape 4 / 6</p>
          <h1 className="text-3xl font-bold tracking-tight">Coordonnées bancaires</h1>
          <p className="text-muted-foreground">Ces informations servent à émettre les paiements de commissions.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomTitulaireIban">Titulaire du compte *</Label>
            <Input id="nomTitulaireIban" name="nomTitulaireIban" value={form.nomTitulaireIban} onChange={handleChange} placeholder="OPUS BTP SAS" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">IBAN *</Label>
            <Input id="iban" name="iban" value={form.iban} onChange={handleChange} placeholder="FR76 3000 6000 0112 3456 7890 189" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bic">BIC / SWIFT *</Label>
            <Input id="bic" name="bic" value={form.bic} onChange={handleChange} placeholder="BNPAFRPP" />
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Commission par défaut</p>
            <p className="text-xs text-muted-foreground">Appliquée automatiquement aux nouveaux contrats. Modifiable contrat par contrat.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tauxCommissionDefaut">Taux (%)</Label>
              <Input id="tauxCommissionDefaut" name="tauxCommissionDefaut" type="number" min="0" max="100" step="0.1" value={form.tauxCommissionDefaut} onChange={handleChange} placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantFixeDefaut">Montant fixe (€)</Label>
              <Input id="montantFixeDefaut" name="montantFixeDefaut" type="number" min="0" step="0.01" value={form.montantFixeDefaut} onChange={handleChange} placeholder="500" />
            </div>
          </div>

          {erreur && <p className="text-sm text-destructive">{erreur}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={chargement}
            className="w-full h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {chargement ? 'Enregistrement...' : 'Continuer'}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/inscription/etape-5?profil=${profil}`)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Passer cette étape
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">* Champs obligatoires</p>
      </div>
    </main>
  );
}

export default function EtapeQuatrePage() {
  return (
    <Suspense>
      <EtapeQuatreForm />
    </Suspense>
  );
}
