import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playBalatroSound } from '../lib/soundEffects';

interface BalatroChemicalLogoProps {
  onCardClick?: () => void;
}

export const BalatroChemicalLogo: React.FC<BalatroChemicalLogoProps> = ({ onCardClick }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.08);
    setRotateY(x * 0.08);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsCardHovered(false);
  };

  const leftLetters = ['P', 'O', 'K', 'E', 'R'];
  const rightLetters = ['Q', 'U', 'I', 'M', 'I', 'C', 'O'];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative select-none flex flex-col items-center justify-center cursor-default z-30"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative flex items-center justify-center"
      >
        {/* SVG Defs for Balatro-style chemical fluid wave filling & filters */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="balatroTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f3f4f6" />
              <stop offset="60%" stopColor="#d1d5db" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>

            <pattern id="chemFluidPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 0 20 Q 15 5, 30 20 T 60 20"
                fill="none"
                stroke="#e11d48"
                strokeWidth="6"
                strokeOpacity="0.85"
              />
              <path
                d="M 0 42 Q 15 28, 30 42 T 60 42"
                fill="none"
                stroke="#0284c7"
                strokeWidth="6"
                strokeOpacity="0.85"
              />
            </pattern>

            <filter id="chunkyShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="0" floodColor="#090a0f" floodOpacity="1" />
              <feDropShadow dx="0" dy="12" stdDeviation="4" floodColor="#000000" floodOpacity="0.7" />
            </filter>
          </defs>
        </svg>

        {/* Centerpiece Chemical Spatula / DNA Caduceus Behind Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <svg width="120" height="240" viewBox="0 0 120 240" className="opacity-90 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
            {/* Central Titanium Chemical Rod / Pipette */}
            <line x1="60" y1="10" x2="60" y2="230" stroke="#090a0f" strokeWidth="12" strokeLinecap="round" />
            <line x1="60" y1="10" x2="60" y2="230" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
            <polygon points="60,2 52,18 68,18" fill="#38bdf8" stroke="#090a0f" strokeWidth="3" />
            <circle cx="60" cy="232" r="6" fill="#f43f5e" stroke="#090a0f" strokeWidth="2" />

            {/* Twisted Chemical Helix / Bond Serpent (Cyan & Crimson) */}
            <path
              d="M 35 40 Q 85 70, 60 100 Q 35 130, 85 160 Q 60 190, 40 215"
              fill="none"
              stroke="#090a0f"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 35 40 Q 85 70, 60 100 Q 35 130, 85 160 Q 60 190, 40 215"
              fill="none"
              stroke="#0284c7"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Red Helix Counter-Twist */}
            <path
              d="M 85 45 Q 35 75, 60 105 Q 85 135, 35 165 Q 60 195, 80 220"
              fill="none"
              stroke="#090a0f"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 85 45 Q 35 75, 60 105 Q 85 135, 35 165 Q 60 195, 80 220"
              fill="none"
              stroke="#e11d48"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* The Balatro Chunky Title: "POKER" [CARD] "QUIMICO" */}
        <div className="flex items-center justify-center w-full max-w-4xl px-2 sm:px-4 py-2 relative z-10">
          {/* Left Wing: "POKER" */}
          <div className="flex-1 flex justify-end items-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-arcade tracking-tight sm:tracking-tighter text-white">
            {leftLetters.map((letter, i) => (
              <span
                key={i}
                className="relative inline-block transition-transform duration-150 hover:-translate-y-2 hover:scale-105"
                style={{
                  color: '#ffffff',
                  textShadow: `
                    -3px -3px 0 #000,
                     3px -3px 0 #000,
                    -3px  3px 0 #000,
                     3px  3px 0 #000,
                     0px  6px 0 #18181b,
                     0px  9px 0 #090a0f,
                     0px 14px 20px rgba(0,0,0,0.8)
                  `,
                  transform: `rotate(${(i - 2) * 2.5}deg) translateY(${Math.sin(i * 0.8) * 3}px)`,
                }}
              >
                <span className="relative z-10">{letter}</span>
                <span
                  className="absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-multiply bg-gradient-to-b from-transparent via-rose-500/80 to-sky-500/80"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {letter}
                </span>
              </span>
            ))}
          </div>

          {/* Centerpiece: Interactive Floating Chemical Playing Card (Like Balatro's Ace of Spades) */}
          <motion.div
            whileHover={{ scale: 1.15, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => {
              setIsCardHovered(true);
              playBalatroSound('hover');
            }}
            onClick={() => {
              playBalatroSound('deal');
              onCardClick?.();
            }}
            className="relative mx-2 sm:mx-4 md:mx-6 cursor-pointer z-30 group shrink-0"
          >
            {/* Glowing Chemical Aura behind card */}
            <div
              className={`absolute -inset-2 bg-gradient-to-r from-emerald-500/40 via-cyan-400/40 to-rose-500/40 rounded-xl blur-md transition-opacity duration-300 ${
                isCardHovered ? 'opacity-100' : 'opacity-40'
              }`}
            />

            {/* Chunky Balatro Playing Card: Carbon (6 C) / Ace of Chemistry */}
            <div
              className="w-14 sm:w-18 md:w-22 h-20 sm:h-28 md:h-34 bg-[#f8fafc] border-[3px] sm:border-[3.5px] border-slate-900 rounded-xl flex flex-col justify-between p-1.5 sm:p-2 shadow-[0_6px_0_0_#0f172a,0_10px_20px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-150 group-hover:border-emerald-500"
              style={{
                imageRendering: 'pixelated',
              }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center leading-none">
                <div className="flex flex-col items-center">
                  <span className="font-arcade font-black text-xs sm:text-base text-slate-900">A</span>
                  <span className="text-[8px] sm:text-xs font-mono font-bold text-emerald-600">6</span>
                </div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
              </div>

              {/* Center Atom / Chemical Carbon Symbol */}
              <div className="flex flex-col items-center justify-center my-auto relative">
                <div className="relative flex items-center justify-center">
                  {/* Electron orbital rings */}
                  <div className="absolute w-8 sm:w-11 h-8 sm:h-11 rounded-full border border-dashed border-emerald-500/60 animate-spin-slow" />
                  <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black font-arcade text-xs sm:text-base border-2 border-emerald-400 shadow-inner">
                    C
                  </div>
                </div>
                <span className="text-[7px] sm:text-[9px] font-black font-mono text-slate-700 uppercase tracking-widest mt-0.5">
                  OCTETO
                </span>
              </div>

              {/* Card Footer Inverted */}
              <div className="flex justify-between items-center rotate-180 leading-none">
                <div className="flex flex-col items-center">
                  <span className="font-arcade font-black text-xs sm:text-base text-slate-900">A</span>
                  <span className="text-[8px] sm:text-xs font-mono font-bold text-emerald-600">6</span>
                </div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
              </div>

              {/* Pixelated Card Edge Highlight */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-white/80 pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Wing: "QUIMICO" */}
          <div className="flex-1 flex justify-start items-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-arcade tracking-tight sm:tracking-tighter text-white">
            {rightLetters.map((letter, i) => (
              <span
                key={i}
                className="relative inline-block transition-transform duration-150 hover:-translate-y-2 hover:scale-105"
                style={{
                  color: '#ffffff',
                  textShadow: `
                    -3px -3px 0 #000,
                     3px -3px 0 #000,
                    -3px  3px 0 #000,
                     3px  3px 0 #000,
                     0px  6px 0 #18181b,
                     0px  9px 0 #090a0f,
                     0px 14px 20px rgba(0,0,0,0.8)
                  `,
                  transform: `rotate(${(i - 3) * -2.5}deg) translateY(${Math.sin((i + 2) * 0.8) * 3}px)`,
                }}
              >
                <span className="relative z-10">{letter}</span>
                <span
                  className="absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-multiply bg-gradient-to-b from-transparent via-rose-500/80 to-sky-500/80"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {letter}
                </span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
