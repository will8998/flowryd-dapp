"use client";

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="text-white/30 mb-4 flex justify-center">
          {icon}
        </div>
      )}
      
      <h3 className="text-white/30 text-lg font-medium mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-white/20 text-sm mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="border border-white/20 hover:border-white/40 text-white rounded px-3 py-1.5 text-sm transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};