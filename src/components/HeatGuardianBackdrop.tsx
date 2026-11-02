import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Maximize, Play, Settings, BookOpen, QrCode, LogOut } from 'lucide-react';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';
import { ExpandableIconButton } from './MatchControlUI';

export interface HeatGuardianMenuItem {
  id: string;
  label: string;
  sublabel?: string;
  onClick: () => void;
  isPrimary?: boolean;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  isDanger?: boolean;
}

export type HeatGuardianVariant =
  | 'frost_amber'
  | 'crimson_mist'
  | 'arctic_cyan'
  | 'golden_ember'
  | 'emerald_lab';

interface HeatGuardianAtmosphereProps {
  /** Subtle tint for the horizon & colossus silhouette atmosphere */
  variant?: HeatGuardianVariant;
  /** Whether to show the silhouette colossus ruin & forest horizon */
  showGuardianScene?: boolean;
  /** Opacity of the background scene when used behind active gameplay boards */
  sceneOpacity?: number;
}

/**
 * Atmospheric backdrop styled with the "II SILHOUETTE" editorial palette:
 * - Obsidian Night: #0e0c15 / #14121d
 * - Alabaster Stone: #f0f0f2
 * - Valus Crimson & Sunset Amber: #9e1b24, #d95338, #f58233
 * - Phaedra Cerulean: #0284c7, #38bdf8
 * - Gaius & Pelagia Emerald & Amethyst: #22e584, #10b981, #a855f7
 */
