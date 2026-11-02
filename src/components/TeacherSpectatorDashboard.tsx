import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  QrCode,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  Award,
  Flame,
  LayoutList,
  Tv,
  DoorOpen,
  Home,
  Pause,
  Play,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  EducationalGameType,
  GamePlayer,
  RoomState,
  LatinosMatchState,
  ImpostorMatchState,
  ElementCard,
} from '../types';
import { playBalatroSound, getSfxMuted, setSfxMuted } from '../lib/soundEffects';
import { socketClient } from '../lib/socketClient';
import { HeatGuardianAtmosphere } from './HeatGuardianBackdrop';
import { computeEscapeRunnerPositions, EscapeRunnerInput } from '../lib/escapeRoomStageLogic';
import {
  ExpandableIconButton,
  LeaveMatchConfirmModal,
  StudentPauseLockOverlay,
} from './MatchControlUI';

export interface TeacherSpectatorDashboardProps {
  gameType: EducationalGameType;
  gameTitle: string;
  room: RoomState | null;
  players: GamePlayer[];
  roomCode: string;
  totalInitialSeconds?: number;
  timeRemainingSecs?: number;
  totalQuestions?: number;
  currentQuestionText?: string;
  latinosState?: LatinosMatchState;
  impostorState?: ImpostorMatchState;
  pokerPhase?: string;
  pokerCommunityCards?: ElementCard[];
  pokerPot?: number;
  geoTargetCountry?: string;
  geoPlayMode?: string;
  onGoLobby: () => void;
  onGoHome?: () => void;
  onOpenSummaryModal?: () => void;
  /** Optional custom full-screen spectator stage (e.g., PokerTable or 100 Latinos TV Board) */
  customSpectatorStage?: React.ReactNode;
  /** Optional external pause state & toggle for solo/local teacher testing */
  isPausedOverride?: boolean;
  onTogglePauseOverride?: () => void;
}

interface NormalizedStudentTelemetry {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
  grade: number;
  progressCurrent: number;
  progressTotal: number;
  wrongCount: number;
  statusLabel: string;
  statusType: 'finished' | 'active' | 'warning' | 'danger';
  team?: 'A' | 'B';
  detailChip: string;
}

