import React from 'react';

interface MarkovaLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

// Geometric Monogram based on the provided MARKOVA identity
export const MarkovaMonogram: React.FC<MarkovaLogoProps> = ({
  className = '',
  size = 28,
  color = 'currentColor'
}) => {
  return (
    <svg
      width={size}
      height={size * (72 / 100)}
      viewBox="0 0 100 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Chevron */}
      <path
        d="M12 70 L48 4 L76 70"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Right Chevron overlapping */}
      <path
        d="M24 70 L52 4 L88 70"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};

// Stunning Modern Thin-Border Brand Badge
export const MarkovaBrandBadge: React.FC<{ subtitle?: string; className?: string }> = ({
  subtitle = 'EXECUTIVE SUITE',
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      {/* Monogram Box in Thin Border */}
      <div className="relative group">
        <div className="w-9 h-9 rounded-lg bg-stone-950/80 border border-stone-800/90 group-hover:border-amber-500/50 flex items-center justify-center p-1.5 shadow-md shadow-black/40 transition-all duration-300">
          <MarkovaMonogram size={22} color="#f59e0b" />
        </div>
      </div>

      {/* Stylized Wordmark in Thin Border */}
      <div className="flex flex-col">
        <div className="px-2.5 py-0.5 rounded-md border border-stone-800/80 bg-stone-900/40 backdrop-blur-sm flex items-center gap-2">
          <span className="font-sans font-bold tracking-[0.28em] text-[13px] text-stone-100 uppercase select-none">
            MARKOVA
          </span>
          <span className="w-1 h-1 rounded-full bg-amber-500/80"></span>
          <span className="text-[10px] text-amber-400/90 font-mono font-semibold tracking-wider">
            AI
          </span>
        </div>
        <div className="flex items-center justify-between px-0.5 mt-0.5">
          <span className="text-[9px] text-stone-500 font-mono tracking-widest uppercase">
            NEXURA AI Lab
          </span>
          <span className="text-[9px] text-stone-600 font-serif italic">
            Nima Changizi
          </span>
        </div>
      </div>
    </div>
  );
};

// Ambient Background Watermark
export const MarkovaWatermarkBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center select-none opacity-[0.025]">
      <svg
        width="800"
        height="576"
        viewBox="0 0 100 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white transform scale-125"
      >
        <path
          d="M12 70 L48 4 L76 70"
          stroke="currentColor"
          strokeWidth="6"
        />
        <path
          d="M24 70 L52 4 L88 70"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    </div>
  );
};
