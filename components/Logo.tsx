import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-36 w-36',
    md: 'h-44 w-44', 
    lg: 'h-52 w-52',
    xl: 'h-60 w-60'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        <ImageWithFallback
          src="/ChatGPT Image Nov 11, 2025, 10_31_00 PM (1).png"
          alt="Imtehaan Logo"
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  );
}