export const HeatGuardianAtmosphere: React.FC<HeatGuardianAtmosphereProps> = React.memo(({
  variant = 'frost_amber',
  showGuardianScene = true,
  sceneOpacity = 1,
}) => {
  const palette = {
    frost_amber: {
      skyTop: '#0e0c15',
      skyMid: '#181426',
      horizonGlow: '#22e584',
      secondaryGlow: '#a855f7',
      fogColor: '#f0f0f2',
      ruinSilhouette: '#12101b',
    },
    crimson_mist: {
      skyTop: '#0e0c15',
      skyMid: '#241118',
      horizonGlow: '#9e1b24',
      secondaryGlow: '#d95338',
      fogColor: '#f0f0f2',
      ruinSilhouette: '#140d12',
    },
    arctic_cyan: {
      skyTop: '#0e0c15',
      skyMid: '#0d1b2a',
      horizonGlow: '#0284c7',
      secondaryGlow: '#22e584',
      fogColor: '#f0f0f2',
      ruinSilhouette: '#0b131e',
    },
    golden_ember: {
      skyTop: '#0e0c15',
      skyMid: '#261314',
      horizonGlow: '#d95338',
      secondaryGlow: '#9e1b24',
      fogColor: '#f0f0f2',
      ruinSilhouette: '#160d10',
    },
    emerald_lab: {
      skyTop: '#040607',
      skyMid: '#4928C2',
      horizonGlow: '#BF40FA',
      secondaryGlow: '#5B2A62',
      fogColor: '#E3D9FC',
      ruinSilhouette: '#1c0d26',
    },
  }[variant];

  const snowParticles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const seed = (i * 73 + 19) % 100;
      const left = (i * 29 + 7) % 100;
      const size = i % 7 === 0 ? 5 : i % 3 === 0 ? 3 : 2;
      const duration = 9 + (seed % 8);
      const delay = -(seed % 10);
      const opacity = i % 7 === 0 ? 0.6 : 0.2 + (seed % 30) / 100;
      return { id: i, left, size, duration, delay, opacity };
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ opacity: sceneOpacity }}
    >
      {/* 1. Base II SILHOUETTE Obsidian Night + Double-Exposure Colossus Glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 24% 42%, ${palette.horizonGlow}33 0%, ${palette.secondaryGlow}22 36%, ${palette.skyMid} 68%, ${palette.skyTop} 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-85"
        style={{
          background: `linear-gradient(155deg, ${palette.skyTop} 0%, ${palette.skyMid} 48%, ${palette.skyTop} 100%)`,
        }}
      />

      {/* Sacred Geometry Watermark Circles & Diamonds (II SILHOUETTE signature motif) */}
      <svg
        className="absolute right-8 top-10 w-[440px] h-[440px] text-[#f0f0f2]/[0.05] pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.8" strokeDasharray="5 4" />
        <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="0.8" />
        <polygon points="100,12 188,100 100,188 12,100" stroke="currentColor" strokeWidth="0.8" />
        <rect x="42" y="42" width="116" height="116" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="26" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Soft Atmospheric Orbs */}
      <div
        className="absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full blur-[120px] opacity-30"
        style={{ background: palette.horizonGlow }}
      />
      <div
        className="absolute top-1/3 right-[-120px] w-[500px] h-[500px] rounded-full blur-[140px] opacity-25"
        style={{ background: palette.secondaryGlow }}
      />

      {/* 3. Layered SVG Ancient Ruin Arches, Pine Silhouettes & Misty Horizon (II SILHOUETTE style) */}
      {showGuardianScene && (
        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <linearGradient id="hgMistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.horizonGlow} stopOpacity="0.22" />
              <stop offset="55%" stopColor={palette.secondaryGlow} stopOpacity="0.18" />
              <stop offset="100%" stopColor={palette.skyTop} stopOpacity="0.96" />
            </linearGradient>

            <linearGradient id="hgSnowDrift" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.ruinSilhouette} stopOpacity="0.88" />
              <stop offset="100%" stopColor={palette.skyTop} stopOpacity="1" />
            </linearGradient>
          </defs>

          <rect x="0" y="420" width="1920" height="440" fill="url(#hgMistGrad)" />

          {/* Distant Ancient Aqueduct / Bridge Arches (from Gaius Knight & Pelagia Sea in reference image) */}
          <g fill={palette.ruinSilhouette} opacity="0.55">
            <rect x="520" y="670" width="960" height="14" />
            {[560, 680, 800, 920, 1040, 1160, 1280, 1400].map((archX) => (
              <path
                key={archX}
                d={`M${archX},684 L${archX},840 L${archX + 34},840 L${archX + 34},740 A43,43 0 0,1 ${
                  archX + 120
                },740 L${archX + 120},684 Z`}
              />
            ))}
          </g>

          {/* Far background pine & ruin silhouettes */}
          <g fill={palette.ruinSilhouette} opacity="0.65">
            {[
              480, 540, 610, 690, 760, 830, 910, 1080, 1150, 1230, 1310, 1390, 1460, 1540, 1620,
              1700, 1790, 1860,
            ].map((x, idx) => {
              const h = 140 + ((idx * 37) % 105);
              const baseY = 850;
              return (
                <g key={x}>
                  <polygon points={`${x},${baseY - h} ${x - 34},${baseY} ${x + 34},${baseY}`} />
                  <polygon
                    points={`${x},${baseY - h * 0.75} ${x - 44},${baseY} ${x + 44},${baseY}`}
                  />
                </g>
              );
            })}
          </g>

          <ellipse cx="1050" cy="865" rx="760" ry="85" fill={palette.horizonGlow} opacity="0.14" />

          {/* Foreground Ridge */}
          <path
            d="M0,1080 L0,940 Q420,910 760,955 Q1120,860 1540,915 Q1760,940 1920,900 L1920,1080 Z"
            fill="url(#hgSnowDrift)"
          />
        </svg>
      )}

      {/* 4. Subtle Floating Atmospheric Motes (GPU Composited) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {snowParticles.map((flake) => (
          <div
            key={flake.id}
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
            }}
            className="absolute rotate-45 bg-[#f0f0f2]/70 animate-float-mote"
          />
        ))}
      </div>

      {/* 5. Soft Obsidian Vignette Around Screen Edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 55% 50%, transparent 38%, rgba(14, 12, 21, 0.55) 78%, rgba(14, 12, 21, 0.92) 100%)',
        }}
      />
    </div>
  );
});

interface HeatGuardianLobbyShellProps {
  titleLine1: string;
  titleLine2: string;
  subtitleBadge?: string;
  roomCode?: string;
  creditText?: string;
  menuItems: HeatGuardianMenuItem[];
  soundMuted?: boolean;
  onToggleSound?: () => void;
  onToggleFullscreen?: () => void;
  topRightSlot?: React.ReactNode;
  variant?: HeatGuardianVariant;
  footerCredit?: string;
  children: React.ReactNode;
}

/**
 * Curved Circular Portal Arc Lobby Shell keeping the exact distribution and button placement
 * while applying the "II SILHOUETTE" palette and editorial typography (for all games except Póker Químico).
 */
export const HeatGuardianLobbyShell: React.FC<HeatGuardianLobbyShellProps> = React.memo(({
  titleLine1,
  titleLine2,
  subtitleBadge,
  roomCode,
  creditText,
  menuItems,
  soundMuted = false,
  onToggleSound,
  onToggleFullscreen,
  topRightSlot,
  variant = 'frost_amber',
  children,
}) => {
  const displayPin = roomCode || creditText || 'SALA';
  const isPokerLegacy = variant === 'emerald_lab';

  // Accent colors matched to the II SILHOUETTE sections
  const accentColor =
    variant === 'golden_ember' || variant === 'crimson_mist'
      ? '#9e1b24'
      : variant === 'arctic_cyan'
      ? '#0284c7'
      : '#22e584';

  const secondaryAccent =
    variant === 'golden_ember'
      ? '#f58233'
      : variant === 'crimson_mist'
      ? '#22e584'
      : variant === 'arctic_cyan'
      ? '#22e584'
      : '#9e1b24';

  const getMenuIcon = (id: string) => {
    switch (id) {
      case 'audio':
        return soundMuted ? <VolumeX size={24} /> : <Volume2 size={24} />;
      case 'play':
      case 'primary_action':
        return <Play size={24} fill="currentColor" />;
      case 'settings':
      case 'mode_create':
        return <Settings size={24} />;
      case 'library':
      case 'rules':
        return <BookOpen size={24} />;
      case 'qr':
      case 'mode_join':
        return <QrCode size={24} />;
      case 'exit':
      case 'close_modal':
        return <LogOut size={24} />;
      default:
        return <Settings size={24} />;
    }
  };

  // Combine Audio node + menuItems so the curved arc always has the 4-5 circular nodes
  const arcNodes = useMemo(() => {
    const base = [...menuItems];
    if (onToggleSound && !base.some((i) => i.id === 'audio')) {
      base.unshift({
        id: 'audio',
        label: soundMuted ? 'Audio OFF' : 'Audio',
        onClick: onToggleSound,
      });
    }
    return base.slice(0, 6);
  }, [menuItems, onToggleSound, soundMuted]);

  // Exact mathematical coordinates along the outer circle (cx = -60, cy = 400, r = 385 in 520x800 viewBox)
  const arcPositions = useMemo(() => {
    const count = arcNodes.length;
    const minDeg = -52;
    const maxDeg = 52;
    const cx = -60;
    const cy = 400;
    const r = 385;

    return arcNodes.map((item, idx) => {
      const deg =
        count === 1 ? 0 : minDeg + (idx / (count - 1)) * (maxDeg - minDeg);
      const rad = (deg * Math.PI) / 180;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      return {
        item,
        leftPct: (x / 520) * 100,
        topPct: (y / 800) * 100,
        isCenterEmphasis:
          item.isPrimary || item.active || idx === Math.floor(count / 2),
      };
    });
  }, [arcNodes]);

  return (
    <div
      className={cn(
        'relative w-full min-h-screen h-auto select-none font-sans flex flex-col lg:flex-row items-center justify-between overflow-x-hidden',
        isPokerLegacy ? 'bg-[#040607] text-[#E3D9FC]' : 'bg-[#0e0c15] text-[#f0f0f2]'
      )}
    >
      {/* Full-bleed Atmosphere */}
      <HeatGuardianAtmosphere variant={variant} showGuardianScene={true} />

      {/* Top-right minimal icon buttons (superimposed mini-label on hover, no stretching) */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2.5">
        {topRightSlot ? (
          topRightSlot
        ) : (
          <>
            {onToggleSound && (
              <ExpandableIconButton
                icon={
                  soundMuted ? (
                    <VolumeX size={16} className="text-rose-300" />
                  ) : (
                    <Volume2 size={16} className="text-[#f0f0f2]" />
                  )
                }
                label={soundMuted ? 'Activar Audio' : 'Silenciar'}
                onClick={onToggleSound}
                variant="default"
              />
            )}
            {onToggleFullscreen && (
              <ExpandableIconButton
                icon={<Maximize size={16} />}
                label="Pantalla Completa"
                onClick={onToggleFullscreen}
                variant="default"
              />
            )}
          </>
        )}
      </div>

      {/* =====================================================================
          1. LEFT CURVED PORTAL ARC & RADIAL CIRCULAR NODES (DESKTOP)
      ===================================================================== */}
      <aside className="relative z-30 w-full lg:w-[460px] xl:w-[520px] shrink-0 flex flex-col justify-center">
        {/* Desktop Curved Arc Portal */}
        <div className="hidden lg:block relative w-full aspect-[520/800] max-h-[92vh]">
          <svg
            viewBox="0 0 520 800"
            className="w-full h-full overflow-visible pointer-events-none"
          >
            <defs>
              <radialGradient id="silhouettePortalFill" cx="35%" cy="50%" r="65%">
                <stop
                  offset="0%"
                  stopColor={isPokerLegacy ? '#BF40FA' : accentColor}
                  stopOpacity="0.28"
                />
                <stop
                  offset="48%"
                  stopColor={isPokerLegacy ? '#4928C2' : secondaryAccent}
                  stopOpacity="0.22"
                />
                <stop offset="82%" stopColor="#14121d" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#0e0c15" stopOpacity="0.96" />
              </radialGradient>
              <linearGradient id="silhouetteArcStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0f0f2" stopOpacity="0.35" />
                <stop
                  offset="50%"
                  stopColor={isPokerLegacy ? '#BF40FA' : '#22e584'}
                  stopOpacity="0.9"
                />
                <stop offset="100%" stopColor="#f0f0f2" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Inner Glowing Circular Portal Window */}
            <circle
              cx="-60"
              cy="400"
              r="340"
              fill="url(#silhouettePortalFill)"
              stroke="#f0f0f2"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
            {/* Sacred Geometry Dashed Ring inside Portal (II SILHOUETTE motif) */}
            <circle
              cx="-60"
              cy="400"
              r="326"
              fill="none"
              stroke={isPokerLegacy ? '#BF40FA' : '#22e584'}
              strokeOpacity="0.4"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <polygon
              points="-60,110 230,400 -60,690 -350,400"
              fill="none"
              stroke="#f0f0f2"
              strokeOpacity="0.12"
              strokeWidth="1"
            />

            {/* Main Outer Arc Track where the circular buttons sit */}
            <circle
              cx="-60"
              cy="400"
              r="385"
              fill="none"
              stroke="url(#silhouetteArcStroke)"
              strokeWidth="2"
            />
          </svg>

          {/* Portal Window Inner Branding & Title (Left of the Arc) */}
          <div className="absolute inset-y-0 left-0 w-[52%] flex flex-col justify-center pl-6 pr-3 pointer-events-none select-none">
            <div className="space-y-2">
              <AulaPlayLogo size="xs" theme="light" />
              <div className="pt-2">
                <div className="font-serif font-bold uppercase text-2xl xl:text-3xl leading-none tracking-[0.14em] text-[#f0f0f2] drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)]">
                  {titleLine1}
                </div>
                <div
                  className={cn(
                    'font-serif font-bold uppercase text-sm xl:text-base leading-tight tracking-[0.22em] mt-1.5',
                    isPokerLegacy ? 'text-[#BF40FA]' : 'text-[#22e584]'
                  )}
                >
                  ◇ {titleLine2}
                </div>
              </div>
              {subtitleBadge && (
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-300/80 leading-relaxed pt-1">
                  {subtitleBadge}
                </p>
              )}
              <div className="pt-3">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#f0f0f2]/90 border-b border-[#22e584]/60 pb-1">
                  PIN <strong className="text-[#22e584]">{displayPin}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Circular Icon Nodes Positioned Directly Along the Curved Arc */}
          {arcPositions.map(({ item, leftPct, topPct, isCenterEmphasis }) => {
            const isPrimary = item.isPrimary || item.active;
            return (
              <div
                key={item.id}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center group"
              >
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    playBalatroSound(isPrimary ? 'play' : 'select');
                    item.onClick();
                  }}
                  aria-label={item.label}
                  className={cn(
                    'relative rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                    isCenterEmphasis
                      ? 'w-[74px] h-[74px] bg-[#14121d] border-2 border-[#22e584] text-[#f0f0f2] shadow-[0_0_28px_rgba(34,229,132,0.35)] group-hover:border-[#f0f0f2] group-hover:scale-105'
                      : item.isDanger
                      ? 'w-16 h-16 bg-[#14121d] border-2 border-[#9e1b24]/80 hover:border-rose-400 text-[#f0f0f2] hover:text-rose-300 shadow-[0_8px_24px_rgba(0,0,0,0.85)] group-hover:scale-105'
                      : 'w-16 h-16 bg-[#14121d] border-2 border-zinc-500/70 hover:border-[#22e584] text-[#f0f0f2] hover:text-[#22e584] shadow-[0_8px_24px_rgba(0,0,0,0.85)] group-hover:scale-105'
                  )}
                >
                  {/* Double concentric ring on central/primary node */}
                  {isCenterEmphasis && (
                    <span className="pointer-events-none absolute inset-[4px] rounded-full border border-[#f0f0f2]/60" />
                  )}
                  <span
                    className={cn(
                      'transition-colors',
                      isPrimary
                        ? 'text-[#22e584] group-hover:text-[#f0f0f2]'
                        : item.isDanger
                        ? 'text-[#9e1b24] group-hover:text-rose-300'
                        : 'text-[#f0f0f2] group-hover:text-[#22e584]'
                    )}
                  >
                    {getMenuIcon(item.id)}
                  </span>
                </button>

                {/* Label floating cleanly to the right of the circular node along the curve */}
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    playBalatroSound(isPrimary ? 'play' : 'select');
                    item.onClick();
                  }}
                  className="ml-3.5 text-left whitespace-nowrap cursor-pointer disabled:opacity-40 select-none"
                >
                  <span
                    className={cn(
                      'block font-serif uppercase tracking-[0.16em] text-sm xl:text-base transition-colors',
                      isPrimary
                        ? 'font-bold text-[#f0f0f2] group-hover:text-[#22e584]'
                        : 'font-medium text-[#f0f0f2]/85 group-hover:text-[#22e584]'
                    )}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="block text-[10px] font-mono tracking-[0.14em] text-[#22e584]">
                      {item.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet Compact Curved Header & Circular Node Strip */}
        <div className="lg:hidden w-full px-4 pt-4 pb-2 flex flex-col items-center gap-3 border-b border-white/10 bg-[#0e0c15]/80 backdrop-blur-md">
          <div className="text-center">
            <span className="font-serif text-lg font-bold uppercase tracking-[0.18em] text-[#f0f0f2]">
              {titleLine1} <span className="text-[#22e584]">◇ {titleLine2}</span>
            </span>
            <span className="ml-3 text-xs font-mono text-[#22e584]">
              PIN {displayPin}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pb-1">
            {arcNodes.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  playBalatroSound(item.isPrimary ? 'play' : 'select');
                  item.onClick();
                }}
                className="flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span
                  className={cn(
                    'w-12 h-12 rounded-full bg-[#14121d] border-2 flex items-center justify-center',
                    item.isPrimary || item.active
                      ? 'border-[#22e584] text-[#22e584] shadow-[0_0_16px_rgba(34,229,132,0.35)]'
                      : 'border-zinc-600 text-[#f0f0f2]'
                  )}
                >
                  {getMenuIcon(item.id)}
                </span>
                <span className="text-[10px] font-serif uppercase tracking-[0.12em] text-[#f0f0f2]/90">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. RIGHT OPEN TYPOGRAPHIC SETTINGS / LOBBY STAGE
      ===================================================================== */}
      <main className="relative z-20 flex-1 w-full h-auto flex flex-col justify-center items-start px-5 sm:px-10 lg:pl-8 lg:pr-14 py-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
});
