import React from 'react';

interface BackgroundDesignProps {
  children?: React.ReactNode;
  className?: string;
}

export const BackgroundDesign: React.FC<BackgroundDesignProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Ambient Radial Spotlight Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top-Center Orange Glow */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-gradient-to-b from-[#ff7a00]/25 via-[#f2603f]/15 to-transparent blur-[120px] opacity-70 dark:opacity-90 animate-pulse" 
          style={{ animationDuration: '6s' }}
        />
        
        {/* Left Side Subtle Glow */}
        <div 
          className="absolute top-1/3 -left-40 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#ff5500]/15 via-[#fa8816]/10 to-transparent blur-[100px] opacity-50 dark:opacity-80" 
        />

        {/* Bottom Right Amber Accent */}
        <div 
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#ff7a00]/20 via-[#e14760]/10 to-transparent blur-[130px] opacity-60 dark:opacity-85" 
        />

        {/* Modern Vector Grid Mesh Overlay with Radial Blur Mask */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.09] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" 
        />
        
        {/* Subtle Tech Dots Array */}
        <div className="absolute top-12 left-10 w-24 h-24 opacity-20 dark:opacity-30 bg-[radial-gradient(#ff7a00_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="absolute bottom-20 right-10 w-32 h-32 opacity-20 dark:opacity-30 bg-[radial-gradient(#ff7a00_1px,transparent_1px)] [background-size:12px_12px]" />
      </div>

      {/* Foreground Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundDesign;
