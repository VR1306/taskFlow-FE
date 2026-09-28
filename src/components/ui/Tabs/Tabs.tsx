'use client';

import React, { memo, useRef, useCallback } from 'react';

export interface TabItem<K extends string = string> {
  key: K;
  label: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  testId?: string;
}

export type TabsVariant = 'segmented' | 'underline' | 'pills';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabsProps<K extends string = string> {
  items: TabItem<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
  tabClassName?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
}

export interface TabPanelProps {
  tabKey: string;
  activeKey: string;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
  direction?: 'left' | 'right';
}

export const TabPanel = memo(function TabPanel({
  tabKey,
  activeKey,
  children,
  className = '',
  keepMounted = false,
  direction,
}: TabPanelProps) {
  const isActive = tabKey === activeKey;

  if (!isActive && !keepMounted) {
    return null;
  }

  let animationClass = 'animate-fadeIn';
  if (direction === 'right') {
    animationClass = 'animate-slide-in-right';
  } else if (direction === 'left') {
    animationClass = 'animate-slide-in-left';
  }

  return (
    <div
      key={`${tabKey}-${direction || 'default'}`}
      role="tabpanel"
      id={`tabpanel-${tabKey}`}
      aria-labelledby={`tab-${tabKey}`}
      hidden={!isActive}
      className={`${animationClass} will-change-transform outline-none focus:outline-none ${!isActive ? 'hidden' : ''} ${className}`}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

export const Tabs = memo(function Tabs<K extends string = string>({
  items,
  activeKey,
  onChange,
  variant = 'segmented',
  size = 'md',
  className = '',
  tabClassName = '',
  ariaLabel = 'Tabs',
  fullWidth = false,
}: TabsProps<K>) {
  const tabRefs = useRef<Map<K, HTMLButtonElement | null>>(new Map());

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentKey: K) => {
      const enabledItems = items.filter((item) => !item.disabled);
      const currentIndex = enabledItems.findIndex((item) => item.key === currentKey);
      if (currentIndex === -1) return;

      let nextIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % enabledItems.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = enabledItems.length - 1;
      }

      if (nextIndex !== -1) {
        const nextItem = enabledItems[nextIndex];
        onChange(nextItem.key);
        const nextButton = tabRefs.current.get(nextItem.key);
        nextButton?.focus();
      }
    },
    [items, onChange]
  );

  const sizeClasses: Record<TabsSize, string> = {
    sm: 'px-1.5 sm:px-2.5 py-1 text-xs gap-1 sm:gap-1.5',
    md: 'px-1.5 min-[380px]:px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold gap-1 min-[380px]:gap-1.5 sm:gap-2',
    lg: 'px-3 sm:px-4.5 py-2 sm:py-2.5 text-sm font-semibold gap-1.5 sm:gap-2.5',
  };

  const getItemWidthClass = () => {
    if (fullWidth) {
      return 'flex-1';
    }
    if (variant === 'segmented') {
      return 'flex-1 sm:min-w-[140px]';
    }
    return '';
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'underline':
        return `flex items-center gap-6 border-b border-slate-200 ${fullWidth ? 'w-full' : ''} ${className}`;
      case 'pills':
        return `${fullWidth ? 'w-full' : 'inline-flex'} items-center gap-1.5 p-1 bg-slate-50/80 rounded-2xl border border-slate-200/60 ${className}`;
      case 'segmented':
      default:
        return `${fullWidth ? 'w-full flex' : 'flex w-full sm:w-auto sm:inline-flex'} relative items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs ${className}`;
    }
  };

  const getItemClasses = (isActive: boolean, isDisabled?: boolean) => {
    if (isDisabled) {
      return 'opacity-40 cursor-not-allowed select-none';
    }

    if (variant === 'underline') {
      if (isActive) {
        return 'border-b-2 border-blue-600 text-blue-600 font-bold -mb-[1px]';
      }
      return 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-semibold -mb-[1px]';
    }

    if (variant === 'pills') {
      if (isActive) {
        return 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/20 rounded-xl';
      }
      return 'text-slate-600 hover:bg-white hover:text-slate-900 font-semibold rounded-xl';
    }

    if (isActive) {
      return 'text-slate-900 font-bold';
    }
    return 'text-slate-600 hover:text-slate-900 font-semibold';
  };

  const getBadgeClasses = (isActive: boolean) => {
    switch (variant) {
      case 'underline':
        return isActive
          ? 'bg-blue-100 text-blue-700 font-bold'
          : 'bg-slate-100 text-slate-600 font-semibold';
      case 'pills':
        return isActive
          ? 'bg-white/25 text-white font-bold'
          : 'bg-slate-200/70 text-slate-600 font-semibold';
      case 'segmented':
      default:
        return isActive
          ? 'bg-blue-50 text-blue-700 border border-blue-200/70 font-bold'
          : 'bg-slate-200/70 text-slate-600 font-semibold';
    }
  };

  const foundIndex = items.findIndex((item) => item.key === activeKey);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;

  return (
    <div role="tablist" aria-label={ariaLabel} className={getContainerClasses()}>
      {variant === 'segmented' && items.length > 0 && (
        <span
          role="presentation"
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-xl bg-white shadow-xs pointer-events-none transition-transform duration-250 ease-out will-change-transform z-0"
          style={{
            width: `calc((100% - 8px) / ${items.length})`,
            transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            left: '4px',
          }}
        />
      )}
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const isDisabled = Boolean(item.disabled);

        return (
          <button
            key={item.key}
            ref={(el) => {
              tabRefs.current.set(item.key, el);
            }}
            type="button"
            role="tab"
            id={`tab-${item.key}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.key}`}
            aria-disabled={isDisabled ? 'true' : undefined}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(item.key)}
            onKeyDown={(e) => handleKeyDown(e, item.key)}
            data-testid={item.testId || `tab-${item.key}`}
            className={`relative z-10 flex items-center justify-center min-w-0 transition-colors duration-200 select-none cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-blue-500/30 ${getItemWidthClass()} ${sizeClasses[size]} ${getItemClasses(isActive, isDisabled)} ${tabClassName}`}
          >
            {item.icon && <span className="shrink-0 inline-flex items-center">{item.icon}</span>}
            <span className="whitespace-nowrap">{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <span
                className={`inline-flex items-center justify-center shrink-0 min-w-[18px] sm:min-w-[20px] px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] rounded-full transition-colors duration-200 ${getBadgeClasses(
                  isActive
                )}`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}) as <K extends string = string>(props: TabsProps<K>) => React.JSX.Element;

export default Tabs;
