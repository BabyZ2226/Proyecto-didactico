import React, { useState, useEffect } from 'react';
import { GamePlayer, EvaluationResult, ElementCard } from '../types';
import { ReactionVisualizer } from './ReactionVisualizer';
import { CasinoChipStack } from './CasinoChipStack';
import { Trophy, RotateCcw, ChevronDown, ChevronUp, FlaskConical, Cpu, Sparkles, ArrowLeft, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { explainTiebreaker } from '../lib/evaluator';
import { playBalatroSound } from '../lib/soundEffects';
import { motion, AnimatePresence } from 'motion/react';

interface ShowdownResultsProps {
  players: GamePlayer[];
  currentUserId?: string;
  isHost?: boolean;
  pot?: number;
  roomCode?: string;
  onNextHand: () => void;
  onReturnToLobby?: () => void;
  onGoHome?: () => void;
}

const MiniCard: React.FC<{ card: ElementCard }> = ({ card }) => {
  const getGroupColor = (group: number) => {
    switch (group) {
      case 1: return 'bg-rose-100 border-rose-300 text-rose-950';
      case 2: return 'bg-orange-100 border-orange-300 text-orange-950';
      case 3: return 'bg-amber-100 border-amber-300 text-amber-950';
      case 4: return 'bg-emerald-100 border-emerald-300 text-emerald-950';
      case 5: return 'bg-cyan-100 border-cyan-300 text-cyan-950';
      case 6: return 'bg-blue-100 border-blue-300 text-blue-950';
      case 7: return 'bg-indigo-100 border-indigo-300 text-indigo-950';
      case 8: return 'bg-purple-100 border-purple-300 text-purple-950';
      default: return 'bg-zinc-100 border-zinc-300 text-zinc-950';
    }
  };

  return (
    <div
      className={cn(
        'w-7 h-10 sm:w-9 sm:h-12 rounded-md border-2 flex flex-col items-center justify-between p-0.5 shadow-sm font-sans shrink-0 transition-transform hover:scale-105 select-none',
        getGroupColor(card.group)
      )}
      title={`${card.name} (${card.symbol}) - Grupo ${card.group}`}
    >
      <span className="text-[8px] font-mono font-bold text-zinc-500 self-start leading-none px-0.5">{card.group}</span>
      <span className="text-xs sm:text-base font-extrabold text-zinc-950 leading-none">{card.symbol}</span>
      <span className="text-[7px] font-semibold text-zinc-600 truncate max-w-full leading-none px-0.5">{card.name}</span>
    </div>
  );
}

function getHandSimpleName(evalData?: EvaluationResult | null, folded?: boolean): { main: string; sub: string; style: string } {
  if (folded) {
    return { main: 'Se retiró', sub: 'Fold', style: 'bg-zinc-800/80 text-zinc-400 border-zinc-700' };
  }
  if (!evalData || !evalData.isValid) {
    return { main: 'Sin combinación', sub: 'Inestable', style: 'bg-stone-800 text-stone-300 border-stone-700' };
  }

  const formulaStr = evalData.formula ? `${evalData.formula}` : '';
  const handName = evalData.pokerHandRank || evalData.name || 'Combinación';

  if (evalData.rank >= 8) {
    return { main: formulaStr ? `${formulaStr} • ${handName}` : handName, sub: 'Flor / Póker', style: 'bg-amber-500 text-amber-950 border-amber-300 font-bold' };
  }
  if (evalData.rank >= 5) {
    return { main: formulaStr ? `${formulaStr} • ${handName}` : handName, sub: 'Combinación Alta', style: 'bg-emerald-500 text-emerald-950 border-emerald-300 font-bold' };
  }
  if (evalData.rank >= 3) {
    return { main: formulaStr ? `${formulaStr} • ${handName}` : handName, sub: 'Molécula Doble', style: 'bg-blue-500 text-blue-950 border-blue-300 font-bold' };
  }
  return { main: formulaStr ? `${formulaStr} • ${handName}` : handName, sub: 'Molécula Simple', style: 'bg-indigo-600 text-white border-indigo-400' };
}

export function ShowdownResults({
  players,
  currentUserId,
  pot = 0,
  roomCode,
  onNextHand,
  onReturnToLobby,
  onGoHome,
}: ShowdownResultsProps) {
  // Sort active players (strictly excluding teacher spectators) by hand strength
  const activeContenders = players.filter(
    (p) =>
      !p.isSpectator &&
      p.role !== 'teacher' &&
      !p.name.toLowerCase().includes('profesor') &&
      !p.name.toLowerCase().includes('docente')
  );
  const sortedPlayers = [...(activeContenders.length > 0 ? activeContenders : players)].sort((a, b) => {
    if (a.hasFolded && !b.hasFolded) return 1;
    if (!a.hasFolded && b.hasFolded) return -1;
    const rankA = a.evaluation?.rank ?? 0;
    const rankB = b.evaluation?.rank ?? 0;
    if (rankB !== rankA) return rankB - rankA;
    return (b.evaluation?.tiebreaker ?? 0) - (a.evaluation?.tiebreaker ?? 0);
  });

  const winner = sortedPlayers[0];
  const isWinnerHuman = winner && winner.id === currentUserId;
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(winner?.id || sortedPlayers[0]?.id);

  const inspectedPlayer = sortedPlayers.find(p => p.id === selectedPlayerId) || winner;

  useEffect(() => {
    playBalatroSound('play');
  }, [winner?.id]);

  const winnerHandInfo = getHandSimpleName(winner?.evaluation, winner?.hasFolded);

  const tieExplain =
    sortedPlayers.length > 1 &&
    sortedPlayers[0]?.evaluation?.isValid &&
    sortedPlayers[1]?.evaluation?.isValid &&
    sortedPlayers[0].evaluation.rank === sortedPlayers[1].evaluation.rank
      ? explainTiebreaker(sortedPlayers[0].evaluation, sortedPlayers[1].evaluation)
      : '';

  return (
    <div className="relative w-full min-h-screen h-auto z-[100] flex items-start justify-center bg-[#0e0c15] py-6 px-3 sm:p-4 select-none">
      {/* Subtle Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.15),rgba(16,185,129,0.1)_45%,transparent_75%)]" />

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="relative max-w-2xl w-full my-auto z-10 bg-zinc-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col gap-4 text-white h-auto"
      >
        {/* Top Winner Card Banner */}
        <div className="relative bg-gradient-to-r from-amber-950/80 via-emerald-950/90 to-amber-950/80 border-2 border-amber-500/60 rounded-2xl p-4 text-center shadow-lg h-auto">
          <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy size={26} className="text-amber-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase">
              {winner?.hasFolded ? (
                <span>¡Ronda Finalizada!</span>
              ) : isWinnerHuman ? (
                <span>¡VICTORIA! ¡Ganaste el Bote!</span>
              ) : (
                <span>¡{winner?.name} GANA LA RONDA!</span>
              )}
            </h2>
          </div>

          {/* Pot Badge */}
          {pot > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-500 text-amber-950 px-4 py-1 rounded-full font-black text-sm sm:text-base shadow-md my-1.5 border border-amber-300">
              <CasinoChipStack amount={pot} size="sm" />
              <span>Bote Ganado: ${pot.toLocaleString()}</span>
            </div>
          )}

          {/* Winner Hand summary */}
          {!winner?.hasFolded && winner?.evaluation?.isValid && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-100">
              <span className="bg-emerald-900/90 text-emerald-200 px-3 py-1 rounded-lg border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={14} className="text-emerald-400" />
                {winnerHandInfo.main}
              </span>
              {tieExplain && (
                <span className="text-[11px] font-mono text-amber-300/90 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800">
                  {tieExplain}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Player Results List */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider px-1">
            Resultados de los Jugadores
          </h3>

          <div className="space-y-2 h-auto pr-1">
            {sortedPlayers.map((player, idx) => {
              const isWinner = player.id === winner?.id;
              const isMe = player.id === currentUserId;
              const handInfo = getHandSimpleName(player.evaluation, player.hasFolded);
              const playerCards = player.evaluation?.cards?.length ? player.evaluation.cards : player.hand;

              return (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer select-none',
                    isWinner
                      ? 'bg-amber-950/40 border-amber-500/70 text-amber-100 shadow-md ring-1 ring-amber-500/30'
                      : isMe
                      ? 'bg-emerald-950/30 border-emerald-600/50 text-white'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                  )}
                >
                  {/* Left: Position, Avatar, Name */}
                  <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                      isWinner ? 'bg-amber-500 text-amber-950 font-black' : 'bg-zinc-700 text-zinc-300'
                    )}>
                      #{idx + 1}
                    </span>

                    <span className="text-xl shrink-0">{player.avatar}</span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold truncate">
                        <span className="truncate text-sm sm:text-base">{player.name}</span>
                        {isMe && (
                          <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider shrink-0">
                            Tú
                          </span>
                        )}
                        {player.isBot && <Cpu size={12} className="text-zinc-400 shrink-0" />}
                        {isWinner && <Trophy size={14} className="text-amber-400 shrink-0" />}
                      </div>

                      {/* Small Subtitle */}
                      <span className="text-[11px] text-zinc-400 font-mono block truncate">
                        {player.hasFolded ? 'Retirado' : handInfo.main}
                      </span>
                    </div>
                  </div>

                  {/* Right: Player's visual mini cards */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center py-0.5">
                    {player.hasFolded ? (
                      <span className="text-xs text-zinc-500 font-mono italic px-2">
                        Cartas descartadas
                      </span>
                    ) : (
                      playerCards.map((card, cIdx) => (
                        <MiniCard key={card.id || `mini-${cIdx}`} card={card} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Toggle: Detailed Chemical Analysis */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              playBalatroSound('select');
              setShowDetails(!showDetails);
            }}
            className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-700 font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FlaskConical size={14} className="text-emerald-400" />
            <span>{showDetails ? 'Ocultar Análisis Científico' : '🔬 Ver Estructura y Enlaces Químicos'}</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showDetails && inspectedPlayer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="h-auto mt-2"
              >
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-400">Análisis para: <strong className="text-white">{inspectedPlayer.name}</strong></span>
                    <span className="text-emerald-400 font-bold">{inspectedPlayer.evaluation?.formula || 'Sin fórmula'}</span>
                  </div>

                  {/* Reaction Canvas */}
                  <div className="w-full min-h-[160px] h-auto flex items-center justify-center bg-black/80 rounded-lg border border-zinc-800 p-2 relative">
                    <ReactionVisualizer cards={inspectedPlayer.evaluation?.cards || []} />
                  </div>

                  {/* Details summary */}
                  {inspectedPlayer.evaluation?.isValid && (
                    <div className="flex flex-wrap items-center justify-around gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                      <span>Enlace: <strong className="text-amber-300">{inspectedPlayer.evaluation.bondType || 'Covalente'}</strong></span>
                      <span>Naturaleza: <strong className="text-emerald-400">{inspectedPlayer.evaluation.chemicalNature || 'Neutro'}</strong></span>
                      <span>Moléculas: <strong className="text-cyan-400">{inspectedPlayer.evaluation.moleculeCount || 1}</strong></span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Action Footer Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playBalatroSound('play');
              onNextHand();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl border-2 border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap"
          >
            <RotateCcw size={16} />
            <span>Siguiente Ronda</span>
          </button>

          {onReturnToLobby && (
            <button
              type="button"
              onClick={() => {
                playBalatroSound('click');
                onReturnToLobby();
              }}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-amber-300 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider whitespace-nowrap"
            >
              <ArrowLeft size={16} />
              <span>Volver a la Sala{roomCode ? ` (${roomCode})` : ''}</span>
            </button>
          )}

          {onGoHome && (
            <button
              type="button"
              onClick={() => {
                playBalatroSound('click');
                onGoHome();
              }}
              className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Home size={16} />
              <span>Menú</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
