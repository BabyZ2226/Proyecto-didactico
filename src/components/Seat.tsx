import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GamePlayer, GamePhase } from '../types';
import { Card } from './Card';
import { CasinoChipStack } from './CasinoChipStack';
import { cn } from '../lib/utils';

interface SeatProps {
  key?: React.Key;
  player: GamePlayer;
  phase: GamePhase;
  isHero?: boolean;
  isDealer?: boolean;
  forceShowCards?: boolean;
  className?: string;
  onSelect?: () => void;
}

export const Seat = React.memo(function Seat({ player, phase, isHero = false, isDealer = false, forceShowCards = false, className, onSelect }: SeatProps) {
  const isShowdown = phase === 'showdown';
  const evalRes = player.evaluation;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center select-none transition-all duration-200 group relative',
        className
      )}
    >
      {/* Speech Action Bubble (e.g. "Call", "Raise $100", "Fold", "Check") */}
      {player.statusText && !player.hasFolded && (
        <div className="absolute -top-6 sm:-top-7 z-30 animate-in fade-in zoom-in-75 duration-150 pointer-events-none">
          <div className="relative bg-white text-zinc-950 font-bold text-[9px] sm:text-[11px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border-2 border-zinc-950 shadow-xl whitespace-nowrap max-w-[115px] sm:max-w-none truncate">
            <span>{player.statusText}</span>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-zinc-950 rotate-45" />
          </div>
        </div>
      )}

      {/* Cards Area - Angled & Overlapping like real poker */}
      <div className="relative flex items-center justify-center mb-1 z-10 filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] min-h-[44px] sm:min-h-[50px] min-w-[60px] sm:min-w-[70px]">
        <AnimatePresence mode="popLayout">
          {player.hand.map((card, i) => (
            <motion.div
              key={card?.id || `seat-card-${player.id}-${i}`}
              initial={{ opacity: 0, scale: 0.6, y: -140, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: i === 0 ? -9 : 9 }}
              exit={{ opacity: 0, scale: 0.5, y: 40 }}
              transition={{
                type: 'spring',
                damping: 17,
                stiffness: 55,
                mass: 1.1,
                delay: i * 0.18,
              }}
              className={cn(
                'transition-transform duration-200',
                i === 0 ? '-mr-3 sm:-mr-4' : 'z-10'
              )}
            >
              <Card
                card={isShowdown || isHero || forceShowCards ? card : null}
                className={cn(
                  'w-7 h-10 sm:w-10 sm:h-14 md:w-12 md:h-16 border shadow-lg transition-transform',
                  isHero ? 'w-12 h-17 sm:w-15 sm:h-22 md:w-17 md:h-25' : '',
                  (isShowdown || forceShowCards) && evalRes?.isValid ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : ''
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ribbon & Nameplate Block with Side Chips and Dealer Button */}
      <div className="relative flex items-center justify-center">
        {/* Main Ribbon + Plate Container */}
        <div
          className={cn(
            'flex flex-col items-center min-w-[68px] max-w-[96px] sm:min-w-[84px] sm:max-w-[145px] filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] transition-all z-10',
            player.hasFolded && 'opacity-40 grayscale'
          )}
        >
          {/* Top Red Money Ribbon */}
          <div className="w-full bg-gradient-to-r from-red-950 via-red-800 to-red-950 border-t border-x border-red-600/80 px-1.5 sm:px-2 py-0.5 rounded-t-sm text-center shadow-inner">
            <span className="text-white text-[10px] sm:text-xs font-black tracking-tight font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              ${(player.chips || 0).toLocaleString()}
            </span>
          </div>

          {/* Lower Name Plate */}
          <div
            className={cn(
              'w-full px-1.5 sm:px-2 py-0.5 rounded-b-sm text-center border-b border-x shadow-md',
              isHero
                ? 'bg-gradient-to-b from-amber-300 to-amber-400 border-amber-600 text-zinc-950 font-black'
                : 'bg-gradient-to-b from-zinc-50 to-zinc-200 border-zinc-400 text-zinc-900 font-bold'
            )}
          >
            <span className="text-[9px] sm:text-[11px] truncate block leading-tight tracking-tight">
              {isHero ? 'Tú' : player.name.replace(' (Bot)', '')}
            </span>
          </div>

          {/* Molecule name on Showdown */}
          {isShowdown && evalRes && !player.hasFolded && (
            <div className="mt-1 bg-zinc-950/90 border border-emerald-500/60 px-1.5 py-0.5 rounded shadow-lg">
              <span className="text-[9px] font-mono font-black text-emerald-300 block truncate">
                {evalRes.isValid ? evalRes.formula : 'Inestable'}
              </span>
            </div>
          )}
        </div>

        {/* Casino Chip Stacks Beside Player */}
        <div className="absolute -right-7 sm:-right-8 top-1 z-20 pointer-events-none">
          <CasinoChipStack amount={player.chips || 100} size="sm" />
        </div>

        {/* Dealer Button Chip */}
        {isDealer && (
          <div className="absolute -left-5 sm:-left-6 top-1 z-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-red-600 shadow-[0_2px_5px_rgba(0,0,0,0.8)] flex items-center justify-center font-black text-red-600 text-[10px] sm:text-xs font-serif leading-none">
            D
          </div>
        )}
      </div>
    </div>
  );
});


