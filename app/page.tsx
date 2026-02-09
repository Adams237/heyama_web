'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { objectsApi, ObjectData } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import CreateObjectModal from '@/components/CreateObjectModal';
import ObjectCard from '@/components/ObjectCard';

export default function HomePage() {
  const router = useRouter();
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const { on, off } = useSocket();

  const loadObjects = async () => {
    try {
      const data = await objectsApi.getAll();
      setObjects(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjects();

    // Écouter les événements temps réel
    on('objectCreated', (newObject: ObjectData) => {
      setObjects((prev) => [newObject, ...prev]);
    });

    on('objectDeleted', ({ id }: { id: string }) => {
      setObjects((prev) => prev.filter((obj) => obj._id !== id));
    });

    return () => {
      off('objectCreated');
      off('objectDeleted');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Mes Objets</h1>
            <CreateObjectModal onCreated={loadObjects} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : objects.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            Aucun objet pour le moment. Créez-en un !
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objects.map((object) => (
              <ObjectCard
                key={object._id}
                object={object}
                onView={(id) => router.push(`/objects/${id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}