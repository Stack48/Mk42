'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='fr'>
      <body className="flex items-center justify-center min-h-screen font-sans">
        <div className="text-center">
          <h2 className="mb-4">Une erreur inattendue est survenue</h2>
          <button onClick={reset} className="px-4 py-2 cursor-pointer">
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
