import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { getUsersByAccount, createUser, deleteUser } from './services/api';
import { Account, User } from './types';
import GoalsForm from './components/GoalsForm';
import FoodEntryForm from './components/FoodEntryForm';
import FoodLogView from './components/FoodLogView';
import FavoritesView from './components/FavoritesView';
import Login from './components/Login';
import Layout from './components/Layout';
import { useOnClickOutside } from './hooks/useOnClickOutside';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Main Content Component (must be inside Router)
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showGoals, setShowGoals] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [entryToLog, setEntryToLog] = useState<any>(null);

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

  const loadUsers = useCallback(async () => {
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
  }, [account, selectedUserId]);

  useEffect(() => {
    if (account) {
      loadUsers();
    }
  }, [account, loadUsers]);

  const handleLogin = (loggedInAccount: Account) => {
    setAccount(loggedInAccount);
    localStorage.setItem('account', JSON.stringify(loggedInAccount));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setAccount(null);
      setUsers([]);
      setSelectedUserId('');
      localStorage.removeItem('account');
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
    setEntryToLog(null); // Clear the prefilled data after adding
  };

  const handleSelectForLog = (entry: any) => {
    setEntryToLog(entry);
    navigate('/'); // Navigate to dashboard where the entry form is
  };

  const changeDate = (days: number) => {
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
    <Layout
      onLogout={handleLogout}
      currentUser={account.username}
    >
      <div className="space-y-6">
        {/* Top Controls: User & Date */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          {/* User Selection */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 flex gap-2 w-full sm:w-auto">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 sm:flex-none w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={users.length === 0}
              >
                {users.length === 0 ? (
                  <option value="">No users found</option>
                ) : (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))
                )}
              </select>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-full px-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center"
                  title="User Management"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-100 dark:border-gray-700 py-2 animate-fade-in-down">
                    <button
                      onClick={() => { setShowUserMenu(false); handleCreateUser(); }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span>➕</span> Create New User
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        const user = users.find(u => u.id === selectedUserId);
                        if (user) handleDeleteUser(user.id, user.name);
                      }}
                      disabled={!selectedUserId}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>🗑️</span> Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date Selection and Goals Toggle */}
          {selectedUserId && (
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-stretch sm:items-center">
              {/* Show Goals Button */}
              <button
                onClick={() => setShowGoals(!showGoals)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium border ${showGoals
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
              >
                {showGoals ? 'Hide Goals' : 'View Goals'}
              </button>

              {/* Date Controls */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-300"
                  title="Previous Day"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-center text-sm font-medium text-gray-900 dark:text-white w-32 cursor-pointer"
                />
                <button
                  onClick={() => setSelectedDate(getTodayString())}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                  title="Jump to Today"
                >
                  TODAY
                </button>
                <button
                  onClick={() => changeDate(1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-300"
                  title="Next Day"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedUserId && showGoals && (
          <div className="animate-fade-in">
            <GoalsForm userId={selectedUserId} />
          </div>
        )}

        <Routes>
          <Route path="/favorites" element={selectedUserId ? <FavoritesView userId={selectedUserId} onSelectForLog={handleSelectForLog} /> : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Selection Required</h3>
              <p className="text-gray-500 dark:text-gray-400">Please select a user to view favorites.</p>
            </div>
          )} />
        </Routes>

        {location.pathname === '/' && selectedUserId && (
          <div className="space-y-6 animate-fade-in">
            <FoodEntryForm
              userId={selectedUserId}
              date={selectedDate}
              onEntryAdded={handleEntryAdded}
              initialValues={entryToLog}
            />
            <FoodLogView
              userId={selectedUserId}
              date={selectedDate}
              refresh={refreshTrigger}
              onSelectForLog={handleSelectForLog}
            />
          </div>
        )}

        {!selectedUserId && users.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center max-w-lg mx-auto mt-10 border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-6">🥗</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Welcome to NutriTrack!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Start your health journey by creating your first user profile. Track meals, monitor goals, and improved your well-being.
            </p>
            <button onClick={handleCreateUser} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 font-medium">
              Create First User
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;