import React from 'react';

interface CasinoChipStackProps {
  amount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CasinoChipStack = React.memo(function CasinoChipStack({ amount = 100, size = 'sm', className = '' }: CasinoChipStackProps) {
  // Determine height of chip columns based on amount
  const colCount = amount > 500 ? 4 : amount > 200 ? 3 : amount > 50 ? 2 : 1;

  const getScale = () => {
    switch (size) {
      case 'lg': return 'scale-125';
      case 'md': return 'scale-100';
      case 'sm': default: return 'scale-75 sm:scale-90';
    }
  };

  return (
    <div className={`inline-flex items-end -space-x-1.5 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] ${getScale()} ${className}`}>
      {/* Grey/Black Chips Column */}
      <div className="flex flex-col-reverse -space-y-2 space-y-reverse">
        {[...Array(Math.min(5, Math.max(2, Math.floor(amount / 200))))].map((_, i) => (
          <div
            key={`grey-${i}`}
            className="w-5 h-2 rounded-full border border-zinc-900 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] relative flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-x-1 h-0.5 bg-white/60 top-0.5 rounded-full" />
            <div className="w-1.5 h-1 border-x border-white/80 absolute" />
          </div>
        ))}
      </div>

      {/* Blue Chips Column */}
      {colCount >= 2 && (
        <div className="flex flex-col-reverse -space-y-2 space-y-reverse">
          {[...Array(Math.min(6, Math.max(3, Math.floor(amount / 150))))].map((_, i) => (
            <div
              key={`blue-${i}`}
              className="w-5 h-2 rounded-full border border-blue-950 bg-gradient-to-r from-blue-700 via-sky-400 to-blue-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] relative flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-x-1 h-0.5 bg-white/60 top-0.5 rounded-full" />
              <div className="w-1.5 h-1 border-x border-white/80 absolute" />
            </div>
          ))}
        </div>
      )}

      {/* Yellow/Gold Chips Column */}
      {colCount >= 3 && (
        <div className="flex flex-col-reverse -space-y-2 space-y-reverse">
          {[...Array(Math.min(4, Math.max(2, Math.floor(amount / 100))))].map((_, i) => (
            <div
              key={`gold-${i}`}
              className="w-5 h-2 rounded-full border border-amber-950 bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-700 shadow-[0_1px_1px_rgba(0,0,0,0.8)] relative flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-x-1 h-0.5 bg-white/70 top-0.5 rounded-full" />
              <div className="w-1.5 h-1 border-x border-white/80 absolute" />
            </div>
          ))}
        </div>
      )}

      {/* Red Chips Column */}
      {colCount >= 4 && (
        <div className="flex flex-col-reverse -space-y-2 space-y-reverse">
          {[...Array(Math.min(5, Math.max(2, Math.floor(amount / 80))))].map((_, i) => (
            <div
              key={`red-${i}`}
              className="w-5 h-2 rounded-full border border-red-950 bg-gradient-to-r from-red-700 via-rose-400 to-red-800 shadow-[0_1px_1px_rgba(0,0,0,0.8)] relative flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-x-1 h-0.5 bg-white/60 top-0.5 rounded-full" />
              <div className="w-1.5 h-1 border-x border-white/80 absolute" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
