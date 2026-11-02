import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { playBalatroSound } from '../lib/soundEffects';

interface MatchStartCountdownProps {
  onComplete: () => void;
  subtitle?: string;
}

export const MatchStartCountdown: React.FC<MatchStartCountdownProps> = ({
  onComplete,
  subtitle = '¡PREPÁRENSE PARA COMENZAR!',
}) => {
  const [count, setCount] = useState<number>(3);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    playBalatroSound('select');

    const t1 = setTimeout(() => {
      setCount(2);
      playBalatroSound('select');
    }, 950);

    const t2 = setTimeout(() => {
      setCount(1);
      playBalatroSound('select');
    }, 1900);

    const t3 = setTimeout(() => {
      setCount(0);
      playBalatroSound('play');
    }, 2850);

    const tEnd = setTimeout(() => {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        onCompleteRef.current();
      }
    }, 3450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
    };
  }, []);

  const ringProgress = count === 3 ? 0.33 : count === 2 ? 0.66 : count === 1 ? 1 : 1;
  const circumference = 2 * Math.PI * 110;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#090d16]/90 backdrop-blur-sm select-none overflow-hidden">
      {/* Subtle static radial glow (zero heavy blur-3xl ping animations) */}
      <div className="absolute inset-0 bg-radial from-amber-500/15 via-fuchsia-900/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
        {count > 0 ? (
          <div className="relative flex flex-col items-center justify-center">
            {/* Circular Fluid SVG Ring */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="rgba(15, 23, 42, 0.75)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="10"
                />
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - ringProgress)}
                  style={{ transition: 'stroke-dashoffset 0.85s linear' }}
                />
              </svg>

              {/* Crisp Instantaneous Number Pop (No mode="wait" blocking) */}
              <motion.span
                key={count}
                initial={{ scale: 0.55, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 font-sans text-[8.5rem] sm:text-[10rem] font-black text-amber-400 drop-shadow-[0_6px_24px_rgba(245,158,11,0.55)] leading-none select-none"
              >
                {count}
              </motion.span>
            </div>

            <span className="font-mono text-xs sm:text-sm text-amber-300 font-bold uppercase tracking-widest mt-4 bg-slate-900/90 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
              {subtitle}
            </span>
          </div>
        ) : (
          <motion.div
            key="go"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="font-sans text-5xl sm:text-7xl md:text-8xl font-black text-emerald-400 tracking-tight uppercase drop-shadow-[0_6px_30px_rgba(16,185,129,0.6)]">
              ¡A JUGAR! 🚀
            </div>
            <span className="font-mono text-xs sm:text-sm text-slate-200 font-bold tracking-widest mt-3">
              ¡Comienza la partida!
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
