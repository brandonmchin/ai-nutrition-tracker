import { Request, Response } from 'express';
import prisma from '../prisma';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const goals = await prisma.nutritionGoal.findUnique({
      where: { userId }
    });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const setGoals = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const goalData = req.body;
    
    const goals = await prisma.nutritionGoal.upsert({
      where: { userId },
      update: goalData,
      create: {
        userId,
        ...goalData
      }
    });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set goals' });
  }
};