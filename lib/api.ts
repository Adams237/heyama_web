
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://51.75.123.172:5005';


export interface ObjectData {
    _id?: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt?: Date;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const objectsApi = {
    create: async (title: string, description: string, imageBase64: string) => {
        try {
            const response = await api.post('/objects', {
                title,
                description,
                imageBase64,
            });
            return response.data;
        } catch (error) {
            console.log(error)
        }

    },

    getAll: async (): Promise<ObjectData[]> => {
        const response = await api.get('/objects');
        return response.data;
    },

    getOne: async (id: string): Promise<ObjectData> => {
        const response = await api.get(`/objects/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/objects/${id}`);
    },
};