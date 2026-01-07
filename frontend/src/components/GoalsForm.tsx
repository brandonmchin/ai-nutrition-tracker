import React, { useState, useEffect } from 'react';
import { getGoals, setGoals } from '../services/api';
import { NutritionGoal } from '../types';

interface GoalsFormProps {
  userId: string;
}

const GoalsForm: React.FC<GoalsFormProps> = ({ userId }) => {
  const [goals, setGoalsState] = useState({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 65,
    cholesterolGoal: undefined as number | undefined,
    sodiumGoal: undefined as number | undefined,
    sugarGoal: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    try {
      const data = await getGoals(userId);
      if (data) {
        setGoalsState({
          calorieGoal: data.calorieGoal,
          proteinGoal: data.proteinGoal,
          carbsGoal: data.carbsGoal,
          fatGoal: data.fatGoal,
          cholesterolGoal: data.cholesterolGoal || undefined,
          sodiumGoal: data.sodiumGoal || undefined,
          sugarGoal: data.sugarGoal || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setGoals(userId, goals);
      alert('Goals saved successfully!');
    } catch (error) {
      console.error('Failed to save goals:', error);
      alert('Failed to save goals');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setGoalsState({ ...goals, [field]: parseFloat(value) || 0 });
  };

  if (loading) return <div className="text-center py-4 text-gray-700 dark:text-gray-300">Loading goals...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Nutrition Goals</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Macros Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Macronutrients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Daily Calories
              </label>
              <input
                type="number"
                value={goals.calorieGoal}
                onChange={(e) => handleChange('calorieGoal', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Protein (g)
              </label>
              <input
                type="number"
                value={goals.proteinGoal}
                onChange={(e) => handleChange('proteinGoal', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Carbs (g)
              </label>
              <input
                type="number"
                value={goals.carbsGoal}
                onChange={(e) => handleChange('carbsGoal', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Fat (g)
              </label>
              <input
                type="number"
                value={goals.fatGoal}
                onChange={(e) => handleChange('fatGoal', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Micros Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Additional Micronutrients (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Cholesterol (mg)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={goals.cholesterolGoal ?? ''}
                  onChange={(e) => handleChange('cholesterolGoal', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional"
                />
                {goals.cholesterolGoal !== undefined && goals.cholesterolGoal !== null && (
                  <button
                    type="button"
                    onClick={() => setGoalsState({ ...goals, cholesterolGoal: undefined })}
                    className="px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Sodium (mg)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={goals.sodiumGoal ?? ''}
                  onChange={(e) => handleChange('sodiumGoal', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional"
                />
                {goals.sodiumGoal !== undefined && goals.sodiumGoal !== null && (
                  <button
                    type="button"
                    onClick={() => setGoalsState({ ...goals, sodiumGoal: undefined })}
                    className="px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Sugar (g)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={goals.sugarGoal ?? ''}
                  onChange={(e) => handleChange('sugarGoal', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional"
                />
                {goals.sugarGoal !== undefined && goals.sugarGoal !== null && (
                  <button
                    type="button"
                    onClick={() => setGoalsState({ ...goals, sugarGoal: undefined })}
                    className="px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Goals'}
        </button>
      </form>
    </div>
  );
};

export default GoalsForm;