import React from 'react';
import { cn } from '../lib/utils';

interface AulaPlayLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'amber';
  className?: string;
  onClick?: () => void;
}

/**
 * Renders the signature Landing Page "AUL≡PLAY" wide geometric logo
 * (`font-spaced-logo`, wide letter-spacing, and triple-bar stylized 'A' glyph with sky-400 accent).
 */
export const AulaPlayLogo: React.FC<AulaPlayLogoProps> = ({
  size = 'md',
  theme = 'light',
  className,
  onClick,
}) => {
  const sizeConfig = {
    xs: {
      text: 'text-[10px] tracking-[0.24em]',
      barsWrap: 'w-2.5 h-2 mr-0.5',
      barHeight: 'h-[1.5px]',
      gap: 'gap-1',
    },
    sm: {
      text: 'text-xs sm:text-sm tracking-[0.26em]',
      barsWrap: 'w-3 h-2.5 mr-0.5',
      barHeight: 'h-[2px]',
      gap: 'gap-1',
    },
    md: {
      text: 'text-base sm:text-lg tracking-[0.28em]',
      barsWrap: 'w-3.5 h-3 mr-1',
      barHeight: 'h-[2.5px]',
      gap: 'gap-1.5',
    },
    lg: {
      text: 'text-lg sm:text-xl tracking-[0.28em]',
      barsWrap: 'w-4 h-3.5 mr-1',
      barHeight: 'h-[2.5px]',
      gap: 'gap-1.5',
    },
    xl: {
      text: 'text-2xl sm:text-3xl tracking-[0.3em]',
      barsWrap: 'w-5 h-4 mr-1.5',
      barHeight: 'h-[3px]',
      gap: 'gap-2',
    },
  }[size];

  const colorConfig = {
    light: {
      text: 'text-white group-hover:text-sky-300',
      outerBar: 'bg-white group-hover:bg-sky-300',
      midBar: 'bg-sky-400',
    },
    dark: {
      text: 'text-[#191332] group-hover:text-sky-700',
      outerBar: 'bg-[#191332] group-hover:bg-sky-700',
      midBar: 'bg-sky-500',
    },
    amber: {
      text: 'text-amber-300 group-hover:text-amber-200',
      outerBar: 'bg-amber-300 group-hover:bg-amber-200',
      midBar: 'bg-sky-400',
    },
  }[theme];

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center select-none group align-middle',
        sizeConfig.gap,
        onClick && 'cursor-pointer',
        className
      )}
    >
      <span
        className={cn(
          'font-spaced-logo font-extrabold uppercase transition-colors leading-none',
          sizeConfig.text,
          colorConfig.text
        )}
      >
        AUL
      </span>
      {/* Stylized triple-bar glyph from the Landing Page */}
      <span className={cn('inline-flex flex-col justify-between shrink-0', sizeConfig.barsWrap)}>
        <span className={cn('w-full transition-colors', sizeConfig.barHeight, colorConfig.outerBar)} />
        <span className={cn('w-3/4', sizeConfig.barHeight, colorConfig.midBar)} />
        <span className={cn('w-full transition-colors', sizeConfig.barHeight, colorConfig.outerBar)} />
      </span>
      <span
        className={cn(
          'font-spaced-logo font-extrabold uppercase transition-colors leading-none',
          sizeConfig.text,
          colorConfig.text
        )}
      >
        PLAY
      </span>
    </span>
  );
};

interface EscapeBunkerGateProps {
  isOpen: boolean;
  currentChamber: number;
  totalChambers: number;
  compact?: boolean;
  className?: string;
}

/**
 * High-detail Industrial Arctic Bunker & Thermal Portal Gate for the Escape Room chase horizon.
 * Features steel blast pillars, hazard warning chevrons, glowing thermal coils, a rotating
 * energy core vortex when unlocked, and a volumetric light beam on the snow.
 */
