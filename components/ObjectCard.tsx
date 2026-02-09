/* eslint-disable @next/next/no-img-element */
'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ObjectData } from '@/lib/api';

interface ObjectCardProps {
  object: ObjectData;
  onView: (id: string) => void;
}

export default function ObjectCard({ object, onView }: ObjectCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={object.imageUrl}
        alt={object.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="pt-4">
        <h3 className="text-xl font-bold mb-2">{object.title}</h3>
        <p className="text-gray-600 line-clamp-2">{object.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {new Date(object.createdAt!).toLocaleDateString('fr-FR')}
        </span>
        <Button onClick={() => onView(object._id!)} variant="outline">
          Voir détails
        </Button>
      </CardFooter>
    </Card>
  );
}