import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NutritionData {
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cholesterol?: number;
  sodium?: number;
  sugar?: number;
  mealType: string;
  suggestions: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface Goals {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  cholesterolGoal?: number;
  sodiumGoal?: number;
  sugarGoal?: number;
}

export const analyzeFood = async (
  foodDescription: string,
  goals: Goals
): Promise<NutritionData> => {
  const prompt = `You are a nutrition expert. Analyze the following food description and return ONLY a JSON object with nutrition information. Do not include any other text, explanations, or markdown formatting.

Food description: "${foodDescription}"

User's nutrition goals (use these to provide personalized suggestions):
- Calories: ${goals.calorieGoal} kcal/day
- Protein: ${goals.proteinGoal}g/day
- Carbs: ${goals.carbsGoal}g/day
- Fat: ${goals.fatGoal}g/day
${goals.cholesterolGoal ? `- Cholesterol: ${goals.cholesterolGoal}mg/day` : ''}
${goals.sodiumGoal ? `- Sodium: ${goals.sodiumGoal}mg/day` : ''}
${goals.sugarGoal ? `- Sugar: ${goals.sugarGoal}g/day` : ''}

Return this exact JSON structure with estimated nutrition values:
{
  "foodName": "brief, clear description of the food",
  "quantity": estimated_quantity_as_number,
  "unit": "g" or "oz" or "cup" or "serving" etc,
  "calories": estimated_calories_as_number,
  "protein": estimated_protein_in_grams,
  "carbs": estimated_carbs_in_grams,
  "fat": estimated_fat_in_grams,
  "cholesterol": estimated_cholesterol_in_mg_or_null,
  "sodium": estimated_sodium_in_mg_or_null,
  "sugar": estimated_sugar_in_grams_or_null,
  "mealType": "breakfast" or "lunch" or "dinner" or "snack",
  "suggestions": ["2-3 personalized suggestions based on user's goals for improving this meal"],
  "confidence": "high" or "medium" or "low" (based on how specific the description was)
}

Guidelines for suggestions:
- If the meal is already well-aligned with goals, provide positive reinforcement
- If it's high in certain nutrients relative to goals, suggest healthier alternatives
- Be specific and actionable (e.g., "Replace sour cream with Greek yogurt to reduce fat by 15g")
- Keep suggestions friendly and encouraging

CRITICAL: Return ONLY the JSON object. No markdown, no code blocks, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert that provides accurate nutritional information in JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent outputs
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean the response (remove markdown code blocks if present)
    let cleaned = content.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Parse JSON
    const data = JSON.parse(cleaned) as NutritionData;

    // Validate required fields
    if (
      !data.foodName ||
      typeof data.calories !== 'number' ||
      typeof data.protein !== 'number' ||
      typeof data.carbs !== 'number' ||
      typeof data.fat !== 'number'
    ) {
      throw new Error('Invalid nutrition data structure from AI');
    }

    return data;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze food with AI');
  }
};