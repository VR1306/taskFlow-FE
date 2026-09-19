import React from 'react';

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'info' | 'warning' | 'purple' | 'slate';
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

const BADGE_STYLES: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'info',
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600 border-blue-100',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {badgeText && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  BADGE_STYLES[badgeVariant] || BADGE_STYLES.info
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
        </div>

        {icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${iconBgColor}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
