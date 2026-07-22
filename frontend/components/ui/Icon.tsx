import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps extends React.ComponentProps<'img'> {
  name: string;
  set?: 'lucide' | 'brands';
  color?: string;
}

export function Icon({ name, set = 'lucide', color = '%23ffffff', className, alt, ...props }: IconProps) {
  const src = set === 'brands' ? `/brands/${name}.svg` : `/icons/${set}/${name}.svg`;
  const iconColor = set === 'brands' ? undefined : color ? decodeURIComponent(color) : undefined;

  return (
    <img
      src={src}
      alt={alt ?? name}
      className={cn('inline-block', className)}
      style={iconColor ? { color: iconColor } : undefined}
      {...props}
    />
  );
}
