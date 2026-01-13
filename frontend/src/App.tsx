import React, { useState, useEffect, useRef } from 'react';
import { getUsersByAccount, createUser, deleteUser } from './services/api';
import { Account, User } from './types';
import GoalsForm from './components/GoalsForm';
import FoodEntryForm from './components/FoodEntryForm';
import FoodLogView from './components/FoodLogView';
import Login from './components/Login';
import { useTheme } from './context/ThemeContext';
import { useOnClickOutside } from './hooks/useOnClickOutside';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [account, setAccount] = useState<Account | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showGoals, setShowGoals] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(userMenuRef, () => setShowUserMenu(false));

  useEffect(() => {
    // Check if user is logged in (stored in localStorage)
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      const parsedAccount = JSON.parse(storedAccount);
      setAccount(parsedAccount);
    }
  }, []);

  useEffect(() => {
    if (account) {
      loadUsers();
    }
  }, [account]);

  const handleLogin = (loggedInAccount: Account) => {
    setAccount(loggedInAccount);
    localStorage.setItem('account', JSON.stringify(loggedInAccount));
  };

  const handleLogout = () => {
    setAccount(null);
    setUsers([]);
    setSelectedUserId('');
    localStorage.removeItem('account');
  };

  const loadUsers = async () => {
    if (!account) return;
    try {
      const data = await getUsersByAccount(account.id);
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!account) return;
    const name = prompt('Enter user name:');
    if (!name) return;
    try {
      await createUser(name, account.id);
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will delete all their data including goals and food logs.`)) {
      return;
    }

    try {
      await deleteUser(userId);

      // If we deleted the selected user, clear the selection
      if (selectedUserId === userId) {
        setSelectedUserId('');
      }

      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    // Adjust for timezone when creating date object from string "YYYY-MM-DD" which defaults to UTC
    const dateParts = selectedDate.split('-').map(Number);
    // Create date using local time constructor (year, monthIndex, day)
    // Note: month is 0-indexed
    const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    d.setDate(d.getDate() + days);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Show login if not authenticated
  if (!account) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-4">
        <header className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4 gap-4 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center md:text-left">
                Nutrition Tracker
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center md:text-left">
                Logged in as: {account.username}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-auto relative">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  User
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-l px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto flex-grow"
                    disabled={users.length === 0}
                  >
                    {users.length === 0 ? (
                      <option value="">No users</option>
                    ) : (
                      users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))
                    )}
                  </select>

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-r hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border border-l-0 border-gray-300 dark:border-gray-600"
                      title="Manage Users"
                    >
                      ⚙️
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleCreateUser();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          ➕ New User
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            const user = users.find(u => u.id === selectedUserId);
                            if (user) handleDeleteUser(user.id, user.name);
                          }}
                          disabled={!selectedUserId}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🗑️ Delete User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedUserId && (
              <button
                onClick={() => setShowGoals(!showGoals)}
                className="bg-purple-500 dark:bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-600 dark:hover:bg-purple-700 mt-2 sm:mt-6 transition-colors w-full sm:w-auto"
              >
                {showGoals ? 'Hide Goals' : 'Show Goals'}
              </button>
            )}
          </div>
        </header>

        {selectedUserId && showGoals && <GoalsForm userId={selectedUserId} />}

        {
          selectedUserId && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between sm:justify-between gap-2 sm:gap-6">
                  {/* Mobile Button: Square Arrow */}
                  <button
                    onClick={() => changeDate(-1)}
                    className="sm:hidden bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                    aria-label="Previous Day"
                  >
                    <span className="text-xl font-bold">←</span>
                  </button>
                  {/* Desktop Button: Text */}
                  <button
                    onClick={() => changeDate(-1)}
                    className="hidden sm:block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    ← Previous Day
                  </button>

                  <div className="flex items-end gap-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1 text-center text-gray-700 dark:text-gray-300">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base w-[130px] sm:w-auto"
                      />
                    </div>
                    <button
                      onClick={() => setSelectedDate(getTodayString())}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium h-[38px] sm:h-[42px]"
                      title="Jump to Today"
                    >
                      Today
                    </button>
                  </div>

                  {/* Mobile Button: Square Arrow */}
                  <button
                    onClick={() => changeDate(1)}
                    className="sm:hidden bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                    aria-label="Next Day"
                  >
                    <span className="text-xl font-bold">→</span>
                  </button>
                  {/* Desktop Button: Text */}
                  <button
                    onClick={() => changeDate(1)}
                    className="hidden sm:block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
          )
        }

        {
          !selectedUserId && users.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Welcome to Nutrition Tracker!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first user profile.
              </p>
              <button
                onClick={handleCreateUser}
                className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                Create Your First User
              </button>
            </div>
          )
        }
      </div >
    </div >
  );
}

export default App;