'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='fr'>
      <body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Une erreur inattendue est survenue</h2>
          <button onClick={reset} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
