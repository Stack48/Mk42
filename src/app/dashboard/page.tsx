import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/connexion');

  const user = await currentUser();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <p className="text-gray-600">Bienvenue, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}</p>
      <SignOutButton redirectUrl="/connexion">
        <button className="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
      </SignOutButton>
    </main>
  );
}
