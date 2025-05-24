import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ trigger, items, align = 'right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 w-48 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-[#1da1f2]/20 focus:outline-none ${alignments[align]} ${className}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex="-1"
        >
          <div className="py-1" role="none">
            {Array.isArray(items) &&
              items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={`group flex items-center w-full px-4 py-2 text-sm rounded-xl transition-colors
                    ${item.danger
                      ? 'text-red-700 hover:bg-red-50 dark:hover:bg-red-900'
                      : 'text-gray-700 dark:text-gray-100 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8]'}
                  `}
                  role="menuitem"
                  tabIndex="-1"
                >
                  {item.icon && (
                    <span className="mr-3 h-5 w-5" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
