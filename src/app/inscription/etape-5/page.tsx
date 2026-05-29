'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, Suspense } from 'react';
import { Label } from '@/components/ui/label';

type StatutUpload = 'idle' | 'uploading' | 'done' | 'error';

interface FileUploadState {
  statut: StatutUpload;
  nomFichier: string;
}

function EtapeCinqForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profil = searchParams.get('profil') ?? 'entreprise';

  const [kbis, setKbis] = useState<FileUploadState>({ statut: 'idle', nomFichier: '' });
  const [identite, setIdentite] = useState<FileUploadState>({ statut: 'idle', nomFichier: '' });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const refKbis = useRef<HTMLInputElement>(null);
  const refIdentite = useRef<HTMLInputElement>(null);

  async function uploadFichier(
    file: File,
    type: 'KYC_KBIS' | 'KYC_IDENTITE',
    setEtat: (s: FileUploadState) => void,
  ) {
    setEtat({ statut: 'uploading', nomFichier: file.name });

    try {
      // 1. Obtenir l'URL présignée
      const resUrl = await fetch('/api/documents/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomFichier: file.name, contentType: file.type }),
      });
      const { url, key } = await resUrl.json();
      if (!resUrl.ok) throw new Error('Erreur génération URL');

      // 2. Upload direct vers S3
      const resS3 = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!resS3.ok) throw new Error('Erreur upload S3');

      // 3. Enregistrer le document en base
      const resDoc = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, urlS3: key, nomFichier: file.name }),
      });
      if (!resDoc.ok) throw new Error('Erreur enregistrement');

      setEtat({ statut: 'done', nomFichier: file.name });
    } catch {
      setEtat({ statut: 'error', nomFichier: file.name });
    }
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'KYC_KBIS' | 'KYC_IDENTITE',
    setEtat: (s: FileUploadState) => void,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFichier(file, type, setEtat);
  }

  async function handleContinuer() {
    setChargement(true);
    router.push(`/inscription/etape-6?profil=${profil}`);
  }

  function StatutIcon({ statut }: { statut: StatutUpload }) {
    if (statut === 'uploading') return <span className="text-xs text-muted-foreground">Chargement...</span>;
    if (statut === 'done') return <span className="text-xs text-green-600 font-medium">✓ Téléversé</span>;
    if (statut === 'error') return <span className="text-xs text-destructive">Erreur — réessayer</span>;
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Étape 5 / 6</p>
          <h1 className="text-3xl font-bold tracking-tight">Documents KYC</h1>
          <p className="text-muted-foreground">
            Ces documents permettent de vérifier votre identité et votre entreprise conformément à la réglementation.
          </p>
        </div>

        <div className="space-y-6">
          {/* KBIS */}
          <div className="space-y-2">
            <Label>Extrait KBIS *</Label>
            <p className="text-xs text-muted-foreground">Document officiel d'immatriculation de votre société (moins de 3 mois).</p>
            <div
              onClick={() => refKbis.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {kbis.statut === 'idle' ? (
                <p className="text-sm text-muted-foreground">Cliquez pour sélectionner un fichier (PDF, JPG, PNG)</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{kbis.nomFichier}</p>
                  <StatutIcon statut={kbis.statut} />
                </div>
              )}
            </div>
            <input
              ref={refKbis}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => handleFileChange(e, 'KYC_KBIS', setKbis)}
            />
          </div>

          {/* Pièce d'identité */}
          <div className="space-y-2">
            <Label>Pièce d'identité du représentant légal *</Label>
            <p className="text-xs text-muted-foreground">Carte nationale d'identité ou passeport en cours de validité.</p>
            <div
              onClick={() => refIdentite.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {identite.statut === 'idle' ? (
                <p className="text-sm text-muted-foreground">Cliquez pour sélectionner un fichier (PDF, JPG, PNG)</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{identite.nomFichier}</p>
                  <StatutIcon statut={identite.statut} />
                </div>
              )}
            </div>
            <input
              ref={refIdentite}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => handleFileChange(e, 'KYC_IDENTITE', setIdentite)}
            />
          </div>

          {erreur && <p className="text-sm text-destructive">{erreur}</p>}

          <button
            type="button"
            onClick={handleContinuer}
            disabled={chargement || kbis.statut === 'uploading' || identite.statut === 'uploading'}
            className="w-full h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {chargement ? 'Chargement...' : 'Continuer'}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/inscription/etape-6?profil=${profil}`)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Passer cette étape
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Vos documents sont chiffrés et stockés de manière sécurisée. La vérification prend généralement 24-48h.
        </p>
      </div>
    </main>
  );
}

export default function EtapeCinqPage() {
  return (
    <Suspense>
      <EtapeCinqForm />
    </Suspense>
  );
}
