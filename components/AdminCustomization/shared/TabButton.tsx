import React from 'react';

interface TabButtonProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ id, label, icon, activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange(id)}
    className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
      activeTab === id
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon} {label}
  </button>
);

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  children, 
  variant = '', 
  className = '', 
  ...props 
}) => (
  <button
    className={`px-4 py-2 rounded-lg text-sm font-bold ${variant} ${className}`}
    {...props}
  >
    {children}
  </button>
);
