'use client';

import React, { memo, useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
  triggerClassName?: string;
  maxWidth?: string;
  disabled?: boolean;
}

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent border-[5px]',
  bottom:
    'top-[-5px] left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent border-[5px]',
  left: 'right-[-5px] top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-[5px]',
  right:
    'left-[-5px] top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-[5px]',
};

export const Tooltip = memo(function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  triggerClassName = 'inline-flex items-center min-w-0 max-w-full align-middle cursor-default',
  maxWidth = 'max-w-xs',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: TooltipPosition;
    ready: boolean;
  }>({
    top: 0,
    left: 0,
    placement: position,
    ready: false,
  });

  const tooltipId = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 240;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 38;

    let targetPlacement = position;
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    // Automatic flip if near boundary (e.g. first or last row of table)
    if (position === 'top' && spaceTop < tooltipHeight + 14 && spaceBottom > spaceTop) {
      targetPlacement = 'bottom';
    } else if (
      position === 'bottom' &&
      spaceBottom < tooltipHeight + 14 &&
      spaceTop > spaceBottom
    ) {
      targetPlacement = 'top';
    } else if (position === 'left' && spaceLeft < tooltipWidth + 14 && spaceRight > spaceLeft) {
      targetPlacement = 'right';
    } else if (position === 'right' && spaceRight < tooltipWidth + 14 && spaceLeft > spaceRight) {
      targetPlacement = 'left';
    }

    let top = 0;
    let left = 0;

    if (targetPlacement === 'top') {
      top = rect.top - tooltipHeight - 8;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (targetPlacement === 'bottom') {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (targetPlacement === 'left') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - 8;
    } else {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + 8;
    }

    // Horizontal boundary clamping so it never overflows offscreen
    const padding = 10;
    const maxLeft = window.innerWidth - tooltipWidth - padding;
    left = Math.max(padding, Math.min(left, maxLeft));

    // Vertical boundary clamping
    const maxTop = window.innerHeight - tooltipHeight - padding;
    top = Math.max(padding, Math.min(top, maxTop));

    setCoords({ top, left, placement: targetPlacement, ready: true });
  }, [position]);

  const showTooltip = useCallback(() => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  }, [disabled, content]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setCoords((prev) => ({ ...prev, ready: false }));
    }, 60);
  }, []);

  // Update coordinates whenever visibility turns on, or on scroll/resize
  useEffect(() => {
    if (!isVisible) return;
    calculatePosition();

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible, calculatePosition]);

  if (!content || disabled) {
    return <>{children}</>;
  }

  const tooltipPortal =
    mounted && isVisible && typeof document !== 'undefined'
      ? createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              opacity: coords.ready ? 1 : 0,
              visibility: coords.ready ? 'visible' : 'hidden',
            }}
            className={`fixed z-[9999] pointer-events-none px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 rounded-lg shadow-2xl border border-slate-800 backdrop-blur-xs whitespace-normal break-words text-left transition-opacity duration-150 ${maxWidth} ${className}`}
          >
            {content}
            <span
              className={`absolute w-0 h-0 pointer-events-none ${arrowClasses[coords.placement]}`}
            />
          </span>,
          document.body
        )
      : null;

  return (
    <span
      ref={triggerRef}
      className={triggerClassName}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      {tooltipPortal}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';
export default Tooltip;
