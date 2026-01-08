import { Request, Response } from 'express';
import { analyzeFood } from '../services/openaiService';

export const analyzeFoodDescription = async (req: Request, res: Response) => {
  try {
    const { foodDescription, goals } = req.body;

    if (!foodDescription) {
      return res.status(400).json({ error: 'Food description is required' });
    }

    if (!goals) {
      return res.status(400).json({ error: 'User goals are required' });
    }

    console.log('Analyzing food:', foodDescription);

    const nutritionData = await analyzeFood(foodDescription, goals);

    console.log('Analysis complete:', nutritionData);

    res.json(nutritionData);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze food',
      message: error.message 
    });
  }
};