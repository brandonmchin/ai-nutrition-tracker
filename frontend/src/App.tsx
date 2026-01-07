import React, { useState, useEffect } from 'react';
import { getUsers, createUser } from './services/api';
import { User } from './types';
import GoalsForm from './components/GoalsForm';
import FoodEntryForm from './components/FoodEntryForm';
import FoodLogView from './components/FoodLogView';
import { useTheme } from './context/ThemeContext';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showGoals, setShowGoals] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateUser = async () => {
    const name = prompt('Enter user name:');
    if (!name) return;
    try {
      await createUser(name);
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-4">
        <header className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Nutrition Tracker
            </h1>
            <button
              onClick={toggleTheme}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateUser}
              className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 mt-6 transition-colors"
            >
              New User
            </button>
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="bg-purple-500 dark:bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600 dark:hover:bg-purple-700 mt-6 transition-colors"
            >
              {showGoals ? 'Hide Goals' : 'Show Goals'}
            </button>
          </div>
        </header>

        {selectedUserId && showGoals && <GoalsForm userId={selectedUserId} />}

        {selectedUserId && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => changeDate(-1)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Previous Day
                </button>
                <div>
                  <label className="block text-sm font-medium mb-1 text-center text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => changeDate(1)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Next Day →
                </button>
              </div>
            </div>

            <FoodEntryForm
              userId={selectedUserId}
              date={selectedDate}
              onEntryAdded={handleEntryAdded}
            />

            <FoodLogView
              userId={selectedUserId}
              date={selectedDate}
              refresh={refreshTrigger}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;