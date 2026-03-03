"use client";
import React from 'react';

const shimmer = "animate-pulse bg-white/[0.04]";

export const CardSkeleton = () => (
  <div className={`${shimmer} rounded-lg h-48 border border-white/5`} />
);

export const TickerSkeleton = () => (
  <div className="flex gap-4 overflow-hidden px-4 py-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-2 shrink-0">
        <div className={`${shimmer} w-16 h-4 rounded`} />
        <div className={`${shimmer} w-10 h-3 rounded`} />
      </div>
    ))}
  </div>
);

export const GridSkeleton = ({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) => (
  <div className="p-8 space-y-6">
    <div className="flex items-center gap-4">
      <div className={`${shimmer} w-48 h-8 rounded`} />
      <div className={`${shimmer} w-32 h-8 rounded`} />
    </div>
    <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="h-full flex flex-col">
    <TickerSkeleton />
    <div className="flex-1 flex">
      <div className={`${shimmer} flex-1 m-2 rounded-lg`} />
      <div className="w-[320px] p-2 space-y-2">
        <div className={`${shimmer} h-40 rounded-lg`} />
        <div className={`${shimmer} h-40 rounded-lg`} />
        <div className={`${shimmer} h-32 rounded-lg`} />
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="p-6 space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <div className={`${shimmer} w-8 h-8 rounded`} />
        <div className="flex-1 space-y-1.5">
          <div className={`${shimmer} w-2/3 h-3 rounded`} />
          <div className={`${shimmer} w-1/3 h-2 rounded`} />
        </div>
        <div className={`${shimmer} w-16 h-6 rounded`} />
      </div>
    ))}
  </div>
);