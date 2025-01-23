import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import type { User } from '@/lib/types';
import MenuBar from '@/components/Menubar';
import ClientWrapper from '@/components/UserContent/ClientWrapper';

async function UserPageContent({ username }: { username: string }) {
  const [session, user] = await Promise.all([
    getServerSession(),
    (async () => {
      const client = await clientPromise;
      const db = client.db('bentoit');
      return db.collection<User>('users').findOne(
        { username },
        { projection: { password: 0 } }
      );
    })()
  ]);

  if (!user) {
    notFound();
  }

  const isOwner = session?.user?.email === user.email;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          {isOwner && (
            <p className="text-sm opacity-70 mt-2">
              Edit mode available - customize your blocks
            </p>
          )}
        </div>
      </header>

      <ClientWrapper 
        blocks={user.blocks || []}
        isEditable={isOwner}
      />
    </div>
  );
}

export default async function UserPage({ params }: PageProps) {
  const username = await params.username;
  if (!username) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <UserPageContent username={username} />
      </Suspense>
    </main>
  );
}
