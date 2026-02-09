/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { objectsApi, ObjectData } from '@/lib/api';

export default function ObjectDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [object, setObject] = useState<ObjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        loadObject();
    }, [id]);

    const loadObject = async () => {
        try {
            const data = await objectsApi.getOne(id);
            setObject(data);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de charger l\'objet');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Voulez-vous vraiment supprimer cet objet ?')) return;

        try {
            setLoadingDelete(true);
            await objectsApi.delete(id);
            alert('Objet supprimé avec succès');
            router.push('/');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Échec de la suppression');
        }finally{
            setLoadingDelete(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Chargement...</p>
            </div>
        );
    }

    if (!object) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <Button onClick={() => router.push('/')} variant="ghost" className="mb-6">
                    ← Retour
                </Button>

                <Card>
                    <img
                        src={object.imageUrl}
                        alt={object.title}
                        className="w-full h-96 object-cover rounded-t-lg"
                    />
                    <CardContent className="p-6">
                        <h1 className="text-3xl font-bold mb-4">{object.title}</h1>
                        <p className="text-gray-700 text-lg mb-6">{object.description}</p>
                        <p className="text-sm text-gray-500 mb-6">
                            Créé le {new Date(object.createdAt!).toLocaleString('fr-FR')}
                        </p>
                        <Button disabled={loadingDelete} onClick={handleDelete} variant="destructive" size="lg">
                          {loadingDelete ? 'Suppression...' : 'Supprimer cet objet'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}