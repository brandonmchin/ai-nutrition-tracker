import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
    currentUser: string | undefined;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, currentUser }) => {
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        {
            path: '/', label: 'Dashboard', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            path: '/favorites', label: 'Favorites', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        }
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg z-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                        Nutrition Tracker
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-4">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{currentUser}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={toggleTheme}
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50 h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    Nutrition Tracker
                </h1>
                <div className="flex items-center gap-3">
                    {currentUser && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                            {currentUser}
                        </span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full pb-20 pt-16 md:pt-0 md:pb-0 scroll-smooth">
                <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
                <nav className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {React.cloneElement(item.icon, { className: 'h-6 w-6' })}
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={toggleTheme}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400"
                    >
                        <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
                        <span className="text-xs font-medium">Theme</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 dark:text-gray-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-xs font-medium">Logout</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Layout;
