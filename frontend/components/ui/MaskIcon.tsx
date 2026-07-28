import React from 'react';
import { cn } from '@/lib/utils';

interface MaskIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  set?: 'lucide' | 'brands';
}

/**
 * Renders a single-colour SVG icon via CSS mask + `background-color: currentColor`,
 * so it always matches the exact text colour (and hover/active states) of whatever
 * it's inherited from - unlike <img src="*.svg">, which can't be recoloured with CSS
 * since the SVG loads as its own isolated document.
 */
export function MaskIcon({ name, set = 'lucide', className, style, ...props }: MaskIconProps) {
  const src = set === 'brands' ? `/brands/${name}.svg` : `/icons/${set}/${name}.svg`;
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    ...style,
  };

  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-block bg-current', className)}
      style={maskStyle}
      {...props}
    />
  );
}
