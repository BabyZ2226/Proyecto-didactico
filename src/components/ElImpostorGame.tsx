import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Globe,
  Home,
  QrCode,
  Vote,
  Sparkles,
  Award,
  Trophy,
  Copy,
  Check,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Palette,
  Share2,
  LogOut,
  Clock,
  ArrowLeft,
  Settings,
  DoorOpen,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  GamePlayer,
  RoomState,
  ImpostorGamePack,
  ImpostorMatchState,
  ImpostorVoteRecord,
} from '../types';
import {
  SEED_IMPOSTOR_LIBRARY,
  createInitialImpostorMatchState,
} from '../lib/impostorEngine';
import { ImpostorLibraryModal } from './ImpostorLibraryModal';
import { QRCodeModal } from './QRCodeModal';
import { MatchStartCountdown } from './MatchStartCountdown';
import { TeacherSpectatorDashboard } from './TeacherSpectatorDashboard';
import { socketClient } from '../lib/socketClient';
import { playBalatroSound, isSfxMuted, setSfxMuted } from '../lib/soundEffects';
import { saveMatchRecord } from '../lib/matchHistory';
import { cn } from '../lib/utils';
import {
  HeatGuardianAtmosphere,
  HeatGuardianLobbyShell,
  HeatGuardianMenuItem,
} from './HeatGuardianBackdrop';
import {
  ExpandableIconButton,
  LeaveMatchConfirmModal,
  StudentPauseLockOverlay,
  TeacherPauseToggleButton,
} from './MatchControlUI';

interface ElImpostorGameProps {
  players: GamePlayer[];
  currentUserId: string;
  isTeacherSpectator?: boolean;
  isSoloPractice?: boolean;
  room?: RoomState | null;
  initialPack?: ImpostorGamePack;
  onGoHome: () => void;
}

/**
 * Renders an Among-Us style Crewmate SVG icon in the statement's color.
 */
