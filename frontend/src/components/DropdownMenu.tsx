import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
    options: DropdownOption[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="sr-only">Open options</span>
                {/* Vertical Ellipsis */}
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white dark:bg-gray-700 divide-y divide-gray-100 dark:divide-gray-600 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    option.onClick();
                                    setIsOpen(false);
                                }}
                                className={`group flex w-full items-center px-4 py-2 text-sm ${option.variant === 'danger'
                                    ? 'text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
