import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  RotateCcw,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Skull,
  Flame,
  Maximize2,
  DoorOpen,
} from 'lucide-react';
import { GamePlayer, RoomState, EscapeRoomQuestion, EscapeRoomPack } from '../types';
import { DEFAULT_ESCAPE_10_QUESTIONS } from '../lib/escapeRoomEngine';
import { saveMatchRecord } from '../lib/matchHistory';
import { playBalatroSound, playJumpscareSound } from '../lib/soundEffects';
import { socketClient } from '../lib/socketClient';
import confetti from 'canvas-confetti';
import { EscapeRoomLobby } from './EscapeRoomLobby';
import { TeacherGradeSummaryModal, StudentGradeResult } from './TeacherGradeSummaryModal';
import { TeacherSpectatorDashboard } from './TeacherSpectatorDashboard';
import { MatchStartCountdown } from './MatchStartCountdown';
import { EscapeRoomLibraryModal } from './EscapeRoomLibraryModal';
import { HeatGuardianAtmosphere } from './HeatGuardianBackdrop';
import { EscapeBunkerGate } from './AulaPlayLogo';
import {
  ExpandableIconButton,
  LeaveMatchConfirmModal,
  StudentPauseLockOverlay,
  TeacherPauseToggleButton,
} from './MatchControlUI';

interface EducationalEscapeRoomProps {
  players: GamePlayer[];
  currentUserId: string;
  isTeacherSpectator?: boolean;
  isSoloPractice?: boolean;
  room?: RoomState | null;
  initialPack?: EscapeRoomPack;
  onGoHome: () => void;
}

