'use client';

import React, { memo } from 'react';
import { Image } from '@/components/ui';

export interface PasswordToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}

export const PasswordToggle: React.FC<Readonly<PasswordToggleProps>> = memo(
  function PasswordToggle({ isVisible, onToggle, showLabel, hideLabel }) {
    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onToggle}
        className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors cursor-pointer"
        aria-label={isVisible ? hideLabel : showLabel}
      >
        <Image
          key={isVisible ? 'eye-off' : 'eye'}
          src={isVisible ? '/icons/eye-off.svg' : '/icons/eye.svg'}
          alt={isVisible ? hideLabel : showLabel}
          width={18}
          height={18}
        />
      </button>
    );
  }
);

PasswordToggle.displayName = 'PasswordToggle';
