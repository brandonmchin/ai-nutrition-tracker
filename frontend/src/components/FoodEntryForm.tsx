import React, { useState } from 'react';
import { addFoodEntry } from '../services/api';

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
  });
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addFoodEntry(userId, {
        date,
        foodName: entry.foodName,
        quantity: parseFloat(entry.quantity),
        unit: entry.unit,
        calories: parseInt(entry.calories),
        protein: parseFloat(entry.protein),
        carbs: parseFloat(entry.carbs),
        fat: parseFloat(entry.fat),
        mealType: entry.mealType,
      });
      setEntry({
        foodName: '',
        quantity: '',
        unit: 'g',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        mealType: 'breakfast',
      });
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
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add Food Entry</h3>
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
        <button
          type="submit"
          disabled={adding}
          className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
        >
          {adding ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default FoodEntryForm;