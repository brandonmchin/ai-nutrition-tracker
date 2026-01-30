import React, { useState, useEffect, useRef } from 'react';
import { addFoodEntry, analyzeFoodWithAI, analyzeImageWithAI, getGoals, addFavorite } from '../services/api';

interface FoodEntryFormProps {
  userId: string;
  date: string;
  onEntryAdded: () => void;
  initialValues?: {
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
    mealType?: string;
  } | null;
}

interface SourceAnalysis {
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
  };
  confidence: 'high' | 'medium' | 'low';
  status: string;
}

const FoodEntryForm: React.FC<FoodEntryFormProps> = ({ userId, date, onEntryAdded, initialValues }) => {
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
  const [sourceAnalysis, setSourceAnalysis] = useState<SourceAnalysis[]>([]);
  const [showSources, setShowSources] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Store base values from AI for scaling
  const [baseValues, setBaseValues] = useState<{
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    cholesterol?: number;
    sodium?: number;
    sugar?: number;
  } | null>(null);

  // Populate form with initialValues when provided
  useEffect(() => {
    if (initialValues) {
      setEntry({
        foodName: initialValues.foodName,
        quantity: initialValues.quantity.toString(),
        unit: initialValues.unit,
        calories: initialValues.calories.toString(),
        protein: initialValues.protein.toString(),
        carbs: initialValues.carbs.toString(),
        fat: initialValues.fat.toString(),
        mealType: initialValues.mealType || 'breakfast',
        cholesterol: initialValues.cholesterol?.toString() || '',
        sodium: initialValues.sodium?.toString() || '',
        sugar: initialValues.sugar?.toString() || '',
      });

      // Show optional fields if present
      if (initialValues.cholesterol || initialValues.sodium || initialValues.sugar) {
        setShowOptional(true);
      }

      // Set base values for scaling if needed (optional implementation choice)
      setBaseValues({
        quantity: initialValues.quantity,
        calories: initialValues.calories,
        protein: initialValues.protein,
        carbs: initialValues.carbs,
        fat: initialValues.fat,
        cholesterol: initialValues.cholesterol,
        sodium: initialValues.sodium,
        sugar: initialValues.sugar,
      });

      // Switch to manual mode if AI was open
      setUseAI(false);
    }
  }, [initialValues]);

  // Auto-scale nutrition values when quantity changes
  useEffect(() => {
    if (!baseValues || !entry.quantity) return;

    const newQuantity = parseFloat(entry.quantity);
    if (isNaN(newQuantity) || newQuantity <= 0) return;

    const scaleFactor = newQuantity / baseValues.quantity;

    setEntry(prev => ({
      ...prev,
      calories: Math.round(baseValues.calories * scaleFactor).toString(),
      protein: (baseValues.protein * scaleFactor).toFixed(1),
      carbs: (baseValues.carbs * scaleFactor).toFixed(1),
      fat: (baseValues.fat * scaleFactor).toFixed(1),
      cholesterol: baseValues.cholesterol
        ? (baseValues.cholesterol * scaleFactor).toFixed(1)
        : '',
      sodium: baseValues.sodium
        ? (baseValues.sodium * scaleFactor).toFixed(1)
        : '',
      sugar: baseValues.sugar
        ? (baseValues.sugar * scaleFactor).toFixed(1)
        : '',
    }));
  }, [entry.quantity, baseValues]);

  const handleAIAnalysis = async () => {
    if (!aiDescription.trim()) {
      alert('Please describe what you ate');
      return;
    }

    setAnalyzing(true);
    setSuggestions([]);
    setConfidence('');
    setSourceAnalysis([]);

    try {
      // Get user's goals for context
      const goals = await getGoals(userId);

      if (!goals) {
        alert('Please set your nutrition goals first');
        return;
      }

      // Analyze food with AI
      const result = await analyzeFoodWithAI(aiDescription, goals);

      // Store base values for scaling
      setBaseValues({
        quantity: result.quantity,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        cholesterol: result.cholesterol || undefined,
        sodium: result.sodium || undefined,
        sugar: result.sugar || undefined,
      });

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
      setSourceAnalysis(result.sourceAnalysis || []);

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
      setSourceAnalysis([]);
      setBaseValues(null);
      setUseAI(false);
      onEntryAdded();
    } catch (error) {
      console.error('Failed to add entry:', error);
      alert('Failed to add food entry');
    } finally {
      setAdding(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!entry.foodName || !entry.quantity || !entry.calories || !entry.protein || !entry.carbs || !entry.fat) {
      alert('Please fill in all required fields before adding to favorites.');
      return;
    }

    try {
      const favoriteData: any = {
        foodName: entry.foodName,
        quantity: parseFloat(entry.quantity),
        unit: entry.unit,
        calories: parseInt(entry.calories),
        protein: parseFloat(entry.protein),
        carbs: parseFloat(entry.carbs),
        fat: parseFloat(entry.fat),
      };

      // Add optional fields if they have values
      if (entry.cholesterol) favoriteData.cholesterol = parseFloat(entry.cholesterol);
      if (entry.sodium) favoriteData.sodium = parseFloat(entry.sodium);
      if (entry.sugar) favoriteData.sugar = parseFloat(entry.sugar);

      await addFavorite(userId, favoriteData);
      alert('Added to favorites!');
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      alert('Failed to add to favorites. It might already exist.');
    }
  };

  // Handle manual quantity change
  const handleQuantityChange = (value: string) => {
    setEntry({ ...entry, quantity: value });
    // The useEffect above will handle the scaling
  };

  // Clear base values when switching modes or manually editing nutrition fields
  const handleManualNutritionEdit = (field: string, value: string) => {
    setEntry({ ...entry, [field]: value });
    setBaseValues(null); // Disable auto-scaling when user manually edits
  };

  const toggleAutoScaling = () => {
    if (baseValues) {
      setBaseValues(null);
    } else {
      // Enable based on current values
      const currentQty = parseFloat(entry.quantity);
      if (isNaN(currentQty) || currentQty <= 0) {
        alert('Please enter a valid quantity to enable auto-scaling.');
        return;
      }

      setBaseValues({
        quantity: currentQty,
        calories: parseFloat(entry.calories) || 0,
        protein: parseFloat(entry.protein) || 0,
        carbs: parseFloat(entry.carbs) || 0,
        fat: parseFloat(entry.fat) || 0,
        cholesterol: parseFloat(entry.cholesterol) || undefined,
        sodium: parseFloat(entry.sodium) || undefined,
        sugar: parseFloat(entry.sugar) || undefined,
      });
    }
  };

  useEffect(() => {
    if (initialValues) {
      // Scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [initialValues]);

  return (
    <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Food Entry</h3>
        <button
          type="button"
          onClick={() => {
            setUseAI(!useAI);
            setSuggestions([]);
            setConfidence('');
            setSourceAnalysis([]);
            setBaseValues(null);
          }}
          className={`px-4 py-2 rounded transition-colors ${useAI
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-purple-500 dark:bg-purple-600 text-white hover:bg-purple-600 dark:hover:bg-purple-700'
            }`}
        >
          {useAI ? '✏️ Switch to Manual' : '🤖 Use AI Assistant'}
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

          <div className="mt-4 border-t border-purple-200 dark:border-purple-800 pt-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Or scan a nutrition label / food item
            </label>
            <div className="flex gap-2">
              <label className="cursor-pointer bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2">
                <span>📷</span> Scan Item
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      alert('Please upload an image file');
                      return;
                    }

                    // Validate file size (max 5MB to be safe for base64)
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image is too large. Please use an image under 5MB.');
                      return;
                    }

                    setAnalyzing(true);
                    setSuggestions([]);
                    setConfidence('');
                    setSourceAnalysis([]);

                    try {
                      // Convert to base64
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = async () => {
                        const base64 = reader.result as string;
                        try {
                          const result = await analyzeImageWithAI(base64);

                          // Store base values for scaling
                          setBaseValues({
                            quantity: result.quantity,
                            calories: result.calories,
                            protein: result.protein,
                            carbs: result.carbs,
                            fat: result.fat,
                            cholesterol: result.cholesterol || undefined,
                            sodium: result.sodium || undefined,
                            sugar: result.sugar || undefined,
                          });

                          // Populate form
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
                          setSourceAnalysis(result.sourceAnalysis || []);

                          // Show optional fields if parsed
                          if (result.cholesterol || result.sodium || result.sugar) {
                            setShowOptional(true);
                          }

                          // Set description to "Scanned Image" so user knows
                          setAiDescription('Scanned Image');

                        } catch (err: any) {
                          console.error('Image analysis failed:', err);
                          alert(err.response?.data?.message || 'Failed to analyze image.');
                        } finally {
                          setAnalyzing(false);
                          // Clear input
                          e.target.value = '';
                        }
                      };
                      reader.onerror = () => {
                        alert('Failed to read image file');
                        setAnalyzing(false);
                      };
                    } catch (error) {
                      console.error('Error handling file:', error);
                      setAnalyzing(false);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {confidence && (
            <div className="mt-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Confidence: </span>
              <span className={`font-semibold ${confidence === 'high' ? 'text-green-600 dark:text-green-400' :
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

          {sourceAnalysis.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowSources(true)}
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>ℹ️</span> View Analysis
              </button>
            </div>
          )}

          {showSources && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSources(false)}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Nutrition Analysis Sources</h4>

                <div className="space-y-6">
                  {sourceAnalysis.map((analysis, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white">{analysis.item}</h5>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${analysis.confidence === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          analysis.confidence === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                          }`}>
                          {analysis.status || analysis.confidence.toUpperCase()}
                        </div>
                      </div>

                      {analysis.nutrition && (
                        <div className="grid grid-cols-4 gap-2 mb-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-center">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Cals</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.calories}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Prot</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.protein}g</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.carbs}g</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Fat</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.fat}g</div>
                          </div>
                        </div>
                      )}

                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Methodology
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {analysis.methodology}
                        </p>
                      </div>

                      {analysis.sources.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Sources
                          </p>
                          <ul className="space-y-2">
                            {analysis.sources.map((source, idx) => (
                              <li key={idx} className="text-sm bg-gray-50 dark:bg-gray-900/30 p-2 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${source.type === 'official' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                    source.type === 'database' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {source.type}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {source.reason}
                                  </span>
                                </div>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline break-all block"
                                >
                                  {source.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowSources(false)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-scaling Control */}
      <div className={`mb-4 p-3 rounded border flex justify-between items-center ${baseValues
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
        }`}>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {baseValues
            ? <span>✨ <strong>Auto-scaling is enabled:</strong> Nutrition values will update automatically as you change quantity.</span>
            : <span>⚡ <strong>Auto-scaling is disabled:</strong> Toggle to automatically scale nutrition values with quantity.</span>
          }
        </p>
        <button
          type="button"
          onClick={toggleAutoScaling}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${baseValues
            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
            }`}
        >
          {baseValues ? 'Disable' : 'Enable'}
        </button>
      </div>

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
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Quantity {baseValues && <span className="text-green-600 dark:text-green-400">⚡</span>}
            </label>
            <input
              type="number"
              step="0.1"
              value={entry.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
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
              onChange={(e) => handleManualNutritionEdit('calories', e.target.value)}
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
              onChange={(e) => handleManualNutritionEdit('protein', e.target.value)}
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
              onChange={(e) => handleManualNutritionEdit('carbs', e.target.value)}
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
              onChange={(e) => handleManualNutritionEdit('fat', e.target.value)}
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
                onChange={(e) => handleManualNutritionEdit('cholesterol', e.target.value)}
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
                onChange={(e) => handleManualNutritionEdit('sodium', e.target.value)}
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
                onChange={(e) => handleManualNutritionEdit('sugar', e.target.value)}
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
          <button
            type="button"
            onClick={handleAddToFavorites}
            className="ml-3 border border-pink-500 text-pink-500 dark:text-pink-400 dark:border-pink-400 px-6 py-2 rounded hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
          >
            Add to Favorites
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodEntryForm;