'use client';

import React, { memo, ReactNode } from 'react';
import { Image, Button } from '@/components/ui';

export type EmptyStateVariant =
  | 'no-data'
  | 'no-search'
  | 'offline'
  | 'network-error'
  | 'server-error'
  | 'unauthorized'
  | 'custom';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  iconSrc?: string;
  size?: EmptyStateSize;
  action?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

interface VariantConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultIconSrc: string;
  iconBadgeBg: string;
  iconColorClass: string;
}

const variantMap: Record<EmptyStateVariant, VariantConfig> = {
  'no-data': {
    defaultTitle: 'No Records Found',
    defaultDescription: 'There are currently no items available in this view.',
    defaultIconSrc: '/icons/no-data.svg',
    iconBadgeBg: 'bg-slate-100/80 border-slate-200/80 text-slate-500',
    iconColorClass: 'text-slate-500',
  },
  'no-search': {
    defaultTitle: 'No Matching Results',
    defaultDescription:
      'We could not find anything matching your search criteria. Try different keywords.',
    defaultIconSrc: '/icons/no-search.svg',
    iconBadgeBg: 'bg-blue-50/80 border-blue-200/80 text-blue-600',
    iconColorClass: 'text-blue-600',
  },
  offline: {
    defaultTitle: 'You Are Currently Offline',
    defaultDescription: 'Please check your internet connection to access workspace data.',
    defaultIconSrc: '/icons/wifi-off.svg',
    iconBadgeBg: 'bg-amber-50/80 border-amber-200/80 text-amber-600',
    iconColorClass: 'text-amber-600',
  },
  'network-error': {
    defaultTitle: 'Network Connectivity Issue',
    defaultDescription:
      'Unable to communicate with the server. Please check your connection and retry.',
    defaultIconSrc: '/icons/server-error.svg',
    iconBadgeBg: 'bg-rose-50/80 border-rose-200/80 text-rose-600',
    iconColorClass: 'text-rose-600',
  },
  'server-error': {
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'An unexpected error occurred while processing your request.',
    defaultIconSrc: '/icons/server-error.svg',
    iconBadgeBg: 'bg-rose-50/80 border-rose-200/80 text-rose-600',
    iconColorClass: 'text-rose-600',
  },
  unauthorized: {
    defaultTitle: 'Access Restricted',
    defaultDescription: 'You do not have permission to view or manage these records.',
    defaultIconSrc: '/icons/lock.svg',
    iconBadgeBg: 'bg-indigo-50/80 border-indigo-200/80 text-indigo-600',
    iconColorClass: 'text-indigo-600',
  },
  custom: {
    defaultTitle: 'No Information Available',
    defaultDescription: '',
    defaultIconSrc: '/icons/no-data.svg',
    iconBadgeBg: 'bg-slate-100/80 border-slate-200/80 text-slate-500',
    iconColorClass: 'text-slate-500',
  },
};

const sizeClasses = {
  sm: {
    container: 'py-8 px-4',
    iconWrapper: 'w-12 h-12 rounded-xl mb-3',
    iconSize: 22,
    title: 'text-sm font-bold text-slate-800',
    description: 'text-xs text-slate-500 mt-1 max-w-sm',
    actionGap: 'mt-3.5',
    buttonSize: 'sm' as const,
  },
  md: {
    container: 'py-12 px-6',
    iconWrapper: 'w-16 h-16 rounded-2xl mb-4 shadow-xs',
    iconSize: 30,
    title: 'text-base sm:text-lg font-bold text-slate-900',
    description: 'text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md',
    actionGap: 'mt-5',
    buttonSize: 'md' as const,
  },
  lg: {
    container: 'py-16 px-8',
    iconWrapper: 'w-20 h-20 rounded-3xl mb-5 shadow-sm',
    iconSize: 38,
    title: 'text-xl sm:text-2xl font-bold text-slate-900 tracking-tight',
    description: 'text-sm sm:text-base text-slate-500 mt-2 max-w-lg',
    actionGap: 'mt-6',
    buttonSize: 'lg' as const,
  },
};

export const EmptyState = memo(function EmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  iconSrc,
  size = 'md',
  action,
  actionText,
  onAction,
  actionIcon,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  const config = variantMap[variant] || variantMap['no-data'];
  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  const displayTitle = title ?? config.defaultTitle;
  const displayDescription = description ?? config.defaultDescription;
  const activeIconSrc = iconSrc || (typeof icon === 'string' ? icon : config.defaultIconSrc);

  return (
    <section
      aria-label={typeof displayTitle === 'string' ? displayTitle : 'Empty state'}
      className={`flex flex-col items-center justify-center text-center select-none ${sizeConfig.container} ${className}`}
    >
      {/* Icon Wrapper */}
      <div
        className={`flex items-center justify-center border transition-transform duration-200 ${sizeConfig.iconWrapper} ${config.iconBadgeBg}`}
      >
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <Image
            src={activeIconSrc}
            alt=""
            width={sizeConfig.iconSize}
            height={sizeConfig.iconSize}
            className={config.iconColorClass}
          />
        )}
      </div>

      {/* Headings */}
      {displayTitle && <h3 className={sizeConfig.title}>{displayTitle}</h3>}
      {displayDescription && <p className={sizeConfig.description}>{displayDescription}</p>}

      {/* Action Buttons */}
      {(action || actionText || secondaryActionText) && (
        <div className={`flex flex-wrap items-center justify-center gap-3 ${sizeConfig.actionGap}`}>
          {action ?? (
            <>
              {secondaryActionText && onSecondaryAction && (
                <Button
                  type="button"
                  variant="outline"
                  size={sizeConfig.buttonSize}
                  onClick={onSecondaryAction}
                  className="font-semibold text-xs sm:text-sm"
                >
                  {secondaryActionText}
                </Button>
              )}
              {actionText && onAction && (
                <Button
                  type="button"
                  variant="primary"
                  size={sizeConfig.buttonSize}
                  onClick={onAction}
                  leftIcon={actionIcon}
                  className="font-semibold text-xs sm:text-sm shadow-sm"
                >
                  {actionText}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
