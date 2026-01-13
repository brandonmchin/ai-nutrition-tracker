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
  sourceAnalysis: {
    item: string;
    sources: {
      url: string;
      reason: string;
      type: 'official' | 'database' | 'search' | 'estimate';
    }[];
    methodology: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      cholesterol?: number;
      sodium?: number;
      sugar?: number;
    };
    confidence: 'high' | 'medium' | 'low';
    status: string;
  }[];
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

const validateUrl = async (url: string): Promise<boolean> => {
  try {
    // Skip validation for search URLs as they are always valid
    if (url.includes('google.com/search')) return true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for speed

    // specific deep links might block HEAD, so we try; if it fails/timeouts we assume it's arguably bad for the user anyway
    // or we could fallback to search
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Nutrition-Tracker/1.0;)'
      }
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const analyzeFood = async (
  foodDescription: string,
  goals: Goals
): Promise<NutritionData> => {
  const prompt = `You are a nutrition expert. Analyze the following food description and return ONLY a JSON object with nutrition information.

Food description: "${foodDescription}"

User's nutrition goals:
- Calories: ${goals.calorieGoal} kcal/day
- Protein: ${goals.proteinGoal}g/day
- Carbs: ${goals.carbsGoal}g/day
- Fat: ${goals.fatGoal}g/day
${goals.cholesterolGoal ? `- Cholesterol: ${goals.cholesterolGoal}mg/day` : ''}
${goals.sodiumGoal ? `- Sodium: ${goals.sodiumGoal}mg/day` : ''}
${goals.sugarGoal ? `- Sugar: ${goals.sugarGoal}g/day` : ''}

Return this exact JSON structure:
{
  "foodName": "brief, clear description of the food. If multiple items, combine them.",
  "mealType": "breakfast" or "lunch" or "dinner" or "snack",
  "suggestions": ["2-3 personalized suggestions"],
  "confidence": "high" or "medium" or "low",
  "sourceAnalysis": [
    {
      "item": "Specific Food Item Name (e.g. 'Raw Spinach')",
      "sources": [
        {
            "url": "full_url_string",
            "reason": "Why this link?",
            "type": "official" or "database" or "search" or "estimate"
        }
      ],
      "methodology": "Explanation of portion size assumption and data source.",
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "cholesterol": number (optional),
        "sodium": number (optional),
        "sugar": number (optional)
      },
      "confidence": "high" or "medium" or "low",
      "status": "Exact" or "Estimate"
    }
  ]
}

Guidelines for Sources:
- PRIORITY 1: Specific Product Pages. Try to provide the direct URL to the official product page or database entry (e.g., https://www.mcdonalds.com/.../big-mac.html).
- PRIORITY 2: Search Fallback. If a direct link isn't certain, use a Google Search query: "https://www.google.com/search?q=site:domain+item+nutrition".
- Diversity: Provide up to 3 different sources per item.

Guidelines for Item Breakdown:
- Break down the description into individual ingredients or distinct components.
- Estimate specific portion sizes for each component.

CRITICAL: Return ONLY the JSON object.`;

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

    // Clean and parse
    let cleaned = content.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // We assert the shape here, but we will strictly type check and calculate totals below
    const rawData = JSON.parse(cleaned) as any;

    if (!rawData.foodName || !Array.isArray(rawData.sourceAnalysis)) {
      throw new Error('Invalid structure from AI');
    }

    // Backend Calculation of Totals for Consistency
    const safeNumber = (val: any) => (typeof val === 'number' && !isNaN(val) ? val : 0);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCholesterol = 0;
    let totalSodium = 0;
    let totalSugar = 0;

    // Validate URLs and Calculate totals
    const sourceAnalysis = await Promise.all(rawData.sourceAnalysis.map(async (item: any) => {
      const nut = item.nutrition || {};
      const cals = safeNumber(nut.calories);
      const prot = safeNumber(nut.protein);
      const carbs = safeNumber(nut.carbs);
      const fat = safeNumber(nut.fat);
      const chol = safeNumber(nut.cholesterol);
      const sod = safeNumber(nut.sodium);
      const sug = safeNumber(nut.sugar);

      totalCalories += cals;
      totalProtein += prot;
      totalCarbs += carbs;
      totalFat += fat;
      totalCholesterol += chol;
      totalSodium += sod;
      totalSugar += sug;

      // Process and Validate Sources
      const sources = Array.isArray(item.sources) ? await Promise.all(item.sources.map(async (source: any) => {
        const url = source.url || '';
        const isValid = await validateUrl(url);

        if (isValid) {
          return source;
        } else {
          // Construct fallback search URL
          // Attempt to extract domain using regex or basic split, otherwise just search for the item
          let query = `${item.item} nutrition`;
          try {
            const urlObj = new URL(url);
            if (urlObj.hostname) {
              query = `site:${urlObj.hostname} ${item.item} nutrition`;
            }
          } catch (e) {
            // Invalid URL string, just use item name
          }

          return {
            ...source,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            reason: `${source.reason} (Search Fallback)`,
            type: 'search'
          };
        }
      })) : [];

      // Ensure the item structure is correct
      return {
        item: item.item || 'Unknown Item',
        sources: sources,
        methodology: item.methodology || 'No methodology',
        nutrition: {
          calories: cals,
          protein: prot,
          carbs: carbs,
          fat: fat,
          cholesterol: chol,
          sodium: sod,
          sugar: sug
        },
        confidence: item.confidence || 'low',
        status: item.status || 'Estimate'
      };
    }));

    const finalData: NutritionData = {
      foodName: rawData.foodName,
      quantity: 1, // Default to 1 serving since we summed it all up
      unit: 'serving',
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      cholesterol: totalCholesterol > 0 ? Math.round(totalCholesterol) : undefined,
      sodium: totalSodium > 0 ? Math.round(totalSodium) : undefined,
      sugar: totalSugar > 0 ? Math.round(totalSugar) : undefined,
      mealType: rawData.mealType || 'snack',
      suggestions: Array.isArray(rawData.suggestions) ? rawData.suggestions : [],
      confidence: rawData.confidence || 'medium',
      sourceAnalysis: sourceAnalysis
    };

    return finalData;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze food with AI');
  }
};