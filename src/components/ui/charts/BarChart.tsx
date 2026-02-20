"use client";

import { useState, useMemo } from 'react';

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
}

export const BarChart = ({ 
  data, 
  height = 300, 
  showLabels = true, 
  showValues = false 
}: BarChartProps) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  const chartData = useMemo(() => {
    const margin = { top: 20, right: 20, bottom: showLabels ? 60 : 20, left: 20 };
    
    if (!data.length) return { bars: [], maxValue: 0, gridLines: [], margin, chartWidth: 100, chartHeight: height - margin.top - margin.bottom };

    const maxValue = Math.max(...data.map(d => d.value));
    const paddedMax = maxValue * 1.1;
    const chartWidth = 100;
    const chartHeight = height - margin.top - margin.bottom;
    
    const barWidth = chartWidth / data.length * 0.6;
    const barSpacing = chartWidth / data.length;

    const bars = data.map((item, index) => {
      const barHeight = (item.value / paddedMax) * chartHeight;
      const x = index * barSpacing + barSpacing / 2 - barWidth / 2;
      const y = chartHeight - barHeight;

      return {
        ...item,
        x,
        y,
        width: barWidth,
        height: barHeight,
        index
      };
    });

    const gridLines = [];
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = (chartHeight / gridCount) * i;
      const value = paddedMax - (paddedMax / gridCount) * i;
      gridLines.push({ y, value });
    }

    return { bars, maxValue: paddedMax, gridLines, margin, chartWidth, chartHeight };
  }, [data, height, showLabels]);

  const handleBarHover = (bar: typeof chartData.bars[0], event: React.MouseEvent<SVGRectElement>) => {
    const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
    
    if (svgRect) {
      setHoveredBar(bar.index);
      setTooltipData({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top,
        value: bar.value,
        label: bar.label
      });
    }
  };

  const handleBarLeave = () => {
    setHoveredBar(null);
    setTooltipData(null);
  };

  if (!data.length) {
    return (
      <div 
        className="flex items-center justify-center text-white/30 text-sm"
        style={{ height }}
      >
        No data to display
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 100 ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
          </linearGradient>
          <linearGradient id="barGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {chartData.gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={chartData.margin.left}
              y1={chartData.margin.top + line.y}
              x2={100 - chartData.margin.right}
              y2={chartData.margin.top + line.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Bars */}
        {chartData.bars.map((bar) => (
          <g key={bar.index}>
            <rect
              x={`${chartData.margin.left + bar.x}%`}
              y={chartData.margin.top + bar.y}
              width={`${bar.width}%`}
              height={bar.height}
              fill={hoveredBar === bar.index ? 'url(#barGradientHover)' : 'url(#barGradient)'}
              onMouseEnter={(e) => handleBarHover(bar, e)}
              onMouseLeave={handleBarLeave}
              className="transition-all duration-200 cursor-pointer"
            />
            
            {/* Value labels on bars */}
            {showValues && (
              <text
                x={`${chartData.margin.left + bar.x + bar.width / 2}%`}
                y={chartData.margin.top + bar.y - 5}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.6)"
                className="text-[10px]"
              >
                {bar.value}
              </text>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {showLabels && chartData.bars.map((bar) => (
          <text
            key={`label-${bar.index}`}
            x={`${chartData.margin.left + bar.x + bar.width / 2}%`}
            y={height - chartData.margin.bottom + 15}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(255,255,255,0.4)"
            className="text-[10px]"
          >
            {bar.label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="absolute z-10 bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white pointer-events-none"
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y - 10,
            transform: tooltipData.x > 200 ? 'translateX(-100%)' : 'translateX(0)'
          }}
        >
          <div className="font-medium">{tooltipData.label}</div>
          <div className="text-white/60">{tooltipData.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};