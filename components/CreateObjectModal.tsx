'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { objectsApi } from '@/lib/api';
import { convertFileToBase64 } from '@/lib/imageHelper';

export default function CreateObjectModal({ onCreated }: { onCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !imageFile) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const imageBase64 = await convertFileToBase64(imageFile, {
                maxWidth: 800,
                quality: 0.1,
                maxSizeKB: 100
            });
            await objectsApi.create(title, description, imageBase64);

            // Réinitialiser le formulaire
            setTitle('');
            setDescription('');
            setImageFile(null);
            setImagePreview(null);
            setOpen(false);

            if (onCreated) onCreated();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Échec de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg">+ Créer un Objet</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer un nouvel objet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Titre</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titre de l'objet"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description de l'objet"
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Image</label>
                        <div
                            {...getRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition"
                        >
                            <input {...getInputProps()} />
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-40 mx-auto rounded"
                                />
                            ) : (
                                <p className="text-gray-500">
                                    Glissez une image ici ou cliquez pour sélectionner
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Création...' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}