import React, { useState, useEffect } from 'react';
import { ElementCard, GamePlayer, GamePhase, EvaluationResult, RoomState } from '../types';
import { Card } from './Card';
import { Seat } from './Seat';
import { CasinoChipStack } from './CasinoChipStack';
import { ReactionVisualizer } from './ReactionVisualizer';
import { MusicControl } from './MusicControl';
import { BalatroChemicalBackground } from './BalatroChemicalBackground';
import { TeacherSpectatorDashboard } from './TeacherSpectatorDashboard';
import { Sparkles, Beaker, CheckCircle2, AlertTriangle, Eye, X, RotateCcw, Home, Maximize2, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { playBalatroSound } from '../lib/soundEffects';
import { socketClient } from '../lib/socketClient';
import {
  ExpandableIconButton,
  LeaveMatchConfirmModal,
  StudentPauseLockOverlay,
  TeacherPauseToggleButton,
} from './MatchControlUI';

interface PokerTableProps {
  phase: GamePhase;
  communityCards: ElementCard[];
  players: GamePlayer[];
  currentUserId: string;
  selectedCardIds: string[];
  evaluation: EvaluationResult;
  onToggleCard: (id: string) => void;
  onAutoOptimize: () => void;
  onAdvancePhase: () => void;
  onLockIn: () => void;
  isHost: boolean;
  pot?: number;
  dealerIndex?: number;
  turnIndex?: number;
  currentBet?: number;
  onFold?: () => void;
  onCallCheck?: () => void;
  onRaise?: (amount: number) => void;
  onReturnToLobby?: () => void;
  onGoHome?: () => void;
  userRole?: 'teacher' | 'student' | null;
  room?: RoomState | null;
}

export function PokerTable({
  phase,
  communityCards,
  players,
  currentUserId,
  selectedCardIds,
  evaluation,
  onToggleCard,
  onAutoOptimize,
  onAdvancePhase,
  onLockIn,
  isHost,
  pot = 0,
  dealerIndex = 0,
  turnIndex = 0,
  currentBet = 0,
  onFold,
  onCallCheck,
  onRaise,
  onReturnToLobby,
  onGoHome,
  userRole,
  room,
}: PokerTableProps) {
  const [showLewisModal, setShowLewisModal] = useState(false);
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(50);
  const [forceShowProjectorCards, setForceShowProjectorCards] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const [confirmExitType, setConfirmExitType] = useState<'lobby' | 'menu' | null>(null);

  const isPaused = Boolean(room?.isPaused ?? localPaused);
  const handleTogglePause = () => {
    playBalatroSound('select');
    if (room?.code) {
      socketClient.togglePause(!isPaused);
    } else {
      setLocalPaused((prev) => !prev);
    }
  };

  const isSolo = !room;
  const mePlayer = players.find((p) => p.id === currentUserId) || players.find((p) => p.isHost && p.isSpectator);
  const isSpectator = Boolean(
    !isSolo && (
      userRole === 'teacher' ||
      mePlayer?.isSpectator ||
      mePlayer?.role === 'teacher' ||
      mePlayer?.name.toLowerCase().includes('profesor') ||
      mePlayer?.name.toLowerCase().includes('docente')
    )
  );

  const isTeacherOrSpectator = (p: GamePlayer) => {
    if (isSolo) return false;
    return Boolean(
      p.isSpectator ||
      p.role === 'teacher' ||
      p.name.toLowerCase().includes('profesor') ||
      p.name.toLowerCase().includes('docente') ||
      (isSpectator && (p.id === currentUserId || p.id === 'hero-player'))
    );
  };

  const hero = isSpectator
    ? null
    : mePlayer && !isTeacherOrSpectator(mePlayer)
    ? mePlayer
    : players.find((p) => !p.isBot && !isTeacherOrSpectator(p)) || null;

  const heroIndex = hero ? players.findIndex((p) => p.id === hero.id) : -1;
  const opponents = players.filter((p) => !isTeacherOrSpectator(p) && p.id !== hero?.id);

  const [lastHandKey, setLastHandKey] = useState<string>('');
  const currentHandKey = players.map((p) => p.hand.map((c) => c?.id || '').join(',')).join('|');

  // Trigger crisp deal audio when a new hand starts
  useEffect(() => {
    if (phase === 'preflop' && currentHandKey !== lastHandKey && players.length > 0) {
      setLastHandKey(currentHandKey);
      playBalatroSound('deal');
    }
  }, [phase, currentHandKey, lastHandKey, players.length]);

  const isMyTurn = turnIndex === heroIndex && !hero?.hasFolded && phase !== 'showdown';
  const toPay = currentBet - (hero?.currentBet || 0);

  // Distribute opponents around the table perimeter with safe offsets inside felt
  const getOpponentSeatClass = (index: number, total: number) => {
    if (total === 1) {
      return 'top-1 sm:top-2 left-1/2 -translate-x-1/2';
    }
    if (total === 2) {
      return index === 0
        ? 'top-1 sm:top-2 left-[25%] -translate-x-1/2'
        : 'top-1 sm:top-2 right-[25%] translate-x-1/2';
    }
    if (total === 3) {
      if (index === 0) return 'top-1 sm:top-2 left-[25%] -translate-x-1/2';
      if (index === 1) return 'top-1 sm:top-2 right-[25%] translate-x-1/2';
      return 'top-1/2 left-1.5 sm:left-3 -translate-y-1/2';
    }
    // 4 or more opponents
    switch (index) {
      case 0: return 'top-1 sm:top-2 left-[22%] -translate-x-1/2'; // Top Left
      case 1: return 'top-1 sm:top-2 right-[22%] translate-x-1/2'; // Top Right
      case 2: return 'top-1/2 left-1.5 sm:left-3 -translate-y-1/2'; // Middle Left
      case 3: return 'top-1/2 right-1.5 sm:right-3 translate-x-1/2 -translate-y-1/2'; // Middle Right
      case 4: return 'top-1 sm:top-2 left-1/2 -translate-x-1/2'; // Top Center
      default: return 'top-1/2 left-1.5 sm:left-3 -translate-y-1/2';
    }
  };

  const getPhaseName = (p: GamePhase) => {
    switch (p) {
      case 'preflop': return 'Pre-Flop (Apuestas)';
      case 'flop': return 'Flop (3 Comunes)';
      case 'turn': return 'Turn (4 Comunes)';
      case 'river': return 'River (5 Comunes)';
      case 'showdown': return 'Showdown (Definición)';
      default: return p;
    }
  };

  useEffect(() => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const toggleMatchFullscreen = () => {
    playBalatroSound('select');
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const tableContent = (
    <div
      className={cn(
        'select-none bg-[#031509] flex flex-col justify-between p-1.5 sm:p-2.5 md:p-3 h-auto',
        isSpectator ? 'flex-1 w-full min-h-full relative' : 'relative w-full min-h-screen h-auto'
      )}
    >
      
      {/* 1. Animated Balatro Swirling Chemical Fluid Plasma Canvas (Matches Start Screen) */}
      <BalatroChemicalBackground intensity={0.7} />
      
      {/* Table Radial Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,_rgba(9,61,24,0.75)_0%,_rgba(5,37,15,0.85)_50%,_rgba(2,18,7,0.95)_100%)] z-0" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_140px_rgba(0,0,0,0.95)] z-0" />

      {/* 1. Top Bar: Back to Sala/Menu Buttons, Phase Status, and Quick Tools (NYNÄ Palette) */}
      <div className="w-full flex items-center justify-between z-40 relative shrink-0 px-2 sm:px-4 pt-1 pb-2">
        
        {/* Left: Sala & Salir de la Partida with Confirmation */}
        <div className="flex items-center gap-2">
          {onReturnToLobby && (
            <ExpandableIconButton
              onClick={() => setConfirmExitType('lobby')}
              icon={<ArrowLeft size={15} />}
              label="Sala"
              variant="secondary"
              title="Volver a la sala"
            />
          )}
          {onGoHome && (
            <ExpandableIconButton
              onClick={() => setConfirmExitType('menu')}
              icon={<Home size={15} />}
              label="Menú"
              variant="danger"
              title="Salir al menú principal"
            />
          )}
          {isHost && !isSpectator && (
            <TeacherPauseToggleButton isPaused={isPaused} onTogglePause={handleTogglePause} />
          )}
        </div>

        {/* Center: Phase Badge */}
        <div className="flex items-center gap-2 shrink min-w-0 mx-1">
          <span className="px-3.5 py-1.5 rounded-full bg-[#040607]/90 border-2 border-[#4928C2] text-[#E3D9FC] font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(4,6,7,0.75)] truncate max-w-[165px] sm:max-w-[240px]">
            {getPhaseName(phase)}
          </span>
          {phase === 'showdown' && (
            <span className="px-2.5 py-1 rounded-full bg-[#BF40FA] text-[#040607] font-mono font-black text-[9px] sm:text-[10px] uppercase tracking-wide animate-pulse shadow-sm">
              Showdown
            </span>
          )}
        </div>

        {/* Right: Music Control, Lewis Structure & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MusicControl />

          <ExpandableIconButton
            onClick={() => setShowLewisModal(true)}
            icon={<Eye size={15} />}
            label="Estructura Lewis"
            variant="primary"
            title="Ver estructura molecular de Lewis"
          />

          <ExpandableIconButton
            onClick={toggleMatchFullscreen}
            icon={<Maximize2 size={15} />}
            label="Pantalla Completa"
            variant="secondary"
            title="Alternar pantalla completa"
          />
        </div>
      </div>

      {/* 2. Main Centered Poker Table Area (Flex Column with Guaranteed Vertical Separation) */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10 px-1 sm:px-3 my-auto min-h-0 py-0.5 overflow-visible">
        
        {/* PHYSICAL OVAL POKER TABLE (Felt containing Opponents, Pot, Community Cards, and Hero) */}
        <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#0b6329] via-[#074b1e] to-[#042e12] rounded-[36px] sm:rounded-[70px] md:rounded-[90px] border-[5px] sm:border-[9px] md:border-[11px] border-[#25150d] shadow-[0_15px_40px_rgba(0,0,0,0.95),inset_0_0_35px_rgba(0,0,0,0.85)] flex flex-col justify-between items-center py-2 sm:py-3.5 px-2 sm:px-5 overflow-visible my-auto min-h-[250px] sm:min-h-[300px] md:min-h-[340px]">
          
          {/* Table Felt Inner Decorative Rings */}
          <div className="absolute inset-1.5 sm:inset-2.5 border border-emerald-300/15 rounded-[34px] sm:rounded-[64px] md:rounded-[80px] pointer-events-none" />
          <div className="absolute inset-3 sm:inset-4 border border-emerald-400/10 rounded-[26px] sm:rounded-[54px] md:rounded-[70px] pointer-events-none" />

          {/* Table Center Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 font-mono text-lg sm:text-2xl md:text-3xl font-black text-emerald-200 uppercase tracking-widest">
            POKER QUÍMICO
          </div>

          {/* Opponent Seats around the outer perimeter */}
          {opponents.map((opp, idx) => {
            const actualPlayerIndex = players.findIndex((p) => p.id === opp.id);
            const isDealer = actualPlayerIndex === dealerIndex;

            return (
              <div
                key={opp.id}
                className={cn('absolute z-30 transition-all pointer-events-auto', getOpponentSeatClass(idx, opponents.length))}
              >
                <Seat player={opp} phase={phase} isDealer={isDealer} forceShowCards={forceShowProjectorCards} />
              </div>
            );
          })}

          {/* Teacher Spectator Notice if 0 students seated yet */}
          {isSpectator && opponents.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none z-20">
              <span className="text-2xl sm:text-3xl mb-1">👨‍🏫</span>
              <span className="font-medieval text-xs sm:text-sm font-bold text-amber-300">
                MESA DE SUPERVISIÓN DOCENTE
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-emerald-200/80 mt-1 max-w-sm">
                Esperando a que los estudiantes tomen asiento en la mesa con el PIN de la clase...
              </span>
            </div>
          )}

          {/* TOP FELT SECTION: Pot Display */}
          <div className="flex flex-col items-center z-20 shrink-0 mt-1 sm:mt-0.5">
            <CasinoChipStack amount={Math.max(pot, 50)} size="sm" className="mb-0.5 scale-75 sm:scale-90" />
            <div className="text-lg sm:text-xl md:text-2xl font-black text-amber-300 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-mono leading-none">
              ${pot.toLocaleString()}
            </div>
            <span className="text-[7px] sm:text-[8px] text-emerald-300/60 font-bold uppercase tracking-widest mt-0.5">
              Bote de la Mesa
            </span>
          </div>

          {/* MIDDLE FELT SECTION: 5 Community Cards (Clean felt space) */}
          <div className="flex flex-col items-center justify-center z-20 my-auto py-0.5 sm:py-1">
            
            {/* Community Cards */}
            <div className="flex space-x-1 sm:space-x-2 md:space-x-2.5 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]">
              {[0, 1, 2, 3, 4].map((i) => {
                const card = communityCards[i];
                const isSelected = card ? selectedCardIds.includes(card.id) : false;

                return (
                  <div
                    key={card?.id || `community-slot-${i}`}
                    className={
                      !card
                        ? 'w-8 h-12 sm:w-11 sm:h-16 md:w-13 md:h-19 bg-emerald-950/40 border-2 border-dashed border-emerald-400/30 rounded-lg flex items-center justify-center shadow-inner'
                        : 'relative'
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {card ? (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: -180, scale: 0.65, rotate: -15 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, y: 60 }}
                          transition={{
                            type: 'spring',
                            damping: 18,
                            stiffness: 48,
                            mass: 1.25,
                            delay: i * 0.22,
                          }}
                          onAnimationStart={() => {
                            try { playBalatroSound('deal'); } catch {}
                          }}
                        >
                          <Card
                            card={card}
                            selected={isSelected}
                            onClick={() => onToggleCard(card.id)}
                            className="w-8 h-12 sm:w-11 sm:h-16 md:w-13 md:h-19 cursor-pointer shadow-xl hover:-translate-y-1 transition-transform"
                            selectedClassName="-translate-y-1.5 ring-3 ring-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.9)]"
                          />
                        </motion.div>
                      ) : (
                        <span className="text-[6px] sm:text-[7px] font-black text-emerald-300/40 uppercase tracking-wider">
                          {i < 3 ? 'FLOP' : i === 3 ? 'TURN' : 'RIVER'}
                        </span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM FELT SECTION: HERO PLAYER HOLE CARDS & SEAT */}
          {hero && (
            <div className="flex flex-col items-center z-30 shrink-0 pt-0.5 pb-0.5">
              
              {/* Hero Hole Cards */}
              <div className="relative flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)] mb-1">
                <AnimatePresence mode="popLayout">
                  {hero.hand.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: -200, scale: 0.65, rotate: -18 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotate: i === 0 ? -5 : 5 }}
                      exit={{ opacity: 0, scale: 0.5, y: 80 }}
                      transition={{
                        type: 'spring',
                        damping: 17,
                        stiffness: 45,
                        mass: 1.3,
                        delay: i * 0.28,
                      }}
                      onAnimationStart={() => {
                        try { playBalatroSound('deal'); } catch {}
                      }}
                      className={cn(
                        'transition-transform duration-200 cursor-pointer',
                        i === 0 ? '-mr-2.5 sm:-mr-3' : 'z-10'
                      )}
                      onClick={() => onToggleCard(card.id)}
                    >
                      <Card
                        card={card}
                        selected={selectedCardIds.includes(card.id)}
                        className="w-12 h-17 sm:w-15 sm:h-22 md:w-17 md:h-25 border-2 shadow-2xl hover:-translate-y-1.5 transition-transform"
                        selectedClassName="-translate-y-2 ring-3 ring-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.9)]"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Hero Balance & Nameplate Block */}
              <div className="relative flex items-center justify-center">
                <div className="flex flex-col items-center min-w-[76px] sm:min-w-[90px] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] z-10">
                  {/* Red Money Ribbon */}
                  <div className="w-full bg-[#832334] border-t-2 border-x-2 border-[#571420] px-1.5 sm:px-2 py-0.5 rounded-t-md text-center shadow-inner">
                    <span className="text-white text-[10px] sm:text-xs font-black tracking-tight font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      ${(hero.chips || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Gold "Tú" Plate */}
                  <div className="w-full bg-[#e8cca0] border-2 border-t-0 border-[#b89559] px-1.5 sm:px-2 py-0.5 rounded-b-md text-center shadow-md">
                    <span className="text-[#3b2311] text-[10px] sm:text-xs font-mono font-bold tracking-tight block leading-tight">
                      Tú (Químico)
                    </span>
                  </div>
                </div>

                {/* Hero Side Chip Stack */}
                <div className="absolute -right-7 sm:-right-8 top-0 z-20 pointer-events-none">
                  <CasinoChipStack amount={hero.chips || 1000} size="sm" />
                </div>

                {/* Dealer Chip Indicator */}
                {dealerIndex === heroIndex && (
                  <div className="absolute -left-5 sm:-left-6 top-0.5 z-20 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border-2 border-red-600 shadow-[0_2px_5px_rgba(0,0,0,0.8)] flex items-center justify-center font-black text-red-600 text-[9px] font-serif leading-none">
                    D
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 3. Bottom Action Bar: Teacher Spectator Controls vs Student Player Action Controls */}
      <div className="w-full flex flex-col items-center z-40 relative shrink-0 pt-1 pb-1">
        {isSpectator ? (
          /* DOCENTE / SPECTATOR READ-ONLY BANNER (NO ACTION BUTTONS) */
          <div className="w-full max-w-2xl bg-[#1b1e28]/95 border-2 border-amber-500/80 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between px-4 text-slate-100 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-medieval text-xs sm:text-sm font-bold text-amber-300">
                👨‍🏫 MODO OBSERVACIÓN DOCENTE (SIN PARTICIPACIÓN EN LA MESA)
              </span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-amber-200 px-2 py-0.5 rounded border border-amber-500/40">
              SOLO LECTURA
            </span>
          </div>
        ) : (
          /* STANDARD STUDENT PLAYER CONTROLS */
          <>
            {/* Molecule Status Pill & Auto Button */}
            <div className="mb-1.5 flex items-center gap-2 bg-[#1b120a]/95 px-3 py-1 rounded-full border border-[#54391b] shadow-xl max-w-full">
              <span
                className={cn(
                  'text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 truncate',
                  evaluation.isValid ? 'text-emerald-400' : 'text-amber-400'
                )}
              >
                {evaluation.isValid ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span className="font-bold uppercase tracking-wide">ESTABLE:</span>
                    <span className="text-amber-300 font-extrabold">{evaluation.formula}</span>
                    {evaluation.name && <span className="text-stone-300 font-medium hidden sm:inline">({evaluation.name})</span>}
                  </>
                ) : (
                  <>
                    <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                    <span className="font-bold uppercase tracking-wide">INESTABLE</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={onAutoOptimize}
                className="text-[10px] text-amber-100 hover:text-white transition-all flex items-center gap-1 font-mono font-bold bg-[#b45309] hover:bg-[#d97706] px-2.5 py-0.5 rounded-md border border-[#78350f] shadow-[0_1px_0_0_#451a03] active:translate-y-0.5 cursor-pointer shrink-0 ml-1.5"
                title="Optimizar combinación molecular automáticamente"
              >
                <Sparkles size={11} className="text-amber-200" />
                <span>Auto</span>
              </button>
            </div>

            {/* Action Buttons Row */}
            <div className="w-full flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6">
            
            {/* Raise Popover */}
            {isRaiseOpen && hero && (
              <div className="absolute bottom-full mb-3 bg-[#2b170c] border-2 border-[#54391b] p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.95)] flex flex-col gap-3 w-72 z-50 animate-in fade-in zoom-in-95 text-[#f4e0ba]">
                <div className="flex justify-between items-center text-xs font-bold font-mono">
                  <span className="text-[#ddbf91]">Apuesta de Subida:</span>
                  <span className="text-white bg-[#b45309] px-2.5 py-0.5 rounded-lg border border-[#78350f] text-sm font-bold">
                    +${raiseAmount}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[25, 50, 100, 200, 300].map((amt) => {
                    const canAfford = (hero.chips || 0) >= amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        disabled={!canAfford}
                        onClick={() => setRaiseAmount(amt)}
                        className={cn(
                          'py-1.5 rounded-lg text-xs font-bold font-mono transition-all border-2 cursor-pointer',
                          raiseAmount === amt
                            ? 'bg-[#b45309] border-[#78350f] text-white shadow-[0_2px_0_0_#451a03]'
                            : canAfford
                            ? 'bg-[#ddbf91] border-[#ba9663] text-[#3b2311] hover:bg-[#f4e0ba]'
                            : 'bg-[#1c120a] border-[#3b2311] text-stone-600 cursor-not-allowed'
                        )}
                      >
                        +${amt}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setRaiseAmount(hero.chips || 0)}
                    className="py-1.5 rounded-lg text-xs font-bold font-mono bg-[#832334] border-2 border-[#571420] text-white hover:bg-[#9a2b3f] transition-all cursor-pointer shadow-[0_2px_0_0_#380b14]"
                  >
                    ALL IN
                  </button>
                </div>

                <input
                  type="range"
                  min={10}
                  max={Math.min(hero.chips || 0, 300)}
                  step={5}
                  value={raiseAmount <= 300 ? raiseAmount : Math.min(hero.chips || 0, 300)}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[#1c120a] border border-[#54391b] rounded-lg appearance-none cursor-pointer accent-[#b45309]"
                />

                <div className="flex gap-2 pt-1 border-t border-[#54391b]">
                  <button
                    type="button"
                    onClick={() => setIsRaiseOpen(false)}
                    className="flex-1 py-1.5 text-xs font-mono font-bold bg-[#3b2311] hover:bg-[#4d2f17] text-[#f4e0ba] border-2 border-[#1e1007] rounded-xl transition-all cursor-pointer shadow-[0_2px_0_0_#120904]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onRaise) onRaise(raiseAmount);
                      setIsRaiseOpen(false);
                    }}
                    className="flex-1 py-1.5 text-xs font-mono font-bold bg-[#b45309] hover:bg-[#d97706] text-white border-2 border-[#78350f] rounded-xl shadow-[0_2px_0_0_#451a03] transition-all cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}

            {/* 1. Fold Button */}
            <button
              onClick={onFold}
              disabled={!isMyTurn}
              className="w-24 sm:w-32 md:w-36 py-2.5 sm:py-3 rounded-xl bg-[#832334] hover:bg-[#9a2b3f] border-2 border-[#571420] text-white font-mono font-black text-xs sm:text-sm tracking-wider shadow-[0_4px_0_0_#380b14] active:translate-y-1 active:shadow-none hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer uppercase"
            >
              Retirarse
            </button>

            {/* 2. Call / Check / Nueva Ronda Button */}
            <button
              onClick={onCallCheck}
              disabled={!isMyTurn && phase !== 'showdown'}
              className={cn(
                'w-28 sm:w-36 md:w-44 py-2.5 sm:py-3 rounded-xl border-2 font-mono font-black text-xs sm:text-sm tracking-wider active:translate-y-1 active:shadow-none hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase',
                phase === 'showdown'
                  ? 'bg-[#b45309] hover:bg-[#d97706] border-[#78350f] text-white shadow-[0_4px_0_0_#451a03]'
                  : 'bg-[#28632e] hover:bg-[#327d39] border-[#163a1a] text-white shadow-[0_4px_0_0_#0e2611]'
              )}
            >
              {phase === 'showdown' ? (
                <span>Nueva Ronda</span>
              ) : toPay > 0 ? (
                <span>Igualar ${toPay}</span>
              ) : (
                <span>Pasar</span>
              )}
            </button>

            {/* 3. Raise Button */}
            <button
              onClick={() => {
                if (isMyTurn) setIsRaiseOpen(!isRaiseOpen);
              }}
              disabled={!isMyTurn}
              className="w-24 sm:w-32 md:w-36 py-2.5 sm:py-3 rounded-xl bg-[#b45309] hover:bg-[#d97706] border-2 border-[#78350f] text-white font-mono font-black text-xs sm:text-sm tracking-wider shadow-[0_4px_0_0_#451a03] active:translate-y-1 active:shadow-none hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer uppercase"
            >
              Subir
            </button>
            </div>
          </>
        )}
      </div>

      {/* Live Lewis Structure Modal (Grimorio Theme) */}
      {showLewisModal && (
        <div className="absolute inset-x-0 top-0 min-h-full h-auto z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm py-8 px-3 sm:px-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full h-auto bg-[#f4e0ba] border-4 border-[#571420] rounded-2xl shadow-2xl flex flex-col text-[#3b2311]">
            <div className="p-3 sm:p-4 border-b-2 border-[#ba9663] bg-[#e8cca0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker size={18} className="text-[#b45309]" />
                <h3 className="text-sm font-bold font-medieval text-[#3b2311]">Estructura Molecular de Lewis</h3>
              </div>
              <button
                onClick={() => setShowLewisModal(false)}
                aria-label="Cerrar estructura de Lewis"
                className="text-[#54391b] hover:text-[#3b2311] p-1 rounded-lg hover:bg-[#ddbf91] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-[#1c140d] flex items-center justify-center overflow-visible">
              <ReactionVisualizer cards={evaluation.cards || []} />
            </div>

            <div className="p-4 bg-[#e5caa0] border-t-2 border-[#ba9663] text-left space-y-1.5">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-sm font-bold font-medieval text-[#3b2311] truncate">{evaluation.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {evaluation.formula && (
                    <span className="text-xs font-mono font-bold text-white bg-[#b45309] px-2 py-0.5 rounded border border-[#78350f]">
                      {evaluation.formula}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs font-mono text-[#4d3215] leading-relaxed">{evaluation.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Student Pause Lock Overlay */}
      <StudentPauseLockOverlay isOpen={isPaused && !isSpectator} />

      {/* Confirmation Modal for Sala / Menú */}
      <LeaveMatchConfirmModal
        isOpen={confirmExitType !== null}
        destinationLabel={confirmExitType === 'lobby' ? 'la Sala de Espera' : 'el Menú Principal'}
        onCancel={() => setConfirmExitType(null)}
        onConfirm={() => {
          const target = confirmExitType;
          setConfirmExitType(null);
          if (target === 'lobby') {
            onReturnToLobby?.();
          } else {
            onGoHome?.();
          }
        }}
      />

    </div>
  );

  if (isSpectator) {
    return (
      <TeacherSpectatorDashboard
        gameType="poker_quimico"
        gameTitle="Póker del Octeto · Estrategia Molecular"
        room={room || null}
        players={players}
        roomCode={room?.code || 'QUÍMICA'}
        totalQuestions={5}
        pokerPhase={getPhaseName(phase)}
        pokerCommunityCards={communityCards}
        pokerPot={pot}
        onGoLobby={onReturnToLobby || onGoHome || (() => {})}
        onGoHome={onGoHome}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        customSpectatorStage={tableContent}
      />
    );
  }

  return tableContent;
}