export const EducationalEscapeRoom: React.FC<EducationalEscapeRoomProps> = ({
  players,
  currentUserId,
  isTeacherSpectator = false,
  isSoloPractice = false,
  room = null,
  initialPack,
  onGoHome,
}) => {
  // Questions list (10 questions / chambers default)
  const [questions, setQuestions] = useState<EscapeRoomQuestion[]>(() => {
    if (initialPack?.chambers && initialPack.chambers.length > 0) {
      return initialPack.chambers;
    }
    const saved = localStorage.getItem('po_custom_escape_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length >= 4 &&
          !['phys_1', 'bio_1', 'math_1', 'hist_1'].includes(parsed[0]?.id)
        ) {
          return parsed;
        }
        localStorage.removeItem('po_custom_escape_questions');
      } catch {}
    }
    return DEFAULT_ESCAPE_10_QUESTIONS;
  });

  const [activePackTitle, setActivePackTitle] = useState<string>(
    initialPack?.title || 'Escape Multidisciplinar: Las 10 Cámaras del Saber'
  );
  const [isEscapeLibraryOpen, setIsEscapeLibraryOpen] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [isTeacherSummaryOpen, setIsTeacherSummaryOpen] = useState<boolean>(false);

  // Timer state (exact seconds)
  const [totalInitialSeconds, setTotalInitialSeconds] = useState<number>(600); // 10 mins default
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Pre-game Lobby vs In-game Match Phase & 3-Second Countdown
  const [gamePhase, setGamePhase] = useState<'lobby' | 'playing'>('lobby');
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [localPaused, setLocalPaused] = useState<boolean>(false);
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState<'lobby' | 'home' | null>(null);
  const isPaused = Boolean(room?.isPaused ?? localPaused);

  const handleTogglePause = useCallback(() => {
    playBalatroSound('select');
    if (room) {
      socketClient.togglePause(!room.isPaused);
    } else {
      setLocalPaused((prev) => !prev);
    }
  }, [room]);

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

  const isHost = room ? room.hostId === currentUserId : true;

  // Auto-provision a live room if mounting in classroom multiplayer mode without one
  useEffect(() => {
    if (!room && !isSoloPractice) {
      const pName = localStorage.getItem('po_player_name') || (isTeacherSpectator ? 'Profesor' : 'Marie Curie');
      const pAvatar = localStorage.getItem('po_player_avatar') || (isTeacherSpectator ? '👨‍🏫' : '👩‍🔬');
      socketClient.createRoom(pName, pAvatar, 0, 16, 'Escape Room Didáctico', isTeacherSpectator, 'escape_room');
    }
  }, [room, isTeacherSpectator, isSoloPractice]);

  // Synchronize custom questions and timer configured by host across all students in the room
  useEffect(() => {
    if (room?.escapeRoomQuestions && room.escapeRoomQuestions.length > 0) {
      setQuestions(room.escapeRoomQuestions);
    } else if (room && isHost && questions.length > 0) {
      socketClient.updateEscapeConfig(questions, totalInitialSeconds);
    }
    if (typeof room?.escapeRoomTotalSeconds === 'number' && room.escapeRoomTotalSeconds >= 5) {
      setTotalInitialSeconds(room.escapeRoomTotalSeconds);
      if (gamePhase === 'lobby') {
        setTimeRemaining(room.escapeRoomTotalSeconds);
      }
    }
  }, [room?.code, room?.escapeRoomQuestions, room?.escapeRoomTotalSeconds, gamePhase, isHost]);

  // Sync phase from multiplayer room state across all connected devices (only on actual phase transition)
  const prevRoomPhaseRef = useRef<string>(room?.phase || 'lobby');
  useEffect(() => {
    const currentPhase = room?.phase;
    if (!currentPhase) return;

    if (currentPhase !== prevRoomPhaseRef.current) {
      prevRoomPhaseRef.current = currentPhase;

      if (currentPhase === 'countdown') {
        const syncedTotal = room?.escapeRoomTotalSeconds || totalInitialSeconds;
        setIsCountdownActive(true);
        setGamePhase('playing');
        setTimeRemaining(syncedTotal);
        setIsTimerRunning(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setWrongAttempts(0);
        setSprintBoost(0);
        setIsGameOver(false);
        setIsVictory(false);
        setIsJumpscareActive(false);
        setSelectedOption(null);
        setIsAnswered(false);
        setFeedback(null);
      } else if (currentPhase === 'playing') {
        setGamePhase('playing');
        setIsCountdownActive((currentlyCounting) => {
          if (!currentlyCounting) {
            setIsTimerRunning(true);
          }
          return currentlyCounting;
        });
      } else if (currentPhase === 'lobby') {
        setIsCountdownActive(false);
        setGamePhase('lobby');
        setIsTimerRunning(false);
        setIsGameOver(false);
        setIsVictory(false);
        setIsJumpscareActive(false);
        setIsTeacherSummaryOpen(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setWrongAttempts(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setFeedback(null);
      }
    }
  }, [room?.phase, room?.escapeRoomTotalSeconds, totalInitialSeconds]);

  const handleStartMatchFromLobby = useCallback(() => {
    let matchQuestions = [...questions];
    if (shuffleChambers) {
      matchQuestions.sort(() => Math.random() - 0.5);
    }
    if (maxChambersLimit > 0 && maxChambersLimit < matchQuestions.length) {
      matchQuestions = matchQuestions.slice(0, maxChambersLimit);
    }
    if (matchQuestions.length !== questions.length || shuffleChambers) {
      setQuestions(matchQuestions);
    }

    if (room) {
      socketClient.updateEscapeConfig(matchQuestions, totalInitialSeconds);
      socketClient.startGame();
    }
    setIsCountdownActive(true);
    setGamePhase('playing');
    setTimeRemaining(totalInitialSeconds);
    setIsTimerRunning(false); // Timer starts after 3-second countdown
    setCurrentQuestionIndex(0);
    setScore(0);
    setWrongAttempts(0);
    setSprintBoost(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsJumpscareActive(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
  }, [room, questions, totalInitialSeconds]);

  const handleCountdownComplete = useCallback(() => {
    setIsCountdownActive(false);
    setIsTimerRunning(true);
  }, []);

  const handleReturnToLobby = useCallback(() => {
    setIsGameOver(false);
    setIsVictory(false);
    setIsJumpscareActive(false);
    setIsCountdownActive(false);
    setIsTimerRunning(false);
    setGamePhase('lobby');
    if (room) {
      socketClient.returnToLobby();
    }
    playBalatroSound('click');
  }, [room]);


  // Sprint boost & stumble
  const [sprintBoost, setSprintBoost] = useState<number>(0);
  const [playerStumble, setPlayerStumble] = useState<boolean>(false);

  // Stride alternation (steady running cadence, 2 clean poses)
  const [strideStep, setStrideStep] = useState<number>(0);

  // Quiz Interaction
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isJumpscareActive, setIsJumpscareActive] = useState<boolean>(false);

  // Teacher Pre-Game Rules & Mechanics Settings
  const [wrongAnswerPenaltySecs, setWrongAnswerPenaltySecs] = useState<number>(20);
  const [maxChambersLimit, setMaxChambersLimit] = useState<number>(0); // 0 = Todas
  const [shuffleChambers, setShuffleChambers] = useState<boolean>(false);
  const [correctBoostAmount, setCorrectBoostAmount] = useState<number>(14);
  const [pointsPerChamber, setPointsPerChamber] = useState<number>(250);
  const [enableJumpscare, setEnableJumpscare] = useState<boolean>(true);

  // Trigger dramatic jumpscare sequence (or calm game over if enableJumpscare is false)
  const triggerJumpscare = () => {
    if (isJumpscareActive || isGameOver) return;
    setIsTimerRunning(false);

    if (!enableJumpscare) {
      playBalatroSound('hover');
      setIsGameOver(true);
      return;
    }

    setIsJumpscareActive(true);
    playJumpscareSound();

    setTimeout(() => {
      setIsJumpscareActive(false);
      setIsGameOver(true);
    }, 1850);
  };

  // Single Minimalist Settings Modal (Consolidates Time, Rules, AI generator & Editor)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'time' | 'rules' | 'ai' | 'questions'>('time');
  const [exactMinutesInput, setExactMinutesInput] = useState<string>('10');
  const [exactSecondsInput, setExactSecondsInput] = useState<string>('00');

  // Teacher AI & Manual Form
  const [aiTopicInput, setAiTopicInput] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOpt0, setNewOpt0] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);

  const activeQuestion = questions[currentQuestionIndex] || questions[0];
  const questionsRemaining = Math.max(0, questions.length - currentQuestionIndex);
  const isExitDoorVisible = questionsRemaining === 1;

  // Time ratio (1.0 = full, 0.0 = expired)
  const timeRatio = Math.max(0, Math.min(1, timeRemaining / Math.max(1, totalInitialSeconds)));

  // Player and Monster X percentages (kept close together regardless of total time)
  const playerX = useMemo(() => {
    const base = 66 + timeRatio * 4; // 66% to 70%
    return Math.min(75, Math.max(62, base + Math.min(4, sprintBoost * 0.3) - (playerStumble ? 2 : 0)));
  }, [timeRatio, sprintBoost, playerStumble]);

  const monsterX = useMemo(() => {
    if (timeRemaining <= 0) return playerX;
    // Always stay close behind the player (gap between 6% and 11% regardless of time)
    const closeGap = 6 + timeRatio * 4.5 + Math.min(2.5, sprintBoost * 0.2) - (playerStumble ? 1.8 : 0);
    return Math.max(52, playerX - Math.max(5, Math.min(12, closeGap)));
  }, [timeRatio, playerX, timeRemaining, sprintBoost, playerStumble]);

  const distanceMeters = Math.max(1, Math.round((playerX - monsterX) * 1.4));

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isPaused || isGameOver || isVictory || isJumpscareActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerJumpscare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused, isGameOver, isVictory, isJumpscareActive]);

  // Trigger jumpscare if time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && !isGameOver && !isJumpscareActive && !isVictory) {
      triggerJumpscare();
    }
  }, [timeRemaining, isGameOver, isJumpscareActive, isVictory]);

  // Sprint boost decay
  useEffect(() => {
    if (isPaused) return;
    if (sprintBoost > 0) {
      const timer = setTimeout(() => {
        setSprintBoost((prev) => Math.max(0, prev - 1));
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [sprintBoost, isPaused]);

  // Continuous brisk running stride cycle so the character always looks like they are running
  useEffect(() => {
    if (isPaused || isGameOver || isVictory) return;
    const cadence = sprintBoost > 0 ? 95 : 140;
    const interval = setInterval(() => {
      setStrideStep((prev) => (prev === 0 ? 1 : 0));
    }, cadence);
    return () => clearInterval(interval);
  }, [sprintBoost, isPaused, isGameOver, isVictory]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Answer handler
  const handleAnswerQuestion = (optionIndex: number) => {
    if (isPaused || isAnswered || isGameOver || isVictory) return;

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    if (optionIndex === activeQuestion.correctOptionIndex) {
      playBalatroSound('play');
      setScore((s) => s + pointsPerChamber);
      setSprintBoost(correctBoostAmount);
      setFeedback(`⚡ ¡CORRECTO! (+${pointsPerChamber} pts) Aceleras el paso y te alejas del monstruo.`);

      setTimeout(() => {
        const nextIdx = currentQuestionIndex + 1;
        if (nextIdx >= questions.length) {
          setIsVictory(true);
          setIsTimerRunning(false);
          playBalatroSound('play');
          confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } });
        } else {
          setCurrentQuestionIndex(nextIdx);
          setSelectedOption(null);
          setIsAnswered(false);
          setFeedback(null);
        }
      }, 900);
    } else {
      playBalatroSound('hover');
      setWrongAttempts((w) => w + 1);
      setPlayerStumble(true);
      setTimeout(() => setPlayerStumble(false), 700);
      if (wrongAnswerPenaltySecs > 0) {
        setTimeRemaining((prev) => Math.max(0, prev - wrongAnswerPenaltySecs));
        setFeedback(`❌ ¡INCORRECTO! Tropezaste (-${wrongAnswerPenaltySecs}s de tiempo).`);
      } else {
        setFeedback('❌ ¡INCORRECTO! Tropezaste (Sin penalización de reloj).');
      }
      setTimeout(() => {
        setIsAnswered(false);
        setSelectedOption(null);
      }, 1300);
    }
  };

  // Save match history record when Escape Room finishes (victory or game over)
  useEffect(() => {
    if (isVictory || isGameOver) {
      const finalGrade = calculateProportionalGrade(
        isVictory ? questions.length : currentQuestionIndex,
        questions.length,
        wrongAttempts,
        isVictory,
        timeRemaining,
        totalInitialSeconds
      );

      saveMatchRecord({
        gameType: 'escape_room',
        gameTitle: `Escape Room: ${activePackTitle}`,
        role: isTeacherSpectator ? 'teacher' : 'student',
        playerName: localStorage.getItem('po_player_name') || (isTeacherSpectator ? 'Profesor' : 'Estudiante'),
        playerAvatar: localStorage.getItem('po_player_avatar') || (isTeacherSpectator ? '👨‍🏫' : '👩‍🔬'),
        grade: finalGrade,
        score: score,
        maxScore: questions.length * 250,
        isVictory,
        statusText: isVictory ? `🗝️ Escape Exitoso (${finalGrade}/100)` : `💥 Atrapado (${finalGrade}/100)`,
        detailsText: `${isVictory ? questions.length : currentQuestionIndex}/${questions.length} Cámaras resueltas · ${wrongAttempts} errores.`,
        roomCode: room?.code || 'SOLO',
        studentResults: studentResults.map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          grade: s.grade,
          score: s.score,
          escapedOrWon: s.escaped,
          details: `${s.correctAnswers}/${s.totalQuestions} cámaras · ${s.incorrectAnswers} errores`,
        })),
      });
    }
  }, [isVictory, isGameOver]);

  // Adjust exact time
  const handleApplyExactTime = (mins: number, secs: number) => {
    const validMins = Math.max(0, Math.min(180, isNaN(mins) ? 0 : mins));
    const validSecs = Math.max(0, Math.min(59, isNaN(secs) ? 0 : secs));
    const total = Math.max(10, validMins * 60 + validSecs);
    setTotalInitialSeconds(total);
    setTimeRemaining(total);
    setExactMinutesInput(validMins.toString());
    setExactSecondsInput(validSecs.toString().padStart(2, '0'));
    setIsGameOver(false);
    if (room && isHost) {
      socketClient.updateEscapeConfig(questions, total);
    }
    playBalatroSound('click');
  };

  // AI Generator
  const handleGenerateQuestionsWithAi = async () => {
    if (!aiTopicInput.trim()) return;
    setIsAiGenerating(true);
    playBalatroSound('bubble');

    try {
      const response = await fetch('/api/generate-escape-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopicInput.trim(), questionCount: 4 }),
      });
      if (!response.ok) throw new Error('Error');
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        localStorage.setItem('po_custom_escape_questions', JSON.stringify(data.questions));
        if (room && isHost) {
          socketClient.updateEscapeConfig(data.questions, totalInitialSeconds);
        }
        setCurrentQuestionIndex(0);
        setIsSettingsModalOpen(false);
        setAiTopicInput('');
        playBalatroSound('play');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Manual Question
  const handleAddManualQuestion = () => {
    if (!newQuestionText.trim() || !newOpt0.trim() || !newOpt1.trim()) return;
    const options = [newOpt0, newOpt1, newOpt2, newOpt3].filter(Boolean);
    const newQ: EscapeRoomQuestion = {
      id: `q_${Date.now()}`,
      chamberTitle: `Cámara ${questions.length + 1}`,
      question: newQuestionText.trim(),
      options,
      correctOptionIndex: Math.min(newCorrectIdx, options.length - 1),
      lockCode: `L${questions.length + 1}`,
      subject: 'Ciencia General',
    };
    const updated = [...questions, newQ];
    setQuestions(updated);
    localStorage.setItem('po_custom_escape_questions', JSON.stringify(updated));
    if (room && isHost) {
      socketClient.updateEscapeConfig(updated, totalInitialSeconds);
    }
    setNewQuestionText('');
    setNewOpt0('');
    setNewOpt1('');
    setNewOpt2('');
    setNewOpt3('');
    setNewCorrectIdx(0);
    playBalatroSound('click');
  };

  const handleResetDefaultQuestions = () => {
    setQuestions(DEFAULT_ESCAPE_10_QUESTIONS);
    setActivePackTitle('Escape Multidisciplinar: Las 10 Cámaras del Saber');
    localStorage.setItem('po_custom_escape_questions', JSON.stringify(DEFAULT_ESCAPE_10_QUESTIONS));
    if (room && isHost) {
      socketClient.updateEscapeConfig(DEFAULT_ESCAPE_10_QUESTIONS, totalInitialSeconds);
    }
    playBalatroSound('click');
  };

  // Keyboard shortcuts (1-4 or A-D) for fast student responses during chase
  useEffect(() => {
    const isTeacherRunnerBlocked = !isSoloPractice && isTeacherSpectator;
    if (gamePhase !== 'playing' || isPaused || isCountdownActive || isTeacherRunnerBlocked || isSettingsModalOpen || isVictory || isGameOver || isAnswered) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      let idx = -1;
      if (key === '1' || key === 'A') idx = 0;
      else if (key === '2' || key === 'B') idx = 1;
      else if (key === '3' || key === 'C') idx = 2;
      else if (key === '4' || key === 'D') idx = 3;

      if (idx >= 0 && idx < (activeQuestion?.options.length || 0)) {
        e.preventDefault();
        handleAnswerQuestion(idx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, isPaused, isCountdownActive, isSoloPractice, isTeacherSpectator, isSettingsModalOpen, isVictory, isGameOver, isAnswered, activeQuestion]);

  // Calculate exact proportional grade (0 to 100) based on questions answered, mistakes, and time
  const calculateProportionalGrade = useCallback((
    correctAnswers: number,
    totalQuestions: number,
    wrongAttemptsCount: number = 0,
    escaped: boolean = false,
    timeRemainingSecs: number = 0,
    totalTimeSecs: number = 600
  ): number => {
    if (totalQuestions <= 0) return 0;

    // 1. Base proportional score directly matching questions solved:
    // e.g. 4 questions = 25 pts each (4/4 = 100, 3/4 = 75, 2/4 = 50, 1/4 = 25, 0/4 = 0)
    const baseProportional = Math.round((Math.min(correctAnswers, totalQuestions) / totalQuestions) * 100);

    // If 0 questions answered correctly, score is 0
    if (correctAnswers <= 0) return 0;

    // 2. Proportional mistake deduction: -3 points per wrong attempt
    // (capped at 35% of earned base score so correct answers always yield net positive value)
    const maxPenalty = Math.floor(baseProportional * 0.35);
    const mistakePenalty = Math.min(maxPenalty, wrongAttemptsCount * 3);

    // 3. Proportional time bonus (up to +5 bonus points if escaped with ample time)
    let speedBonus = 0;
    if (escaped && totalTimeSecs > 0 && timeRemainingSecs > 0) {
      const timeRatio = Math.max(0, Math.min(1, timeRemainingSecs / totalTimeSecs));
      speedBonus = Math.round(timeRatio * 5);
    }

    // Flawless escape: all correct with 0 mistakes is always a guaranteed 100
    if (correctAnswers >= totalQuestions && wrongAttemptsCount === 0) {
      return 100;
    }

    const finalGrade = baseProportional - mistakePenalty + speedBonus;
    return Math.max(0, Math.min(100, finalGrade));
  }, []);

  // Real-time calculation of local player's proportional grade
  const localStudentGrade = useMemo(() => {
    const correctCount = isVictory ? questions.length : currentQuestionIndex;
    return calculateProportionalGrade(
      correctCount,
      questions.length,
      wrongAttempts,
      isVictory,
      timeRemaining,
      totalInitialSeconds
    );
  }, [calculateProportionalGrade, isVictory, questions.length, currentQuestionIndex, wrongAttempts, timeRemaining, totalInitialSeconds]);

  // Calculate individual student 0-100 grade evaluations for teacher summary
  const studentResults: StudentGradeResult[] = useMemo(() => {
    const rawConnected = room?.players || players;
    const studentList = rawConnected.filter(
      (p) => !p.isSpectator && p.role !== 'teacher' && (isTeacherSpectator ? p.id !== room?.hostId : true)
    );

    if (studentList.length === 0) {
      const pName = localStorage.getItem('po_player_name') || 'Estudiante 1';
      const pAvatar = localStorage.getItem('po_player_avatar') || '🧑‍🎓';
      const correctAns = isVictory ? questions.length : currentQuestionIndex;
      const grade = calculateProportionalGrade(
        correctAns,
        questions.length,
        wrongAttempts,
        isVictory,
        timeRemaining,
        totalInitialSeconds
      );
      return [
        {
          id: 'student-single',
          name: pName,
          avatar: pAvatar,
          grade,
          questionsAnswered: correctAns,
          totalQuestions: questions.length,
          correctAnswers: correctAns,
          incorrectAnswers: wrongAttempts,
          timeRemainingSecs: timeRemaining,
          totalTimeSecs: totalInitialSeconds,
          escaped: isVictory,
          score,
        },
      ];
    }

    return studentList.map((p, idx) => {
      const isCurrentPlayer = p.id === currentUserId || (!isTeacherSpectator && p.id === 'hero-player');
      const totalQ = p.escapeProgress?.totalQuestions || questions.length;

      const isEscaped = isCurrentPlayer
        ? isVictory
        : (p.escapeProgress?.isVictory || false);

      const correctAns = isCurrentPlayer
        ? (isVictory ? questions.length : currentQuestionIndex)
        : (p.escapeProgress?.isVictory ? totalQ : (p.escapeProgress?.questionIndex ?? 0));

      const incorrectAns = isCurrentPlayer
        ? wrongAttempts
        : (p.escapeProgress?.wrongAttempts ?? 0);

      const timeRem = isCurrentPlayer
        ? timeRemaining
        : totalInitialSeconds;

      const grade = calculateProportionalGrade(
        correctAns,
        totalQ,
        incorrectAns,
        isEscaped,
        timeRem,
        totalInitialSeconds
      );

      return {
        id: p.id || `std_${idx}`,
        name: p.name,
        avatar: p.avatar,
        grade,
        questionsAnswered: correctAns,
        totalQuestions: totalQ,
        correctAnswers: correctAns,
        incorrectAnswers: incorrectAns,
        timeRemainingSecs: timeRem,
        totalTimeSecs: totalInitialSeconds,
        escaped: isEscaped,
        score: isCurrentPlayer ? score : (p.escapeProgress?.score ?? p.score ?? (correctAns * 250)),
      };
    });
  }, [room?.players, players, isTeacherSpectator, isVictory, timeRemaining, totalInitialSeconds, wrongAttempts, currentQuestionIndex, questions.length, score, calculateProportionalGrade, currentUserId]);

  // Broadcast live student progress to WebSocket room (Deduplicated with Ref to prevent infinite loops)
  const lastSentProgressRef = useRef<string>('');
  useEffect(() => {
    const isTeacherClassroomHost = !isSoloPractice && isTeacherSpectator;
    if (gamePhase === 'playing' && room && !isTeacherClassroomHost) {
      const correctAns = isVictory ? questions.length : currentQuestionIndex;
      const grade = calculateProportionalGrade(
        correctAns,
        questions.length,
        wrongAttempts,
        isVictory,
        timeRemaining,
        totalInitialSeconds
      );

      const payloadKey = `${currentQuestionIndex}_${wrongAttempts}_${score}_${isVictory}_${isGameOver}_${grade}`;
      if (lastSentProgressRef.current === payloadKey) {
        return; // Prevent duplicate transmission and ping-pong loop
      }
      lastSentProgressRef.current = payloadKey;

      socketClient.send({
        type: 'update_escape_progress',
        questionIndex: currentQuestionIndex,
        totalQuestions: questions.length,
        wrongAttempts,
        isVictory,
        isGameOver,
        grade,
        score,
      });
    }
  }, [currentQuestionIndex, score, wrongAttempts, isVictory, isGameOver, gamePhase, isSoloPractice, isTeacherSpectator, room, questions.length, totalInitialSeconds, timeRemaining, calculateProportionalGrade]);

  // ----------------------------------------------------------------------
  // A. LOBBY VIEW (WAITING ROOM & PRE-GAME SETUP - MATCHING USER SCREENSHOT)
  // ----------------------------------------------------------------------
  if (gamePhase === 'lobby') {
    if (isEscapeLibraryOpen) {
      return (
        <EscapeRoomLibraryModal
          isOpen={isEscapeLibraryOpen}
          defaultAuthorName={localStorage.getItem('po_player_name') || (isTeacherSpectator ? 'Profesor' : 'Estudiante')}
          onClose={() => setIsEscapeLibraryOpen(false)}
          onSelectPack={(pack) => {
            setQuestions(pack.chambers);
            setActivePackTitle(pack.title);
            localStorage.setItem('po_custom_escape_questions', JSON.stringify(pack.chambers));
            if (room && isHost) {
              socketClient.updateEscapeConfig(pack.chambers, totalInitialSeconds);
            }
            setIsEscapeLibraryOpen(false);
            playBalatroSound('deal');
          }}
        />
      );
    }

    return (
      <div className="relative w-full min-h-screen h-auto">
        <EscapeRoomLobby
          roomCode={room?.code || (isSoloPractice ? 'SOLO' : '191440')}
          roomName={room?.name}
          totalInitialSeconds={totalInitialSeconds}
          questionsCount={maxChambersLimit > 0 ? Math.min(maxChambersLimit, questions.length) : questions.length}
          activePackTitle={activePackTitle}
          wrongPenaltySecs={wrongAnswerPenaltySecs}
          enableJumpscare={enableJumpscare}
          onStartMatch={handleStartMatchFromLobby}
          onOpenSettings={(tab) => {
            setSettingsTab(tab);
            setIsSettingsModalOpen(true);
          }}
          onOpenEscapeLibrary={() => setIsEscapeLibraryOpen(true)}
          onExit={onGoHome}
          isHost={isHost}
          isTeacherSpectator={!isSoloPractice && isTeacherSpectator}
          onOpenTeacherSummary={() => setIsTeacherSummaryOpen(true)}
          players={
            isSoloPractice
              ? [
                  {
                    id: 'solo-hero',
                    name: localStorage.getItem('po_player_name') || 'Explorador Solitario',
                    avatar: localStorage.getItem('po_player_avatar') || '🧑‍🔬',
                    ready: true,
                  },
                ]
              : (room?.players || [])
                  .filter((p) => !p.isSpectator && p.role !== 'teacher' && (isTeacherSpectator ? p.id !== room?.hostId : true))
                  .map((p) => ({
                    id: p.id,
                    name: p.name,
                    avatar: p.avatar,
                    ready: true,
                  }))
          }
        />

        {/* Escape Room Infinite Library Modal */}
        <EscapeRoomLibraryModal
          isOpen={isEscapeLibraryOpen}
          defaultAuthorName={localStorage.getItem('po_player_name') || (isTeacherSpectator ? 'Profesor' : 'Estudiante')}
          onClose={() => setIsEscapeLibraryOpen(false)}
          onSelectPack={(pack) => {
            setQuestions(pack.chambers);
            setActivePackTitle(pack.title);
            localStorage.setItem('po_custom_escape_questions', JSON.stringify(pack.chambers));
            if (room && isHost) {
              socketClient.updateEscapeConfig(pack.chambers, totalInitialSeconds);
            }
            setIsEscapeLibraryOpen(false);
            playBalatroSound('deal');
          }}
        />

        {/* Teacher Grade Summary Modal */}
        {isTeacherSummaryOpen && (
          <TeacherGradeSummaryModal
            onClose={() => setIsTeacherSummaryOpen(false)}
            results={studentResults}
            roomCode={room?.code || '191440'}
            gameTitle="Escape Room Didáctico: Mazmorra Alquímica"
          />
        )}

        {/* PRE-GAME SETTINGS MODAL (CONFIGURACIÓN ANTES DE LA PARTIDA - II SILHOUETTE STYLE) */}
        <AnimatePresence>
          {isSettingsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0c15]/90 backdrop-blur-md p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#14121d] border border-zinc-700 p-5 sm:p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl text-xs font-sans text-[#f0f0f2] h-auto"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-[#22e584]" />
                    <h3 className="font-serif text-base font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                      ◇ Ajustes de Partida (Docente)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    aria-label="Cerrar configuración"
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 text-[11px] font-bold">
                  <button
                    onClick={() => setSettingsTab('time')}
                    className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
                      settingsTab === 'time'
                        ? 'border-[#22e584] text-[#22e584]'
                        : 'border-transparent text-zinc-400 hover:text-[#f0f0f2]'
                    }`}
                  >
                    ⏱️ Tiempo
                  </button>
                  <button
                    onClick={() => setSettingsTab('rules')}
                    className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
                      settingsTab === 'rules'
                        ? 'border-[#22e584] text-[#22e584]'
                        : 'border-transparent text-zinc-400 hover:text-[#f0f0f2]'
                    }`}
                  >
                    ⚙️ Reglas Docente
                  </button>
                  <button
                    onClick={() => setSettingsTab('ai')}
                    className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
                      settingsTab === 'ai'
                        ? 'border-[#9e1b24] text-[#f0f0f2]'
                        : 'border-transparent text-zinc-400 hover:text-[#f0f0f2]'
                    }`}
                  >
                    ✨ Generador IA
                  </button>
                  <button
                    onClick={() => setSettingsTab('questions')}
                    className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
                      settingsTab === 'questions'
                        ? 'border-[#22e584] text-[#22e584]'
                        : 'border-transparent text-zinc-400 hover:text-[#f0f0f2]'
                    }`}
                  >
                    📝 Cámaras ({questions.length})
                  </button>
                </div>

                {/* Tab 1: Exact Time */}
                {settingsTab === 'time' && (
                  <div className="space-y-4 pt-1">
                    <span className="text-zinc-300 block text-xs">
                      Selecciona la duración exacta del escape antes de empezar:
                    </span>

                    <div className="flex items-center justify-center gap-3 bg-[#0e0c15] p-4 rounded-xl border border-zinc-800">
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] text-zinc-400 uppercase font-mono mb-1 font-bold">
                          Minutos
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="180"
                          value={exactMinutesInput}
                          onChange={(e) => setExactMinutesInput(e.target.value)}
                          className="w-20 text-center text-3xl font-black font-mono bg-[#1c1a27] border border-[#22e584]/60 rounded-xl text-[#22e584] py-1"
                        />
                      </div>
                      <span className="text-3xl font-black text-zinc-500 mt-4">:</span>
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] text-zinc-400 uppercase font-mono mb-1 font-bold">
                          Segundos
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={exactSecondsInput}
                          onChange={(e) => setExactSecondsInput(e.target.value)}
                          className="w-20 text-center text-3xl font-black font-mono bg-[#1c1a27] border border-[#22e584]/60 rounded-xl text-[#22e584] py-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {[
                        { label: '+10s', s: 10 },
                        { label: '+30s', s: 30 },
                        { label: '+1 min', s: 60 },
                        { label: '+2 min', s: 120 },
                        { label: '-30s', s: -30 },
                      ].map((adj) => (
                        <button
                          key={adj.label}
                          onClick={() => {
                            const curM = parseInt(exactMinutesInput) || 0;
                            const curS = parseInt(exactSecondsInput) || 0;
                            const total = Math.max(10, curM * 60 + curS + adj.s);
                            setExactMinutesInput(Math.floor(total / 60).toString());
                            setExactSecondsInput((total % 60).toString().padStart(2, '0'));
                          }}
                          className="px-2.5 py-1.5 bg-[#25242c] hover:bg-[#31303a] border border-zinc-700 text-[#22e584] rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          {adj.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <span className="text-zinc-400 block text-[11px] mb-1.5 font-bold">
                        Preajustes rápidos:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: '1:00 min', m: 1, s: 0 },
                          { label: '2:30 min', m: 2, s: 30 },
                          { label: '3:00 min', m: 3, s: 0 },
                          { label: '5:00 min', m: 5, s: 0 },
                          { label: '7:30 min', m: 7, s: 30 },
                          { label: '10:00 min', m: 10, s: 0 },
                          { label: '15:00 min', m: 15, s: 0 },
                          { label: '20:00 min', m: 20, s: 0 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              handleApplyExactTime(preset.m, preset.s);
                            }}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                              totalInitialSeconds === preset.m * 60 + preset.s
                                ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                                : 'bg-[#25242c] border-zinc-700 text-zinc-200 hover:border-[#22e584] hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const m = parseInt(exactMinutesInput) || 0;
                        const s = parseInt(exactSecondsInput) || 0;
                        handleApplyExactTime(m, s);
                        setIsSettingsModalOpen(false);
                      }}
                      className="w-full mt-3 py-2.5 bg-[#22e584] hover:bg-[#10b981] text-[#0e0c15] font-black text-xs rounded-xl cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Guardar y Aplicar Tiempo</span>
                      <strong className="text-[#f0f0f2] bg-[#0e0c15] px-2 py-0.5 rounded text-[11px]">
                        {(parseInt(exactMinutesInput) || 0).toString().padStart(2, '0')}:
                        {(parseInt(exactSecondsInput) || 0).toString().padStart(2, '0')}
                      </strong>
                    </button>
                  </div>
                )}

                {/* Tab 1.5: Teacher Rules & Mechanics */}
                {settingsTab === 'rules' && (
                  <div className="space-y-3.5 pt-1">
                    {/* 1. Penalización de Tiempo por Error */}
                    <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                      <label className="text-[11px] font-bold text-amber-300 block">
                        ⏳ Penalización de Reloj al Fallar una Cámara
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { v: 0, label: '0s (Sin resta)' },
                          { v: 10, label: '-10 seg' },
                          { v: 20, label: '-20s (Estándar)' },
                          { v: 30, label: '-30s (Experto)' },
                        ].map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => {
                              playBalatroSound('select');
                              setWrongAnswerPenaltySecs(opt.v);
                            }}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                              wrongAnswerPenaltySecs === opt.v
                                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                                : 'bg-[#1e1133] border-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Cantidad de Cámaras a Resolver */}
                    <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                      <label className="text-[11px] font-bold text-emerald-300 block">
                        🚪 Cantidad de Cámaras a Resolver en la Partida
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { v: 0, label: `Todas (${questions.length})` },
                          { v: 3, label: '3 Cámaras' },
                          { v: 5, label: '5 Cámaras' },
                          { v: 7, label: '7 Cámaras' },
                          { v: 10, label: '10 Cámaras' },
                        ].map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => {
                              playBalatroSound('select');
                              setMaxChambersLimit(opt.v);
                            }}
                            className={`py-1.5 px-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                              maxChambersLimit === opt.v
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                                : 'bg-[#1e1133] border-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Orden de las Cámaras & Impulso de Sprint */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                        <label className="text-[11px] font-bold text-cyan-300 block">
                          🔀 Orden de las Cámaras
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShuffleChambers(false)}
                            className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              !shuffleChambers
                                ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                                : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                            }`}
                          >
                            Orden Fijo
                          </button>
                          <button
                            type="button"
                            onClick={() => setShuffleChambers(true)}
                            className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              shuffleChambers
                                ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                                : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                            }`}
                          >
                            Barajar Azar
                          </button>
                        </div>
                      </div>

                      <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                        <label className="text-[11px] font-bold text-purple-300 block">
                          ⚡ Impulso de Sprint al Acertar
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { v: 8, label: 'Corto' },
                            { v: 14, label: 'Normal' },
                            { v: 24, label: 'Turbo' },
                          ].map((b) => (
                            <button
                              key={b.v}
                              type="button"
                              onClick={() => setCorrectBoostAmount(b.v)}
                              className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                correctBoostAmount === b.v
                                  ? 'bg-purple-500 text-white border-purple-400'
                                  : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Puntos por Cámara & Animación de Susto Final */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                        <label className="text-[11px] font-bold text-amber-300 block">
                          ⭐ Puntos por Cámara Resuelta
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[100, 250, 500].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setPointsPerChamber(pts)}
                              className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                pointsPerChamber === pts
                                  ? 'bg-amber-500 text-zinc-950 border-amber-400'
                                  : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                              }`}
                            >
                              {pts} pts
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                        <label className="text-[11px] font-bold text-rose-300 block">
                          👻 Animación de Susto (Jumpscare)
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEnableJumpscare(true)}
                            className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                              enableJumpscare
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                            }`}
                          >
                            👻 Susto ON
                          </button>
                          <button
                            type="button"
                            onClick={() => setEnableJumpscare(false)}
                            className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                              !enableJumpscare
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                                : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                            }`}
                          >
                            🛡️ Tranquilo
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playBalatroSound('play');
                        setIsSettingsModalOpen(false);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl cursor-pointer shadow-lg transition-colors"
                    >
                      Guardar Reglas del Docente
                    </button>
                  </div>
                )}

                {/* Tab 2: Gemini AI */}
                {settingsTab === 'ai' && (
                  <div className="space-y-3 pt-1">
                    <span className="text-zinc-300 block text-xs">
                      Genera 4 preguntas al instante escribiendo un tema de clase:
                    </span>
                    <input
                      type="text"
                      value={aiTopicInput}
                      onChange={(e) => setAiTopicInput(e.target.value)}
                      placeholder="Ej. Leyes de Newton, Célula animal, Revolución Francesa..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-purple-500/40 rounded-lg text-white font-sans text-xs"
                    />
                    <button
                      disabled={isAiGenerating || !aiTopicInput.trim()}
                      onClick={handleGenerateQuestionsWithAi}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isAiGenerating ? 'Generando preguntas con IA...' : 'Generar Preguntas con IA (Gemini)'}
                    </button>
                  </div>
                )}

                {/* Tab 3: Manual Questions */}
                {settingsTab === 'questions' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-bold text-xs">
                        Preguntas de la Partida ({questions.length}):
                      </span>
                      <button
                        type="button"
                        onClick={handleResetDefaultQuestions}
                        className="text-[10px] font-mono text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        Restaurar Preguntas Base
                      </button>
                    </div>

                    <div className="space-y-1.5 h-auto pr-1">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between gap-2"
                        >
                          <span className="text-amber-300 line-clamp-1 text-xs">
                            {idx + 1}. {q.question}
                          </span>
                          {questions.length > 1 && (
                            <button
                              onClick={() => {
                                const filtered = questions.filter((_, i) => i !== idx);
                                setQuestions(filtered);
                                localStorage.setItem('po_custom_escape_questions', JSON.stringify(filtered));
                                if (room && isHost) {
                                  socketClient.updateEscapeConfig(filtered, totalInitialSeconds);
                                }
                              }}
                              aria-label={`Eliminar pregunta ${idx + 1}`}
                              className="text-red-400 p-1 cursor-pointer hover:text-red-300 shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add New Manual Question Form */}
                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                      <span className="text-[11px] font-bold text-blue-300 block">
                        + Añadir Nueva Pregunta Manual:
                      </span>
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="Escribe el enunciado de la pregunta..."
                        className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={newOpt0}
                          onChange={(e) => setNewOpt0(e.target.value)}
                          placeholder="Opción A (Requerida)"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={newOpt1}
                          onChange={(e) => setNewOpt1(e.target.value)}
                          placeholder="Opción B (Requerida)"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={newOpt2}
                          onChange={(e) => setNewOpt2(e.target.value)}
                          placeholder="Opción C (Opcional)"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={newOpt3}
                          onChange={(e) => setNewOpt3(e.target.value)}
                          placeholder="Opción D (Opcional)"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-[11px]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                          <span>Correcta:</span>
                          {['A', 'B', 'C', 'D'].map((letter, idx) => (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => setNewCorrectIdx(idx)}
                              className={`w-6 h-6 rounded font-bold cursor-pointer ${
                                newCorrectIdx === idx
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={!newQuestionText.trim() || !newOpt0.trim() || !newOpt1.trim()}
                          onClick={handleAddManualQuestion}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={13} />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }



  // ----------------------------------------------------------------------
  // B. TEACHER SPECTATOR DASHBOARD (CAMERAS + LEADERBOARD, ZERO PARTICIPATION)
  // ----------------------------------------------------------------------
  const isTeacherView = Boolean(
    !isSoloPractice && (
      isTeacherSpectator ||
        (room && room.hostIsSpectator && room.hostId === currentUserId) ||
        (typeof window !== 'undefined' && localStorage.getItem('po_user_role') === 'teacher')
    )
  );
  if (isTeacherView) {
    return (
      <div className="relative w-full min-h-screen h-auto">
        {isCountdownActive && (
          <MatchStartCountdown
            onComplete={handleCountdownComplete}
            subtitle="¡INICIANDO ESCAPE ROOM EN VIVO!"
          />
        )}
        <TeacherSpectatorDashboard
          gameType="escape_room"
          gameTitle={activePackTitle}
          room={room}
          players={players}
          roomCode={room?.code || '191440'}
          totalInitialSeconds={totalInitialSeconds}
          timeRemainingSecs={timeRemaining}
          totalQuestions={questions.length}
          currentQuestionText={activeQuestion?.question}
          currentOptions={activeQuestion?.options}
          correctOptionIndex={activeQuestion?.correctOptionIndex}
          onOpenGradeSummary={() => setIsTeacherSummaryOpen(true)}
          onGoLobby={handleReturnToLobby}
          onGoHome={onGoHome}
        />

        {/* Teacher Grade Summary Modal */}
        {isTeacherSummaryOpen && (
          <TeacherGradeSummaryModal
            onClose={() => setIsTeacherSummaryOpen(false)}
            results={studentResults}
            roomCode={room?.code || '191440'}
            gameTitle="Escape Room Didáctico: Mazmorra Alquímica"
            onReturnToLobby={() => {
              setIsTeacherSummaryOpen(false);
              handleReturnToLobby();
            }}
            onRestartMatch={() => {
              setIsTeacherSummaryOpen(false);
              handleStartMatchFromLobby();
            }}
          />
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // C. STUDENT IN-GAME MATCH (HEAT GUARDIAN LAYOUT: LEFT MONOLITH QUESTIONS
  //    + FULL-BLEED MOVING SNOWY FOREST CHASE & GIANT SKY COUNTER BACKGROUND)
  // ----------------------------------------------------------------------
  // Keep both characters ALWAYS visible in the open snowy stage to the right of the monolith
  // and always positioned close to each other regardless of total/remaining time
  const scenePlayerLeft = Math.min(76, Math.max(64, playerX));
  const sceneMonsterLeft = Math.min(scenePlayerLeft - 5.5, Math.max(54, monsterX));

  return (
    <div className="relative w-full min-h-screen h-auto bg-[#0e0c15] text-[#f0f0f2] font-sans select-none flex flex-col lg:flex-row">
      {isCountdownActive && (
        <MatchStartCountdown
          onComplete={handleCountdownComplete}
          subtitle="¡PREPÁRENSE PARA ESCAPAR!"
        />
      )}

      {/* =====================================================================
          1. FULL-BLEED BACKGROUND: MOVING PARALLAX SNOWY PINE FOREST CHASE + SKY COUNTER
      ===================================================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base II SILHOUETTE Sky, Mist, Snowfall & Vignette */}
        <HeatGuardianAtmosphere
          variant="crimson_mist"
          showGuardianScene={false}
          sceneOpacity={1}
        />

        {/* PARALLAX LAYER 1: DISTANT MISTY PINE LINE (Continuous Left Scroll) */}
        <div
          className={`absolute inset-y-0 left-0 w-[200%] flex ${
            sprintBoost > 0
              ? 'animate-[infinite-corridor_9s_linear_infinite]'
              : 'animate-[infinite-corridor_16s_linear_infinite]'
          }`}
        >
          {[0, 1].map((tileIdx) => (
            <svg
              key={`far-forest-tile-${tileIdx}`}
              className="w-1/2 h-full object-cover shrink-0"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="none"
            >
              <g fill="#cbd5e1" opacity="0.48">
                {[
                  60, 140, 220, 310, 390, 470, 560, 640, 730, 810, 900, 980,
                  1070, 1150, 1240, 1320, 1410, 1490, 1580, 1660, 1750, 1840,
                ].map((x, idx) => {
                  const h = 155 + ((idx * 37) % 95);
                  const baseY = 855;
                  return (
                    <g key={`far-pine-${tileIdx}-${x}`}>
                      <polygon
                        points={`${x},${baseY - h} ${x - 36},${baseY - h * 0.55} ${x + 36},${baseY - h * 0.55}`}
                      />
                      <polygon
                        points={`${x},${baseY - h * 0.75} ${x - 48},${baseY - h * 0.28} ${x + 48},${baseY - h * 0.28}`}
                      />
                      <polygon
                        points={`${x},${baseY - h * 0.45} ${x - 60},${baseY} ${x + 60},${baseY}`}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          ))}
        </div>

        {/* PARALLAX LAYER 2: MIDGROUND DARK SLATE PINE FOREST (Faster Continuous Left Scroll) */}
        <div
          className={`absolute inset-y-0 left-0 w-[200%] flex ${
            sprintBoost > 0
              ? 'animate-[infinite-corridor_4.8s_linear_infinite]'
              : 'animate-[infinite-corridor_8.2s_linear_infinite]'
          }`}
        >
          {[0, 1].map((tileIdx) => (
            <svg
              key={`mid-forest-tile-${tileIdx}`}
              className="w-1/2 h-full object-cover shrink-0"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="none"
            >
              <g fill="#334155" opacity="0.68">
                {[
                  80, 210, 340, 480, 610, 750, 890, 1030, 1170, 1310, 1450, 1590, 1730, 1860,
                ].map((x, idx) => {
                  const h = 215 + ((idx * 53) % 115);
                  const baseY = 895;
                  return (
                    <g key={`mid-pine-${tileIdx}-${x}`}>
                      <polygon
                        points={`${x},${baseY - h} ${x - 44},${baseY - h * 0.6} ${x + 44},${baseY - h * 0.6}`}
                      />
                      <polygon
                        points={`${x},${baseY - h * 0.78} ${x - 58},${baseY - h * 0.3} ${x + 58},${baseY - h * 0.3}`}
                      />
                      <polygon
                        points={`${x},${baseY - h * 0.48} ${x - 72},${baseY} ${x + 72},${baseY}`}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          ))}
        </div>

        {/* PARALLAX LAYER 3: FOREGROUND SNOWY GROUND, SCRUBS, ROCKS & TRACKS (High-Speed Running Illusion) */}
        <div
          className={`absolute inset-y-0 left-0 w-[200%] flex ${
            sprintBoost > 0
              ? 'animate-[infinite-corridor_1.9s_linear_infinite]'
              : 'animate-[infinite-corridor_3.2s_linear_infinite]'
          }`}
        >
          {[0, 1].map((tileIdx) => (
            <svg
              key={`fg-ground-tile-${tileIdx}`}
              className="w-1/2 h-full object-cover shrink-0"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`escapeMistGrad-${tileIdx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b86b5e" stopOpacity="0.22" />
                  <stop offset="55%" stopColor="#cbd5e1" stopOpacity="0.68" />
                  <stop offset="100%" stopColor="#0f171c" stopOpacity="0.96" />
                </linearGradient>
              </defs>

              {/* Ground Fog */}
              <rect x="0" y="700" width="1920" height="380" fill={`url(#escapeMistGrad-${tileIdx})`} />

              {/* Seamless Rolling Snowbank (Starts and ends at Y=890 for seamless tiling) */}
              <path
                d="M 0 1080 L 0 890 Q 240 865 480 890 T 960 890 T 1440 890 T 1920 890 L 1920 1080 Z"
                fill="#d8e2eb"
                opacity="0.9"
              />

              {/* Seamless Dark Foreground Ridge & Trail (Starts and ends at Y=950) */}
              <path
                d="M 0 1080 L 0 950 Q 320 925 640 950 T 1280 950 T 1920 950 L 1920 1080 Z"
                fill="#0f171c"
                opacity="0.9"
              />

              {/* Passing Foreground Scrubs, Rocks, and Snow Trail Streaks for Strong Motion Reference */}
              {[120, 310, 520, 740, 950, 1160, 1380, 1590, 1790].map((x, idx) => (
                <g key={`fg-scrub-${tileIdx}-${x}`}>
                  {/* Dark Winter Bush / Rock Silhouette */}
                  <polygon
                    points={`${x},945 ${x - 28},945 ${x - 14},${905 - (idx % 3) * 14}`}
                    fill="#1e293b"
                    opacity="0.85"
                  />
                  <polygon
                    points={`${x + 18},948 ${x - 10},948 ${x + 4},${915 - (idx % 2) * 12}`}
                    fill="#0f171c"
                    opacity="0.9"
                  />
                  {/* Snow Track Dashes on the Running Path */}
                  <rect
                    x={x - 45}
                    y={920 + (idx % 3) * 10}
                    width={65}
                    height={4}
                    rx={2}
                    fill="#94a3b8"
                    opacity="0.65"
                  />
                  <rect
                    x={x + 30}
                    y={965 + (idx % 2) * 12}
                    width={85}
                    height={3}
                    rx={1.5}
                    fill="#475569"
                    opacity="0.55"
                  />
                </g>
              ))}
            </svg>
          ))}
        </div>

        {/* HORIZONTAL WIND & SNOW SPEED LINES ACROSS THE CHASE CORRIDOR */}
        <div className="absolute inset-x-0 bottom-[10%] h-44 overflow-hidden pointer-events-none z-15">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((lineIdx) => (
            <div
              key={`wind-streak-${lineIdx}`}
              className="absolute right-0 h-[2px] bg-gradient-to-l from-transparent via-white/45 to-transparent animate-speed-streak"
              style={{
                top: `${12 + lineIdx * 11}%`,
                width: `${90 + (lineIdx % 3) * 55}px`,
                animationDelay: `${lineIdx * 0.14}s`,
                animationDuration: sprintBoost > 0 ? '0.45s' : '0.75s',
              }}
            />
          ))}
        </div>

        {/* =================================================================
            GIANT SKY COUNTER & PURSUIT TELEMETRY IN THE BACKGROUND SKY
        ================================================================= */}
        <div className="absolute inset-x-0 top-3 sm:top-7 lg:pl-[430px] xl:pl-[470px] px-4 flex flex-col items-center justify-center z-10">
          {/* Top Atmospheric Label */}
          <div className="flex items-center gap-2.5 px-3.5 py-1 bg-[#0b1114]/80 border border-[#26353d] backdrop-blur-sm mb-1">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-amber-400 font-bold">
              PERSECUCIÓN EN VIVO · CÁMARA {currentQuestionIndex + 1} DE {questions.length}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-300 font-bold">
              ⭐ {score} PTS
            </span>
          </div>

          {/* MONUMENTAL STENCIL COUNTDOWN CLOCK IN THE SKY */}
          <div
            className={`font-sans font-black tracking-[0.06em] leading-none select-none transition-all duration-300 ${
              timeRemaining <= 15
                ? 'text-5xl sm:text-7xl lg:text-[6.8rem] text-red-500 animate-urgent-thump drop-shadow-[0_0_45px_rgba(239,68,68,0.95)]'
                : timeRemaining <= 45
                ? 'text-5xl sm:text-7xl lg:text-[6.4rem] text-red-300 animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                : 'text-5xl sm:text-7xl lg:text-[6.2rem] text-[#f1f5f9]'
            }`}
            style={{
              textShadow:
                timeRemaining <= 45
                  ? '0 4px 0 #7f1d1d, 0 12px 36px rgba(0,0,0,0.95)'
                  : '0 3px 0 #334155, 0 12px 32px rgba(0,0,0,0.9)',
            }}
          >
            {formatTime(timeRemaining)}
          </div>

          {/* Distance & Danger Status Pill under the Sky Counter */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <div
              className={`px-3.5 py-1 border font-mono text-xs sm:text-sm font-black uppercase tracking-[0.18em] flex items-center gap-2 shadow-xl ${
                distanceMeters <= 9
                  ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
                  : distanceMeters <= 12
                  ? 'bg-amber-950/90 border-amber-500/70 text-amber-200'
                  : 'bg-[#0b1114]/85 border-[#26353d] text-slate-200'
              }`}
            >
              <span>👾 SOMBRA A {distanceMeters}M DE DISTANCIA</span>
              {sprintBoost > 0 && (
                <span className="text-amber-300 font-black">· ⚡ SPRINT ACTIVO</span>
              )}
            </div>

            {timeRemaining <= 15 && (
              <span className="px-3 py-1 bg-red-600 text-white font-mono text-xs font-black uppercase tracking-widest animate-bounce">
                💀 ¡PELIGRO INMINENTE!
              </span>
            )}
          </div>
        </div>

        {/* =================================================================
            SMALLER, CLOSE-PROXIMITY CHASE ACTORS & FORTIFIED BUNKER EXIT GATE
        ================================================================= */}
        {/* FORTIFIED ARCTIC BUNKER & THERMAL PORTAL EXIT GATE ON FAR RIGHT */}
        <div className="absolute right-3 sm:right-8 bottom-[12.5%] z-20">
          <EscapeBunkerGate
            isOpen={isExitDoorVisible || isVictory}
            currentChamber={currentQuestionIndex + 1}
            totalChambers={questions.length}
          />
        </div>

        {/* PURSUING SHADOW MONSTER (SMALLER & ALWAYS CLOSE BEHIND THE GUARDIAN) */}
        <div
          style={{
            left: `${sceneMonsterLeft}%`,
            bottom: '13.5%',
            transition: 'left 0.35s ease-out',
          }}
          className="absolute -translate-x-1/2 z-20 flex flex-col items-center animate-monster-lunge select-none"
        >
          <div className="mb-0.5 px-1.5 py-0.5 bg-red-950/90 border border-red-500/70 text-[8px] font-mono font-black uppercase tracking-wider text-red-300 whitespace-nowrap">
            LA SOMBRA
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-3 rounded-full bg-red-600/30 blur-md animate-pulse" />
            <img
              src={
                distanceMeters <= 10 || timeRemaining <= 30
                  ? '/assets/aistudio/monster_clean_lunge.png'
                  : '/assets/aistudio/monster_clean.png'
              }
              alt="Monstruo de sombras"
              className="h-14 sm:h-16 lg:h-20 w-auto max-w-none object-contain filter drop-shadow-[0_0_18px_rgba(239,68,68,0.95)]"
            />
          </div>
          <div className="w-11 h-2 bg-black/75 rounded-full blur-[2px] mt-0.5" />
        </div>

        {/* LONE GUARDIAN / STUDENT (SMALLER, CONTINUOUSLY RUNNING WITH SNOW KICK PUFFS) */}
        <div
          style={{
            left: `${scenePlayerLeft}%`,
            bottom: '13%',
            transition: 'left 0.35s ease-out',
          }}
          className={`absolute -translate-x-1/2 z-25 flex flex-col items-center select-none ${
            playerStumble ? 'animate-bounce' : 'animate-runner-bounce'
          }`}
        >
          <div className="mb-0.5 px-2 py-0.5 bg-[#0b1114]/90 border border-amber-400/70 text-[8px] font-mono font-black uppercase tracking-wider text-amber-300 shadow-md whitespace-nowrap">
            GUARDIÁN · {localStudentGrade} PTS
          </div>

          <div
            className={`relative flex items-center justify-center transition-transform ${
              sprintBoost > 0 ? 'scale-110 -rotate-3' : '-rotate-2'
            }`}
          >
            {/* Glowing Amber Heat Core Aura behind the Guardian's backpack */}
            <div
              className={`absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full blur-md transition-all ${
                sprintBoost > 0
                  ? 'bg-amber-300/85 scale-125'
                  : 'bg-amber-500/60 animate-pulse'
              }`}
            />
            {/* Continuous Snow Kick / Running Dust Puffs behind feet */}
            <div className="absolute -left-4 bottom-0.5 flex items-center gap-0.5 opacity-80">
              <span
                className={`inline-block w-2 h-2 rounded-full bg-slate-200/80 blur-[1px] transition-transform duration-150 ${
                  strideStep === 0 ? 'scale-125 -translate-x-1' : 'scale-75 translate-y-0.5'
                }`}
              />
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full bg-white/75 blur-[0.5px] transition-transform duration-150 ${
                  strideStep === 1 ? 'scale-125 -translate-x-1.5 -translate-y-0.5' : 'scale-50'
                }`}
              />
            </div>

            <img
              src={
                strideStep === 0
                  ? '/assets/aistudio/player_run_1.png'
                  : '/assets/aistudio/player_run_2.png'
              }
              alt="Estudiante escapando"
              className="relative z-10 h-11 sm:h-14 lg:h-16 w-auto max-w-none object-contain pixel-art filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]"
            />
          </div>

          <div className="w-9 h-1.5 bg-black/75 rounded-full blur-[1.5px] mt-0.5" />
        </div>

        {/* Bottom 10-Chamber Trail Progress Bar across the Snowy Horizon */}
        <div className="absolute bottom-3 inset-x-4 lg:left-[445px] xl:left-[490px] lg:right-8 z-20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-[#0b1114]/80 px-3 py-1 border border-[#26353d]">
            <span>RUTA DE ESCAPE ({currentQuestionIndex} / {questions.length} CÁMARAS SUPERADAS)</span>
            <span className="text-amber-300 font-bold">{activePackTitle}</span>
          </div>
          <div className="grid grid-cols-10 gap-1 bg-[#0b1114]/90 p-1 border border-[#26353d]">
            {questions.map((q, idx) => {
              const isPassed = idx < currentQuestionIndex;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <div
                  key={q.id || idx}
                  className={`h-2 transition-all ${
                    isPassed
                      ? 'bg-[#22e584]'
                      : isCurrent
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-[#18242b]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Red Danger Vignette when Monster is < 15m */}
        {distanceMeters <= 15 && (
          <div className="absolute inset-0 border-4 border-red-500/80 animate-pulse bg-red-950/20 shadow-[inset_0_0_60px_rgba(239,68,68,0.6)] z-30" />
        )}
      </div>

      {/* =====================================================================
          2. LEFT VERTICAL MONOLITH COLUMN: QUESTIONS & ANSWERS AT THE SIDE
             (II SILHOUETTE EDITORIAL PALETTE & STYLE)
      ===================================================================== */}
      {!isVictory && !isGameOver && (
        <aside className="relative z-20 w-full lg:w-[405px] xl:w-[445px] lg:ml-[3%] lg:my-4 min-h-[calc(100vh-2rem)] h-auto shrink-0 bg-[#0e0c15]/95 backdrop-blur-2xl border border-zinc-700/80 rounded-none lg:rounded-2xl shadow-[0_0_70px_rgba(0,0,0,0.85)] flex flex-col justify-between px-5 py-5 sm:px-7 sm:py-7">
          {/* TOP OF MONOLITH: Monumental Stacked Title */}
          <div className="relative z-10 text-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9e1b24] font-bold block mb-1">
              ◇ EXPEDICIÓN CONTRARRELOJ
            </span>
            <div className="font-serif font-bold uppercase text-3xl sm:text-4xl lg:text-[2.6rem] leading-[0.95] tracking-[0.12em] text-[#f0f0f2]">
              CÁMARA {String(currentQuestionIndex + 1).padStart(2, '0')}
            </div>
            <div className="font-mono font-bold uppercase text-xs sm:text-sm leading-tight tracking-[0.2em] text-zinc-400 mt-1.5">
              DE {String(questions.length).padStart(2, '0')} · {activeQuestion.subject}
            </div>
            <div className="mt-2.5 inline-block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#22e584] bg-[#25242c] border border-zinc-700 rounded-full py-1 px-4 shadow-sm">
              {activeQuestion.chamberTitle}
            </div>
          </div>

          {/* CENTER OF MONOLITH: Question Prompt + Vertical Menu-Style Options */}
          <div className="relative z-10 my-4 lg:my-auto space-y-4">
            {/* Question Statement Box */}
            <div className="bg-[#181622] border border-zinc-700/80 rounded-xl p-4 sm:p-5 shadow-inner">
              <p className="text-xs sm:text-sm lg:text-[15px] font-sans font-bold text-[#f0f0f2] leading-relaxed">
                {activeQuestion.question}
              </p>
            </div>

            {/* 4 Vertical Options Styled with II SILHOUETTE Slate & Emerald/Crimson Accents */}
            <div className="flex flex-col gap-2.5">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === activeQuestion.correctOptionIndex;
                const letter = String.fromCharCode(65 + idx);

                let optionClasses =
                  'bg-[#14121d] hover:bg-[#25242c] border-zinc-700/80 hover:border-[#22e584] text-[#f0f0f2]';

                if (isAnswered) {
                  if (isCorrect) {
                    optionClasses =
                      'bg-[#22e584]/20 border-[#22e584] text-[#f0f0f2] shadow-[0_0_20px_rgba(34,229,132,0.3)]';
                  } else if (isSelected) {
                    optionClasses =
                      'bg-[#9e1b24]/30 border-[#9e1b24] text-[#f0f0f2]';
                  } else {
                    optionClasses =
                      'bg-[#0e0c15]/60 border-zinc-800 text-zinc-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered || isPaused}
                    onClick={() => handleAnswerQuestion(idx)}
                    className={`group relative w-full px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-not-allowed ${optionClasses}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#25242c] border border-zinc-600 group-hover:border-[#22e584] text-[#22e584] font-mono font-black text-xs flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-bold tracking-wide leading-snug">
                        {opt}
                      </span>
                    </div>

                    <span
                      className={`text-xs shrink-0 transition-all ${
                        isAnswered && isCorrect
                          ? 'text-[#22e584] opacity-100'
                          : isAnswered && isSelected
                          ? 'text-[#9e1b24] opacity-100'
                          : 'text-[#f0f0f2] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-[#22e584]'
                      }`}
                    >
                      {isAnswered && isCorrect ? (
                        <CheckCircle2 size={16} className="text-[#22e584]" />
                      ) : (
                        '▶'
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Feedback or Instruction inside Monolith */}
            <div className="min-h-[28px] flex items-center justify-center text-center px-2">
              {feedback ? (
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    feedback.includes('CORRECTO')
                      ? 'bg-[#22e584]/20 text-[#22e584] border border-[#22e584]'
                      : 'bg-[#9e1b24]/30 text-rose-200 border border-[#9e1b24]'
                  }`}
                >
                  {feedback}
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-400">
                  TECLAS [A-D] O [1-4] ·{' '}
                  {wrongAnswerPenaltySecs > 0
                    ? `ERROR: -${wrongAnswerPenaltySecs}S`
                    : 'SIN PENALIZACIÓN DE RELOJ'}
                </span>
              )}
            </div>
          </div>

          {/* BOTTOM OF MONOLITH: Non-stretching Icon Controls + Confirmation Modals */}
          <div className="relative z-10 pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-center flex-wrap gap-2">
              {(isTeacherSpectator || isHost) && (
                <TeacherPauseToggleButton
                  isPaused={isPaused}
                  onToggle={handleTogglePause}
                />
              )}

              <ExpandableIconButton
                onClick={toggleMatchFullscreen}
                icon={<Maximize2 size={15} />}
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
                icon={<ArrowLeft size={15} />}
                label="Menú"
                variant="danger"
              />
            </div>

            <div className="text-center text-[10px] font-serif font-bold uppercase tracking-[0.22em] text-zinc-400">
              ◇ ESCAPE GUARDIAN · {room?.code || 'SOLO'}
            </div>
          </div>
        </aside>
      )}

      {/* Global Student Pause Lock Overlay */}
      <StudentPauseLockOverlay
        isPaused={isPaused}
        isTeacher={isTeacherSpectator}
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

      {/* 5. JUMPSCARE CINEMATIC SEQUENCE */}
      {isJumpscareActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none bg-black cursor-none">
          {/* Strobe background flashing red and black */}
          <div className="absolute inset-0 animate-jumpscare-strobe pointer-events-none" />

          {/* Violent Screen Tremor container */}
          <div className="relative w-full h-full flex items-center justify-center animate-violent-shake">
            
            {/* Dark vignetted abyssal overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(180,0,0,0.55)_55%,rgba(0,0,0,0.96)_100%)] pointer-events-none" />

            {/* Glowing Claw Slash FX SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              {/* Claw Slash 1 */}
              <path
                d="M 120 180 Q 520 480 880 780"
                stroke="#ff1133"
                strokeWidth="16"
                strokeLinecap="round"
                className="animate-claw-slash filter drop-shadow-[0_0_15px_#ff0033]"
              />
              {/* Claw Slash 2 */}
              <path
                d="M 180 140 Q 580 440 940 740"
                stroke="#ff4466"
                strokeWidth="12"
                strokeLinecap="round"
                className="animate-claw-slash filter drop-shadow-[0_0_20px_#ff0033]"
                style={{ animationDelay: '0.07s' }}
              />
              {/* Claw Slash 3 */}
              <path
                d="M 240 100 Q 640 400 990 700"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                className="animate-claw-slash filter drop-shadow-[0_0_25px_#ff1111]"
                style={{ animationDelay: '0.14s' }}
              />
              {/* Violent Cross slash */}
              <path
                d="M 850 150 Q 500 500 150 850"
                stroke="#ff0000"
                strokeWidth="14"
                strokeLinecap="round"
                className="animate-claw-slash filter drop-shadow-[0_0_30px_#ff0000]"
                style={{ animationDelay: '0.2s' }}
              />
            </svg>

            {/* Demonic Lunging Monster Sprite with glowing crimson eyes */}
            <div className="relative z-20 flex flex-col items-center justify-center animate-jumpscare-zoom">
              <img
                src="/assets/aistudio/monster_clean_lunge.png"
                alt="Monster Jumpscare"
                className="w-72 sm:w-96 md:w-[32rem] max-w-none object-contain filter drop-shadow-[0_0_60px_rgba(255,0,0,1)] brightness-125 select-none"
              />
              {/* Piercing glowing crimson eyes overlay */}
              <div className="absolute top-[34%] flex gap-12 sm:gap-16 pointer-events-none">
                <div className="w-5 h-5 sm:w-7 sm:h-7 bg-red-500 rounded-full blur-[2px] animate-ping" />
                <div className="w-5 h-5 sm:w-7 sm:h-7 bg-red-500 rounded-full blur-[2px] animate-ping delay-75" />
              </div>
            </div>

            {/* Terrifying horror text */}
            <div className="absolute bottom-12 sm:bottom-16 z-40 text-center px-4">
              <h1 className="font-medieval text-4xl sm:text-6xl md:text-7xl font-black text-red-500 animate-glitch-text tracking-widest uppercase drop-shadow-[0_0_35px_rgba(255,0,0,1)]">
                ¡TE ATRAPÓ LA SOMBRA!
              </h1>
              <p className="font-retro-mono text-xs sm:text-sm text-red-200 mt-2 font-bold tracking-widest uppercase opacity-90 animate-pulse">
                La oscuridad te devoró en la mazmorra...
              </p>
            </div>

            {/* Red blood vignette borders */}
            <div className="absolute inset-0 border-[16px] sm:border-[24px] border-red-700/80 pointer-events-none animate-pulse" />
          </div>
        </div>
      )}

      {/* 6. VICTORY MODAL */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#150d26] border-2 border-amber-500 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl"
          >
            <span className="text-5xl animate-bounce">🚪✨</span>
            <h2 className="font-medieval text-2xl font-black text-amber-400">
              ¡ESCAPASTE CON ÉXITO!
            </h2>
            <p className="font-retro-mono text-xs text-zinc-300">
              Cruzaste la puerta de luz antes de que el monstruo te alcanzara.
            </p>
            {/* Calificación Proporcional Oficial */}
            <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-2xl text-center space-y-1.5 shadow-inner">
              <span className="text-[10px] font-retro-mono text-emerald-300 uppercase tracking-widest font-bold block">
                Calificación Proporcional Obtenida
              </span>
              <div className="text-4xl font-black font-mono text-emerald-300">
                {localStudentGrade} <span className="text-sm font-normal text-zinc-400">/ 100</span>
              </div>
              <div className="text-[11px] font-retro-mono text-zinc-300 flex items-center justify-around pt-2 border-t border-emerald-800/40">
                <span>Aciertos: <strong className="text-emerald-400">{questions.length} / {questions.length}</strong></span>
                <span>Fallos: <strong className="text-amber-300">{wrongAttempts}</strong></span>
                <span>Tiempo: <strong className="text-amber-400">{formatTime(timeRemaining)}</strong></span>
              </div>
            </div>

            {(isTeacherSpectator || isHost) && (
              <button
                onClick={() => setIsTeacherSummaryOpen(true)}
                className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📊 Ver Resumen de Notas del Curso (0 - 100 pts)</span>
              </button>
            )}

            <button
              onClick={handleStartMatchFromLobby}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <RotateCcw size={15} />
              <span>Jugar Otra Partida en esta Sala</span>
            </button>

            <button
              onClick={handleReturnToLobby}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft size={15} />
              <span>VOLVER A LA SALA DE ESPERA ({room?.code || 'LOBBY'})</span>
            </button>

            <button
              onClick={onGoHome}
              className="w-full py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
            >
              Salir al Menú Principal
            </button>
          </motion.div>
        </div>
      )}

      {/* 7. EPIC GAME OVER MODAL */}
      {isGameOver && !isVictory && !isJumpscareActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gradient-to-b from-[#240a12] via-[#140612] to-[#0a030c] border-2 border-red-500/80 p-5 sm:p-7 rounded-3xl max-w-md w-full h-auto text-center space-y-4 shadow-[0_0_60px_rgba(220,38,38,0.4)] relative"
          >
            {/* Ambient Background Aura */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Monster Skull Emblem */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-950 border-2 border-red-400 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse">
                <Skull size={36} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
              </div>
              <div className="absolute -bottom-2 px-2.5 py-0.5 bg-red-950 border border-red-500 rounded-full text-[9px] font-black text-red-300 uppercase tracking-widest">
                Derrota Fatal
              </div>
            </div>

            {/* Title & Lore */}
            <div className="pt-2">
              <h2 className="font-medieval text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-500 tracking-wide">
                ¡CAÍSTE EN LAS SOMBRAS!
              </h2>
              <p className="font-retro-mono text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                El tiempo se agotó por completo y la criatura de la mazmorra te alcanzó en la oscuridad.
              </p>
            </div>

            {/* Performance Stats Grid with Proportional Grade */}
            <div className="grid grid-cols-2 gap-2 bg-black/50 border border-red-900/40 p-3 rounded-2xl text-left text-xs font-retro-mono">
              <div className="bg-[#1f0a10]/60 p-2.5 rounded-xl border border-red-900/30">
                <span className="text-[10px] text-zinc-400 block">Cámaras Logradas</span>
                <strong className="text-sm font-black text-amber-400">
                  {currentQuestionIndex} / {questions.length}
                </strong>
              </div>
              <div className="bg-[#1f0a10]/60 p-2.5 rounded-xl border border-red-900/30">
                <span className="text-[10px] text-zinc-400 block">Nota Proporcional</span>
                <strong className={`text-base font-black ${
                  localStudentGrade >= 70 ? 'text-blue-400' :
                  localStudentGrade >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {localStudentGrade} / 100
                </strong>
              </div>
              <div className="bg-[#1f0a10]/60 p-2.5 rounded-xl border border-red-900/30">
                <span className="text-[10px] text-zinc-400 block">Puntos de Juego</span>
                <strong className="text-sm font-black text-yellow-400">
                  {score} pts
                </strong>
              </div>
              <div className="bg-[#1f0a10]/60 p-2.5 rounded-xl border border-red-900/30">
                <span className="text-[10px] text-zinc-400 block">Fallos Cometidos</span>
                <strong className="text-sm font-black text-rose-400">
                  {wrongAttempts} {wrongAttempts === 1 ? 'fallo' : 'fallos'}
                </strong>
              </div>
            </div>

            {/* Helpful Didactic Advice */}
            <div className="p-2.5 bg-red-950/40 border border-red-800/30 rounded-xl text-[11px] font-retro-mono text-zinc-300 flex items-start gap-2 text-left">
              <Flame size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Consejo:</strong> Acierta las preguntas rápidamente para obtener impulsos de sprint y distanciarte del monstruo.
              </span>
            </div>

            {/* Epic Actions */}
            <div className="space-y-2 pt-1 font-retro-mono">
              {(isTeacherSpectator || isHost) && (
                <button
                  onClick={() => setIsTeacherSummaryOpen(true)}
                  className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📊 Ver Resumen de Notas (0 - 100 pts)</span>
                </button>
              )}

              {/* Retry Immediately */}
              <button
                onClick={() => {
                  setIsGameOver(false);
                  setIsJumpscareActive(false);
                  setTimeRemaining(totalInitialSeconds);
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setSprintBoost(0);
                  setIsTimerRunning(true);
                  playBalatroSound('play');
                }}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer shadow-[0_4px_16px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
              >
                <RotateCcw size={15} />
                <span>REINTENTAR ESCAPE</span>
              </button>

              {/* Return to Lobby to configure before next match */}
              <button
                onClick={handleReturnToLobby}
                className="w-full py-2.5 bg-[#1f1233] hover:bg-[#2d1b47] border border-fuchsia-500/40 rounded-xl text-fuchsia-300 hover:text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>VOLVER A LA SALA (CONFIGURAR TIEMPO / PREGUNTAS)</span>
              </button>

              {/* Exit to Menu */}
              <button
                onClick={onGoHome}
                className="w-full py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
              >
                Salir al Menú Principal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Root level Teacher Grade Summary Modal (Accessible from header or end match) */}
      {isTeacherSummaryOpen && (
        <TeacherGradeSummaryModal
          onClose={() => setIsTeacherSummaryOpen(false)}
          results={studentResults}
          roomCode={room?.code || '191440'}
          gameTitle="Escape Room Didáctico: Mazmorra Alquímica"
          onReturnToLobby={() => {
            setIsTeacherSummaryOpen(false);
            handleReturnToLobby();
          }}
          onRestartMatch={() => {
            setIsTeacherSummaryOpen(false);
            handleStartMatchFromLobby();
          }}
        />
      )}

      {/* Escape Room Infinite Library Modal */}
      <EscapeRoomLibraryModal
        isOpen={isEscapeLibraryOpen}
        defaultAuthorName={localStorage.getItem('po_player_name') || (isTeacherSpectator ? 'Profesor' : 'Estudiante')}
        onClose={() => setIsEscapeLibraryOpen(false)}
        onSelectPack={(pack) => {
          setQuestions(pack.chambers);
          setActivePackTitle(pack.title);
          localStorage.setItem('po_custom_escape_questions', JSON.stringify(pack.chambers));
          if (room && isHost) {
            socketClient.updateEscapeConfig(pack.chambers, totalInitialSeconds);
          }
          setIsEscapeLibraryOpen(false);
          playBalatroSound('deal');
        }}
      />

    </div>
  );
};
