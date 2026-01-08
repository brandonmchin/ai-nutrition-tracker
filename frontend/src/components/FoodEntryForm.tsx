import React, { useState, useEffect } from 'react';
import { addFoodEntry, analyzeFoodWithAI, getGoals } from '../services/api';

interface FoodEntryFormProps {
  userId: string;
  date: string;
  onEntryAdded: () => void;
}

const FoodEntryForm: React.FC<FoodEntryFormProps> = ({ userId, date, onEntryAdded }) => {
  const [entry, setEntry] = useState({
    foodName: '',
    quantity: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'breakfast',
    cholesterol: '',
    sodium: '',
    sugar: '',
  });
  const [adding, setAdding] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<string>('');

  const handleAIAnalysis = async () => {
    if (!aiDescription.trim()) {
      alert('Please describe what you ate');
      return;
    }

    setAnalyzing(true);
    setSuggestions([]);
    setConfidence('');

    try {
      // Get user's goals for context
      const goals = await getGoals(userId);
      
      if (!goals) {
        alert('Please set your nutrition goals first');
        return;
      }

      // Analyze food with AI
      const result = await analyzeFoodWithAI(aiDescription, goals);

      // Populate form with AI results
      setEntry({
        foodName: result.foodName,
        quantity: result.quantity.toString(),
        unit: result.unit,
        calories: result.calories.toString(),
        protein: result.protein.toString(),
        carbs: result.carbs.toString(),
        fat: result.fat.toString(),
        mealType: result.mealType,
        cholesterol: result.cholesterol?.toString() || '',
        sodium: result.sodium?.toString() || '',
        sugar: result.sugar?.toString() || '',
      });

      setSuggestions(result.suggestions || []);
      setConfidence(result.confidence);

      // Show optional fields if any micros were detected
      if (result.cholesterol || result.sodium || result.sugar) {
        setShowOptional(true);
      }

    } catch (error: any) {
      console.error('AI analysis failed:', error);
      alert(error.response?.data?.message || 'Failed to analyze food. Please try again or enter manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const entryData: any = {
        date,
        foodName: entry.foodName,
        quantity: parseFloat(entry.quantity),
        unit: entry.unit,
        calories: parseInt(entry.calories),
        protein: parseFloat(entry.protein),
        carbs: parseFloat(entry.carbs),
        fat: parseFloat(entry.fat),
        mealType: entry.mealType,
      };

      // Add optional fields if they have values
      if (entry.cholesterol) entryData.cholesterol = parseFloat(entry.cholesterol);
      if (entry.sodium) entryData.sodium = parseFloat(entry.sodium);
      if (entry.sugar) entryData.sugar = parseFloat(entry.sugar);

      await addFoodEntry(userId, entryData);
      
      // Reset form
      setEntry({
        foodName: '',
        quantity: '',
        unit: 'g',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        mealType: 'breakfast',
        cholesterol: '',
        sodium: '',
        sugar: '',
      });
      setAiDescription('');
      setSuggestions([]);
      setConfidence('');
      setUseAI(false);
      onEntryAdded();
    } catch (error) {
      console.error('Failed to add entry:', error);
      alert('Failed to add food entry');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Food Entry</h3>
        <button
          type="button"
          onClick={() => {
            setUseAI(!useAI);
            setSuggestions([]);
            setConfidence('');
          }}
          className={`px-4 py-2 rounded transition-colors ${
            useAI
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-purple-500 dark:bg-purple-600 text-white hover:bg-purple-600 dark:hover:bg-purple-700'
          }`}
        >
          {useAI ? '✏️ Manual Entry' : '🤖 AI Assistant'}
        </button>
      </div>

      {useAI && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Describe what you ate
          </label>
          <textarea
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[80px]"
            placeholder="e.g., 2 scrambled eggs with cheese, 2 slices of whole wheat toast with butter, and a cup of coffee"
          />
          <button
            type="button"
            onClick={handleAIAnalysis}
            disabled={analyzing}
            className="mt-2 bg-purple-500 dark:bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600 dark:hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
          >
            {analyzing ? '🤔 Analyzing...' : '✨ Analyze with AI'}
          </button>

          {confidence && (
            <div className="mt-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Confidence: </span>
              <span className={`font-semibold ${
                confidence === 'high' ? 'text-green-600 dark:text-green-400' :
                confidence === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-orange-600 dark:text-orange-400'
              }`}>
                {confidence.toUpperCase()}
              </span>
              {confidence !== 'high' && (
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  (Please review and adjust values as needed)
                </span>
              )}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Personalized Suggestions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Food Name</label>
            <input
              type="text"
              value={entry.foodName}
              onChange={(e) => setEntry({ ...entry, foodName: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Meal Type</label>
            <select
              value={entry.mealType}
              onChange={(e) => setEntry({ ...entry, mealType: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity</label>
            <input
              type="number"
              step="0.1"
              value={entry.quantity}
              onChange={(e) => setEntry({ ...entry, quantity: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unit</label>
            <select
              value={entry.unit}
              onChange={(e) => setEntry({ ...entry, unit: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="g">grams</option>
              <option value="oz">ounces</option>
              <option value="cup">cup</option>
              <option value="tbsp">tablespoon</option>
              <option value="serving">serving</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Calories</label>
            <input
              type="number"
              value={entry.calories}
              onChange={(e) => setEntry({ ...entry, calories: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Protein (g)</label>
            <input
              type="number"
              step="0.1"
              value={entry.protein}
              onChange={(e) => setEntry({ ...entry, protein: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Carbs (g)</label>
            <input
              type="number"
              step="0.1"
              value={entry.carbs}
              onChange={(e) => setEntry({ ...entry, carbs: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Fat (g)</label>
            <input
              type="number"
              step="0.1"
              value={entry.fat}
              onChange={(e) => setEntry({ ...entry, fat: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Optional Fields Toggle */}
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
        >
          {showOptional ? '− Hide optional fields' : '+ Add optional fields'}
        </button>

        {/* Optional Fields */}
        {showOptional && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Cholesterol (mg)
              </label>
              <input
                type="number"
                step="0.1"
                value={entry.cholesterol}
                onChange={(e) => setEntry({ ...entry, cholesterol: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Sodium (mg)
              </label>
              <input
                type="number"
                step="0.1"
                value={entry.sodium}
                onChange={(e) => setEntry({ ...entry, sodium: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Sugar (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={entry.sugar}
                onChange={(e) => setEntry({ ...entry, sugar: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={adding}
            className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
          >
            {adding ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodEntryForm;