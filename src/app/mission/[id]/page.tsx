export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Lien de mission</h1>
            <p className="text-sm text-gray-500">Votre visite a bien été enregistrée.</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 font-mono">Réf. mission : {id}</p>
      </div>
    </main>
  );
}
