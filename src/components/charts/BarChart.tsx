'use client';

import React, { useState } from 'react';

export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
  subLabel?: string;
  color?: string;
  secondaryColor?: string;
}

export interface BarChartProps {
  data: BarChartItem[];
  title?: string;
  valueLabel?: string;
  secondaryLabel?: string;
  height?: number;
  showGrid?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  valueLabel = 'Count',
  secondaryLabel,
  height = 200,
  showGrid = true,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center ${className}`}
        style={{ height }}
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-500">No chart analytics available</p>
      </div>
    );
  }

  // Find max value for Y-scale
  const hasSecondary = data.some((item) => item.secondaryValue !== undefined);
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.value, item.secondaryValue || 0)),
    5
  );

  // Nice round upper ceiling for grid steps (e.g. 5, 10, 20, 50, 100...)
  const getCeiling = (val: number) => {
    if (val <= 5) return 5;
    if (val <= 10) return 10;
    if (val <= 20) return 20;
    if (val <= 50) return 50;
    if (val <= 100) return 100;
    const factor = Math.pow(10, Math.floor(Math.log10(val)));
    return Math.ceil(val / factor) * factor;
  };

  const yCeiling = getCeiling(maxValue);
  const gridTicks = [yCeiling, Math.round(yCeiling * 0.66), Math.round(yCeiling * 0.33), 0];

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {(title || hasSecondary) && (
        <div className="flex items-center justify-between mb-4">
          {title ? <h3 className="text-sm font-semibold text-slate-800">{title}</h3> : <div />}
          {hasSecondary && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span className="text-slate-600 font-medium">{valueLabel}</span>
              </div>
              {secondaryLabel && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600 font-medium">{secondaryLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="relative w-full flex" style={{ height }}>
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between pr-2 text-[10px] font-medium text-slate-400 select-none pb-6">
          {gridTicks.map((tick) => (
            <span key={tick} className="leading-none text-right w-6">
              {tick}
            </span>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative flex-1 flex flex-col justify-end">
          {/* Grid lines */}
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {gridTicks.map((tick) => (
                <div key={tick} className="w-full border-b border-slate-100/80" />
              ))}
            </div>
          )}

          {/* Bar Columns */}
          <div className="relative z-10 flex items-end justify-between h-full gap-2 pb-6 pt-2">
            {data.map((item, index) => {
              const heightPercent = Math.min(100, Math.max(4, (item.value / yCeiling) * 100));
              const secHeightPercent = item.secondaryValue
                ? Math.min(100, Math.max(4, (item.secondaryValue / yCeiling) * 100))
                : 0;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={item.label}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  data-testid={`bar-column-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-11 z-30 bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap flex flex-col items-center transform -translate-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-slate-200">
                        {valueLabel}: <strong className="text-white">{item.value}</strong>
                        {hasSecondary && item.secondaryValue !== undefined && (
                          <>
                            {' · '}
                            {secondaryLabel || 'Secondary'}:{' '}
                            <strong className="text-emerald-400">{item.secondaryValue}</strong>
                          </>
                        )}
                      </span>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1" />
                    </div>
                  )}

                  {/* Bars */}
                  <div className="flex items-end justify-center gap-1 w-full max-w-[42px] h-full">
                    {/* Primary Bar */}
                    <div
                      className="w-full rounded-t-md transition-all duration-300 relative group-hover:brightness-110"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: item.color || '#3b82f6',
                        opacity: hoveredIndex === null || isHovered ? 1 : 0.65,
                      }}
                    >
                      {isHovered && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700">
                          {item.value}
                        </div>
                      )}
                    </div>

                    {/* Secondary Bar if present */}
                    {hasSecondary && item.secondaryValue !== undefined && (
                      <div
                        className="w-full rounded-t-md transition-all duration-300 relative group-hover:brightness-110"
                        style={{
                          height: `${secHeightPercent}%`,
                          backgroundColor: item.secondaryColor || '#10b981',
                          opacity: hoveredIndex === null || isHovered ? 1 : 0.65,
                        }}
                      />
                    )}
                  </div>

                  {/* X-Axis Label */}
                  <div className="absolute -bottom-0.5 text-center truncate max-w-full">
                    <span className="text-[11px] font-medium text-slate-500 block truncate">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
