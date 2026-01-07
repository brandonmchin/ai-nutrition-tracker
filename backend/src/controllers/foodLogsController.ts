import { Request, Response } from 'express';
import prisma from '../prisma';

export const getFoodLogsByDate = async (req: Request, res: Response) => {
  try {
    const { userId, date } = req.params;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const foodLog = await prisma.foodLog.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        entries: true
      }
    });
    
    res.json(foodLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food log' });
  }
};

export const addFoodEntry = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { date, ...entryData } = req.body;
    
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(12, 0, 0, 0); // Normalize to noon
    
    // Find or create food log for this date
    let foodLog = await prisma.foodLog.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(logDate.setHours(0, 0, 0, 0)),
          lte: new Date(logDate.setHours(23, 59, 59, 999))
        }
      }
    });
    
    if (!foodLog) {
      foodLog = await prisma.foodLog.create({
        data: {
          userId,
          date: logDate
        }
      });
    }
    
    // Add the food entry
    const entry = await prisma.foodEntry.create({
      data: {
        foodLogId: foodLog.id,
        ...entryData
      }
    });
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add food entry' });
  }
};

export const deleteFoodEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    
    await prisma.foodEntry.delete({
      where: { id: entryId }
    });
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};