"use client";

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export const StatCard = ({ title, value, subtitle, change, icon }: StatCardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const formatChange = (changeValue: number) => {
    const abs = Math.abs(changeValue);
    const symbol = changeValue >= 0 ? '↑' : '↓';
    return `${symbol} ${abs}%`;
  };

  return (
    <div className="border border-white/10 bg-black/30 rounded p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[9px] text-white/40 font-bold tracking-wide uppercase">
          {title}
        </h3>
        {icon && (
          <div className="text-white/30">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-2xl font-semibold text-white mb-1">
          {formatValue(value)}
        </div>
        
        {subtitle && (
          <div className="text-white/40 text-sm">
            {subtitle}
          </div>
        )}
      </div>
      
      {change && (
        <div className="flex items-center gap-1">
          <span className="text-white/40 text-sm">
            {formatChange(change.value)}
          </span>
        </div>
      )}
    </div>
  );
};