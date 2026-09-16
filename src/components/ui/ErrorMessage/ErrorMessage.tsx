import React from 'react';
import { Image } from '@/components/ui/Image';

export interface ErrorMessageProps {
  id?: string;
  message?: string;
  className?: string;
}

export const ErrorMessage: React.FC<Readonly<ErrorMessageProps>> = ({
  id,
  message,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 animate-fadeIn ${className}`}
    >
      <Image
        src="/icons/alert-circle.svg"
        alt="Error"
        width={14}
        height={14}
        className="shrink-0"
      />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
