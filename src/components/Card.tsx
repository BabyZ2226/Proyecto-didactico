import React from 'react';
import { ElementCard as ElementCardType } from '../types';
import { cn } from '../lib/utils';

interface CardProps {
  key?: React.Key;
  card: ElementCardType | null; // null means face down
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  selectedClassName?: string;
  delay?: number;
  overrideDots?: number;
  hideDots?: boolean;
  dotsPlacement?: { top?: number; bottom?: number; left?: number; right?: number };
  occupiedSides?: ('top' | 'bottom' | 'left' | 'right')[];
  lewisMode?: boolean;
  ionicCharge?: string;
}

export const Card = React.memo(function Card({
  card,
  onClick,
  selected,
  className,
  selectedClassName,
  overrideDots,
  hideDots = false,
  dotsPlacement,
  occupiedSides,
  lewisMode = false,
  ionicCharge,
}: CardProps) {
  const isFaceDown = !card;

  const getGroupColor = (group: number) => {
    switch (group) {
      case 1: return 'bg-rose-50 border-rose-300 text-rose-950 border-t-rose-500';
      case 2: return 'bg-orange-50 border-orange-300 text-orange-950 border-t-orange-500';
      case 3: return 'bg-amber-50 border-amber-300 text-amber-950 border-t-amber-500';
      case 4: return 'bg-emerald-50 border-emerald-300 text-emerald-950 border-t-emerald-500';
      case 5: return 'bg-cyan-50 border-cyan-300 text-cyan-950 border-t-cyan-500';
      case 6: return 'bg-blue-50 border-blue-300 text-blue-950 border-t-blue-500';
      case 7: return 'bg-indigo-50 border-indigo-300 text-indigo-950 border-t-indigo-500';
      case 8: return 'bg-purple-50 border-purple-300 text-purple-950 border-t-purple-500';
      default: return 'bg-zinc-50 border-zinc-300 text-zinc-950 border-t-zinc-500';
    }
  };

  const dotsCount = overrideDots !== undefined ? overrideDots : (card?.group || 0);

  const renderLewisDots = () => {
    if (hideDots) return null;

    let placement = dotsPlacement;

    if (!placement && overrideDots !== undefined) {
      // Calculate placement avoiding occupiedSides (where bonds connect)
      const count = Math.min(8, Math.max(0, overrideDots));
      const occupied = occupiedSides || [];
      const allSides: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
      const freeSides = allSides.filter((s) => !occupied.includes(s));

      placement = { top: 0, bottom: 0, left: 0, right: 0 };

      if (freeSides.length > 0) {
        // Distribute non-bonding electron count as pairs among free sides
        let remaining = count;
        for (const side of freeSides) {
          if (remaining <= 0) break;
          const toAdd = Math.min(2, remaining);
          placement[side] = toAdd;
          remaining -= toAdd;
        }
        if (remaining > 0) {
          for (const side of freeSides) {
            if (remaining <= 0) break;
            const current = placement[side] || 0;
            const canAdd = Math.min(2 - current, remaining);
            if (canAdd > 0) {
              placement[side] = current + canAdd;
              remaining -= canAdd;
            }
          }
        }
      }
    } else if (!placement) {
      // Standard isolated Lewis dots filling (Hund's rule 1-4 singles, 5-8 paired)
      const num = Math.min(8, Math.max(0, dotsCount));
      placement = {
        top: num >= 2 ? 2 : num === 1 ? 1 : 0,
        bottom: num >= 4 ? 2 : num === 3 ? 1 : 0,
        right: num >= 6 ? 2 : num === 5 ? 1 : 0,
        left: num >= 8 ? 2 : num === 7 ? 1 : 0,
      };
    }

    const dotBase = lewisMode
      ? 'w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(253,230,138,0.8)] shrink-0 z-10 relative'
      : 'w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-900 shrink-0';

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge */}
        {(placement.top || 0) > 0 && (
          <div className="absolute -top-1.5 left-0 right-0 flex justify-center items-center gap-1">
            {Array.from({ length: placement.top || 0 }).map((_, idx) => (
              <span key={`top-dot-${idx}`} className={dotBase} />
            ))}
          </div>
        )}

        {/* Bottom Edge */}
        {(placement.bottom || 0) > 0 && (
          <div className="absolute -bottom-1.5 left-0 right-0 flex justify-center items-center gap-1">
            {Array.from({ length: placement.bottom || 0 }).map((_, idx) => (
              <span key={`bottom-dot-${idx}`} className={dotBase} />
            ))}
          </div>
        )}

        {/* Left Edge */}
        {(placement.left || 0) > 0 && (
          <div className="absolute -left-1.5 top-0 bottom-0 flex flex-col justify-center items-center gap-1">
            {Array.from({ length: placement.left || 0 }).map((_, idx) => (
              <span key={`left-dot-${idx}`} className={dotBase} />
            ))}
          </div>
        )}

        {/* Right Edge */}
        {(placement.right || 0) > 0 && (
          <div className="absolute -right-1.5 top-0 bottom-0 flex flex-col justify-center items-center gap-1">
            {Array.from({ length: placement.right || 0 }).map((_, idx) => (
              <span key={`right-dot-${idx}`} className={dotBase} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-lg cursor-pointer select-none transition-all duration-150 ease-out will-change-transform',
        selected
          ? selectedClassName || '-translate-y-2 ring-2 ring-white shadow-md'
          : 'hover:-translate-y-0.5',
        className || 'w-16 h-24 sm:w-20 sm:h-28'
      )}
    >
      {/* Front Face */}
      {!isFaceDown ? (
        <div
          className={cn(
            'w-full h-full rounded-lg flex flex-col items-center justify-between p-1.5 sm:p-2 border border-t-2 shadow-sm transition-all',
            getGroupColor(card.group)
          )}
        >
          <div className="w-full flex justify-between text-[8px] sm:text-[9px] font-mono text-zinc-500 font-medium leading-none px-0.5">
            <span>{card.group}</span>
            <span>{card.en.toFixed(1)}</span>
          </div>

          <div className="relative flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 my-auto">
            <span className="text-lg sm:text-2xl font-bold tracking-tight leading-none z-10 select-none text-zinc-950 font-sans">
              {card.symbol}
            </span>
            {ionicCharge && (
              <span className="absolute -top-1 -right-2 text-[9px] sm:text-[10px] font-mono font-bold text-zinc-800 bg-zinc-100 px-1 rounded border border-zinc-300 leading-none z-20">
                {ionicCharge}
              </span>
            )}
            {renderLewisDots()}
          </div>

          <div className="w-full text-center text-[6.5px] sm:text-[7.5px] uppercase tracking-normal text-zinc-600 truncate leading-none px-0.5 font-semibold">
            {card.name}
          </div>
        </div>
      ) : (
        /* Back Face - Classic Blue Casino Card Back */
        <div className="w-full h-full rounded-lg border-2 border-white bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-1 flex items-center justify-center shadow-lg relative overflow-hidden">
          {/* Inner border */}
          <div className="w-full h-full rounded border border-white/60 bg-blue-800/80 flex items-center justify-center relative overflow-hidden">
            {/* Diamond pattern overlay */}
            <div 
              className="absolute inset-0 opacity-40" 
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 15%, transparent 20%), radial-gradient(circle, #ffffff 15%, transparent 20%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px'
              }}
            />
            {/* Center Emblem */}
            <div className="w-5 h-5 rounded-full border border-white/60 bg-blue-900/90 flex items-center justify-center z-10 shadow-inner">
              <div className="w-2 h-2 rotate-45 bg-white/80" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