const AmongUsCrewmateSvg: React.FC<{
  color: 'red' | 'cyan' | 'lime' | 'amber' | 'purple' | 'pink' | 'orange' | 'blue';
  isEjected?: boolean;
  isSelected?: boolean;
  isVoted?: boolean;
  size?: number;
}> = ({ color, isEjected = false, isSelected = false, isVoted = false, size = 80 }) => {
  const palette = {
    red: { body: '#ef4444', shadow: '#991b1b', light: '#fca5a5' },
    cyan: { body: '#06b6d4', shadow: '#155e75', light: '#67e8f9' },
    lime: { body: '#22c55e', shadow: '#166534', light: '#86efac' },
    amber: { body: '#eab308', shadow: '#854d0e', light: '#fde047' },
    purple: { body: '#a855f7', shadow: '#6b21a8', light: '#d8b4fe' },
    pink: { body: '#ec4899', shadow: '#9d174d', light: '#fbcfe8' },
    orange: { body: '#f97316', shadow: '#9a3412', light: '#fdba74' },
    blue: { body: '#3b82f6', shadow: '#1e40af', light: '#93c5fd' },
  }[color] || { body: '#ef4444', shadow: '#991b1b', light: '#fca5a5' };

  if (isEjected) {
    return (
      <svg width={size} height={size * 0.85} viewBox="0 0 100 85" className="shrink-0 transition-transform duration-300">
        <path
          d="M 20,45 C 20,65 30,75 42,75 L 42,82 L 28,82 L 28,70 L 22,70 L 22,82 L 8,82 L 8,50 Z"
          fill={palette.shadow}
          stroke="#090a0f"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 25,40 C 25,60 38,70 50,70 L 50,80 L 38,80 L 38,68 L 32,68 L 32,80 L 20,80 L 20,40 Z"
          fill={palette.body}
          stroke="#090a0f"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 32,42 L 32,20 C 26,18 26,10 32,10 C 35,10 38,14 38,18 C 42,14 46,10 50,14 C 54,18 48,22 42,24 L 42,42 Z"
          fill="#f8fafc"
          stroke="#090a0f"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 34,22 L 34,42 L 40,42 L 40,24" fill="#cbd5e1" opacity="0.6" />
      </svg>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      {isSelected && (
        <div className="absolute inset-0 rounded-full bg-[#22e584]/35 blur-md animate-pulse" />
      )}
      {isVoted && !isSelected && (
        <div className="absolute inset-0 rounded-full bg-[#9e1b24]/30 blur-md" />
      )}

      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 70 80"
        className={cn(
          'shrink-0 transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]',
          isSelected && 'scale-110 -translate-y-1',
          isVoted && 'brightness-105'
        )}
      >
        <rect
          x="6"
          y="24"
          width="14"
          height="34"
          rx="7"
          fill={palette.shadow}
          stroke="#090a0f"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M 18,22 C 18,8 54,8 54,22 L 54,58 L 46,58 L 46,72 L 34,72 L 34,58 L 30,58 L 30,72 L 18,72 L 18,58 Z"
          fill={palette.shadow}
          stroke="#090a0f"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M 22,20 C 22,10 52,10 52,20 L 52,56 L 44,56 L 44,70 L 34,70 L 34,56 L 30,56 L 30,70 L 22,70 L 22,56 Z"
          fill={palette.body}
        />
        <path
          d="M 26,15 C 32,12 44,12 48,15 C 44,18 32,18 26,15 Z"
          fill={palette.light}
          opacity="0.5"
        />
        <rect
          x="30"
          y="18"
          width="34"
          height="22"
          rx="11"
          fill="#090a0f"
        />
        <rect
          x="32"
          y="20"
          width="30"
          height="18"
          rx="9"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="1.5"
        />
        <path
          d="M 34,28 C 38,34 54,34 60,28 L 60,35 C 52,38 40,38 34,35 Z"
          fill="#0369a1"
          opacity="0.75"
        />
        <ellipse
          cx="43"
          cy="24.5"
          rx="7"
          ry="3"
          fill="#ffffff"
          opacity="0.9"
          transform="rotate(-10 43 24.5)"
        />
      </svg>
    </div>
  );
};


export const ElImpostorGame: React.FC<ElImpostorGameProps> = ({
  players,
  currentUserId,
  isTeacherSpectator = false,
  isSoloPractice = false,
  room,
  initialPack,
  onGoHome,
}) => {
  const [selectedPack, setSelectedPack] = useState<ImpostorGamePack>(
    () => initialPack || SEED_IMPOSTOR_LIBRARY[0]
  );
  const [localState, setLocalState] = useState<ImpostorMatchState>(() =>
    createInitialImpostorMatchState(initialPack || SEED_IMPOSTOR_LIBRARY[0])
  );
  const [selectedStatementIdx, setSelectedStatementIdx] = useState<number | null>(null);
  const [inspectingStatementIdx, setInspectingStatementIdx] = useState<number | null>(null);
  const [hoveredStatementIdx, setHoveredStatementIdx] = useState<number | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Pre-game Lobby vs In-game Match Phase & 3-Second Countdown
  const [gamePhase, setGamePhase] = useState<'lobby' | 'playing'>('lobby');
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [localPaused, setLocalPaused] = useState<boolean>(false);
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState<'lobby' | 'home' | null>(null);
  const isPaused = Boolean(room?.isPaused ?? localPaused);

  const handleTogglePause = () => {
    playBalatroSound('select');
    if (room && !isSoloPractice) {
      socketClient.togglePause(!room.isPaused);
    } else {
      setLocalPaused((prev) => !prev);
    }
  };

  // Auto-request fullscreen when match begins
  useEffect(() => {
    if (gamePhase === 'playing') {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  }, [gamePhase]);

  const toggleMatchFullscreen = () => {
    playBalatroSound('select');
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Lobby UI controls
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTeacherConfigOpen, setIsTeacherConfigOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSfxMuted());
  const [currentTheme, setCurrentTheme] = useState<'neon' | 'dungeon' | 'cyber'>('neon');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Teacher Pre-game Configuration State for El Impostor
  const [cfgRoundTime, setCfgRoundTime] = useState<number>(0); // 0 = Sin límite, 30, 45, 60, 90
  const [cfgMaxRounds, setCfgMaxRounds] = useState<number>(0); // 0 = Todas
  const [cfgPointsPerHit, setCfgPointsPerHit] = useState<number>(100);
  const [cfgWrongPenalty, setCfgWrongPenalty] = useState<number>(0);
  const [cfgShuffleRounds, setCfgShuffleRounds] = useState<boolean>(false);
  const [cfgShuffleStatements, setCfgShuffleStatements] = useState<boolean>(true);
  const [cfgHideLiveVotes, setCfgHideLiveVotes] = useState<boolean>(false);
  const [cfgAutoReveal, setCfgAutoReveal] = useState<boolean>(false);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState<number>(0);

  const isHost = room ? room.hostId === currentUserId : true;
  const effectiveIsTeacher = Boolean(
    !isSoloPractice && (
      isTeacherSpectator ||
        (room && room.hostIsSpectator && room.hostId === currentUserId) ||
        (typeof window !== 'undefined' && localStorage.getItem('po_user_role') === 'teacher')
    )
  );
  const roomCode = room?.code || (isSoloPractice ? 'SOLO' : '404888');

  // Auto-provision a live room if mounting in classroom multiplayer mode without one
  useEffect(() => {
    if (!room && !isSoloPractice) {
      const pName =
        localStorage.getItem('po_player_name') || (isTeacherSpectator ? 'Profesor' : 'Estudiante');
      const pAvatar =
        localStorage.getItem('po_player_avatar') || (isTeacherSpectator ? '👨‍🏫' : '🧑‍🎓');
      socketClient.createRoom(
        pName,
        pAvatar,
        0,
        20,
        'Debate: El Impostor en Clase',
        isTeacherSpectator,
        'el_impostor'
      );
    }
  }, [room, isTeacherSpectator, isSoloPractice]);

  // Sync pack if initialPack changes
  useEffect(() => {
    if (initialPack) {
      setSelectedPack(initialPack);
      const next = createInitialImpostorMatchState(initialPack);
      setLocalState(next);
      setSelectedStatementIdx(null);
      if (room && !isSoloPractice) {
        socketClient.updateImpostorState(next);
      }
    }
  }, [initialPack]);

  // Sync phase transitions from multiplayer room
  const prevRoomPhaseRef = useRef<string>(room?.phase || 'lobby');
  useEffect(() => {
    const currentPhase = room?.phase;
    if (!currentPhase) return;
    if (currentPhase !== prevRoomPhaseRef.current) {
      prevRoomPhaseRef.current = currentPhase;
      if (currentPhase === 'countdown') {
        setIsCountdownActive(true);
        setGamePhase('playing');
      } else if (currentPhase === 'playing') {
        setGamePhase('playing');
      } else if (currentPhase === 'lobby') {
        setIsCountdownActive(false);
        setGamePhase('lobby');
      }
    }
  }, [room?.phase]);

  const matchState: ImpostorMatchState =
    !isSoloPractice && room?.impostorState ? room.impostorState : localState;

  // Strictly filter out teacher spectators so the teacher NEVER appears as a connected player
  const studentPlayers = useMemo(() => {
    const list = room?.players || players;
    const seen = new Set<string>();
    return list.filter((p) => {
      if (p.isBot) return false;
      if (
        p.isSpectator ||
        p.role === 'teacher' ||
        p.name.toLowerCase().includes('profesor') ||
        p.name.toLowerCase().includes('docente') ||
        (effectiveIsTeacher &&
          (p.id === room?.hostId || p.id === currentUserId || p.id === 'hero-player'))
      ) {
        return false;
      }
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [room?.players, players, effectiveIsTeacher, room?.hostId, currentUserId]);

  const currentPlayer = useMemo(
    () => studentPlayers.find((p) => p.id === currentUserId) || null,
    [studentPlayers, currentUserId]
  );

  const currentRound =
    matchState.rounds[matchState.currentRoundIndex] || matchState.rounds[0];

  const myVoterId = currentUserId || 'solo-hero';
  const myExistingVote = matchState.votes?.[myVoterId];
  const myScore = matchState.playerScores?.[myVoterId] || 0;

  // Reset local selection when round changes
  useEffect(() => {
    setSelectedStatementIdx(null);
  }, [matchState.currentRoundIndex, matchState.packId]);

  const syncMatchState = (nextState: ImpostorMatchState) => {
    setLocalState(nextState);
    if (!isSoloPractice && room) {
      socketClient.updateImpostorState(nextState);
    }
  };

  const buildTeacherConfig = () => ({
    roundTimeSeconds: cfgRoundTime,
    maxRounds: cfgMaxRounds,
    pointsPerHit: cfgPointsPerHit,
    wrongVotePenalty: cfgWrongPenalty,
    shuffleRounds: cfgShuffleRounds,
    shuffleStatements: cfgShuffleStatements,
    hideLiveVotes: cfgHideLiveVotes,
    autoRevealWhenAllVote: cfgAutoReveal,
  });

  const handleSelectPackFromLibrary = (pack: ImpostorGamePack) => {
    setSelectedPack(pack);
    const next = createInitialImpostorMatchState(pack, buildTeacherConfig());
    setSelectedStatementIdx(null);
    syncMatchState(next);
  };

  const handleStartMatchFromLobby = () => {
    const fresh = createInitialImpostorMatchState(selectedPack, buildTeacherConfig());
    setSelectedStatementIdx(null);
    setLocalState(fresh);
    if (room && !isSoloPractice) {
      socketClient.updateImpostorState(fresh);
      socketClient.startGame();
    }
    setIsCountdownActive(true);
    setGamePhase('playing');
  };

  const handleReturnToLobby = () => {
    setIsCountdownActive(false);
    setGamePhase('lobby');
    if (room && !isSoloPractice) {
      socketClient.returnToLobby();
    }
    playBalatroSound('click');
  };

  const hostDisplay = typeof window !== 'undefined' ? window.location.host : 'aulaplay.edu';
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&game=el_impostor`
      : `https://aulaplay.edu?room=${roomCode}&game=el_impostor`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {}
    setCopiedCode(true);
    playBalatroSound('select');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch {}
    setCopiedUrl(true);
    playBalatroSound('select');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

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

  const themeStyles = {
    neon: {
      leftDoor1: '#ef4444',
      leftDoor2: '#ec4899',
      rightDoor1: '#f97316',
      rightDoor2: '#06b6d4',
      bgGradient: 'from-[#1a0826] via-[#12051a] to-[#0a020f]',
    },
    dungeon: {
      leftDoor1: '#dc2626',
      leftDoor2: '#9333ea',
      rightDoor1: '#b91c1c',
      rightDoor2: '#7e22ce',
      bgGradient: 'from-[#240a12] via-[#140612] to-[#08020a]',
    },
    cyber: {
      leftDoor1: '#10b981',
      leftDoor2: '#06b6d4',
      rightDoor1: '#3b82f6',
      rightDoor2: '#8b5cf6',
      bgGradient: 'from-[#071824] via-[#041019] to-[#02080d]',
    },
  }[currentTheme];

  const handleCastVoteForIndex = (targetIdx: number) => {
    if (isPaused || targetIdx === null || !currentRound) return;

    setSelectedStatementIdx(targetIdx);
    playBalatroSound('play');
    const voterName =
      currentPlayer?.name ||
      localStorage.getItem('po_player_name') ||
      (isTeacherSpectator ? 'Demostración' : 'Estudiante');

    const voteRecord: ImpostorVoteRecord = {
      playerId: myVoterId,
      playerName: voterName,
      playerAvatar: currentPlayer?.avatar || '🕵️',
      statementIndex: targetIdx,
      timestamp: Date.now(),
    };

    const hitPoints = matchState.pointsPerHit || 100;
    const penaltyPoints = matchState.wrongVotePenalty || 0;

    if (isSoloPractice || !room) {
      const isCorrectImpostor =
        currentRound.statements[targetIdx]?.isImpostor === true;
      const deltaPoints = isCorrectImpostor ? hitPoints : -penaltyPoints;
      const currentScores = matchState.playerScores || {};

      const nextState: ImpostorMatchState = {
        ...matchState,
        phase: 'revealed',
        ejectedStatementIndex: targetIdx,
        playerScores: {
          ...currentScores,
          [voteRecord.playerId]: Math.max(0, (currentScores[voteRecord.playerId] || 0) + deltaPoints),
        },
        votes: {
          ...matchState.votes,
          [voteRecord.playerId]: voteRecord,
        },
      };
      setLocalState(nextState);
    } else {
      socketClient.submitImpostorVote(voteRecord);
    }
  };

  const handleCastVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatementIdx !== null) {
      handleCastVoteForIndex(selectedStatementIdx);
    }
  };

  const handleRevealImpostor = () => {
    if (!currentRound) return;
    playBalatroSound('play');

    const hitPoints = matchState.pointsPerHit || 100;
    const penaltyPoints = matchState.wrongVotePenalty || 0;

    const updatedScores: Record<string, number> = {
      ...(matchState.playerScores || {}),
    };
    const voteCounts: Record<number, number> = {};

    (Object.values(matchState.votes || {}) as ImpostorVoteRecord[]).forEach((v) => {
      voteCounts[v.statementIndex] = (voteCounts[v.statementIndex] || 0) + 1;
      const isRightImpostor = currentRound.statements[v.statementIndex]?.isImpostor === true;
      if (isRightImpostor) {
        updatedScores[v.playerId] = (updatedScores[v.playerId] || 0) + hitPoints;
      } else if (penaltyPoints > 0) {
        updatedScores[v.playerId] = Math.max(0, (updatedScores[v.playerId] || 0) - penaltyPoints);
      }
    });

    // Find most voted statement index (or actual impostor if no votes yet)
    const realImpostorIdx = currentRound.statements.findIndex((s) => s.isImpostor);
    let mostVotedIdx = realImpostorIdx;
    let maxVotes = 0;
    Object.entries(voteCounts).forEach(([idxStr, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedIdx = Number(idxStr);
      }
    });

    const nextState: ImpostorMatchState = {
      ...matchState,
      phase: 'revealed',
      ejectedStatementIndex: mostVotedIdx,
      playerScores: updatedScores,
    };

    syncMatchState(nextState);
  };

  // Auto-reveal when all connected students have voted (if enabled by teacher)
  useEffect(() => {
    if (
      gamePhase === 'playing' &&
      !isCountdownActive &&
      matchState.phase === 'debate' &&
      matchState.autoRevealWhenAllVote &&
      (isHost || effectiveIsTeacher) &&
      studentPlayers.length > 0
    ) {
      const currentVotesCount = Object.keys(matchState.votes || {}).length;
      if (currentVotesCount >= studentPlayers.length) {
        handleRevealImpostor();
      }
    }
  }, [
    gamePhase,
    isCountdownActive,
    matchState.phase,
    matchState.autoRevealWhenAllVote,
    matchState.votes,
    isHost,
    effectiveIsTeacher,
    studentPlayers.length,
  ]);

  // Round countdown timer if roundTimeSeconds > 0
  useEffect(() => {
    const configuredSecs = matchState.roundTimeSeconds || 0;
    if (gamePhase !== 'playing' || isCountdownActive || matchState.phase !== 'debate' || configuredSecs <= 0) {
      setRoundSecondsLeft(0);
      return;
    }
    setRoundSecondsLeft(configuredSecs);
  }, [gamePhase, isCountdownActive, matchState.phase, matchState.currentRoundIndex, matchState.roundTimeSeconds]);

  useEffect(() => {
    const configuredSecs = matchState.roundTimeSeconds || 0;
    if (gamePhase !== 'playing' || isPaused || isCountdownActive || matchState.phase !== 'debate' || configuredSecs <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRoundSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isHost || effectiveIsTeacher || isSoloPractice) {
            handleRevealImpostor();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePhase, isPaused, isCountdownActive, matchState.phase, matchState.currentRoundIndex, matchState.roundTimeSeconds]);

  const handleNextRound = () => {
    playBalatroSound('select');
    if (matchState.currentRoundIndex + 1 < matchState.rounds.length) {
      const nextState: ImpostorMatchState = {
        ...matchState,
        currentRoundIndex: matchState.currentRoundIndex + 1,
        phase: 'debate',
        votes: {},
        ejectedStatementIndex: null,
      };
      syncMatchState(nextState);
    } else {
      const finishedState: ImpostorMatchState = {
        ...matchState,
        phase: 'finished',
      };
      syncMatchState(finishedState);

      const maxPossible = Math.max(100, matchState.rounds.length * 100);
      const scoresMap = matchState.playerScores || {};
      const myFinalScore = scoresMap[myVoterId] || 0;
      const myGrade = Math.min(100, Math.max(60, Math.round((myFinalScore / maxPossible) * 100)));

      // Save individual match history record
      saveMatchRecord({
        gameType: 'el_impostor',
        gameTitle: `El Impostor: ${matchState.packTitle}`,
        roomCode: room?.code || 'SOLO',
        role: isTeacherSpectator ? 'teacher' : 'student',
        playerName: currentPlayer?.name || room?.teacherName || 'Detective',
        playerAvatar: currentPlayer?.avatar || '🕵️',
        grade: myGrade,
        score: myFinalScore,
        isVictory: myFinalScore >= maxPossible * 0.6,
        statusText: `Puntaje Individual: ${myFinalScore} pts`,
        detailsText: `Investigación Individual (${matchState.rounds.length} rondas)`,
        studentResults: studentPlayers.map((p) => {
          const stScore = scoresMap[p.id] || 0;
          const stGrade = Math.min(100, Math.max(60, Math.round((stScore / maxPossible) * 100)));
          return {
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            grade: stGrade,
            score: stScore,
            escapedOrWon: stScore >= maxPossible * 0.6,
            details: `${stScore} pts (${Math.round(stScore / 100)}/${matchState.rounds.length} impostores detectados)`,
          };
        }),
      });
    }
  };

  const handleRestartMatch = () => {
    playBalatroSound('select');
    const fresh: ImpostorMatchState = {
      ...matchState,
      currentRoundIndex: 0,
      phase: 'debate',
      playerScores: {},
      votes: {},
      ejectedStatementIndex: null,
    };
    syncMatchState(fresh);
  };

  const votesList: ImpostorVoteRecord[] = useMemo(
    () => Object.values(matchState.votes || {}),
    [matchState.votes]
  );

  const realImpostorIndex = useMemo(
    () => currentRound?.statements.findIndex((s) => s.isImpostor) ?? 0,
    [currentRound]
  );

  // Individual leaderboard for finished screen
  const individualRanking = useMemo(() => {
    const scoresMap = matchState.playerScores || {};
    if (isSoloPractice || studentPlayers.length === 0) {
      const soloName =
        currentPlayer?.name ||
        localStorage.getItem('po_player_name') ||
        'Detective';
      return [
        {
          id: myVoterId,
          name: soloName,
          avatar: currentPlayer?.avatar || '🕵️',
          score: scoresMap[myVoterId] || 0,
        },
      ];
    }

    return studentPlayers
      .map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: scoresMap[p.id] || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [matchState.playerScores, isSoloPractice, studentPlayers, currentPlayer, myVoterId]);

  const selectedStatement =
    selectedStatementIdx !== null ? currentRound?.statements[selectedStatementIdx] : null;

  // ============================================================================
  // A. UNIFIED PRE-GAME WAITING ROOM / LOBBY VIEW (HEAT GUARDIAN MONOLITH STYLE)
  // ============================================================================
  if (gamePhase === 'lobby') {
    const canControlLobby = isHost || effectiveIsTeacher || isSoloPractice;
    const impostorMenuItems: HeatGuardianMenuItem[] = [
      {
        id: 'play',
        label: canControlLobby ? 'JUGAR' : 'ESPERANDO...',
        active: true,
        disabled: !canControlLobby,
        onClick: () => {
          if (canControlLobby) {
            playBalatroSound('play');
            handleStartMatchFromLobby();
          }
        },
      },
      ...(canControlLobby
        ? [
            {
              id: 'settings',
              label: 'AJUSTES',
              badge: cfgRoundTime > 0 ? `${cfgRoundTime}S` : 'LIBRE',
              onClick: () => {
                playBalatroSound('select');
                setIsTeacherConfigOpen(true);
              },
            },
          ]
        : []),
      {
        id: 'library',
        label: 'BIBLIOTECA',
        badge: `${SEED_IMPOSTOR_LIBRARY.length}+`,
        onClick: () => {
          playBalatroSound('click');
          setIsLibraryOpen(true);
        },
      },
      {
        id: 'qr',
        label: 'CÓDIGO QR',
        onClick: () => {
          playBalatroSound('click');
          setIsQrModalOpen(true);
        },
      },
      {
        id: 'exit',
        label: 'SALIR',
        onClick: onGoHome,
      },
    ];

    if (isLibraryOpen) {
      return (
        <ImpostorLibraryModal
          isOpen={isLibraryOpen}
          defaultAuthorName={
            room?.teacherName ||
            localStorage.getItem('po_player_name') ||
            'Docente'
          }
          onClose={() => setIsLibraryOpen(false)}
          onSelectPack={(pack) => {
            setIsLibraryOpen(false);
            handleSelectPackFromLibrary(pack);
          }}
        />
      );
    }

    return (
      <HeatGuardianLobbyShell
        titleLine1="EL"
        titleLine2="IMPOSTOR"
        subtitleBadge="INVESTIGACIÓN INDIVIDUAL · 3 VERDADES Y 1 MENTIRA"
        creditText={`EXPEDIENTE PIN · ${roomCode}`}
        variant="crimson_mist"
        menuItems={impostorMenuItems}
        topRightSlot={
          <div className="flex items-center gap-2 font-mono text-xs">
            <ExpandableIconButton
              onClick={() => {
                playBalatroSound('click');
                setIsLibraryOpen(true);
              }}
              icon={<Globe size={15} />}
              label="Expedientes"
              badge={`${SEED_IMPOSTOR_LIBRARY.length}+`}
              variant="primary"
            />

            <ExpandableIconButton
              onClick={toggleSound}
              icon={soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              label={soundMuted ? 'Activar Sonido' : 'Silenciar'}
              variant="secondary"
            />

            <ExpandableIconButton
              onClick={toggleFullscreen}
              icon={<Maximize size={15} />}
              label="Pantalla Completa"
              variant="secondary"
            />

            <ExpandableIconButton
              onClick={onGoHome}
              icon={<LogOut size={15} />}
              label="Salir"
              variant="danger"
            />
          </div>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-2xl text-[#f0f0f2] space-y-9 py-4"
        >
          {/* Top Wide-Tracked Header (II SILHOUETTE style) + Floating QR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#9e1b24] mb-1">
                <span>◇</span>
                <span>II SILHOUETTE · VALUS ARCHIVE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-[0.18em] uppercase text-[#f0f0f2] drop-shadow-[0_4px_20px_rgba(14,12,21,0.9)]">
                Sala de Clase
              </h1>
              <p className="text-xs font-mono tracking-[0.16em] text-[#22e584] mt-1">
                {matchState.packTitle} · {matchState.rounds.length} Rondas
              </p>
            </div>

            <div
              onClick={() => setIsQrModalOpen(true)}
              className="w-20 h-20 bg-[#f0f0f2] p-2 rounded-2xl shadow-[0_8px_25px_rgba(158,27,36,0.35)] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center border-2 border-[#9e1b24] shrink-0"
              title="Clic para agrandar QR"
            >
              <QRCodeSVG value={joinUrl} size={68} level="M" includeMargin={false} bgColor="#f0f0f2" fgColor="#0e0c15" />
            </div>
          </div>

          {/* SECTION 1: Código PIN & Enlace (Horizontal dot-and-underline bar) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-[0.18em] uppercase text-[#f0f0f2]">
                Código PIN
              </h2>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-3xl sm:text-5xl font-black font-mono tracking-[0.25em] text-[#f0f0f2] hover:text-[#22e584] transition-colors cursor-pointer drop-shadow-[0_4px_18px_rgba(34,229,132,0.35)]"
                title="Clic para copiar código"
              >
                {roomCode}
              </button>
            </div>

            <div className="relative grid grid-cols-3 border-b border-zinc-700/80">
              <button
                type="button"
                onClick={handleCopyCode}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#f0f0f2] font-bold cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-[#22e584] shadow-[0_0_10px_#22e584]" />
                <span>{copiedCode ? 'PIN Copiado' : 'Copiar PIN'}</span>
                <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#22e584] shadow-[0_0_12px_#22e584]" />
              </button>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>{copiedUrl ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>Ampliar QR</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Configuración de Expediente (Horizontal dot-and-underline bar) */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-[0.18em] uppercase text-[#f0f0f2]">
              Configuración de Partida
            </h2>

            <div className="relative grid grid-cols-3 border-b border-zinc-700/80">
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('select');
                  setIsLibraryOpen(true);
                }}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#f0f0f2] font-bold cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-[#9e1b24] shadow-[0_0_10px_#9e1b24]" />
                <span>Expedientes ({matchState.rounds.length})</span>
                <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#9e1b24] shadow-[0_0_12px_#9e1b24]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playBalatroSound('select');
                  setIsTeacherConfigOpen(true);
                }}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>Ajustes ({cfgRoundTime > 0 ? `${cfgRoundTime}s` : 'Libre'})</span>
              </button>

              <div className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400">
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>3 Verdades · 1 Mentira</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Detectives Conectados (Horizontal dot-and-underline bar) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-[0.18em] uppercase text-[#f0f0f2]">
                Estudiantes ({studentPlayers.length})
              </h2>

              {canControlLobby ? (
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    handleStartMatchFromLobby();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#25242c] hover:bg-[#32303c] text-[#f0f0f2] border border-[#22e584]/60 font-black text-xs cursor-pointer shadow-[0_12px_28px_rgba(14,12,21,0.85)] transition-all flex items-center justify-center gap-2.5 tracking-[0.2em] uppercase"
                >
                  <span className="w-5 h-5 rounded bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[10px] font-black">
                    ▼
                  </span>
                  <span>Iniciar Partida</span>
                </button>
              ) : (
                <div className="text-xs font-mono text-[#22e584] flex items-center gap-1.5">
                  <Clock size={14} className="animate-spin" />
                  <span>Esperando al docente...</span>
                </div>
              )}
            </div>

            <div className="relative flex flex-wrap items-center gap-6 border-b border-zinc-700/80 pb-3.5 pt-1">
              {studentPlayers.length === 0 ? (
                <div className="relative flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.12em] text-zinc-400">
                  <span className="w-2 h-2 rotate-45 bg-[#22e584] animate-pulse" />
                  <span>Esperando detectives con el PIN {roomCode}...</span>
                  <span className="pointer-events-none absolute bottom-[-15px] left-0 right-0 h-[3px] bg-[#22e584]" />
                </div>
              ) : (
                studentPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="relative flex items-center gap-2 text-xs sm:text-sm tracking-[0.1em] text-[#f0f0f2] font-bold"
                  >
                    <span className="w-2 h-2 rotate-45 bg-[#22e584] shadow-[0_0_8px_#22e584]" />
                    <span>{p.avatar} {p.name}</span>
                    {idx === 0 && (
                      <span className="pointer-events-none absolute bottom-[-15px] left-0 right-0 h-[3px] bg-[#22e584]" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* QR MODAL PREVIEW */}
        <AnimatePresence>
          {isQrModalOpen && (
            <div className="absolute inset-x-0 top-0 min-h-full h-auto z-50 flex items-start justify-center bg-[#0e0c15]/90 backdrop-blur-md py-8 px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#14121d] border-2 border-[#9e1b24] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
              >
                <h3 className="font-serif text-lg font-bold uppercase tracking-[0.18em] text-[#f0f0f2]">
                  Código QR · El Impostor
                </h3>
                <p className="font-mono text-xs text-zinc-400">
                  Los estudiantes pueden escanear este código para unirse a la investigación:
                </p>
                <div className="w-56 h-56 bg-[#f0f0f2] p-3 rounded-xl mx-auto shadow-2xl flex items-center justify-center border-2 border-[#9e1b24]/40">
                  <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} bgColor="#f0f0f2" fgColor="#0e0c15" />
                </div>
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-700 text-center font-mono">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    PIN de la sala:
                  </span>
                  <span className="text-3xl font-black text-[#f0f0f2] tracking-widest">{roomCode}</span>
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#25242c] hover:bg-[#32303c] border border-[#22e584]/60 text-[#f0f0f2] font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Cerrar QR
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Infinite Library Modal */}
        <ImpostorLibraryModal
          isOpen={isLibraryOpen}
          defaultAuthorName={room?.teacherName || localStorage.getItem('po_player_name') || 'Docente'}
          onClose={() => setIsLibraryOpen(false)}
          onSelectPack={(pack) => {
            setIsLibraryOpen(false);
            handleSelectPackFromLibrary(pack);
          }}
        />

        {/* TEACHER PRE-GAME CONFIGURATION MODAL (EL IMPOSTOR - II SILHOUETTE STYLE) */}
        <AnimatePresence>
          {isTeacherConfigOpen && (
            <div className="absolute inset-x-0 top-0 min-h-full h-auto z-50 flex items-start justify-center bg-[#0e0c15]/90 backdrop-blur-md py-8 px-4">
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-[#14121d] border-2 border-[#9e1b24] rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-[0_24px_70px_rgba(14,12,21,0.95)] text-xs font-sans text-[#f0f0f2] h-auto"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Settings size={18} className="text-[#9e1b24]" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#9e1b24] block">
                        ◇ II SILHOUETTE · PARÁMETROS
                      </span>
                      <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                        Configuraciones del Docente · El Impostor
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTeacherConfigOpen(false)}
                    aria-label="Cerrar configuración"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-[#f0f0f2] hover:bg-[#25242c] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* 1. Tiempo de Votación por Ronda */}
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                    ⏱️ Tiempo Límite de Investigación y Votación por Ronda
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { v: 0, label: 'Sin reloj' },
                      { v: 30, label: '30 seg' },
                      { v: 45, label: '45 seg' },
                      { v: 60, label: '60 seg' },
                      { v: 90, label: '90 seg' },
                    ].map((t) => (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => {
                          playBalatroSound('select');
                          setCfgRoundTime(t.v);
                        }}
                        className={`py-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                          cfgRoundTime === t.v
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300 hover:text-[#f0f0f2]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Cantidad de Rondas a Jugar */}
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                    🔢 Cantidad de Rondas a Jugar (Expediente tiene {selectedPack.rounds.length})
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { v: 0, label: `Todas (${selectedPack.rounds.length})` },
                      { v: 1, label: '1 Ronda' },
                      { v: 2, label: '2 Rondas' },
                      { v: 3, label: '3 Rondas' },
                      { v: 4, label: '4 Rondas' },
                    ].map((r) => (
                      <button
                        key={r.v}
                        type="button"
                        onClick={() => {
                          playBalatroSound('select');
                          setCfgMaxRounds(r.v);
                        }}
                        className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                          cfgMaxRounds === r.v
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300 hover:text-[#f0f0f2]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Puntos por Acierto & Penalización por Error */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#22e584] block">
                      🏆 Puntos por Detectar Impostor
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[100, 150, 200, 250].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setCfgPointsPerHit(pts)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                            cfgPointsPerHit === pts
                              ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                              : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                          }`}
                        >
                          +{pts}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#f58233] block">
                      ⚠️ Penalización por Error
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { v: 0, label: '0 pts' },
                        { v: 25, label: '-25 pts' },
                        { v: 50, label: '-50 pts' },
                      ].map((pen) => (
                        <button
                          key={pen.v}
                          type="button"
                          onClick={() => setCfgWrongPenalty(pen.v)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                            cfgWrongPenalty === pen.v
                              ? 'bg-[#9e1b24] text-[#f0f0f2] border-[#f0f0f2]'
                              : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {pen.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Aleatoriedad de Posición del Impostor y Rondas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                      🔀 Barajar Posición Impostor
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCfgShuffleStatements(true)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          cfgShuffleStatements
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Aleatoria
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgShuffleStatements(false)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          !cfgShuffleStatements
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Posición Fija
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                      🔀 Orden de las Rondas
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCfgShuffleRounds(false)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          !cfgShuffleRounds
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Secuencial
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgShuffleRounds(true)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          cfgShuffleRounds
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Barajar Rondas
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Voto Secreto vs Público & Auto-Revelación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                      👁️ Visibilidad de Votos
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCfgHideLiveVotes(false)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          !cfgHideLiveVotes
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        👁️ Público
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgHideLiveVotes(true)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          cfgHideLiveVotes
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        🔒 Secreto
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                      ⚡ Revelar al Votar Todos
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCfgAutoReveal(false)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          !cfgAutoReveal
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Manual (Docente)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgAutoReveal(true)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          cfgAutoReveal
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Automático
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    const updated = createInitialImpostorMatchState(selectedPack, buildTeacherConfig());
                    syncMatchState(updated);
                    setIsTeacherConfigOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#25242c] hover:bg-[#32303c] border border-[#22e584]/60 text-[#f0f0f2] font-black uppercase tracking-[0.2em] text-xs cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="w-5 h-5 rounded bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[10px] font-black">
                    ▼
                  </span>
                  <span>Guardar y Aplicar Configuraciones</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </HeatGuardianLobbyShell>
    );
  }

  // ============================================================================
  // B. ACTIVE INVESTIGATION & VOTING STAGE (II SILHOUETTE STYLE)
  // ============================================================================
  if (effectiveIsTeacher) {
    return (
      <div className="relative w-full min-h-screen h-auto">
        {isCountdownActive && (
          <MatchStartCountdown
            onComplete={() => setIsCountdownActive(false)}
            subtitle="¡EL IMPOSTOR · MONITOREO DOCENTE!"
          />
        )}
        <TeacherSpectatorDashboard
          gameType="el_impostor"
          gameTitle={matchState.packTitle}
          room={room || null}
          players={players}
          roomCode={roomCode}
          totalInitialSeconds={cfgRoundTime || 120}
          timeRemainingSecs={roundSecondsLeft}
          totalQuestions={matchState.rounds.length}
          currentQuestionText={currentRound?.prompt}
          impostorState={matchState}
          onGoLobby={handleReturnToLobby}
          onGoHome={onGoHome}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen h-auto bg-[#0e0c15] text-[#f0f0f2] flex flex-col justify-between select-none p-2 sm:p-3.5">
      {/* Fluid 3-2-1 Countdown Overlay */}
      {isCountdownActive && (
        <MatchStartCountdown
          onComplete={() => setIsCountdownActive(false)}
          subtitle="¡EL IMPOSTOR · INVESTIGACIÓN INDIVIDUAL!"
        />
      )}

      {/* Global Student Pause Lock Overlay */}
      <StudentPauseLockOverlay
        isPaused={isPaused}
        isTeacher={effectiveIsTeacher}
        onResumeByTeacher={handleTogglePause}
      />

      {/* Confirmation Modal for Sala / Menú during Active Match */}
      <LeaveMatchConfirmModal
        isOpen={pendingLeaveTarget !== null}
        targetDestination={pendingLeaveTarget}
        onCancel={() => setPendingLeaveTarget(null)}
        onConfirm={() => {
          const target = pendingLeaveTarget;
          setPendingLeaveTarget(null);
          if (target === 'lobby') {
            handleReturnToLobby();
          } else if (target === 'home') {
            onGoHome();
          }
        }}
      />

      {/* II SILHOUETTE Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <HeatGuardianAtmosphere
          variant="crimson_mist"
          showGuardianScene={false}
          sceneOpacity={0.45}
        />
      </div>

      {/* =====================================================================
          1. TOP EMERGENCY MEETING COMMAND BAR (II SILHOUETTE BAR)
      ===================================================================== */}
      <header className="sticky top-2 z-40 w-full px-4 sm:px-6 py-3 bg-[#14121d]/95 border border-zinc-700/80 rounded-2xl shadow-[0_12px_35px_rgba(14,12,21,0.9)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9e1b24]/25 border border-[#9e1b24]/70 flex items-center justify-center text-[#f58233]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f58233]">
                ◇ EL IMPOSTOR · MODO INDIVIDUAL
              </span>
              {room?.code && (
                <span className="px-2.5 py-0.5 rounded-lg bg-[#25242c] border border-zinc-600 text-[10px] font-mono font-bold text-[#f0f0f2]">
                  PIN: {room.code}
                </span>
              )}
            </div>
            <h1 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-[#f0f0f2] truncate max-w-md">
              {matchState.packTitle}
            </h1>
          </div>
        </div>

        {/* Center Individual Score & Round Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!effectiveIsTeacher && (
            <div className="px-4 py-1.5 rounded-xl bg-[#0e0c15] border border-[#22e584]/50 flex items-center gap-2">
              <Trophy size={14} className="text-[#22e584]" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Tu Puntaje:
              </span>
              <span className="font-mono text-sm font-black text-[#f0f0f2]">{myScore} pts</span>
            </div>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-[#0e0c15] border border-zinc-700 flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Ronda:
            </span>
            <span className="font-mono text-xs font-bold text-[#f0f0f2]">
              {matchState.currentRoundIndex + 1}/{matchState.rounds.length}
            </span>
          </div>

          {matchState.phase === 'debate' && roundSecondsLeft > 0 && (
            <div
              className={cn(
                'px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-black',
                roundSecondsLeft <= 10
                  ? 'bg-[#9e1b24] border-[#f0f0f2] text-[#f0f0f2] animate-pulse'
                  : 'bg-[#25242c] border-zinc-600 text-[#f0f0f2]'
              )}
            >
              <Clock size={14} />
              <span>{roundSecondsLeft}s</span>
            </div>
          )}
        </div>

        {/* Right Actions: Expandable Icon Controls */}
        <div className="flex items-center gap-2">
          {(isHost || effectiveIsTeacher) && (
            <TeacherPauseToggleButton
              isPaused={isPaused}
              onToggle={handleTogglePause}
            />
          )}

          <ExpandableIconButton
            onClick={toggleMatchFullscreen}
            icon={<Maximize size={15} />}
            label="Pantalla Completa"
            variant="secondary"
          />

          <ExpandableIconButton
            onClick={() => setPendingLeaveTarget('lobby')}
            icon={<DoorOpen size={15} />}
            label="Sala"
            variant="secondary"
          />

          <ExpandableIconButton
            onClick={() => setPendingLeaveTarget('home')}
            icon={<Home size={15} />}
            label="Menú"
            variant="danger"
          />
        </div>
      </header>

      {/* =====================================================================
          2. MAIN INVESTIGATION & VOTING STAGE
      ===================================================================== */}
      <main className="relative z-10 flex-1 h-auto max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {matchState.phase === 'finished' ? (
          /* FINAL INDIVIDUAL SCOREBOARD SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#14121d]/95 border-2 border-[#22e584]/60 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#22e584]/15 border border-[#22e584] flex items-center justify-center mx-auto text-[#22e584]">
              <Award size={34} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#22e584]">
                ◇ EXPEDIENTE CERRADO · RESULTADOS INDIVIDUALES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-[0.14em] text-[#f0f0f2] mt-1">
                {individualRanking[0]
                  ? `¡Mejor Detective: ${individualRanking[0].name} (${individualRanking[0].score} pts)!`
                  : '¡Misión de Investigación Completada!'}
              </h2>
            </div>

            {/* Individual Ranking List */}
            <div className="max-w-md mx-auto space-y-2.5 text-left">
              {individualRanking.map((st, idx) => (
                <div
                  key={st.id}
                  className={cn(
                    'px-4 py-3 rounded-xl border flex items-center justify-between',
                    idx === 0
                      ? 'bg-[#25242c] border-[#22e584] text-[#f0f0f2]'
                      : 'bg-[#0e0c15] border-zinc-800 text-[#f0f0f2]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-[#22e584] w-5">
                      #{idx + 1}
                    </span>
                    <span className="text-lg">{st.avatar}</span>
                    <span className="font-bold text-sm">{st.name}</span>
                  </div>
                  <span className="font-mono text-base font-black text-[#f0f0f2]">
                    {st.score} pts
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestartMatch}
                className="px-6 py-3 rounded-xl bg-[#22e584] hover:brightness-110 text-[#0e0c15] font-black text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Volver a Jugar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#25242c] hover:bg-[#32303c] text-[#f0f0f2] font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer border border-zinc-600"
              >
                <Sparkles size={15} className="text-[#f58233]" />
                <span>Elegir Otro Tema o Crear con IA</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Round Banner */}
            <div className="bg-[#14121d]/95 border border-zinc-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#f58233]">
                    <span>◇</span>
                    <span>
                      RONDA {matchState.currentRoundIndex + 1} DE {matchState.rounds.length}
                    </span>
                    <span>·</span>
                    <span className="text-zinc-300">{currentRound?.subject}</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-[0.14em] text-[#f0f0f2] mt-1">
                    {currentRound?.topicTitle}
                  </h2>
                </div>

                {!effectiveIsTeacher ? (
                  <div className="px-4 py-1.5 rounded-xl bg-[#0e0c15] border border-zinc-700 text-xs text-[#f0f0f2] flex items-center gap-2 self-start md:self-center">
                    <span>🕵️ Investigación Individual</span>
                    <span className="text-[#22e584] font-black">
                      +{matchState.pointsPerHit || 100} pts por acierto
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-1.5 rounded-xl bg-[#0e0c15] border border-zinc-700 text-xs text-[#f0f0f2] flex items-center gap-2 self-start md:self-center">
                    <span>👨‍🏫 Modo Docente (Moderador)</span>
                  </div>
                )}
              </div>

              <p className="text-sm sm:text-base text-[#f0f0f2] leading-relaxed">
                {currentRound?.prompt}
              </p>
            </div>

            {/* AMONG US COSMIC SPACE SCENE (MATCHING ARTWORK WITH REAL-TIME HOVER SPEECH BUBBLE) */}
            <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#180a29] via-[#0d0718] to-[#06030c] border-2 border-[#9e1b24]/60 p-4 sm:p-8 overflow-hidden shadow-[0_0_50px_rgba(158,27,36,0.35)] min-h-[380px] flex flex-col justify-between">
              {/* Floating Stars and Cosmic Particles Backdrop */}
              <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                <div className="absolute top-4 left-10 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                <div className="absolute top-12 right-20 w-2 h-2 bg-[#38bdf8] rounded-full animate-pulse" />
                <div className="absolute bottom-10 left-1/4 w-1 h-1 bg-[#22e584] rounded-full" />
                <div className="absolute top-1/3 right-12 w-2 h-2 bg-[#ec4899] rounded-full animate-ping" />
                <div className="absolute bottom-16 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
              </div>

              {/* Central Cosmic Emergency Hub / Cake with Flame (Matching Reference Artwork) */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-4 bg-[#14121d]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-700/80">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#22e584]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22e584] animate-pulse" />
                  <span>PASA EL MOUSE SOBRE UN TRIPULANTE PARA VER SU AFIRMACIÓN</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                  <span>🎂 MESA DE EMERGENCIA</span>
                </div>
              </div>

              {/* FLOATING CREWMATE PODS GRID */}
              <div className="relative z-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-auto">
                {currentRound?.statements.map((stmt, idx) => {
                  const isSelected = selectedStatementIdx === idx;
                  const isHovered = hoveredStatementIdx === idx;
                  const isRevealed = matchState.phase === 'revealed';
                  const isRealImpostor = stmt.isImpostor;
                  const votesForThis = votesList.filter((v) => v.statementIndex === idx);
                  const hasMyVote = myExistingVote?.statementIndex === idx;

                  // Whimsical floating animation offsets for Among Us zero-G space effect
                  const floatY = idx % 2 === 0 ? [0, -8, 0] : [-4, 6, -4];
                  const floatRot = idx === 0 ? [-2, 2, -2] : idx === 1 ? [3, -3, 3] : idx === 2 ? [-3, 3, -3] : [2, -2, 2];

                  return (
                    <div
                      key={stmt.id}
                      className="relative flex flex-col items-center"
                      onMouseEnter={() => {
                        if (!isPaused) {
                          setHoveredStatementIdx(idx);
                        }
                      }}
                      onMouseLeave={() => setHoveredStatementIdx(null)}
                    >
                      {/* REAL-TIME HOVER SPEECH BUBBLE OVERLAY */}
                      <AnimatePresence>
                        {(isHovered || (isSelected && !isRevealed)) && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 sm:w-72 p-4 bg-[#14121d]/98 border-2 border-[#22e584] rounded-2xl shadow-[0_0_35px_rgba(34,229,132,0.5)] backdrop-blur-2xl z-40 text-left pointer-events-none"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2 mb-2">
                              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#22e584]">
                                💬 AFIRMACIÓN #{idx + 1}
                              </span>
                              <span className="text-[11px] font-bold text-[#f0f0f2] uppercase tracking-wider">
                                {stmt.label}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#f0f0f2] font-serif leading-relaxed italic">
                              “{stmt.text}”
                            </p>
                            <div className="mt-2 text-[10px] font-mono text-[#22e584] font-bold text-right uppercase">
                              {isSelected ? '✓ Seleccionado para Votar' : 'Clic para Seleccionar'}
                            </div>
                            {/* Speech bubble pointer arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#22e584]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Floating Crewmate Card */}
                      <motion.div
                        animate={!isPaused ? { y: floatY, rotate: floatRot } : undefined}
                        transition={{ duration: 3 + idx, repeat: Infinity, ease: 'easeInOut' }}
                        onClick={() => {
                          if (isPaused) return;
                          playBalatroSound('select');
                          setInspectingStatementIdx(idx);
                          setSelectedStatementIdx(idx);
                        }}
                        className={cn(
                          'w-full p-4 sm:p-5 rounded-2xl border transition-all flex flex-col items-center justify-between text-center cursor-pointer backdrop-blur-md select-none group relative',
                          isRevealed && isRealImpostor
                            ? 'bg-[#9e1b24]/50 border-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.6)]'
                            : isRevealed && !isRealImpostor
                            ? 'bg-[#14121d]/85 border-zinc-800 opacity-75'
                            : isSelected || hasMyVote || isHovered
                            ? 'bg-[#25242c]/95 border-[#22e584] shadow-[0_0_35px_rgba(34,229,132,0.4)] scale-105'
                            : 'bg-[#14121d]/90 border-zinc-700/80 hover:border-[#22e584]'
                        )}
                      >
                        {/* Header Status Tag */}
                        <div className="w-full flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                            #{idx + 1}
                          </span>
                          {hasMyVote && !isRevealed && (
                            <span className="px-2 py-0.5 rounded-md bg-[#22e584] text-[#0e0c15] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <CheckCircle2 size={12} />
                              <span>TU VOTO</span>
                            </span>
                          )}
                        </div>

                        {/* Among Us Character SVG Icon */}
                        <div className="my-2">
                          <AmongUsCrewmateSvg
                            color={stmt.crewColor}
                            isEjected={isRevealed && isRealImpostor}
                            isSelected={isSelected || hasMyVote || isHovered}
                            isVoted={votesForThis.length > 0}
                            size={90}
                          />
                        </div>

                        {/* Crewmate Name */}
                        <div className="mt-2 mb-2">
                          <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider text-[#f0f0f2]">
                            {stmt.label}
                          </h3>
                          {isRevealed ? (
                            isRealImpostor ? (
                              <span className="text-[11px] font-black text-[#ef4444] uppercase tracking-widest block mt-1">
                                ❌ ERA EL IMPOSTOR
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-[#22e584] uppercase tracking-widest block mt-1">
                                ✓ VERDADERO
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] text-[#22e584] font-semibold block mt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              {isHovered ? '💬 Leyendo...' : '💬 Coloca el mouse'}
                            </span>
                          )}
                        </div>

                        {/* Quick Inspection Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playBalatroSound('select');
                            setInspectingStatementIdx(idx);
                            setSelectedStatementIdx(idx);
                          }}
                          className={cn(
                            'w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border',
                            isRevealed
                              ? 'bg-[#0e0c15] border-zinc-700 text-zinc-300'
                              : isSelected || hasMyVote
                              ? 'bg-[#22e584] text-[#0e0c15] border-[#f0f0f2]'
                              : 'bg-[#25242c] hover:bg-[#32303c] text-[#f0f0f2] border-zinc-600'
                          )}
                        >
                          <span>🔍 Inspeccionar</span>
                        </button>

                        {/* Live Votes Badges */}
                        {votesForThis.length > 0 && (!matchState.hideLiveVotes || isRevealed) && (
                          <div className="w-full mt-2.5 pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-center gap-1">
                            {votesForThis.map((v) => (
                              <span
                                key={v.playerId}
                                className="px-2 py-0.5 rounded-md bg-[#25242c] border border-zinc-600 text-[#f0f0f2] text-[9px] font-bold"
                              >
                                {v.playerName}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================================
                3. DIRECT INDIVIDUAL EJECTION VOTE BAR
            ================================================================= */}
            {matchState.phase === 'debate' ? (
              <form
                onSubmit={handleCastVote}
                className="bg-[#14121d]/95 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25242c] border border-zinc-600 flex items-center justify-center text-[#22e584] shrink-0">
                    <Vote size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#f0f0f2]">
                      {selectedStatement
                        ? `Sospechoso seleccionado: ${selectedStatement.label}`
                        : 'Selecciona una de las 4 afirmaciones de arriba para votar su expulsión'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Votos registrados en la sala: <strong className="text-[#22e584]">{votesList.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!effectiveIsTeacher && (
                    <button
                      type="submit"
                      disabled={selectedStatementIdx === null || isPaused}
                      className="px-6 py-3 rounded-xl bg-[#25242c] hover:bg-[#32303c] disabled:opacity-40 text-[#f0f0f2] border border-[#22e584]/60 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                    >
                      <span className="w-4 h-4 rounded bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[9px] font-black">
                        ▼
                      </span>
                      <Vote size={16} />
                      <span>
                        {myExistingVote
                          ? 'Actualizar Voto de Expulsión'
                          : 'Votar para Expulsar Impostor'}
                      </span>
                    </button>
                  )}

                  {/* Teacher / Host Reveal Button */}
                  {(effectiveIsTeacher || isSoloPractice || isHost) && (
                    <button
                      type="button"
                      onClick={handleRevealImpostor}
                      className="px-5 py-3 rounded-xl bg-[#9e1b24] hover:bg-[#b5222c] text-[#f0f0f2] border border-[#f0f0f2]/40 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ShieldAlert size={16} />
                      <span>Revelar Impostor y Veredicto</span>
                    </button>
                  )}
                </div>
              </form>
            ) : (
              /* EJECTION REVEAL & PEDAGOGICAL EXPLANATION BANNER */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#14121d]/95 border-2 border-[#22e584] rounded-2xl p-6 space-y-4 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#22e584]">
                      ◇ VEREDICTO DE EXPULSIÓN · EXPLICACIÓN DIDÁCTICA
                    </span>
                    <h3 className="font-serif text-xl font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                      Impostor Real: {currentRound?.statements[realImpostorIndex]?.label}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="px-6 py-3 rounded-xl bg-[#25242c] hover:bg-[#32303c] border border-[#22e584]/60 text-[#f0f0f2] font-black text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer self-start sm:self-center shrink-0"
                  >
                    <span className="w-4 h-4 rounded bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[9px] font-black">
                      ▼
                    </span>
                    <span>
                      {matchState.currentRoundIndex + 1 < matchState.rounds.length
                        ? 'Siguiente Ronda'
                        : 'Ver Resultados Finales'}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                <p className="text-sm text-[#f0f0f2] leading-relaxed bg-[#0e0c15] p-4 rounded-xl border border-zinc-800">
                  {currentRound?.impostorExplanation}
                </p>
              </motion.div>
            )}

            {/* Connected Students Roster */}
            {!isSoloPractice && (
              <div className="bg-[#14121d]/90 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-[#22e584]" />
                  <span>
                    Detectives conectados: <strong className="text-[#f0f0f2]">{studentPlayers.length}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {studentPlayers.map((st) => {
                    const stScore = matchState.playerScores?.[st.id] || 0;
                    return (
                      <span
                        key={st.id}
                        className="px-3 py-1 rounded-lg bg-[#25242c] border border-zinc-700 text-[#f0f0f2] flex items-center gap-1.5"
                      >
                        <span>{st.avatar}</span>
                        <span>{st.name}</span>
                        <span className="font-mono text-[10px] text-[#22e584] font-bold">
                          {stScore} pts
                        </span>
                        {matchState.votes?.[st.id] && (
                          <span className="text-[10px] text-[#f0f0f2] font-bold">✓ Votó</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ImpostorLibraryModal
        isOpen={isLibraryOpen}
        defaultAuthorName={room?.teacherName || localStorage.getItem('po_player_name') || 'Docente'}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPack={(pack) => {
          setIsLibraryOpen(false);
          handleSelectPackFromLibrary(pack);
        }}
      />

      {isQrOpen && room?.code && (
        <QRCodeModal roomCode={room.code} onClose={() => setIsQrOpen(false)} />
      )}
    </div>
  );
};
