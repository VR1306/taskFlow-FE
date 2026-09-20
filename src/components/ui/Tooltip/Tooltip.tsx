'use client';

import React, { memo, useState, useRef, useId } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
  maxWidth?: string;
  disabled?: boolean;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent border-[5px]',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent border-[5px]',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-[5px]',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-[5px]',
};

export const Tooltip = memo(function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  maxWidth = 'max-w-xs',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 80);
  };

  if (!content || disabled) {
    return <>{children}</>;
  }

  return (
    <span
      className="relative inline-flex items-center min-w-0 max-w-full"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 rounded-lg shadow-xl border border-slate-800 backdrop-blur-xs whitespace-normal break-words text-left animate-in fade-in zoom-in-95 duration-150 ${positionClasses[position]} ${maxWidth} ${className}`}
        >
          {content}
          <span className={`absolute w-0 h-0 pointer-events-none ${arrowClasses[position]}`} />
        </span>
      )}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';
export default Tooltip;
