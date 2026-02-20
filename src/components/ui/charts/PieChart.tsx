"use client";

import { useState, useMemo } from 'react';

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  donut?: boolean;
}

const DEFAULT_COLORS = [
  'rgba(255,255,255,0.6)',
  'rgba(255,255,255,0.5)', 
  'rgba(255,255,255,0.4)',
  'rgba(255,255,255,0.3)',
  'rgba(255,255,255,0.2)'
];

export const PieChart = ({ 
  data, 
  size = 200, 
  donut = true 
}: PieChartProps) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data.length) return { slices: [], total: 0, center: size / 2, radius: size / 2 - 10 };

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const center = size / 2;
    const radius = size / 2 - 10;
    const innerRadius = donut ? radius * 0.6 : 0;

    let cumulativeAngle = 0;
    const slices = data.map((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      
      const startX = center + radius * Math.cos(startAngle - Math.PI / 2);
      const startY = center + radius * Math.sin(startAngle - Math.PI / 2);
      const endX = center + radius * Math.cos(endAngle - Math.PI / 2);
      const endY = center + radius * Math.sin(endAngle - Math.PI / 2);
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      let pathData;
      if (donut) {
        const innerStartX = center + innerRadius * Math.cos(startAngle - Math.PI / 2);
        const innerStartY = center + innerRadius * Math.sin(startAngle - Math.PI / 2);
        const innerEndX = center + innerRadius * Math.cos(endAngle - Math.PI / 2);
        const innerEndY = center + innerRadius * Math.sin(endAngle - Math.PI / 2);
        
        pathData = [
          `M ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `L ${innerEndX} ${innerEndY}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
          'Z'
        ].join(' ');
      } else {
        pathData = [
          `M ${center} ${center}`,
          `L ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          'Z'
        ].join(' ');
      }
      
      const percentage = ((item.value / total) * 100).toFixed(1);
      const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      
      cumulativeAngle += angle;
      
      return {
        ...item,
        pathData,
        percentage,
        color,
        index,
        angle,
        startAngle,
        endAngle
      };
    });

    return { slices, total, center, radius, innerRadius };
  }, [data, size, donut]);

  if (!data.length) {
    return (
      <div 
        className="flex items-center justify-center text-white/30 text-sm"
        style={{ width: size, height: size + 100 }}
      >
        No data to display
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="mb-4">
        {chartData.slices.map((slice) => (
          <path
            key={slice.index}
            d={slice.pathData}
            fill={slice.color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1"
            onMouseEnter={() => setHoveredSlice(slice.index)}
            onMouseLeave={() => setHoveredSlice(null)}
            className={`transition-all duration-200 cursor-pointer ${
              hoveredSlice === slice.index ? 'opacity-90 scale-105 origin-center' : 'opacity-80'
            }`}
            style={{
              transformOrigin: `${chartData.center}px ${chartData.center}px`,
              transform: hoveredSlice === slice.index ? 'scale(1.02)' : 'scale(1)'
            }}
          />
        ))}
        
        {/* Center text for donut */}
        {donut && (
          <text
            x={chartData.center}
            y={chartData.center}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            fontWeight="semibold"
            fill="rgba(255,255,255,0.8)"
          >
            {chartData.total.toLocaleString()}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
        {chartData.slices.map((slice) => (
          <div
            key={slice.index}
            className={`flex items-center gap-2 p-2 rounded transition-all cursor-pointer ${
              hoveredSlice === slice.index ? 'bg-white/5' : 'hover:bg-white/[0.02]'
            }`}
            onMouseEnter={() => setHoveredSlice(slice.index)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: slice.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-white/70 text-sm truncate">
                {slice.label}
              </div>
              <div className="text-white/40 text-xs">
                {slice.value.toLocaleString()} ({slice.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};