export const TeacherSpectatorDashboard: React.FC<TeacherSpectatorDashboardProps> = ({
  gameType,
  gameTitle,
  room,
  players,
  roomCode,
  totalInitialSeconds = 600,
  timeRemainingSecs = 600,
  totalQuestions = 5,
  currentQuestionText,
  latinosState,
  impostorState,
  pokerPhase,
  pokerCommunityCards = [],
  pokerPot = 0,
  geoTargetCountry,
  geoPlayMode,
  onGoLobby,
  onGoHome,
  onOpenSummaryModal,
  customSpectatorStage,
  isPausedOverride,
  onTogglePauseOverride,
}) => {
  // Only 'stage' (Pantalla General) and 'table' (Tabla de Notas) — "Ver Cam" removed across all games
  const [viewMode, setViewMode] = useState<'stage' | 'table'>('stage');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => getSfxMuted());
  const [localPaused, setLocalPaused] = useState<boolean>(false);
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState<'lobby' | 'home' | null>(null);
  const [strideStep, setStrideStep] = useState<0 | 1>(0);

  const isPaused = Boolean(room?.isPaused ?? isPausedOverride ?? localPaused);

  const handleTogglePause = () => {
    playBalatroSound('select');
    if (onTogglePauseOverride) {
      onTogglePauseOverride();
      return;
    }
    if (room) {
      socketClient.togglePause(!room.isPaused);
    } else {
      setLocalPaused((prev) => !prev);
    }
  };

  // Running stride animation for the Escape Room general teacher stage (freezes when paused!)
  useEffect(() => {
    if (isPaused || gameType !== 'escape_room') return;
    const interval = setInterval(() => {
      setStrideStep((prev) => (prev === 0 ? 1 : 0));
    }, 150);
    return () => clearInterval(interval);
  }, [isPaused, gameType]);

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&game=${gameType}`
      : `https://aulaplay.edu?room=${roomCode}&game=${gameType}`;

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSfxMuted(next);
    if (!next) playBalatroSound('click');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const safe = Math.max(0, Math.floor(secs));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const gameMeta = useMemo(() => {
    switch (gameType) {
      case 'escape_room':
        return {
          badge: 'ESCAPE ROOM · PANTALLA GENERAL DOCENTE',
          icon: '🗝️',
          unitName: 'Cámaras',
        };
      case 'cien_latinos':
        return {
          badge: '100 LATINOS DICEN · DUELO DE EQUIPOS',
          icon: '🎤',
          unitName: 'Rondas',
        };
      case 'el_impostor':
        return {
          badge: 'EL IMPOSTOR · INVESTIGACIÓN EN VIVO',
          icon: '🕵️',
          unitName: 'Casos',
        };
      case 'geografia_3d':
        return {
          badge: 'ATLAS 3D · CARTOGRAFÍA MUNDIAL',
          icon: '🌍',
          unitName: 'Países',
        };
      case 'poker_quimico':
      default:
        return {
          badge: 'PÓKER DEL OCTETO · MESA QUÍMICA',
          icon: '🧪',
          unitName: 'Cartas',
        };
    }
  }, [gameType]);

  // Filter real student participants (excluding the teacher spectator host)
  const studentList = useMemo(() => {
    const raw = room?.players || players || [];
    const seen = new Set<string>();
    return raw.filter((p) => {
      if (
        p.isSpectator ||
        p.role === 'teacher' ||
        p.name.toLowerCase().includes('profesor') ||
        p.name.toLowerCase().includes('docente') ||
        (room?.hostIsSpectator && p.id === room?.hostId)
      ) {
        return false;
      }
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [room?.players, room?.hostIsSpectator, room?.hostId, players]);

  // Normalize telemetry per student across all 5 games
  const telemetryRows: NormalizedStudentTelemetry[] = useMemo(() => {
    return studentList
      .map((p) => {
        const team = room?.playerTeams?.[p.id];

        if (gameType === 'escape_room') {
          const prog = p.escapeProgress;
          const totalQ = prog?.totalQuestions || totalQuestions || 4;
          const currentQ = prog?.isVictory ? totalQ : prog?.questionIndex ?? 0;
          const wrong = prog?.wrongAttempts ?? 0;
          const score = prog?.score ?? p.score ?? currentQ * 250;
          const grade =
            prog?.grade ??
            Math.max(
              0,
              Math.min(100, Math.round((currentQ / Math.max(1, totalQ)) * 100) - wrong * 3)
            );

          let statusLabel = `Cámara ${Math.min(totalQ, currentQ + 1)} de ${totalQ}`;
          let statusType: NormalizedStudentTelemetry['statusType'] = 'active';
          if (prog?.isVictory) {
            statusLabel = '¡Escapó con Éxito! 🏆';
            statusType = 'finished';
          } else if (prog?.isGameOver) {
            statusLabel = 'Atrapado por la Sombra 💀';
            statusType = 'danger';
          } else if (wrong >= 2) {
            statusType = 'warning';
          }

          return {
            id: p.id,
            name: p.name,
            avatar: p.avatar || '🧑‍🎓',
            isBot: Boolean(p.isBot),
            score,
            grade,
            progressCurrent: currentQ,
            progressTotal: totalQ,
            wrongCount: wrong,
            statusLabel,
            statusType,
            detailChip: prog?.isVictory
              ? 'Búnker Abierto'
              : `Cámara #${Math.min(totalQ, currentQ + 1)}`,
          };
        }

        if (gameType === 'cien_latinos') {
          const assignedTeam: 'A' | 'B' = team || 'A';
          const teamScore =
            assignedTeam === 'A'
              ? latinosState?.teamAScore ?? 0
              : latinosState?.teamBScore ?? 0;
          const totalR = latinosState?.rounds?.length || totalQuestions || 4;
          const currentR = (latinosState?.currentRoundIndex ?? 0) + 1;
          const grade = Math.min(100, Math.max(65, Math.round(70 + Math.min(30, teamScore / 12))));
          const isTurn = latinosState?.activeTeam === assignedTeam;

          return {
            id: p.id,
            name: p.name,
            avatar: p.avatar || '🎤',
            isBot: Boolean(p.isBot),
            score: teamScore,
            grade,
            progressCurrent: currentR,
            progressTotal: totalR,
            wrongCount: latinosState?.strikes ?? 0,
            statusLabel: isTurn ? '🎤 Turno de su Equipo' : 'Esperando turno',
            statusType: isTurn ? 'active' : 'finished',
            team: assignedTeam,
            detailChip:
              assignedTeam === 'A'
                ? `Equipo A (${latinosState?.teamAName || 'A'})`
                : `Equipo B (${latinosState?.teamBName || 'B'})`,
          };
        }

        if (gameType === 'el_impostor') {
          const stScore = impostorState?.playerScores?.[p.id] ?? p.score ?? 0;
          const totalR = impostorState?.rounds?.length || totalQuestions || 4;
          const currentR = (impostorState?.currentRoundIndex ?? 0) + 1;
          const vote = impostorState?.votes?.[p.id];
          const maxPossible = Math.max(100, totalR * (impostorState?.pointsPerHit || 100));
          const grade = Math.min(
            100,
            Math.max(60, Math.round(60 + (stScore / maxPossible) * 40))
          );

          return {
            id: p.id,
            name: p.name,
            avatar: p.avatar || '🕵️',
            isBot: Boolean(p.isBot),
            score: stScore,
            grade,
            progressCurrent: currentR,
            progressTotal: totalR,
            wrongCount: 0,
            statusLabel: vote
              ? `Votó Sospechoso #${vote.statementIndex + 1} ✓`
              : 'Investigando pistas...',
            statusType: vote ? 'finished' : 'active',
            detailChip: vote ? `Voto #${vote.statementIndex + 1}` : 'Analizando',
          };
        }

        if (gameType === 'geografia_3d') {
          const score = p.score || 0;
          const solved = Math.min(totalQuestions, Math.floor(score / 120));
          const grade = Math.min(100, Math.max(65, Math.round(65 + Math.min(35, score / 18))));

          return {
            id: p.id,
            name: p.name,
            avatar: p.avatar || '🌍',
            isBot: Boolean(p.isBot),
            score,
            grade,
            progressCurrent: solved,
            progressTotal: totalQuestions || 10,
            wrongCount: 0,
            statusLabel: p.statusText || 'Explorando Globo 3D 🌍',
            statusType: 'active',
            detailChip: `${score} pts · Atlas 3D`,
          };
        }

        // Default: Póker Químico del Octeto
        const chips = p.chips ?? 1000;
        const evalValid = p.evaluation?.isValid;
        const formula = p.evaluation?.formula || 'En síntesis...';
        const grade = evalValid ? 95 : p.hasFolded ? 65 : 80;

        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar || '🧪',
          isBot: Boolean(p.isBot),
          score: chips,
          grade,
          progressCurrent: p.selectedCardIds?.length || p.hand?.length || 2,
          progressTotal: 5,
          wrongCount: p.hasFolded ? 1 : 0,
          statusLabel: p.hasFolded
            ? 'Retirado de la mano'
            : p.statusText || 'Sintetizando compuesto',
          statusType: evalValid ? 'finished' : p.hasFolded ? 'warning' : 'active',
          detailChip: evalValid ? `🧪 ${formula}` : `$${chips} fichas`,
        };
      })
      .sort((a, b) => b.score - a.score || b.grade - a.grade);
  }, [
    studentList,
    room?.playerTeams,
    gameType,
    totalQuestions,
    latinosState,
    impostorState,
  ]);

  // Escape Room Runners for the Single General Teacher Screen (with anti-overlap positioning)
  const escapeStageRunners = useMemo(() => {
    const timeRatio = Math.max(
      0,
      Math.min(1, timeRemainingSecs / Math.max(1, totalInitialSeconds))
    );

    const rawInputs: EscapeRunnerInput[] =
      telemetryRows.length > 0
        ? telemetryRows.map((st) => ({
            id: st.id,
            name: st.name,
            avatar: st.avatar,
            questionIndex: st.progressCurrent,
            totalQuestions: st.progressTotal,
            isVictory: st.statusType === 'finished',
            isGameOver: st.statusType === 'danger',
            score: st.score,
            grade: st.grade,
          }))
        : [
            // If 0 live students connected yet, display representative classroom runners so the teacher sees how the general screen works
            {
              id: 'demo-1',
              name: 'Ana Sofía',
              avatar: '👩‍🔬',
              questionIndex: 2,
              totalQuestions: totalQuestions || 4,
              isVictory: false,
              isGameOver: false,
              score: 500,
              grade: 75,
            },
            {
              id: 'demo-2',
              name: 'Mateo R.',
              avatar: '🧑‍🎓',
              questionIndex: 1,
              totalQuestions: totalQuestions || 4,
              isVictory: false,
              isGameOver: false,
              score: 250,
              grade: 50,
            },
            {
              id: 'demo-3',
              name: 'Valentina G.',
              avatar: '👩‍🚀',
              questionIndex: 3,
              totalQuestions: totalQuestions || 4,
              isVictory: false,
              isGameOver: false,
              score: 750,
              grade: 90,
            },
            {
              id: 'demo-4',
              name: 'Lucas M.',
              avatar: '🕵️',
              questionIndex: 1,
              totalQuestions: totalQuestions || 4,
              isVictory: false,
              isGameOver: false,
              score: 250,
              grade: 50,
            },
          ];

    return computeEscapeRunnerPositions(rawInputs, timeRatio);
  }, [telemetryRows, timeRemainingSecs, totalInitialSeconds, totalQuestions]);

  // Aggregate Classroom KPIs
  const classStats = useMemo(() => {
    if (telemetryRows.length === 0) {
      return { avgGrade: 0, completedCount: 0, topStudent: '—' };
    }
    const sumGrades = telemetryRows.reduce((acc, r) => acc + r.grade, 0);
    const avgGrade = Math.round(sumGrades / telemetryRows.length);
    const completedCount = telemetryRows.filter((r) => r.statusType === 'finished').length;
    const topStudent = telemetryRows[0]?.name || '—';
    return { avgGrade, completedCount, topStudent };
  }, [telemetryRows]);

  return (
    <div className="relative w-full min-h-screen h-auto bg-[#0e0c15] text-[#f0f0f2] font-sans select-none flex flex-col justify-between">
      {/* II SILHOUETTE Atmospheric Backdrop */}
      <HeatGuardianAtmosphere
        variant="frost_amber"
        showGuardianScene={false}
        sceneOpacity={0.65}
      />

      {/* Teacher Floating Pause Banner when paused */}
      <StudentPauseLockOverlay
        isPaused={isPaused}
        isTeacher={true}
        onResumeByTeacher={handleTogglePause}
      />

      {/* Confirmation Modal for Sala / Menú during active match */}
      <LeaveMatchConfirmModal
        isOpen={pendingLeaveTarget !== null}
        targetDestination={pendingLeaveTarget}
        onCancel={() => setPendingLeaveTarget(null)}
        onConfirm={() => {
          const target = pendingLeaveTarget;
          setPendingLeaveTarget(null);
          if (target === 'lobby') {
            onGoLobby();
          } else if (target === 'home' && onGoHome) {
            onGoHome();
          }
        }}
      />

      {/* =====================================================================
          1. TOP TEACHER COMMAND HEADER (II SILHOUETTE PALETTE + ROUNDED + EXPANDABLE ICONS)
      ===================================================================== */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3 bg-[#0e0c15]/95 border-b border-zinc-800 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-[0_10px_35px_rgba(14,12,21,0.9)]">
        {/* Left: Game Identity & Room PIN Pill */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#14121d] border border-zinc-700 flex items-center justify-center text-xl shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            {gameMeta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#14121d] border border-zinc-700 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#22e584]">
                ◇ {gameMeta.badge}
              </span>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-2.5 py-0.5 rounded-full bg-[#25242c] hover:bg-[#22e584] text-[#f0f0f2] hover:text-[#0e0c15] border border-zinc-600 text-[10px] font-mono font-black flex items-center gap-1 cursor-pointer transition-colors"
                title="Mostrar QR de la sala"
              >
                <span>PIN: {roomCode}</span>
                <QrCode size={11} />
              </button>
              {isPaused && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#f58233] text-[#0e0c15] text-[10px] font-mono font-black uppercase tracking-wider animate-pulse">
                  ⏸ EN PAUSA
                </span>
              )}
            </div>
            <h1 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.12em] text-[#f0f0f2] truncate max-w-md mt-0.5">
              {gameTitle}
            </h1>
          </div>
        </div>

        {/* Center: Live Classroom Telemetry Pills (Rounded & Friendly) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-[#14121d] border border-zinc-700/80 flex items-center gap-2">
            <Users size={14} className="text-[#22e584]" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Alumnos:</span>
            <span className="font-mono text-sm font-black text-[#f0f0f2]">
              {telemetryRows.length}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#14121d] border border-zinc-700/80 flex items-center gap-2">
            <Award size={14} className="text-[#f58233]" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Promedio:</span>
            <span className="font-mono text-sm font-black text-[#f0f0f2]">
              {classStats.avgGrade}/100
            </span>
          </div>

          {timeRemainingSecs > 0 && (
            <div
              className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black ${
                isPaused
                  ? 'bg-[#25242c] border-[#f58233] text-[#f0f0f2]'
                  : timeRemainingSecs <= 30
                  ? 'bg-[#9e1b24] border-[#f58233] text-[#f0f0f2] animate-pulse'
                  : 'bg-[#14121d] border-zinc-700 text-[#f0f0f2]'
              }`}
            >
              <Clock size={14} className="text-[#22e584]" />
              <span>{formatTime(timeRemainingSecs)}</span>
            </div>
          )}
        </div>

        {/* Right: Expand-on-Hover Icon Controls (Pause, View Switcher, Sound, Fullscreen, Sala, Menú) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Teacher Pause / Resume Button */}
          <ExpandableIconButton
            icon={isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
            label={isPaused ? 'Reanudar Juego' : 'Pausar Juego'}
            variant={isPaused ? 'magenta' : 'primary'}
            onClick={handleTogglePause}
          />

          {/* Switch between Pantalla General ('stage') and Tabla de Notas ('table') */}
          <ExpandableIconButton
            icon={<Tv size={16} />}
            label="Pantalla General"
            variant={viewMode === 'stage' ? 'active' : 'default'}
            onClick={() => {
              playBalatroSound('select');
              setViewMode('stage');
            }}
          />

          <ExpandableIconButton
            icon={<LayoutList size={16} />}
            label="Tabla de Notas"
            variant={viewMode === 'table' ? 'active' : 'default'}
            onClick={() => {
              playBalatroSound('select');
              setViewMode('table');
            }}
          />

          {onOpenSummaryModal && (
            <ExpandableIconButton
              icon={<Trophy size={16} />}
              label="Acta 0-100"
              variant="default"
              onClick={onOpenSummaryModal}
            />
          )}

          <ExpandableIconButton
            icon={
              soundMuted ? (
                <VolumeX size={16} className="text-[#f58233]" />
              ) : (
                <Volume2 size={16} />
              )
            }
            label={soundMuted ? 'Activar Audio' : 'Silenciar'}
            variant="default"
            onClick={toggleSound}
          />

          <ExpandableIconButton
            icon={<Maximize size={16} />}
            label="Pantalla Completa"
            variant="default"
            onClick={toggleFullscreen}
          />

          {/* Sala Button -> Requests confirmation because match is in progress */}
          <ExpandableIconButton
            icon={<DoorOpen size={16} />}
            label="Sala"
            variant="default"
            onClick={() => {
              playBalatroSound('select');
              setPendingLeaveTarget('lobby');
            }}
          />

          {/* Menú Button -> Requests confirmation because match is in progress */}
          {onGoHome && (
            <ExpandableIconButton
              icon={<Home size={16} />}
              label="Menú"
              variant="danger"
              onClick={() => {
                playBalatroSound('select');
                setPendingLeaveTarget('home');
              }}
            />
          )}
        </div>
      </header>

      {/* =====================================================================
          2. MAIN TEACHER VIEWPORT: SINGLE GENERAL STAGE OR GRADES TABLE
      ===================================================================== */}
      {viewMode === 'stage' && customSpectatorStage && gameType !== 'escape_room' ? (
        <main className="relative z-10 flex-1 w-full flex flex-col">
          {customSpectatorStage}
        </main>
      ) : (
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
          {viewMode === 'stage' ? (
            /* =================================================================
               A. SINGLE GENERAL SCREEN FOR ESCAPE ROOM (ALL STUDENTS RUNNING)
            ================================================================= */
            gameType === 'escape_room' ? (
              <div className="space-y-4">
                {/* General Escape Room Corridor Viewport */}
                <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl border border-zinc-700/80 bg-[#0e0c15] shadow-[0_24px_80px_rgba(14,12,21,0.95)] overflow-hidden select-none">
                  {/* Seamless Corridor Background (scrolls when active, freezes when paused) */}
                  <div
                    className={`absolute inset-y-0 left-0 w-[200%] flex ${
                      isPaused ? '' : 'animate-corridor-scroll'
                    }`}
                  >
                    <div
                      className="w-1/2 h-full bg-repeat-x bg-cover bg-bottom opacity-80"
                      style={{
                        backgroundImage: `url('/assets/aistudio/chase_corridor_seamless.png')`,
                      }}
                    />
                    <div
                      className="w-1/2 h-full bg-repeat-x bg-cover bg-bottom opacity-80"
                      style={{
                        backgroundImage: `url('/assets/aistudio/chase_corridor_seamless.png')`,
                      }}
                    />
                  </div>

                  {/* Atmospheric II SILHOUETTE Obsidian & Sunset Amber Tint Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(14,12,21,0.78) 0%, rgba(158,27,36,0.18) 45%, rgba(20,18,29,0.45) 75%, rgba(14,12,21,0.92) 100%)',
                    }}
                  />

                  {/* Top General Stage Status Pill & Giant Countdown Clock */}
                  <div className="absolute top-4 inset-x-4 z-30 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
                    <div className="px-4 py-2 rounded-2xl bg-[#14121d]/90 border border-zinc-700/80 backdrop-blur-md space-y-0.5 shadow-lg">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#22e584]">
                        <span className="w-2 h-2 rotate-45 bg-[#22e584] animate-ping" />
                        <span>◇ PANTALLA GENERAL DEL DOCENTE · CARRERA EN VIVO</span>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-[#f0f0f2]">
                        {telemetryRows.length > 0
                          ? `${telemetryRows.length} estudiantes corriendo hacia el búnker (${totalQuestions} cámaras)`
                          : 'Vista general de demostración · Esperando estudiantes en vivo'}
                      </p>
                    </div>

                    {/* Monumental Clock */}
                    <div className="px-5 py-2 rounded-2xl bg-[#14121d]/90 border border-zinc-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.65)] text-center backdrop-blur-md">
                      <span className="block text-[9px] font-mono uppercase tracking-[0.22em] text-zinc-400">
                        TIEMPO GENERAL RESTANTE
                      </span>
                      <span className="font-mono font-black text-3xl sm:text-4xl text-[#22e584] tracking-wider">
                        {formatTime(timeRemainingSecs)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Chamber Milestones Bar along the top of the track */}
                  <div className="absolute top-24 left-[36%] right-[12%] z-20 hidden sm:flex items-center justify-between px-3 py-1.5 rounded-full bg-[#14121d]/85 border border-zinc-700/80 backdrop-blur-sm">
                    {Array.from({ length: totalQuestions }, (_, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#f0f0f2]/90">
                        <span className="w-5 h-5 rounded-full bg-[#25242c] border border-zinc-600 flex items-center justify-center text-[#22e584] font-black">
                          {idx + 1}
                        </span>
                        <span className="hidden md:inline">Cámara {idx + 1}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-[#22e584]">
                      <span>🚪 META BÚNKER</span>
                    </div>
                  </div>

                  {/* Distinct Subtle Track Lane Lines on the Floor so students are visually separated */}
                  <div className="absolute inset-x-0 bottom-[8%] h-[34%] pointer-events-none z-10 flex flex-col justify-between px-8 opacity-35">
                    {[0, 1, 2, 3, 4, 5].map((lane) => (
                      <div
                        key={lane}
                        className="w-full border-b border-dashed border-zinc-500/40"
                      />
                    ))}
                  </div>

                  {/* Pursuing Shadow Monster on the Left */}
                  <div
                    className="absolute bottom-[12%] left-[8%] sm:left-[10%] z-20 flex flex-col items-center pointer-events-none transition-all duration-500"
                  >
                    <div className="mb-1.5 px-3 py-1 rounded-full bg-[#14121d]/95 border border-[#9e1b24] text-[10px] font-mono font-black uppercase tracking-wider text-[#f58233] shadow-lg">
                      👹 La Sombra Perseguidora
                    </div>
                    <img
                      src="/assets/aistudio/monster_clean.png"
                      alt="Shadow Monster"
                      className={`w-28 h-28 sm:w-36 sm:h-36 object-contain filter drop-shadow-[0_0_25px_rgba(158,27,36,0.75)] ${
                        isPaused ? '' : 'animate-monster-prowl'
                      }`}
                    />
                  </div>

                  {/* Glowing Bunker Exit Gate on the Far Right */}
                  <div className="absolute bottom-[12%] right-[3%] sm:right-[4%] z-20 flex flex-col items-center pointer-events-none">
                    <div className="mb-1.5 px-3 py-1 rounded-full bg-[#14121d]/95 border border-[#22e584] text-[10px] font-mono font-black text-[#22e584] uppercase tracking-wider shadow-lg">
                      🚪 BÚNKER DE SALIDA
                    </div>
                    <div className="w-16 h-28 sm:w-20 sm:h-36 rounded-t-full bg-gradient-to-t from-[#22e584] via-[#10b981]/60 to-[#f0f0f2] border-4 border-[#f0f0f2] shadow-[0_0_40px_rgba(34,229,132,0.7)] flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                  </div>

                  {/* ALL STUDENT RUNNERS ON ONE SINGLE GENERAL SCREEN (NON-OVERLAPPING LANES) */}
                  {escapeStageRunners.map((runner) => {
                    const currentSprite =
                      strideStep === 0
                        ? '/assets/aistudio/player_run_1.png'
                        : '/assets/aistudio/player_run_2.png';

                    return (
                      <div
                        key={runner.id}
                        style={{
                          left: `${runner.leftPct}%`,
                          bottom: `${runner.bottomPct}%`,
                          zIndex: runner.zIndex,
                        }}
                        className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out pointer-events-auto group"
                      >
                        {/* Floating Name & Chamber Pill Above Head (staggered vertically by badgeTier so adjacent labels never collide) */}
                        <div
                          className={`px-3 py-1 rounded-full border backdrop-blur-md shadow-[0_6px_18px_rgba(14,12,21,0.9)] flex items-center gap-1.5 whitespace-nowrap transition-transform group-hover:scale-110 ${
                            runner.badgeTier === 1 ? 'mb-3' : 'mb-1'
                          } ${
                            runner.isVictory
                              ? 'bg-[#14121d]/95 border-[#22e584] text-[#22e584]'
                              : runner.isGameOver
                              ? 'bg-[#9e1b24]/95 border-[#f58233] text-[#f0f0f2]'
                              : 'bg-[#14121d]/95 border-zinc-600 text-[#f0f0f2]'
                          }`}
                        >
                          <span className="text-xs">{runner.avatar}</span>
                          <span className="text-[11px] sm:text-xs font-black tracking-wide">
                            {runner.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-[#25242c] text-[#22e584] font-mono text-[9px] font-black">
                            {runner.isVictory
                              ? 'ESCAPÓ 🏆'
                              : runner.isGameOver
                              ? 'ATRAPADO'
                              : `C${Math.min(runner.totalQuestions, runner.questionIndex + 1)}/${runner.totalQuestions}`}
                          </span>
                        </div>

                        {/* Running Student Character Sprite */}
                        <div className="relative flex flex-col items-center">
                          <img
                            src={currentSprite}
                            alt={runner.name}
                            className={`w-14 h-14 sm:w-16 sm:h-16 object-contain select-none filter drop-shadow-[0_6px_14px_rgba(14,12,21,0.95)] ${
                              runner.isGameOver ? 'grayscale opacity-60 -rotate-12' : ''
                            }`}
                            style={{
                              transform:
                                !isPaused && !runner.isGameOver
                                  ? strideStep === 0
                                    ? 'translateY(-3px) rotate(3deg)'
                                    : 'translateY(1px) rotate(-2deg)'
                                  : undefined,
                            }}
                          />
                          {/* Ground shadow ellipse */}
                          <div className="w-10 h-2.5 rounded-full bg-[#0e0c15]/85 border border-zinc-700/60 -mt-1.5 blur-[0.5px]" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Compact Rounded Student Progress Strip Below the General Screen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {escapeStageRunners.map((r, idx) => (
                    <div
                      key={r.id}
                      className="px-4 py-3 rounded-2xl bg-[#14121d]/90 border border-zinc-700/80 flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#25242c] border border-zinc-600 flex items-center justify-center font-mono text-xs font-black text-[#22e584] shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-lg shrink-0">{r.avatar}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#f0f0f2] truncate">
                            {r.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {r.isVictory
                              ? '¡Búnker Alcanzado!'
                              : `Cámara ${Math.min(r.totalQuestions, r.questionIndex + 1)} de ${r.totalQuestions}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-[#0e0c15] border border-zinc-700 font-mono text-xs font-black text-[#22e584]">
                          {r.grade}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ===============================================================
                 B. GENERAL STAGE VIEW FOR OTHER GAMES (IMPOSTOR / GEO 3D / ETC.)
              =============================================================== */
              <div className="rounded-3xl bg-[#14121d]/95 border border-zinc-700/80 p-5 sm:p-6 shadow-2xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-[#22e584]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#f0f0f2]">
                      ◇ PANTALLA GENERAL DE LA PARTIDA EN VIVO
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#25242c] border border-zinc-600 text-xs font-mono text-[#22e584]">
                    {gameType === 'el_impostor' &&
                      `Ronda ${(impostorState?.currentRoundIndex ?? 0) + 1}/${
                        impostorState?.rounds?.length || totalQuestions
                      }`}
                    {gameType === 'geografia_3d' &&
                      `Objetivo: ${geoTargetCountry || 'Exploración Libre'}`}
                    {gameType === 'poker_quimico' &&
                      `Fase: ${pokerPhase || 'Pre-Flop'} · Bote: $${pokerPot}`}
                  </span>
                </div>

                {currentQuestionText && (
                  <div className="p-4 rounded-2xl bg-[#0e0c15] border border-zinc-800 text-sm sm:text-base font-bold text-[#f0f0f2]">
                    “{currentQuestionText}”
                  </div>
                )}

                {gameType === 'el_impostor' && impostorState && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {impostorState.rounds[impostorState.currentRoundIndex]?.statements.map(
                      (st, idx) => {
                        const votesList = Object.values(impostorState.votes || {}) as Array<{
                          playerId: string;
                          playerName: string;
                          statementIndex: number;
                        }>;
                        const votesForThis = votesList.filter(
                          (v) => v.statementIndex === idx
                        );
                        return (
                          <div
                            key={st.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 ${
                              st.isImpostor
                                ? 'bg-[#9e1b24]/25 border-[#9e1b24]'
                                : 'bg-[#0e0c15] border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black uppercase text-[#f0f0f2]">
                                #{idx + 1} · {st.label}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                  st.isImpostor
                                    ? 'bg-[#9e1b24]/40 text-[#f58233] border border-[#f58233]/50'
                                    : 'bg-[#22e584]/15 text-[#22e584] border border-[#22e584]/40'
                                }`}
                              >
                                {st.isImpostor
                                  ? '🕵️ IMPOSTOR (CLAVE DOCENTE)'
                                  : '✓ VERDADERO'}
                              </span>
                            </div>
                            <p className="text-xs text-[#f0f0f2]/90 leading-relaxed">{st.text}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] font-mono text-[#22e584]">
                              <span>Votos recibidos: {votesForThis.length}</span>
                              <div className="flex flex-wrap gap-1">
                                {votesForThis.map((v) => (
                                  <span
                                    key={v.playerId}
                                    className="px-2 py-0.5 rounded-full bg-[#25242c] border border-zinc-700 text-[#f0f0f2] text-[10px]"
                                  >
                                    {v.playerName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* Connected Students Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {telemetryRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-4 rounded-2xl bg-[#0e0c15] border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#25242c] border border-zinc-600 text-[#22e584] font-mono text-xs font-black flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-2xl shrink-0">{row.avatar}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-[#f0f0f2] truncate">
                            {row.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {row.statusLabel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-black text-[#22e584]">
                          {row.score} pts
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          Nota: {row.grade}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* =================================================================
               C. LIVE GRADES & RANKING TABLE VIEW ('table')
            ================================================================= */
            <div className="rounded-3xl bg-[#14121d]/95 border border-zinc-700/80 shadow-2xl overflow-hidden">
              <div className="px-5 py-4 bg-[#0e0c15] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy size={17} className="text-[#22e584]" />
                  <h2 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                    Tabla Oficial de Posiciones y Calificaciones en Vivo (0 - 100)
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#14121d] border border-zinc-700 text-[11px] font-mono text-[#22e584]">
                  {telemetryRows.length} estudiantes evaluados
                </span>
              </div>

              {telemetryRows.length === 0 ? (
                <div className="p-10 text-center text-sm text-zinc-400 font-mono">
                  Aún no hay registros de estudiantes en esta sesión.
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-[#0e0c15]/60 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        <th className="py-3.5 px-4">#</th>
                        <th className="py-3.5 px-4">Estudiante</th>
                        <th className="py-3.5 px-4">Estado Actual</th>
                        <th className="py-3.5 px-4">Avance ({gameMeta.unitName})</th>
                        <th className="py-3.5 px-4 text-right">Puntaje</th>
                        <th className="py-3.5 px-4 text-right">Calificación (0-100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-xs">
                      {telemetryRows.map((row, idx) => {
                        const pct = Math.min(
                          100,
                          Math.round(
                            (row.progressCurrent / Math.max(1, row.progressTotal)) * 100
                          )
                        );
                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-[#25242c]/40 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-black text-[#22e584]">
                              #{idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{row.avatar}</span>
                                <div>
                                  <span className="font-bold text-[#f0f0f2] block">
                                    {row.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {row.detailChip}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[#f0f0f2]/90">
                              {row.statusLabel}
                            </td>
                            <td className="py-3 px-4 w-48">
                              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                                <span>
                                  {row.progressCurrent}/{row.progressTotal}
                                </span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#0e0c15] rounded-full overflow-hidden border border-zinc-700">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#22e584]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-[#f0f0f2]">
                              {row.score.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-block px-3 py-1 rounded-full font-mono font-black text-xs bg-[#25242c] border border-zinc-600 text-[#22e584]">
                                {row.grade} / 100
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* QR MODAL FOR CLASSROOM PROJECTION */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0c15]/90 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl bg-[#14121d] border border-zinc-700/80 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22e584]">
              ◇ II SILHOUETTE · ACCESO A SALA ◇
            </div>
            <h3 className="font-serif text-lg font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
              Acceso a la Sala · PIN {roomCode}
            </h3>
            <div className="w-56 h-56 rounded-xl bg-[#f0f0f2] p-3 mx-auto shadow-2xl flex items-center justify-center border-2 border-[#22e584]">
              <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} bgColor="#f0f0f2" fgColor="#0e0c15" />
            </div>
            <div className="rounded-xl bg-[#0e0c15] p-3 border border-zinc-800 text-center font-mono">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                Código PIN:
              </span>
              <span className="text-3xl font-black text-[#22e584] tracking-widest">
                {roomCode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 rounded-xl bg-[#25242c] hover:bg-[#2f2e38] border border-zinc-600 text-[#f0f0f2] font-black uppercase tracking-widest text-xs cursor-pointer transition-colors"
            >
              Cerrar QR
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
