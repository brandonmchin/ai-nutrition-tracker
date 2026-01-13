import React, { useState, useEffect } from 'react';
import { getFoodLogByDate, deleteFoodEntry, getGoals } from '../services/api';
import { FoodLog, FoodEntry, NutritionGoal } from '../types';

interface FoodLogViewProps {
  userId: string;
  date: string;
  refresh: number;
}

const FoodLogView: React.FC<FoodLogViewProps> = ({ userId, date, refresh }) => {
  const [foodLog, setFoodLog] = useState<FoodLog | null>(null);
  const [goals, setGoals] = useState<NutritionGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId, date, refresh]);

  const loadData = async () => {
    try {
      const [logData, goalsData] = await Promise.all([
        getFoodLogByDate(userId, date),
        getGoals(userId)
      ]);
      setFoodLog(logData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteFoodEntry(entryId);
      loadData();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    }
  };

  const calculateTotals = () => {
    if (!foodLog?.entries) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cholesterol: 0,
        sodium: 0,
        sugar: 0
      };
    }
    return foodLog.entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
        cholesterol: acc.cholesterol + (entry.cholesterol || 0),
        sodium: acc.sodium + (entry.sodium || 0),
        sugar: acc.sugar + (entry.sugar || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cholesterol: 0,
        sodium: 0,
        sugar: 0
      }
    );
  };

  const totals = calculateTotals();
  const hasOptionalMicros = goals && (goals.cholesterolGoal || goals.sodiumGoal || goals.sugarGoal);

  if (loading) return <div className="text-center py-4 text-gray-700 dark:text-gray-300">Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Food Log for {date}</h3>

      {/* Progress Summary */}
      {goals && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Daily Progress</h4>

          {/* Main Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Calories</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {totals.calories} / {goals.calorieGoal}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((totals.calories / goals.calorieGoal) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {totals.protein.toFixed(1)}g / {goals.proteinGoal}g
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((totals.protein / goals.proteinGoal) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {totals.carbs.toFixed(1)}g / {goals.carbsGoal}g
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((totals.carbs / goals.carbsGoal) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fat</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {totals.fat.toFixed(1)}g / {goals.fatGoal}g
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((totals.fat / goals.fatGoal) * 100)}%
              </div>
            </div>
          </div>

          {/* Optional Micros */}
          <div className="border-t border-gray-200 dark:border-gray-600 my-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cholesterol</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {goals?.cholesterolGoal
                  ? `${totals.cholesterol.toFixed(1)}mg / ${goals.cholesterolGoal}mg`
                  : `${totals.cholesterol.toFixed(1)}mg`
                }
              </div>
              {goals?.cholesterolGoal && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((totals.cholesterol / goals.cholesterolGoal) * 100)}%
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sodium</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {goals?.sodiumGoal
                  ? `${totals.sodium.toFixed(1)}mg / ${goals.sodiumGoal}mg`
                  : `${totals.sodium.toFixed(1)}mg`
                }
              </div>
              {goals?.sodiumGoal && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((totals.sodium / goals.sodiumGoal) * 100)}%
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sugar</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {goals?.sugarGoal
                  ? `${totals.sugar.toFixed(1)}g / ${goals.sugarGoal}g`
                  : `${totals.sugar.toFixed(1)}g`
                }
              </div>
              {goals?.sugarGoal && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((totals.sugar / goals.sugarGoal) * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Food Entries */}
      {!foodLog?.entries || foodLog.entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No entries for this day yet.</p>
      ) : (
        <div className="space-y-3">
          {foodLog.entries.map((entry) => (
            <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{entry.foodName}</h4>
                    {entry.mealType && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {entry.mealType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.quantity} {entry.unit}
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                    <div className="text-gray-700 dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-400">Cal:</span> {entry.calories}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-400">P:</span> {entry.protein}g
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-400">C:</span> {entry.carbs}g
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <span className="text-gray-600 dark:text-gray-400">F:</span> {entry.fat}g
                    </div>
                  </div>

                  {/* Show optional micros if present */}
                  {(entry.cholesterol || entry.sodium || entry.sugar) && (
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                      {entry.cholesterol && (
                        <div className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-600 dark:text-gray-400">Chol:</span> {entry.cholesterol}mg
                        </div>
                      )}
                      {entry.sodium && (
                        <div className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-600 dark:text-gray-400">Na:</span> {entry.sodium}mg
                        </div>
                      )}
                      {entry.sugar && (
                        <div className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-600 dark:text-gray-400">Sugar:</span> {entry.sugar}g
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodLogView;