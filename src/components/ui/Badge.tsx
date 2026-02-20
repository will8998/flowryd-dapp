"use client";

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses = {
  default: 'bg-white/10 text-white/60',
  success: 'bg-white/15 text-white/70',
  warning: 'bg-white/12 text-white/65',
  danger: 'bg-white/10 text-red-400/60',
  info: 'bg-white/13 text-white/68'
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  return (
    <span className={`
      px-2 py-0.5 rounded text-[9px] font-bold tracking-wide inline-block
      ${variantClasses[variant]}
    `}>
      {children}
    </span>
  );
};