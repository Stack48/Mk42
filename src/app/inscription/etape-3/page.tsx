'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EtapeTroisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profil = searchParams.get('profil') ?? 'entreprise';

  const [form, setForm] = useState({
    raisonSociale: '',
    siret: '',
    adresseSiege: '',
    codeApe: '',
    representantLegal: '',
    telephone: '',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setChargement(true);
    setErreur('');

    try {
      const res = await fetch('/api/inscription/entreprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error?.fieldErrors ? Object.values(data.error.fieldErrors).flat().join(', ') : data.error ?? 'Erreur serveur');
        setChargement(false);
        return;
      }

      router.push(`/inscription/etape-4?profil=${profil}`);
    } catch {
      setErreur('Une erreur inattendue est survenue. Veuillez réessayer.');
      setChargement(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Étape 3 / 6</p>
          <h1 className="text-3xl font-bold tracking-tight">Votre entreprise</h1>
          <p className="text-muted-foreground">Renseignez les informations légales de votre société.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raisonSociale">Raison sociale *</Label>
            <Input id="raisonSociale" name="raisonSociale" value={form.raisonSociale} onChange={handleChange} placeholder="OPUS BTP SAS" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET *</Label>
              <Input id="siret" name="siret" value={form.siret} onChange={handleChange} placeholder="12345678901234" maxLength={14} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeApe">Code APE</Label>
              <Input id="codeApe" name="codeApe" value={form.codeApe} onChange={handleChange} placeholder="4120A" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresseSiege">Adresse du siège *</Label>
            <Input id="adresseSiege" name="adresseSiege" value={form.adresseSiege} onChange={handleChange} placeholder="12 rue des Bâtisseurs, 75001 Paris" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="representantLegal">Représentant légal *</Label>
              <Input id="representantLegal" name="representantLegal" value={form.representantLegal} onChange={handleChange} placeholder="Jean Dupont" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input id="telephone" name="telephone" type="tel" value={form.telephone} onChange={handleChange} placeholder="01 23 45 67 89" />
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
        </div>

        <p className="text-center text-xs text-muted-foreground">* Champs obligatoires</p>
      </div>
    </main>
  );
}

export default function EtapeTroisEntreprisePage() {
  return (
    <Suspense>
      <EtapeTroisForm />
    </Suspense>
  );
}
