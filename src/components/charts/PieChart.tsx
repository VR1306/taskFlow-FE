'use client';

import React, { useState } from 'react';

export interface PieChartItem {
  label: string;
  count: number;
  percentage?: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartItem[];
  title?: string;
  totalLabel?: string;
  size?: number;
  innerRadiusRatio?: number;
  showLegend?: boolean;
  className?: string;
}

interface ComputedSlice extends PieChartItem {
  pathData: string;
  calculatedPercentage: number;
  index: number;
}

function computeArcSlice(
  item: PieChartItem,
  index: number,
  startAngle: number,
  endAngle: number,
  center: number,
  radius: number,
  innerRadius: number,
  total: number
): ComputedSlice {
  const sliceAngle = endAngle - startAngle;
  const isFullCircle = sliceAngle >= 2 * Math.PI - 0.001;
  const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

  const x1 = center + radius * Math.cos(startAngle - Math.PI / 2);
  const y1 = center + radius * Math.sin(startAngle - Math.PI / 2);
  const x2 = center + radius * Math.cos(endAngle - Math.PI / 2);
  const y2 = center + radius * Math.sin(endAngle - Math.PI / 2);

  const ix1 = center + innerRadius * Math.cos(endAngle - Math.PI / 2);
  const iy1 = center + innerRadius * Math.sin(endAngle - Math.PI / 2);
  const ix2 = center + innerRadius * Math.cos(startAngle - Math.PI / 2);
  const iy2 = center + innerRadius * Math.sin(startAngle - Math.PI / 2);

  let pathData: string;
  if (isFullCircle) {
    pathData = `
      M ${center} ${center - radius}
      A ${radius} ${radius} 0 1 0 ${center} ${center + radius}
      A ${radius} ${radius} 0 1 0 ${center} ${center - radius}
      M ${center} ${center - innerRadius}
      A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center + innerRadius}
      A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center - innerRadius}
      Z
    `;
  } else {
    pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${ix1} ${iy1}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
      Z
    `;
  }

  const calculatedPercentage = item.percentage ?? Number(((item.count / total) * 100).toFixed(1));

  return {
    ...item,
    pathData,
    calculatedPercentage,
    index,
  };
}

function buildSlices(
  data: readonly PieChartItem[],
  total: number,
  size: number,
  innerRadiusRatio: number
): ComputedSlice[] {
  const radius = size / 2;
  const center = radius;
  const innerRadius = radius * innerRadiusRatio;

  const slices: ComputedSlice[] = [];
  let currentAngle = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const fraction = item.count / total;
    const sliceAngle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    slices.push(computeArcSlice(item, i, startAngle, endAngle, center, radius, innerRadius, total));
  }

  return slices;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  totalLabel = 'Total',
  size = 220,
  innerRadiusRatio = 0.62,
  showLegend = true,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.count, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-500">No distribution data available</p>
      </div>
    );
  }

  const slices = buildSlices(data, total, size, innerRadiusRatio);
  const activeItem = activeIndex !== null ? slices[activeIndex] : null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && <h3 className="text-sm font-semibold text-slate-800 mb-3 self-start">{title}</h3>}

      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          role="img"
          aria-label={title || 'Pie Chart Distribution'}
        >
          {slices.map((slice) => {
            const isHovered = activeIndex === slice.index;
            return (
              <path
                key={slice.label}
                d={slice.pathData}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth={isHovered ? 3 : 1.5}
                className="transition-all duration-200 cursor-pointer origin-center"
                style={{
                  opacity: activeIndex === null || isHovered ? 1 : 0.6,
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))' : 'none',
                }}
                onMouseEnter={() => setActiveIndex(slice.index)}
                onMouseLeave={() => setActiveIndex(null)}
                data-testid={`pie-slice-${slice.label.toLowerCase().replace(/\s+/g, '-')}`}
              />
            );
          })}
        </svg>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          {activeItem ? (
            <>
              <span className="text-xs font-semibold text-slate-500 truncate max-w-[90px]">
                {activeItem.label}
              </span>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {activeItem.count}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {activeItem.calculatedPercentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                {totalLabel}
              </span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">{total}</span>
              <span className="text-[11px] text-slate-500 font-medium">Total</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 w-full pt-3 border-t border-slate-100">
          {slices.map((slice) => {
            const isHovered = activeIndex === slice.index;
            return (
              <button
                key={slice.label}
                type="button"
                className={`flex items-center justify-between text-left p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? 'bg-slate-100/80' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setActiveIndex(slice.index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                    {slice.label}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-bold text-slate-900">{slice.count}</span>
                  <span className="text-[10px] text-slate-500 ml-1">
                    ({slice.calculatedPercentage}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
