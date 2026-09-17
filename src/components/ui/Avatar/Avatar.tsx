import React, { memo } from 'react';
import { getUserInitials } from '@/helpers';
import { Image } from '@/components/ui/Image';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName?: string;
  lastName?: string;
  size?: AvatarSize;
  colorScheme?: 'blue' | 'purple' | 'slate' | 'emerald';
  src?: string;
  alt?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
  xs: { container: 'h-6 w-6', text: 'text-[10px]', px: 24 },
  sm: { container: 'h-8 w-8', text: 'text-xs', px: 32 },
  md: { container: 'h-10 w-10', text: 'text-sm', px: 40 },
  lg: { container: 'h-12 w-12', text: 'text-base', px: 48 },
  xl: { container: 'h-16 w-16', text: 'text-lg', px: 64 },
};

const colorStyles = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const Avatar = memo(function Avatar({
  firstName,
  lastName,
  size = 'md',
  colorScheme = 'blue',
  src,
  alt = 'Avatar',
  className = '',
  ...props
}: AvatarProps) {
  const initials = getUserInitials(firstName, lastName);
  const sizeConfig = sizeStyles[size];

  if (src) {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden border border-slate-200 shadow-xs ${sizeConfig.container} ${className}`}
        {...props}
      >
        <Image src={src} alt={alt} width={sizeConfig.px} height={sizeConfig.px} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold border transition-transform duration-200 hover:scale-105 shadow-xs ${sizeConfig.container} ${sizeConfig.text} ${colorStyles[colorScheme]} ${className}`}
      aria-label={alt}
      {...props}
    >
      {initials}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
