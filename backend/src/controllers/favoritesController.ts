import { Request, Response } from 'express';
import prisma from '../prisma';

export const addFavorite = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { foodName, quantity, unit, calories, protein, carbs, fat, ...optionalFields } = req.body;

        if (!userId || !foodName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const favorite = await prisma.favoriteFood.create({
            data: {
                userId,
                foodName,
                quantity,
                unit,
                calories,
                protein,
                carbs,
                fat,
                ...optionalFields
            }
        });

        res.json(favorite);
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
};

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const favorites = await prisma.favoriteFood.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};

export const deleteFavorite = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.favoriteFood.delete({
            where: { id }
        });

        res.json({ message: 'Favorite deleted successfully' });
    } catch (error) {
        console.error('Error deleting favorite:', error);
        res.status(500).json({ error: 'Failed to delete favorite' });
    }
};
