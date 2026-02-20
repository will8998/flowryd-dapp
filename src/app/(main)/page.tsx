"use client";

import React from 'react';
import { useCantonAuth } from '@/lib/auth-context';
import { FlowsStudio } from '@/components/control-centre/FlowsStudio';

export default function Home() {
  const { isLoading } = useCantonAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <FlowsStudio />;
}
