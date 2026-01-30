import React, { useState, useEffect } from 'react';
import { getFavorites, deleteFavorite, addFoodEntry } from '../services/api';

interface FavoritesViewProps {
    userId: string;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ userId }) => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, [userId]);

    const loadFavorites = async () => {
        try {
            const data = await getFavorites(userId);
            setFavorites(data);
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogToToday = async (favorite: any) => {
        try {
            const { id, userId: uid, createdAt, updatedAt, ...entryData } = favorite;

            const now = new Date();
            // Adjust timezone for local date string
            const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
            const todayStr = localDate.toISOString().split('T')[0];

            await addFoodEntry(userId, {
                ...entryData,
                date: todayStr
            });

            alert('Logged to today!');
        } catch (error) {
            console.error('Failed to log favorite:', error);
            alert('Failed to log favorite');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove from favorites?')) return;
        try {
            await deleteFavorite(id);
            loadFavorites();
        } catch (error) {
            console.error('Failed to delete favorite:', error);
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-700 dark:text-gray-300">Loading favorites...</div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Favorites</h3>

            {favorites.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No favorites added yet.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="border border-gray-200 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-900">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={fav.foodName}>
                                    {fav.foodName}
                                </h4>
                                <button
                                    onClick={() => handleDelete(fav.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 text-sm"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {fav.quantity} {fav.unit} • {fav.calories} kcal
                                <div className="flex gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                                    <span>P: {fav.protein}g</span>
                                    <span>C: {fav.carbs}g</span>
                                    <span>F: {fav.fat}g</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleLogToToday(fav)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                            >
                                Log to Today
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesView;
