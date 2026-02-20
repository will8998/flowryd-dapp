"use client";

import { useState, useMemo } from 'react';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  showDots?: boolean;
  showArea?: boolean;
}

export const LineChart = ({ 
  data, 
  height = 300, 
  showDots = true, 
  showArea = false 
}: LineChartProps) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  const chartData = useMemo(() => {
    const margin = { top: 20, right: 20, bottom: 60, left: 20 };
    
    if (!data.length) return { points: [], pathData: '', areaPathData: '', maxValue: 0, gridLines: [], margin, chartWidth: 100, chartHeight: height - margin.top - margin.bottom };

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const paddedMax = maxValue + (maxValue - minValue) * 0.1;
    const paddedMin = Math.max(0, minValue - (maxValue - minValue) * 0.1);
    const range = paddedMax - paddedMin;

    const chartWidth = 100 - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const points = data.map((item, index) => {
      const x = (index / Math.max(1, data.length - 1)) * chartWidth;
      const y = chartHeight - ((item.value - paddedMin) / range) * chartHeight;

      return {
        ...item,
        x: margin.left + x,
        y: margin.top + y,
        index,
        originalX: x,
        originalY: y
      };
    });

    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '').trim();

    const areaPathData = showArea && points.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`
      : '';

    const gridLines = [];
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = margin.top + (chartHeight / gridCount) * i;
      const value = paddedMax - (range / gridCount) * i;
      gridLines.push({ y, value });
    }

    return { 
      points, 
      pathData, 
      areaPathData, 
      maxValue: paddedMax, 
      minValue: paddedMin,
      gridLines, 
      margin, 
      chartWidth: 100, 
      chartHeight 
    };
  }, [data, height, showArea]);

  const handleDotHover = (point: typeof chartData.points[0], event: React.MouseEvent<SVGCircleElement>) => {
    const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
    
    if (svgRect) {
      setHoveredDot(point.index);
      setTooltipData({
        x: event.clientX - svgRect.left,
        y: event.clientY - svgRect.top,
        value: point.value,
        label: point.label
      });
    }
  };

  const handleDotLeave = () => {
    setHoveredDot(null);
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
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {chartData.gridLines.map((line, i) => (
          <line
            key={i}
            x1={chartData.margin.left}
            y1={line.y}
            x2={100 - chartData.margin.right}
            y2={line.y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        {showArea && chartData.areaPathData && (
          <path
            d={chartData.areaPathData}
            fill="url(#areaGradient)"
          />
        )}

        {/* Line */}
        <path
          d={chartData.pathData}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots && chartData.points.map((point) => (
          <circle
            key={point.index}
            cx={point.x}
            cy={point.y}
            r={hoveredDot === point.index ? 4 : 3}
            fill="rgba(255,255,255,0.6)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1"
            onMouseEnter={(e) => handleDotHover(point, e)}
            onMouseLeave={handleDotLeave}
            className="transition-all duration-200 cursor-pointer"
          />
        ))}

        {/* X-axis labels */}
        {chartData.points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={height - chartData.margin.bottom + 15}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(255,255,255,0.4)"
            className="text-[10px]"
          >
            {point.label}
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