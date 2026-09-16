import React from 'react';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'gradient' | 'white' | 'monochrome';

export interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_DIMENSIONS: Record<LoaderSize, { px: number; strokeWidth: number }> = {
  xs: { px: 18, strokeWidth: 3.2 },
  sm: { px: 24, strokeWidth: 3.0 },
  md: { px: 40, strokeWidth: 2.8 },
  lg: { px: 64, strokeWidth: 2.6 },
  xl: { px: 88, strokeWidth: 2.4 },
};

const getStrokeColor = (variant: LoaderVariant): string => {
  if (variant === 'white') {
    return '#ffffff';
  }
  if (variant === 'monochrome') {
    return 'currentColor';
  }
  return 'url(#taskflowComponentLoaderGrad)';
};

export const Loader: React.FC<Readonly<LoaderProps>> = ({
  size = 'md',
  variant = 'gradient',
  text,
  fullScreen = false,
  className = '',
  ariaLabel,
}) => {
  const { px, strokeWidth } = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS.md;
  const label = ariaLabel || text || 'Loading';
  const strokeColor = getStrokeColor(variant);

  const loaderSvg = (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 32 32"
      width={px}
      height={px}
      fill="none"
      className="shrink-0 drop-shadow-sm select-none"
    >
      <defs>
        <linearGradient id="taskflowComponentLoaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <style>
          {`
            @keyframes taskflowPulseTL {
              0%, 100% { transform: scale(0.82); opacity: 0.35; transform-origin: 9.25px 9.25px; }
              25% { transform: scale(1.12); opacity: 1; transform-origin: 9.25px 9.25px; }
            }
            @keyframes taskflowPulseTR {
              0%, 100% { transform: scale(0.82); opacity: 0.35; transform-origin: 22.75px 9.25px; }
              50% { transform: scale(1.12); opacity: 1; transform-origin: 22.75px 9.25px; }
            }
            @keyframes taskflowPulseBR {
              0%, 100% { transform: scale(0.82); opacity: 0.35; transform-origin: 22.75px 22.75px; }
              75% { transform: scale(1.12); opacity: 1; transform-origin: 22.75px 22.75px; }
            }
            @keyframes taskflowPulseBL {
              0%, 100% { transform: scale(1.12); opacity: 1; transform-origin: 9.25px 22.75px; }
              25%, 75% { transform: scale(0.82); opacity: 0.35; transform-origin: 9.25px 22.75px; }
            }
            .tf-load-tl { animation: taskflowPulseTL 1.4s ease-in-out infinite; }
            .tf-load-tr { animation: taskflowPulseTR 1.4s ease-in-out infinite; }
            .tf-load-br { animation: taskflowPulseBR 1.4s ease-in-out infinite; }
            .tf-load-bl { animation: taskflowPulseBL 1.4s ease-in-out infinite; }
          `}
        </style>
      </defs>
      {/* Top Left */}
      <rect
        className="tf-load-tl"
        x="4.5"
        y="4.5"
        width="9.5"
        height="9.5"
        rx="2.8"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Top Right */}
      <rect
        className="tf-load-tr"
        x="18"
        y="4.5"
        width="9.5"
        height="9.5"
        rx="2.8"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Bottom Right */}
      <rect
        className="tf-load-br"
        x="18"
        y="18"
        width="9.5"
        height="9.5"
        rx="2.8"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Bottom Left */}
      <rect
        className="tf-load-bl"
        x="4.5"
        y="18"
        width="9.5"
        height="9.5"
        rx="2.8"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  );

  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md p-4 transition-all duration-300 ${className}`}
      >
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-xl animate-fadeIn">
          {loaderSvg}
          {text && (
            <p className="text-sm font-semibold tracking-wide text-slate-700 animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      {loaderSvg}
      {text && <span className="text-xs font-medium text-slate-600 animate-pulse">{text}</span>}
    </div>
  );
};

export default Loader;
