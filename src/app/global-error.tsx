'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='fr'>
<<<<<<< HEAD
      <body className="flex items-center justify-center min-h-screen font-sans">
        <div className="text-center">
          <h2 className="mb-4">Une erreur inattendue est survenue</h2>
          <button onClick={reset} className="px-4 py-2 cursor-pointer">
=======
      <body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Une erreur inattendue est survenue</h2>
          <button onClick={reset} style={{ padding: '8px 16px', cursor: 'pointer' }}>
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