export const EscapeBunkerGate: React.FC<EscapeBunkerGateProps> = ({
  isOpen,
  currentChamber,
  totalChambers,
  compact = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center select-none pointer-events-none',
        className
      )}
    >
      {/* Top Status Signboard */}
      <div
        className={cn(
          'mb-1 px-2.5 py-0.5 border font-mono font-black uppercase tracking-[0.18em] flex items-center gap-1.5 shadow-xl transition-all',
          compact ? 'text-[7px] px-1.5 py-0' : 'text-[9px] sm:text-[10px]',
          isOpen
            ? 'bg-emerald-950/95 border-[#22e584] text-[#22e584] shadow-[0_0_24px_rgba(34,229,132,0.75)] animate-bounce'
            : 'bg-[#0b1114]/95 border-amber-500/70 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-ping',
            isOpen ? 'bg-[#22e584]' : 'bg-amber-400'
          )}
        />
        <span>
          {isOpen
            ? '⚡ BÚNKER ABIERTO · ¡ESCAPA!'
            : `REFUGIO [${currentChamber}/${totalChambers}]`}
        </span>
      </div>

      {/* Main Fortified Bunker Arch & Thermal Portal SVG */}
      <div className="relative flex items-center justify-center">
        {/* Outer Halo Glow */}
        <div
          className={cn(
            'absolute -inset-4 rounded-full blur-xl transition-all duration-500',
            isOpen
              ? 'bg-gradient-to-t from-amber-400/70 via-[#22e584]/55 to-sky-400/50 scale-125 animate-pulse'
              : 'bg-amber-500/20'
          )}
        />

        {/* Ground Volumetric Light Spill onto the Snow */}
        {isOpen && (
          <div
            className="absolute -bottom-2 -left-16 -right-4 h-7 bg-gradient-to-l from-amber-300/70 via-[#22e584]/35 to-transparent blur-md transform -skew-x-12"
          />
        )}

        <svg
          viewBox="0 0 180 210"
          className={cn(
            'relative z-10 w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.95)]',
            compact ? 'h-16 sm:h-20' : 'h-24 sm:h-28 lg:h-34'
          )}
        >
          <defs>
            {/* Portal Vortex Gradient */}
            <radialGradient id="bunkerPortalVortex" cx="50%" cy="52%" r="52%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="28%" stopColor="#fef08a" stopOpacity="0.98" />
              <stop offset="62%" stopColor="#22e584" stopOpacity="0.92" />
              <stop offset="88%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#091318" stopOpacity="1" />
            </radialGradient>

            {/* Locked Blast Door Metallic Gradient */}
            <linearGradient id="bunkerSteelDoor" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#090d14" />
            </linearGradient>

            {/* Heavy Outer Frame Armor */}
            <linearGradient id="bunkerArmorFrame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0b1114" />
            </linearGradient>

            {/* Caution Hazard Pattern */}
            <pattern
              id="hazardStripes"
              width="12"
              height="12"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="6" height="12" fill="#f59e0b" />
              <rect x="6" y="0" width="6" height="12" fill="#0b1114" />
            </pattern>
          </defs>

          {/* 1. Top Radar Beacon & Thermal Exhaust Pipes */}
          <rect x="34" y="8" width="12" height="22" rx="2" fill="#1e293b" stroke="#0b1114" strokeWidth="2" />
          <rect x="134" y="8" width="12" height="22" rx="2" fill="#1e293b" stroke="#0b1114" strokeWidth="2" />
          {/* Top Rotating Beacon Dome */}
          <path d="M74,22 L106,22 L100,6 L80,6 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <circle
            cx="90"
            cy="12"
            r="6"
            fill={isOpen ? '#22e584' : '#f59e0b'}
          />
          <circle
            cx="90"
            cy="12"
            r="11"
            fill={isOpen ? '#22e584' : '#f59e0b'}
            opacity="0.35"
          />

          {/* 2. Massive Hexagonal Armored Bunker Frame */}
          <polygon
            points="16,196 24,42 52,20 128,20 156,42 164,196"
            fill="url(#bunkerArmorFrame)"
            stroke={isOpen ? '#22e584' : '#475569'}
            strokeWidth="3.5"
          />

          {/* Inner Recessed Frame Bevel */}
          <polygon
            points="30,194 36,52 58,34 122,34 144,52 150,194"
            fill="#070c0f"
            stroke="#1e293b"
            strokeWidth="2.5"
          />

          {/* Side Thermal Coils (Left & Right Pillars) */}
          {[62, 86, 110, 134, 158].map((y) => (
            <g key={`coil-${y}`}>
              <rect
                x="20"
                y={y}
                width="9"
                height="14"
                rx="2"
                fill={isOpen ? '#22e584' : '#f59e0b'}
                opacity={isOpen ? '0.95' : '0.75'}
              />
              <rect
                x="151"
                y={y}
                width="9"
                height="14"
                rx="2"
                fill={isOpen ? '#22e584' : '#f59e0b'}
                opacity={isOpen ? '0.95' : '0.75'}
              />
            </g>
          ))}

          {/* Top Hazard Stripe Header Bar */}
          <rect x="46" y="38" width="88" height="9" fill="url(#hazardStripes)" stroke="#0b1114" strokeWidth="1.5" />

          {/* 3. DOORWAY INTERIOR: EITHER BLAZING OPEN PORTAL OR ARMORED BLAST DOORS */}
          {isOpen ? (
            <g>
              {/* Blazing Thermal Energy Portal Core */}
              <polygon
                points="40,192 44,58 62,48 118,48 136,58 140,192"
                fill="url(#bunkerPortalVortex)"
              />

              {/* Concentric Energy Rings Inside Portal */}
              <ellipse
                cx="90"
                cy="122"
                rx="38"
                ry="54"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="10 6"
                opacity="0.85"
              />
              <ellipse
                cx="90"
                cy="122"
                rx="24"
                ry="36"
                fill="none"
                stroke="#fef08a"
                strokeWidth="2"
                opacity="0.9"
              />

              {/* Retracted Blast Door Edges on Left & Right */}
              <polygon points="38,192 42,56 54,56 50,192" fill="#0f172a" stroke="#22e584" strokeWidth="1.5" />
              <polygon points="130,192 126,56 138,56 142,192" fill="#0f172a" stroke="#22e584" strokeWidth="1.5" />

              {/* Warm Sanctuary Silhouette & Arrow Inside */}
              <polygon points="90,88 106,114 96,114 96,148 84,148 84,114 74,114" fill="#06281e" opacity="0.85" />
            </g>
          ) : (
            <g>
              {/* Closed Heavy Interlocking Blast Doors */}
              <polygon
                points="40,192 44,58 90,58 90,192"
                fill="url(#bunkerSteelDoor)"
                stroke="#334155"
                strokeWidth="2"
              />
              <polygon
                points="90,192 90,58 136,58 140,192"
                fill="url(#bunkerSteelDoor)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Central Vertical Blast Seam & Reinforcing Ribs */}
              <line x1="90" y1="58" x2="90" y2="192" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 4" />
              <line x1="44" y1="95" x2="136" y2="95" stroke="#334155" strokeWidth="3" />
              <line x1="42" y1="150" x2="138" y2="150" stroke="#334155" strokeWidth="3" />

              {/* Central High-Security Rotating Wheel Lock */}
              <circle cx="90" cy="122" r="22" fill="#0b1114" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="90" cy="122" r="14" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
              <line x1="74" y1="122" x2="106" y2="122" stroke="#fbbf24" strokeWidth="2.5" />
              <line x1="90" y1="106" x2="90" y2="138" stroke="#fbbf24" strokeWidth="2.5" />
              <circle cx="90" cy="122" r="5" fill="#ef4444" />
            </g>
          )}

          {/* 4. Armored Threshold Ramp & Snow Base */}
          <polygon
            points="8,206 18,190 162,190 172,206"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
          />
          <rect x="24" y="194" width="132" height="6" fill="url(#hazardStripes)" />
        </svg>
      </div>
    </div>
  );
};
