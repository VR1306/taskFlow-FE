import React from 'react';
import { Loader } from '@/components/ui/Loader';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<Readonly<ButtonProps>> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-blue-600 text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500/50 border border-transparent',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-200/80 shadow-2xs',
    outline:
      'border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-blue-500/50',
    ghost:
      'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-blue-500/50',
  };

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-xs rounded-lg gap-1.5',
    md: 'h-11 px-4 text-sm rounded-xl gap-2 font-semibold',
    lg: 'h-12 px-6 text-base rounded-xl gap-2.5 font-semibold',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className={`relative inline-flex items-center justify-center transition-all duration-200 select-none outline-none focus-visible:ring-3 ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${variantStyles[variant]} ${sizeStyles[size]} ${
        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-[0.98]'
      } ${className}`}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <Loader
          size="xs"
          variant={variant === 'primary' ? 'white' : 'gradient'}
          ariaLabel="Loading"
        />
      )}

      {/* Left Icon (only shown when not loading) */}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}

      {/* Text / Children */}
      <span>{isLoading && loadingText ? loadingText : children}</span>

      {/* Right Icon */}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
