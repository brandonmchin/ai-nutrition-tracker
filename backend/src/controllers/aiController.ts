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

export const analyzeFoodImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log('Analyzing food image...');

    // Import lazily or ensure analyzeImage is exported from service
    const { analyzeImage } = await import('../services/openaiService');

    // image is expected to be a base64 string
    const nutritionData = await analyzeImage(image);

    console.log('Image analysis complete');

    res.json(nutritionData);
  } catch (error: any) {
    console.error('AI image analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze food image',
      message: error.message
    });
  }
};