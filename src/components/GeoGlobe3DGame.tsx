import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Globe, { GlobeInstance } from 'globe.gl';
import {
  Globe as GlobeIcon,
  Compass,
  MapPin,
  Trophy,
  Flame,
  SkipForward,
  CheckCircle2,
  XCircle,
  Send,
  RotateCcw,
  Home,
  QrCode,
  Users,
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
  ChevronDown,
  ChevronUp,
  Heart,
  Keyboard,
  ListChecks,
  Settings,
  DoorOpen,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { GamePlayer, RoomState } from '../types';
import {
  ParsedCountry,
  GeoCountryFeature,
  parseGeoJsonCountries,
  generateSameContinentOptions,
  isCountryAnswerCorrect,
} from '../lib/geoGlobeEngine';
import { MatchStartCountdown } from './MatchStartCountdown';
import { QRCodeModal } from './QRCodeModal';
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

export type GlobePlayMode = 'menu' | 'guess_country' | 'locate_country';
export type GuessInputMethod = 'multiple_choice' | 'free_text';

interface GeoGlobe3DGameProps {
  players: GamePlayer[];
  currentUserId: string;
  isTeacherSpectator?: boolean;
  isSoloPractice?: boolean;
  room?: RoomState | null;
  onGoHome: () => void;
}

/**
 * Generates a high-resolution procedural ocean & bathymetry grid texture in a 2D Canvas
 * so the 3D globe never relies on fragile external image URLs.
 */
function createProceduralOceanDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#071426');
  grad.addColorStop(0.25, '#0b223e');
  grad.addColorStop(0.5, '#0e2d52');
  grad.addColorStop(0.75, '#0b223e');
  grad.addColorStop(1, '#071426');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle cartographic meridians & parallels
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.10)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Equator highlight
  ctx.strokeStyle = 'rgba(34, 229, 132, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

const EARTH_BLUE_MARBLE_URL = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const EARTH_TOPOLOGY_BUMP_URL = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

interface GlobalHub {
  name: string;
  lat: number;
  lng: number;
  color?: string;
}

const GLOBAL_HUBS: GlobalHub[] = [
  { name: 'New York', lat: 40.7128, lng: -74.006, color: '#38bdf8' },
  { name: 'London', lat: 51.5074, lng: -0.1278, color: '#38bdf8' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, color: '#22e584' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, color: '#38bdf8' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, color: '#38bdf8' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, color: '#22e584' },
  { name: 'Bogotá', lat: 4.711, lng: -74.0721, color: '#f59e0b' },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, color: '#38bdf8' },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, color: '#38bdf8' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, color: '#38bdf8' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, color: '#22e584' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, color: '#f59e0b' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, color: '#38bdf8' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, color: '#22e584' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, color: '#38bdf8' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, color: '#38bdf8' },
  { name: 'Seoul', lat: 37.5665, lng: 126.978, color: '#38bdf8' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, color: '#22e584' },
];

const GLOBAL_ARCS = [
  { startLat: 40.7128, startLng: -74.006, endLat: 51.5074, endLng: -0.1278 },
  { startLat: 40.7128, startLng: -74.006, endLat: 37.7749, endLng: -122.4194 },
  { startLat: 40.7128, startLng: -74.006, endLat: 4.711, endLng: -74.0721 },
  { startLat: 40.7128, startLng: -74.006, endLat: -23.5505, endLng: -46.6333 },
  { startLat: 51.5074, startLng: -0.1278, endLat: 48.8566, endLng: 2.3522 },
  { startLat: 51.5074, startLng: -0.1278, endLat: 50.1109, endLng: 8.6821 },
  { startLat: 51.5074, startLng: -0.1278, endLat: 40.4168, endLng: -3.7038 },
  { startLat: 51.5074, startLng: -0.1278, endLat: 25.2048, endLng: 55.2708 },
  { startLat: 50.1109, startLng: 8.6821, endLat: 30.0444, endLng: 31.2357 },
  { startLat: 37.7749, startLng: -122.4194, endLat: 35.6762, endLng: 139.6503 },
  { startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.978 },
  { startLat: 35.6762, startLng: 139.6503, endLat: 1.3521, endLng: 103.8198 },
  { startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093 },
  { startLat: 1.3521, startLng: 103.8198, endLat: 19.076, endLng: 72.8777 },
  { startLat: 25.2048, startLng: 55.2708, endLat: 19.076, endLng: 72.8777 },
  { startLat: 4.711, startLng: -74.0721, endLat: 19.4326, endLng: -99.1332 },
  { startLat: 4.711, startLng: -74.0721, endLat: -23.5505, endLng: -46.6333 },
  { startLat: -23.5505, startLng: -46.6333, endLat: -34.6037, endLng: -58.3816 },
  { startLat: 51.5074, startLng: -0.1278, endLat: -33.9249, endLng: 18.4241 },
];

export const GeoGlobe3DGame: React.FC<GeoGlobe3DGameProps> = ({
  players,
  currentUserId,
  isTeacherSpectator = false,
  isSoloPractice = false,
  room,
  onGoHome,
}) => {
  // Pre-game Waiting Room / Lobby vs Active 3D Globe
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

  // Lobby UI State
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isTeacherConfigOpen, setIsTeacherConfigOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSfxMuted());
  const [currentTheme, setCurrentTheme] = useState<'neon' | 'dungeon' | 'cyber'>('cyber');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Pre-game Configuration State for 3D Geography Globe (Set before match begins)
  const [continentFilter, setContinentFilter] = useState<
    'ALL' | 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania'
  >('ALL');
  const [defaultStartMode, setDefaultStartMode] = useState<GlobePlayMode>('guess_country');
  const [allowedInputMode, setAllowedInputMode] = useState<'both' | 'multiple_choice' | 'free_text'>('both');
  const [configuredMaxAttempts, setConfiguredMaxAttempts] = useState<number>(3);
  const [countryTimeLimitSecs, setCountryTimeLimitSecs] = useState<number>(0); // 0 = Sin límite
  const [countrySecondsLeft, setCountrySecondsLeft] = useState<number>(0);
  const [allowSkipButton, setAllowSkipButton] = useState<boolean>(true);
  const [showContinentHint, setShowContinentHint] = useState<boolean>(true);

  // GeoJSON Countries Dataset State
  const [countries, setCountries] = useState<ParsedCountry[]>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Game Mode & Difficulty State
  const [playMode, setPlayMode] = useState<GlobePlayMode>('menu');
  const [inputMethod, setInputMethod] = useState<GuessInputMethod>('multiple_choice');
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);

  // Active Round State
  const [targetCountry, setTargetCountry] = useState<ParsedCountry | null>(null);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<ParsedCountry[]>([]);
  const [freeTextInput, setFreeTextInput] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [roundResolved, setRoundResolved] = useState<boolean>(false);

  // Polygon visual states
  const [correctCountryId, setCorrectCountryId] = useState<string | null>(null);
  const [wrongCountryIds, setWrongCountryIds] = useState<string[]>([]);

  // Scoreboard & Feedback State
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('po_geoglobe_high_score');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [bestStreak, setBestStreak] = useState<number>(() => {
    const saved = localStorage.getItem('po_geoglobe_best_streak');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'correct' | 'wrong' | 'skipped';
    title: string;
    subtitle: string;
  } | null>(null);

  // WebGL Globe Ref
  const globeContainerRef = useRef<HTMLDivElement | null>(null);
  const globeInstanceRef = useRef<GlobeInstance | null>(null);

  // Keep latest mutable refs for Globe callbacks so WebGL canvas never re-initializes
  const playModeRef = useRef<GlobePlayMode>(playMode);
  playModeRef.current = playMode;
  const targetCountryRef = useRef<ParsedCountry | null>(targetCountry);
  targetCountryRef.current = targetCountry;
  const roundResolvedRef = useRef<boolean>(roundResolved);
  roundResolvedRef.current = roundResolved;
  const correctCountryIdRef = useRef<string | null>(correctCountryId);
  correctCountryIdRef.current = correctCountryId;
  const wrongCountryIdsRef = useRef<string[]>(wrongCountryIds);
  wrongCountryIdsRef.current = wrongCountryIds;
  const hoveredFeatureRef = useRef<GeoCountryFeature | null>(null);
  const countriesMapRef = useRef<Map<GeoCountryFeature, ParsedCountry>>(new Map());

  const isHost = room ? room.hostId === currentUserId : true;
  const effectiveIsTeacher = Boolean(
    !isSoloPractice && (
      isTeacherSpectator ||
        (room && room.hostIsSpectator && room.hostId === currentUserId) ||
        (typeof window !== 'undefined' && localStorage.getItem('po_user_role') === 'teacher')
    )
  );
  const roomCode = room?.code || (isSoloPractice ? 'SOLO' : 'GEO360');

  // Strictly filter out teacher spectators from student list
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
        25,
        'Atlas 3D: Geografía Mundial',
        isTeacherSpectator,
        'geografia_3d'
      );
    }
  }, [room, isTeacherSpectator, isSoloPractice]);

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

  // Load GeoJSON Countries Dataset
  useEffect(() => {
    let cancelled = false;
    async function loadGeoData() {
      setIsLoadingGeo(true);
      setGeoError(null);
      try {
        let res = await fetch('/datasets/countries.geojson');
        if (!res.ok) {
          res = await fetch(
            'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
          );
        }
        const data = await res.json();
        if (cancelled) return;
        const parsed = parseGeoJsonCountries(data.features || []);
        const map = new Map<GeoCountryFeature, ParsedCountry>();
        parsed.forEach((c) => map.set(c.feature, c));
        countriesMapRef.current = map;
        setCountries(parsed);
      } catch {
        if (!cancelled) {
          setGeoError('No se pudo cargar el archivo GeoJSON de países.');
        }
      } finally {
        if (!cancelled) setIsLoadingGeo(false);
      }
    }
    loadGeoData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update High Score & Best Streak in localStorage
  const registerPointsAndStreak = useCallback(
    (pointsEarned: number, newStreak: number) => {
      setCurrentScore((prev) => {
        const updated = prev + pointsEarned;
        if (updated > highScore) {
          setHighScore(updated);
          localStorage.setItem('po_geoglobe_high_score', String(updated));
        }
        return updated;
      });
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('po_geoglobe_best_streak', String(newStreak));
      }
    },
    [highScore, bestStreak]
  );

  // Filtered Country Pool according to Teacher's Continent Filter
  const filteredCountriesPool = useMemo(() => {
    if (continentFilter === 'ALL') return countries;
    if (continentFilter === 'Americas') {
      return countries.filter(
        (c) => c.continentEn === 'North America' || c.continentEn === 'South America'
      );
    }
    return countries.filter((c) => c.continentEn === continentFilter);
  }, [countries, continentFilter]);

  // Sync inputMethod when teacher restricts allowedInputMode
  useEffect(() => {
    if (allowedInputMode === 'multiple_choice') {
      setInputMethod('multiple_choice');
    } else if (allowedInputMode === 'free_text') {
      setInputMethod('free_text');
    }
  }, [allowedInputMode]);

  // Pick a random country and configure the round
  const startNextCountryRound = useCallback(
    (modeOverride?: GlobePlayMode, customPool?: ParsedCountry[]) => {
      const basePool = customPool || (filteredCountriesPool.length > 0 ? filteredCountriesPool : countries);
      if (basePool.length === 0) return;

      const activeMode = modeOverride || playModeRef.current;
      const randomCountry = basePool[Math.floor(Math.random() * basePool.length)];

      setTargetCountry(randomCountry);
      setMultipleChoiceOptions(generateSameContinentOptions(randomCountry, countries.length > 0 ? countries : basePool));
      setFreeTextInput('');
      setAttemptsLeft(configuredMaxAttempts);
      setCountrySecondsLeft(countryTimeLimitSecs);
      setRoundResolved(false);
      setCorrectCountryId(null);
      setWrongCountryIds([]);
      setFeedbackBanner(null);

      // Camera choreography depending on mode
      if (globeInstanceRef.current) {
        const controls = globeInstanceRef.current.controls();
        if (controls) {
          controls.autoRotate = false;
        }
        if (activeMode === 'guess_country') {
          // Mode 1: Fly smoothly & zoom to the mystery country
          globeInstanceRef.current.pointOfView(
            {
              lat: randomCountry.lat,
              lng: randomCountry.lng,
              altitude: randomCountry.cameraAltitude,
            },
            1350
          );
        } else if (activeMode === 'locate_country') {
          // Mode 2: Keep a comfortable global altitude so player can rotate & search
          const currentPov = globeInstanceRef.current.pointOfView();
          globeInstanceRef.current.pointOfView(
            {
              lat: currentPov.lat || 15,
              lng: currentPov.lng || 0,
              altitude: 1.85,
            },
            900
          );
        }
      }
    },
    [countries, filteredCountriesPool, configuredMaxAttempts, countryTimeLimitSecs]
  );

  // Per-country countdown timer if teacher configured countryTimeLimitSecs > 0
  useEffect(() => {
    if (
      gamePhase !== 'playing' ||
      isCountdownActive ||
      isPaused ||
      playMode === 'menu' ||
      roundResolved ||
      !targetCountry ||
      countryTimeLimitSecs <= 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      setCountrySecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playBalatroSound('hover');
          setCurrentStreak(0);
          setCorrectCountryId(targetCountry.id);
          setRoundResolved(true);
          setRoundsPlayed((r) => r + 1);
          setFeedbackBanner({
            type: 'wrong',
            title: `⏱️ ¡Tiempo agotado! Era ${targetCountry.nameEs}`,
            subtitle: `Continente: ${targetCountry.continentEs} · Pulsa «Siguiente» para continuar.`,
          });
          globeInstanceRef.current?.pointOfView(
            {
              lat: targetCountry.lat,
              lng: targetCountry.lng,
              altitude: targetCountry.cameraAltitude,
            },
            1100
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePhase, isCountdownActive, isPaused, playMode, roundResolved, targetCountry, countryTimeLimitSecs]);

  // Handle polygon click in Mode 2 ("LOCALIZA EL PAÍS")
  const handlePolygonClickRef = useRef<(feature: GeoCountryFeature) => void>(() => {});
  handlePolygonClickRef.current = (feature: GeoCountryFeature) => {
    if (isPaused) return;
    const clickedCountry = countriesMapRef.current.get(feature);
    if (!clickedCountry) return;

    // If in menu, fly to clicked country and show its name
    if (playModeRef.current === 'menu') {
      playBalatroSound('select');
      globeInstanceRef.current?.pointOfView(
        {
          lat: clickedCountry.lat,
          lng: clickedCountry.lng,
          altitude: clickedCountry.cameraAltitude,
        },
        1000
      );
      setFeedbackBanner({
        type: 'correct',
        title: `${clickedCountry.nameEs}`,
        subtitle: `Continente: ${clickedCountry.continentEs}`,
      });
      return;
    }

    // In Mode 1 ("Adivina el País"), clicking the highlighted country re-centers camera
    if (playModeRef.current === 'guess_country') {
      if (targetCountryRef.current) {
        globeInstanceRef.current?.pointOfView(
          {
            lat: targetCountryRef.current.lat,
            lng: targetCountryRef.current.lng,
            altitude: targetCountryRef.current.cameraAltitude,
          },
          900
        );
      }
      return;
    }

    // In Mode 2 ("Localiza el País")
    if (playModeRef.current === 'locate_country') {
      const target = targetCountryRef.current;
      if (!target || roundResolvedRef.current) return;

      if (clickedCountry.id === target.id) {
        // CORRECT LOCATION! Paint green
        playBalatroSound('play');
        setCorrectCountryId(target.id);
        setRoundResolved(true);
        setRoundsPlayed((r) => r + 1);

        const bonus = attemptsLeft * 50;
        const pointsEarned = 100 + bonus;
        const nextStreak = currentStreak + 1;
        registerPointsAndStreak(pointsEarned, nextStreak);

        setFeedbackBanner({
          type: 'correct',
          title: `¡Correcto! Encontraste ${target.nameEs}`,
          subtitle: `+${pointsEarned} pts · Continente: ${target.continentEs} · Racha: ${nextStreak}`,
        });

        globeInstanceRef.current?.pointOfView(
          {
            lat: target.lat,
            lng: target.lng,
            altitude: target.cameraAltitude,
          },
          1100
        );

        if (nextStreak % 3 === 0) {
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
        }
      } else {
        // WRONG COUNTRY CLICKED! Paint red & deduct attempt
        playBalatroSound('hover');
        setWrongCountryIds((prev) =>
          prev.includes(clickedCountry.id) ? prev : [...prev, clickedCountry.id]
        );

        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        setCurrentStreak(0);

        if (remaining <= 0) {
          // Out of attempts: reveal where the target country was
          setRoundResolved(true);
          setCorrectCountryId(target.id);
          setRoundsPlayed((r) => r + 1);
          setFeedbackBanner({
            type: 'wrong',
            title: `Incorrecto, tocaste ${clickedCountry.nameEs}`,
            subtitle: `Sin intentos restantes. Aquí se ubica ${target.nameEs} (${target.continentEs}).`,
          });
          globeInstanceRef.current?.pointOfView(
            {
              lat: target.lat,
              lng: target.lng,
              altitude: target.cameraAltitude,
            },
            1350
          );
        } else {
          setFeedbackBanner({
            type: 'wrong',
            title: `Incorrecto, ese país era ${clickedCountry.nameEs}`,
            subtitle: `Sigue buscando ${target.nameEs} (${target.continentEs}) · Te quedan ${remaining} ${
              remaining === 1 ? 'intento' : 'intentos'
            }.`,
          });
        }
      }
    }
  };

  // Initialize 3D Globe once when entering 'playing' phase
  useEffect(() => {
    if (gamePhase !== 'playing' || isLoadingGeo || countries.length === 0) return;
    const container = globeContainerRef.current;
    if (!container) return;

    const globe = new Globe(container, {
      rendererConfig: {
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      },
    })
      .globeImageUrl(EARTH_BLUE_MARBLE_URL)
      .bumpImageUrl(EARTH_TOPOLOGY_BUMP_URL)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.22)
      .polygonsData(countries.map((c) => c.feature))
      .polygonStrokeColor(() => 'rgba(56, 189, 248, 0.22)')
      .polygonSideColor(() => 'rgba(15, 23, 42, 0.35)')
      .arcsData(GLOBAL_ARCS)
      .arcColor(() => ['rgba(56, 189, 248, 0.88)', 'rgba(255, 255, 255, 0.95)', 'rgba(34, 229, 132, 0.75)'])
      .arcAltitude(0.24)
      .arcStroke(0.65)
      .arcDashLength(0.4)
      .arcDashGap(0.22)
      .arcDashAnimateTime(2600)
      .pointsData(GLOBAL_HUBS)
      .pointColor((d: any) => (d as GlobalHub).color || '#38bdf8')
      .pointRadius(0.38)
      .pointAltitude(0.015)
      .ringsData(GLOBAL_HUBS)
      .ringColor(() => (t: number) => `rgba(56, 189, 248, ${Math.max(0, 0.85 - t * 0.85)})`)
      .ringMaxRadius(3.2)
      .ringPropagationSpeed(1.6)
      .ringRepeatPeriod(1300)
      .polygonLabel((feat: object) => {
        const f = feat as GeoCountryFeature;
        const c = countriesMapRef.current.get(f);
        if (!c) return '';
        // In "guess_country" or "locate_country", DO NOT leak the country name on hover before round is resolved!
        if (playModeRef.current !== 'menu' && !roundResolvedRef.current) {
          return `<div style="background: rgba(15,23,42,0.92); border: 1px solid rgba(56,189,248,0.4); padding: 4px 8px; border-radius: 6px; font-family: sans-serif; font-size: 11px; color: #e2e8f0;">
            ${
              playModeRef.current === 'locate_country'
                ? 'Haz clic para seleccionar este país'
                : '¿Qué país es?'
            }
          </div>`;
        }
        return `<div style="background: rgba(15,23,42,0.94); border: 1px solid rgba(34,229,132,0.5); padding: 6px 10px; border-radius: 8px; font-family: sans-serif; font-size: 12px; color: #f8fafc; font-weight: 700;">
          🌍 ${c.nameEs} <span style="font-weight: 400; color: #94a3b8; font-size: 11px;">(${c.continentEs})</span>
        </div>`;
      })
      .onPolygonHover((hoverObj: object | null) => {
        const feat = (hoverObj as GeoCountryFeature) || null;
        if (hoveredFeatureRef.current === feat) return;
        hoveredFeatureRef.current = feat;
        if (container) {
          container.style.cursor = feat ? 'pointer' : 'grab';
        }
        // Direct layer update without React component re-rendering
        if (globeInstanceRef.current) {
          globeInstanceRef.current.polygonCapColor(globeInstanceRef.current.polygonCapColor());
          globeInstanceRef.current.polygonStrokeColor(globeInstanceRef.current.polygonStrokeColor());
        }
      })
      .onPolygonClick((clickedObj: object) => {
        if (clickedObj) {
          handlePolygonClickRef.current(clickedObj as GeoCountryFeature);
        }
      });

    // Clamp devicePixelRatio to 1.75 to prevent severe GPU fillrate load on Retina/4K displays
    try {
      const renderer = globe.renderer();
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      }
    } catch {
      // ignore
    }

    // Enable smooth OrbitControls rotation & zoom
    const controls = globe.controls();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.rotateSpeed = 0.75;
      controls.zoomSpeed = 0.9;
      controls.minDistance = 125;
      controls.maxDistance = 420;
      controls.autoRotate = playModeRef.current === 'menu';
      controls.autoRotateSpeed = 0.45;
    }

    globe.pointOfView({ lat: 18, lng: -25, altitude: 2.0 });
    globeInstanceRef.current = globe;

    const handleResize = () => {
      if (globeContainerRef.current && globeInstanceRef.current) {
        globeInstanceRef.current
          .width(globeContainerRef.current.clientWidth)
          .height(globeContainerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Pause rendering loop when document/tab is hidden or inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        globe.pauseAnimation();
      } else {
        globe.resumeAnimation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (globeInstanceRef.current) {
        try {
          globeInstanceRef.current.pauseAnimation();
          globeInstanceRef.current._destructor?.();
          globeInstanceRef.current.renderer()?.dispose();
        } catch {
          // ignore cleanup errors
        }
        globeInstanceRef.current = null;
      }
    };
  }, [gamePhase, isLoadingGeo, countries]);

  // Dynamically update polygon colors and altitudes when round state changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    globe
      .polygonAltitude((feat: object) => {
        const f = feat as GeoCountryFeature;
        const c = countriesMapRef.current.get(f);
        if (!c) return 0.006;
        if (correctCountryId === c.id) return 0.055;
        if (playMode === 'guess_country' && targetCountry?.id === c.id) return 0.05;
        if (wrongCountryIds.includes(c.id)) return 0.03;
        if (hoveredFeatureRef.current === f) return 0.025;
        return 0.006;
      })
      .polygonCapColor((feat: object) => {
        const f = feat as GeoCountryFeature;
        const c = countriesMapRef.current.get(f);
        if (!c) return 'rgba(0,0,0,0)';

        // 1. Confirmed Correct Country (Vibrant Emerald Green)
        if (correctCountryId === c.id) {
          return 'rgba(16, 185, 129, 0.82)';
        }

        // 2. Wrongly clicked or guessed Country (Vibrant Crimson Red)
        if (wrongCountryIds.includes(c.id)) {
          return 'rgba(239, 68, 68, 0.82)';
        }

        // 3. Mode 1 ("Adivina el País"): Highlight the mystery country in bright Gold/Amber
        if (playMode === 'guess_country' && targetCountry?.id === c.id) {
          return hoveredFeatureRef.current === f ? 'rgba(253, 224, 71, 0.88)' : 'rgba(245, 158, 11, 0.82)';
        }

        // 4. Subtle Hover Illumination
        if (hoveredFeatureRef.current === f) {
          return 'rgba(56, 189, 248, 0.35)';
        }

        // 5. Default transparent so satellite texture & continents shine through!
        return 'rgba(56, 189, 248, 0.02)';
      })
      .polygonStrokeColor((feat: object) => {
        const f = feat as GeoCountryFeature;
        const c = countriesMapRef.current.get(f);
        if (c && (correctCountryId === c.id || (playMode === 'guess_country' && targetCountry?.id === c.id))) {
          return '#ffffff';
        }
        if (hoveredFeatureRef.current === f) {
          return '#38bdf8';
        }
        return 'rgba(56, 189, 248, 0.22)';
      });
  }, [playMode, targetCountry, correctCountryId, wrongCountryIds, roundResolved]);

  // Start chosen game mode
  const handleSelectMode = (mode: 'guess_country' | 'locate_country') => {
    playBalatroSound('play');
    setPlayMode(mode);
    playModeRef.current = mode;
    startNextCountryRound(mode);
  };

  // Mode 1: Handle Multiple Choice Selection
  const handleMultipleChoiceAnswer = (chosen: ParsedCountry) => {
    if (isPaused || !targetCountry || roundResolved) return;

    if (chosen.id === targetCountry.id) {
      playBalatroSound('play');
      setCorrectCountryId(targetCountry.id);
      setRoundResolved(true);
      setRoundsPlayed((r) => r + 1);

      const pointsEarned = 120 + currentStreak * 20;
      const nextStreak = currentStreak + 1;
      registerPointsAndStreak(pointsEarned, nextStreak);

      setFeedbackBanner({
        type: 'correct',
        title: `¡Correcto! Es ${targetCountry.nameEs}`,
        subtitle: `+${pointsEarned} pts · Continente: ${targetCountry.continentEs} · Racha: ${nextStreak}`,
      });

      if (nextStreak % 3 === 0) {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
      }
    } else {
      playBalatroSound('hover');
      setWrongCountryIds((prev) => [...prev, chosen.id]);
      setCurrentStreak(0);
      setCorrectCountryId(targetCountry.id);
      setRoundResolved(true);
      setRoundsPlayed((r) => r + 1);

      setFeedbackBanner({
        type: 'wrong',
        title: `Incorrecto, elegiste ${chosen.nameEs}`,
        subtitle: `El país resaltado en el globo era ${targetCountry.nameEs} (${targetCountry.continentEs}).`,
      });
    }
  };

  // Mode 1: Handle Free-Text Submission (Case & Accent Insensitive)
  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaused || !targetCountry || roundResolved || !freeTextInput.trim()) return;

    if (isCountryAnswerCorrect(freeTextInput, targetCountry)) {
      playBalatroSound('play');
      setCorrectCountryId(targetCountry.id);
      setRoundResolved(true);
      setRoundsPlayed((r) => r + 1);

      // Extra bonus for Free-Text mode!
      const pointsEarned = 180 + currentStreak * 30;
      const nextStreak = currentStreak + 1;
      registerPointsAndStreak(pointsEarned, nextStreak);

      setFeedbackBanner({
        type: 'correct',
        title: `¡Excelente! Es ${targetCountry.nameEs}`,
        subtitle: `+${pointsEarned} pts (Escritura Libre) · Continente: ${targetCountry.continentEs}`,
      });

      if (nextStreak % 3 === 0) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
      }
    } else {
      playBalatroSound('hover');
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setCurrentStreak(0);

      if (remaining <= 0) {
        setCorrectCountryId(targetCountry.id);
        setRoundResolved(true);
        setRoundsPlayed((r) => r + 1);
        setFeedbackBanner({
          type: 'wrong',
          title: `Incorrecto («${freeTextInput.trim()}»)`,
          subtitle: `El país resaltado era ${targetCountry.nameEs} (${targetCountry.continentEs}).`,
        });
      } else {
        setFeedbackBanner({
          type: 'wrong',
          title: `No es «${freeTextInput.trim()}»`,
          subtitle: `Pista: Está en ${targetCountry.continentEs} y empieza con «${targetCountry.nameEs.charAt(
            0
          )}». Te quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'}.`,
        });
      }
    }
  };

  // Handle "Saltar" (Skip Country)
  const handleSkipCountry = () => {
    if (!targetCountry) return;
    playBalatroSound('select');
    if (!roundResolved) {
      setCurrentStreak(0);
      setCorrectCountryId(targetCountry.id);
      setRoundResolved(true);
      setFeedbackBanner({
        type: 'skipped',
        title: `País revelado: ${targetCountry.nameEs}`,
        subtitle: `Continente: ${targetCountry.continentEs} · Pulsa «Siguiente País» para continuar.`,
      });
      globeInstanceRef.current?.pointOfView(
        {
          lat: targetCountry.lat,
          lng: targetCountry.lng,
          altitude: targetCountry.cameraAltitude,
        },
        1100
      );
    } else {
      startNextCountryRound();
    }
  };

  // Save session record when leaving if rounds were played
  const handleExitWithSave = () => {
    if (roundsPlayed > 0) {
      const calculatedGrade = Math.min(100, Math.max(65, Math.round(60 + Math.min(40, currentScore / 15))));
      saveMatchRecord({
        gameType: 'geografia_3d',
        gameTitle: 'Globo Terráqueo 3D: Geografía Mundial',
        roomCode,
        role: isTeacherSpectator ? 'teacher' : 'student',
        playerName: localStorage.getItem('po_player_name') || 'Explorador',
        playerAvatar: localStorage.getItem('po_player_avatar') || '🌍',
        grade: calculatedGrade,
        score: currentScore,
        isVictory: currentScore >= 200,
        statusText: `Puntaje: ${currentScore} pts · Mejor Racha: ${bestStreak}`,
        detailsText: `Exploración Geográfica 3D (${roundsPlayed} países jugados)`,
      });
    }
    onGoHome();
  };

  // Lobby helpers
  const hostDisplay = typeof window !== 'undefined' ? window.location.host : 'aulaplay.edu';
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&game=geografia_3d`
      : `https://aulaplay.edu?room=${roomCode}&game=geografia_3d`;

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

  const handleStartMatchFromLobby = () => {
    if (room && !isSoloPractice) {
      socketClient.startGame();
    }
    const modeToRun = defaultStartMode === 'menu' ? 'guess_country' : defaultStartMode;
    setPlayMode(modeToRun);
    playModeRef.current = modeToRun;
    setIsCountdownActive(true);
    setGamePhase('playing');
    setTimeout(() => {
      startNextCountryRound(modeToRun);
    }, 250);
  };

  const handleReturnToLobby = () => {
    setIsCountdownActive(false);
    setGamePhase('lobby');
    if (room && !isSoloPractice) {
      socketClient.returnToLobby();
    }
    playBalatroSound('click');
  };

  const themeStyles = {
    neon: {
      leftDoor1: '#38bdf8',
      leftDoor2: '#22e584',
      rightDoor1: '#f59e0b',
      rightDoor2: '#06b6d4',
      bgGradient: 'from-[#071824] via-[#041019] to-[#02080d]',
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

  // ============================================================================
  // A. UNIFIED PRE-GAME WAITING ROOM / LOBBY VIEW (HEAT GUARDIAN MONOLITH STYLE)
  // ============================================================================
  if (gamePhase === 'lobby') {
    const canControlLobby = isHost || effectiveIsTeacher || isSoloPractice;
    const globeMenuItems: HeatGuardianMenuItem[] = [
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
              badge:
                continentFilter === 'ALL'
                  ? 'MUNDO'
                  : continentFilter.toUpperCase(),
              onClick: () => {
                playBalatroSound('select');
                setIsTeacherConfigOpen(true);
              },
            },
          ]
        : []),
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

    return (
      <HeatGuardianLobbyShell
        titleLine1="ATLAS"
        titleLine2="GUARDIAN 3D"
        subtitleBadge="CARTOGRAFÍA MUNDIAL · VUELO Y LOCALIZACIÓN"
        creditText={`EXPEDICIÓN PIN · ${roomCode}`}
        variant="arctic_cyan"
        menuItems={globeMenuItems}
        topRightSlot={
          <div className="flex items-center gap-2 font-mono text-xs">
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
          {/* Top Wide-Tracked Header ("II SILHOUETTE" style) + Floating QR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#38bdf8] mb-1">
                <span>◇</span>
                <span>II SILHOUETTE · PHAEDRA ATLAS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-[0.16em] text-[#f0f0f2] drop-shadow-[0_4px_20px_rgba(14,12,21,0.9)]">
                Sala de Clase
              </h1>
              <p className="text-xs font-mono tracking-[0.16em] text-[#22e584] mt-1">
                Cartografía GeoJSON Interactiva · {countries.length || 170}+ Países
              </p>
            </div>

            <div
              onClick={() => setIsQrModalOpen(true)}
              className="w-20 h-20 bg-[#f0f0f2] p-2 rounded-2xl shadow-[0_8px_25px_rgba(56,189,248,0.28)] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center border-2 border-[#38bdf8] shrink-0"
              title="Clic para agrandar QR"
            >
              <QRCodeSVG value={joinUrl} size={68} level="M" includeMargin={false} bgColor="#f0f0f2" fgColor="#0e0c15" />
            </div>
          </div>

          {/* SECTION 1: Código PIN & Enlace (Horizontal dot-and-underline bar) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-[0.16em] text-[#f0f0f2]">
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

          {/* SECTION 2: Opciones de Atlas Global (Configuradas ANTES de iniciar la partida) */}
          <div className="space-y-4 bg-[#14121d]/90 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-[#38bdf8]" />
                <h2 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                  Opciones de la Partida (Configurar Antes de Empezar)
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#22e584] bg-[#22e584]/10 border border-[#22e584]/30 px-2.5 py-0.5 rounded-full font-bold">
                Pre-Partida
              </span>
            </div>

            {/* Fila 1: Modo de Juego Directo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                🎮 Modo de Juego al Iniciar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    v: 'guess_country' as const,
                    label: '✈️ 1. Adivina el País (Vuelo 3D)',
                    desc: 'La cámara vuela al país resaltado y respondes por botones o texto.',
                  },
                  {
                    v: 'locate_country' as const,
                    label: '🎯 2. Localiza en el Globo (Clic)',
                    desc: 'Te damos el nombre del país y debes buscarlo y tocarlo en 3D.',
                  },
                ].map((m) => (
                  <button
                    key={m.v}
                    type="button"
                    onClick={() => {
                      playBalatroSound('select');
                      setDefaultStartMode(m.v);
                    }}
                    className={cn(
                      'p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1',
                      defaultStartMode === m.v
                        ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#f0f0f2] shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                        : 'bg-[#0e0c15] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    )}
                  >
                    <span className={cn('text-xs font-bold', defaultStartMode === m.v ? 'text-[#38bdf8]' : 'text-zinc-300')}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1 leading-snug">
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 2: Continente / Región */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                🌍 Continente / Región a Evaluar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { v: 'ALL' as const, label: 'Todo el Mundo' },
                  { v: 'Americas' as const, label: 'América' },
                  { v: 'Europe' as const, label: 'Europa' },
                  { v: 'Asia' as const, label: 'Asia' },
                  { v: 'Africa' as const, label: 'África' },
                  { v: 'Oceania' as const, label: 'Oceanía' },
                ].map((reg) => (
                  <button
                    key={reg.v}
                    type="button"
                    onClick={() => {
                      playBalatroSound('select');
                      setContinentFilter(reg.v);
                    }}
                    className={cn(
                      'py-2 px-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all text-center',
                      continentFilter === reg.v
                        ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584] shadow-md font-black'
                        : 'bg-[#0e0c15] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    )}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 3: Parámetros del Juego (Intentos, Tiempo, Entrada) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Intentos / Vidas */}
              <div className="bg-[#0e0c15] p-2.5 rounded-xl border border-zinc-800 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#f58233] block">
                  ❤️ Intentos por País
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 5].map((att) => (
                    <button
                      key={att}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setConfiguredMaxAttempts(att);
                        setAttemptsLeft(att);
                      }}
                      className={cn(
                        'py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors',
                        configuredMaxAttempts === att
                          ? 'bg-[#f58233] text-[#0e0c15] border-[#f58233] font-black'
                          : 'bg-[#181622] border-zinc-800 text-zinc-400 hover:text-white'
                      )}
                    >
                      {att}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempo por País */}
              <div className="bg-[#0e0c15] p-2.5 rounded-xl border border-zinc-800 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#22e584] block">
                  ⏱️ Tiempo por País
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { v: 0, label: 'Libre' },
                    { v: 15, label: '15s' },
                    { v: 30, label: '30s' },
                    { v: 45, label: '45s' },
                  ].map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setCountryTimeLimitSecs(t.v);
                      }}
                      className={cn(
                        'py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors',
                        countryTimeLimitSecs === t.v
                          ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584] font-black'
                          : 'bg-[#181622] border-zinc-800 text-zinc-400 hover:text-white'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Método de Entrada */}
              <div className="bg-[#0e0c15] p-2.5 rounded-xl border border-zinc-800 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                  ⌨️ Entrada (Adivina)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { v: 'both' as const, label: 'Ambos' },
                    { v: 'multiple_choice' as const, label: '4 Opc.' },
                    { v: 'free_text' as const, label: 'Texto' },
                  ].map((im) => (
                    <button
                      key={im.v}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setAllowedInputMode(im.v);
                      }}
                      className={cn(
                        'py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors',
                        allowedInputMode === im.v
                          ? 'bg-[#38bdf8] text-[#091527] border-[#38bdf8] font-black'
                          : 'bg-[#181622] border-zinc-800 text-zinc-400 hover:text-white'
                      )}
                    >
                      {im.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fila 4: Pista y Salto rápido */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Pista Continente:</span>
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setShowContinentHint((prev) => !prev);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors',
                    showContinentHint
                      ? 'bg-[#22e584]/20 text-[#22e584] border-[#22e584]/50'
                      : 'bg-[#181622] text-zinc-500 border-zinc-800'
                  )}
                >
                  {showContinentHint ? '🧭 Visible' : '🙈 Oculta'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Botón Saltar:</span>
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setAllowSkipButton((prev) => !prev);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors',
                    allowSkipButton
                      ? 'bg-[#22e584]/20 text-[#22e584] border-[#22e584]/50'
                      : 'bg-[#181622] text-zinc-500 border-zinc-800'
                  )}
                >
                  {allowSkipButton ? '⏭️ Permitido' : '🔒 Bloqueado'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: Cartógrafos Conectados (Horizontal dot-and-underline bar) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-[0.16em] text-[#f0f0f2]">
                Estudiantes ({studentPlayers.length})
              </h2>

              {canControlLobby ? (
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    handleStartMatchFromLobby();
                  }}
                  className="pl-2 pr-5 py-2 rounded-full bg-[#25242c] hover:bg-[#2f2e38] text-[#f0f0f2] border border-zinc-600 font-black text-xs cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.65)] transition-all flex items-center justify-center gap-2.5 tracking-[0.2em] uppercase"
                >
                  <span className="w-6 h-6 rounded-full bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[10px] font-black">
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
                <div className="relative flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.12em] text-zinc-300">
                  <span className="w-2 h-2 rotate-45 bg-[#22e584] animate-pulse" />
                  <span>Esperando exploradores con el PIN {roomCode}...</span>
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

        {/* QR MODAL */}
        <AnimatePresence>
          {isQrModalOpen && (
            <div className="absolute inset-x-0 top-0 min-h-full h-auto z-50 flex items-start justify-center bg-[#0e0c15]/90 backdrop-blur-md py-8 px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#14121d] border border-zinc-700/80 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#38bdf8]">
                  ◇ II SILHOUETTE · PHAEDRA ATLAS ◇
                </div>
                <h3 className="font-serif text-lg font-bold uppercase tracking-[0.16em] text-[#f0f0f2]">
                  Código QR · Atlas 3D
                </h3>
                <div className="w-56 h-56 bg-[#f0f0f2] p-3 rounded-xl mx-auto shadow-2xl flex items-center justify-center border-2 border-[#38bdf8]">
                  <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} bgColor="#f0f0f2" fgColor="#0e0c15" />
                </div>
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 text-center font-mono">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                    PIN de la sala:
                  </span>
                  <span className="text-3xl font-black text-[#22e584] tracking-widest">{roomCode}</span>
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#25242c] hover:bg-[#2f2e38] border border-zinc-600 text-[#f0f0f2] font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  Cerrar QR
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* TEACHER PRE-GAME CONFIGURATION MODAL (GLOBO 3D - LOBBY) */}
        <AnimatePresence>
          {isTeacherConfigOpen && (
            <div className="absolute inset-x-0 top-0 min-h-full h-auto z-50 flex items-start justify-center bg-[#0e0c15]/90 backdrop-blur-md py-8 px-4">
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-[#14121d] border border-zinc-700/80 rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs font-sans text-[#f0f0f2] h-auto"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-[#38bdf8]" />
                    <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                      Configuraciones del Docente · Globo Terráqueo 3D
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsTeacherConfigOpen(false)}
                    aria-label="Cerrar configuración"
                    className="p-1 text-zinc-400 hover:text-[#f0f0f2] hover:bg-[#25242c] rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* 1. Filtro de Continente / Región */}
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                    🌍 Región o Continente a Evaluar
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { v: 'ALL', label: 'Todo el Mundo' },
                      { v: 'Americas', label: 'Solo América' },
                      { v: 'Europe', label: 'Solo Europa' },
                      { v: 'Asia', label: 'Solo Asia' },
                      { v: 'Africa', label: 'Solo África' },
                      { v: 'Oceania', label: 'Solo Oceanía' },
                    ].map((reg) => (
                      <button
                        key={reg.v}
                        type="button"
                        onClick={() => {
                          playBalatroSound('select');
                          setContinentFilter(reg.v as any);
                        }}
                        className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                          continentFilter === reg.v
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300 hover:text-[#f0f0f2]'
                        }`}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Modo de Juego Predeterminado */}
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#f0f0f2] block">
                    🎮 Modo de Juego al Empezar la Partida
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { v: 'menu', label: 'Menú Libre (Ambos)' },
                      { v: 'guess_country', label: '1. Adivina el País' },
                      { v: 'locate_country', label: '2. Localiza el País' },
                    ].map((m) => (
                      <button
                        key={m.v}
                        type="button"
                        onClick={() => setDefaultStartMode(m.v as GlobePlayMode)}
                        className={`py-2 px-2 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          defaultStartMode === m.v
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Método de Entrada en Adivina el País & Intentos por País */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                      ⌨️ Método en «Adivina el País»
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { v: 'both', label: 'Ambos' },
                        { v: 'multiple_choice', label: '4 Botones' },
                        { v: 'free_text', label: 'Escritura' },
                      ].map((im) => (
                        <button
                          key={im.v}
                          type="button"
                          onClick={() => setAllowedInputMode(im.v as any)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                            allowedInputMode === im.v
                              ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                              : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {im.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#f58233] block">
                      ❤️ Intentos por País
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 5].map((att) => (
                        <button
                          key={att}
                          type="button"
                          onClick={() => {
                            setConfiguredMaxAttempts(att);
                            setAttemptsLeft(att);
                          }}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                            configuredMaxAttempts === att
                              ? 'bg-[#9e1b24] text-[#f0f0f2] border-[#f58233]'
                              : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {att} Int.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Tiempo Límite por País */}
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#22e584] block">
                    ⏱️ Tiempo Límite por País
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { v: 0, label: 'Sin reloj' },
                      { v: 15, label: '15 seg' },
                      { v: 30, label: '30 seg' },
                      { v: 45, label: '45 seg' },
                      { v: 60, label: '60 seg' },
                    ].map((t) => (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => setCountryTimeLimitSecs(t.v)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          countryTimeLimitSecs === t.v
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Botón Saltar & Pista de Continente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#f0f0f2] block">
                      ⏭️ Botón «Saltar País»
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAllowSkipButton(true)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          allowSkipButton
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Permitido
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllowSkipButton(false)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          !allowSkipButton
                            ? 'bg-[#9e1b24] text-[#f0f0f2] border-[#f58233]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Bloqueado (Examen)
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                      🧭 Mostrar Pista de Continente
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowContinentHint(true)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          showContinentHint
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Visible
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowContinentHint(false)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          !showContinentHint
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        Oculta (Difícil)
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    setIsTeacherConfigOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#25242c] hover:bg-[#2f2e38] border border-zinc-600 text-[#f0f0f2] font-black uppercase tracking-widest text-xs cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-2"
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
  // B. ACTIVE 3D GLOBE VIEWPORT & GAMIFIED GEOGRAPHY HUD
  // ============================================================================
  if (effectiveIsTeacher) {
    return (
      <div className="relative w-full min-h-screen h-auto">
        {isCountdownActive && (
          <MatchStartCountdown
            onComplete={() => setIsCountdownActive(false)}
            subtitle="¡GLOBO TERRÁQUEO 3D · MONITOREO DOCENTE!"
          />
        )}
        <TeacherSpectatorDashboard
          gameType="geografia_3d"
          gameTitle="Globo Terráqueo 3D · Geografía Mundial"
          room={room || null}
          players={players}
          roomCode={roomCode}
          totalInitialSeconds={countryTimeLimitSecs || 180}
          timeRemainingSecs={countrySecondsLeft || 120}
          totalQuestions={10}
          geoTargetCountry={targetCountry?.nameEs || 'Tailandia / Brasil / Egipto'}
          geoPlayMode={playMode}
          onGoLobby={handleReturnToLobby}
          onGoHome={onGoHome}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[radial-gradient(circle_at_45%_48%,#081a38_0%,#040d1e_55%,#01040a_100%)] text-[#f0f0f2] select-none font-sans">
      {/* Fluid 3-2-1 Countdown Overlay */}
      {isCountdownActive && (
        <MatchStartCountdown
          onComplete={() => setIsCountdownActive(false)}
          subtitle="¡ATLAS GLOBAL 3D · EXPLORACIÓN MUNDIAL!"
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
            handleExitWithSave();
          }
        }}
      />

      {/* =====================================================================
          1. DEDICATED 3D WEBGL GLOBE CONTAINER (100% FULL VIEWPORT)
      ===================================================================== */}
      <div
        ref={globeContainerRef}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Loading / Error State Overlay */}
      {(isLoadingGeo || geoError) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#040d1e]/90 p-4">
          <div className="backdrop-blur-2xl bg-[#091527]/70 border border-white/20 rounded-3xl p-6 max-w-md text-center space-y-3 shadow-2xl">
            <GlobeIcon size={36} className="text-[#38bdf8] mx-auto animate-spin" />
            <h3 className="font-sans text-base font-bold uppercase tracking-[0.14em] text-white">
              {geoError ? 'Error de Cartografía' : 'Cargando Atlas Global 3D...'}
            </h3>
            <p className="text-xs text-zinc-300">
              {geoError || 'Preparando fronteras satelitales, vuelos globales y coordenadas 3D...'}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. TOP FLOATING GLASS HEADER BAR (ROOM PIN + PAUSE + EXIT)
      ===================================================================== */}
      <header className="absolute top-0 inset-x-0 z-30 px-3 sm:px-8 py-3 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Brand Badge & Room Details */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 backdrop-blur-xl bg-[#091527]/40 border border-white/15 rounded-full px-3.5 py-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              playBalatroSound('select');
              setPlayMode('menu');
              setTargetCountry(null);
              setCorrectCountryId(null);
              setWrongCountryIds([]);
              setFeedbackBanner(null);
              if (globeInstanceRef.current) {
                const ctrl = globeInstanceRef.current.controls();
                if (ctrl) ctrl.autoRotate = true;
                globeInstanceRef.current.pointOfView({ lat: 18, lng: -25, altitude: 2.0 }, 1000);
              }
            }}
            className="flex items-center gap-2 cursor-pointer text-white hover:text-[#38bdf8] transition-colors"
            title="Menú de Modos"
          >
            <GlobeIcon size={16} className="text-[#38bdf8] shrink-0" />
            <span className="font-sans text-xs font-bold tracking-[0.14em] uppercase">
              Atlas Global 3D
            </span>
          </button>

          {room?.code && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 text-xs font-mono">
              <span className="text-zinc-400 text-[10px] uppercase">SALA:</span>
              <span className="font-bold text-white tracking-widest">{room.code}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copiar Código"
                className="p-1 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedCode ? <Check size={12} className="text-[#22e584]" /> : <Copy size={12} />}
              </button>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                title="Ver Código QR"
                className="p-1 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <QrCode size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Center: Live countdown if timer is active */}
        {playMode !== 'menu' && !roundResolved && countryTimeLimitSecs > 0 && (
          <div
            className={cn(
              'pointer-events-auto backdrop-blur-xl border rounded-full px-4 py-1.5 flex items-center gap-2 font-mono text-xs font-bold shadow-xl',
              countrySecondsLeft <= 7
                ? 'bg-rose-950/60 border-rose-500/80 text-rose-200 animate-pulse'
                : 'bg-[#091527]/40 border-white/15 text-white'
            )}
          >
            <Clock size={13} className="text-[#38bdf8]" />
            <span>{countrySecondsLeft}s</span>
          </div>
        )}

        {/* Right: Controls (Teacher pause, Fullscreen, Sala, Menú) */}
        <div className="pointer-events-auto flex items-center gap-1.5 backdrop-blur-xl bg-[#091527]/40 border border-white/15 rounded-full px-2.5 py-1.5 shadow-xl">
          {effectiveIsTeacher && (
            <button
              type="button"
              onClick={() => setIsTeacherConfigOpen(true)}
              className="p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Ajustes del Docente"
            >
              <Settings size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !isSfxMuted();
              setSfxMuted(next);
              setSoundMuted(next);
            }}
            className="p-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={soundMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

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
          3. ATLAS GLOBAL OS TYPOGRAPHY (LEFT SIDE - MATCHING POSTER LAYOUT)
      ===================================================================== */}
      <div className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 max-w-sm sm:max-w-md pointer-events-none z-10 hidden md:flex flex-col">
        <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-white drop-shadow-lg">
          Atlas Global 3D
        </h1>
        <p className="text-sm lg:text-base text-zinc-300 font-normal mt-2 leading-relaxed">
          Cartografía Interactiva y Exploración Geográfica Mundial
        </p>
        <div className="text-[10px] tracking-[0.22em] text-zinc-400 font-mono uppercase mt-4 flex flex-wrap gap-x-2 gap-y-1">
          <span>GEOJSON 3D</span>
          <span>•</span>
          <span>170+ PAÍSES</span>
          <span>•</span>
          <span>CARTOGRAFÍA SATELITAL</span>
          <span>•</span>
          <span>TIEMPO REAL</span>
        </div>
      </div>

      {/* Bottom-left metadata watermark */}
      <div className="absolute left-6 sm:left-14 bottom-6 text-[11px] font-mono tracking-widest text-zinc-500 uppercase pointer-events-none z-10 hidden sm:block">
        ATLAS.GLOBAL/EDU
      </div>

      {/* =====================================================================
          4. FLOATING FROSTED GLASS TELEMETRY HUD CARD (RIGHT SIDE)
      ===================================================================== */}
      <div className="absolute right-3 sm:right-8 top-16 bottom-5 z-20 flex flex-col justify-center pointer-events-none w-[340px] sm:w-[420px] max-w-[95vw]">
        <div className="pointer-events-auto backdrop-blur-2xl bg-[#091527]/35 border border-white/20 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-2.5 max-h-[85vh] overflow-y-auto">
          {/* Item 1: Mode Switcher */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300">
              MODO DE JUEGO
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSelectMode('guess_country')}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer',
                  playMode === 'guess_country'
                    ? 'bg-[#38bdf8] text-[#091527]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                )}
              >
                Adivina
              </button>
              <button
                type="button"
                onClick={() => handleSelectMode('locate_country')}
                className={cn(
                  'px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer',
                  playMode === 'locate_country'
                    ? 'bg-[#22e584] text-[#091527]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                )}
              >
                Localiza
              </button>
            </div>
          </div>

          {/* Item 2: Target Country / Objective */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300">
              {playMode === 'guess_country' ? 'PAÍS OBJETIVO' : 'LOCALIZAR'}
            </span>
            <span className="font-bold text-xs sm:text-sm text-white">
              {playMode === 'guess_country'
                ? showContinentHint && targetCountry
                  ? `${targetCountry.continentEs}`
                  : '¿Qué país es?'
                : targetCountry
                ? targetCountry.nameEs
                : 'Elige un modo'}
            </span>
          </div>

          {/* Item 3: Input Method (for guess_country) */}
          {playMode === 'guess_country' && allowedInputMode === 'both' && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300">
                MÉTODO
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setInputMethod('multiple_choice');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer',
                    inputMethod === 'multiple_choice'
                      ? 'bg-[#38bdf8] text-[#091527]'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Opciones
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setInputMethod('free_text');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer',
                    inputMethod === 'free_text'
                      ? 'bg-[#38bdf8] text-[#091527]'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Escritura
                </button>
              </div>
            </div>
          )}

          {/* Item 4: Streak & High Score */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300 flex items-center gap-1.5">
              <Flame size={14} className="text-[#f58233]" />
              <span>RACHA & RÉCORD</span>
            </span>
            <span className="font-mono text-xs font-bold text-white">
              {currentStreak} <span className="text-zinc-400 text-[10px] font-normal">(Récord: {highScore})</span>
            </span>
          </div>

          {/* Item 5: Score */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300 flex items-center gap-1.5">
              <Trophy size={14} className="text-[#22e584]" />
              <span>PUNTUACIÓN</span>
            </span>
            <span className="font-mono text-sm font-black text-[#22e584]">
              {currentScore} pts
            </span>
          </div>

          {/* Item 6: Attempts / Hearts */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300 flex items-center gap-1.5">
              <Heart size={14} className="text-[#ef4444]" />
              <span>INTENTOS</span>
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: configuredMaxAttempts }, (_, i) => i + 1).map((idx) => (
                <Heart
                  key={idx}
                  size={15}
                  className={cn(
                    idx <= attemptsLeft ? 'text-[#ef4444] fill-[#ef4444]' : 'text-zinc-600 fill-zinc-700/60'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Feedback Toast Banner */}
          <AnimatePresence mode="wait">
            {feedbackBanner && (
              <motion.div
                key={feedbackBanner.title + feedbackBanner.subtitle}
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                className={cn(
                  'rounded-2xl border p-3 flex items-center justify-between gap-2.5 backdrop-blur-md shadow-lg',
                  feedbackBanner.type === 'correct'
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-white'
                    : feedbackBanner.type === 'wrong'
                    ? 'bg-rose-950/60 border-rose-500/80 text-white'
                    : 'bg-amber-950/60 border-amber-500/80 text-white'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {feedbackBanner.type === 'correct' ? (
                    <CheckCircle2 size={18} className="text-[#22e584] shrink-0" />
                  ) : (
                    <XCircle
                      size={18}
                      className={
                        feedbackBanner.type === 'wrong'
                          ? 'text-[#ef4444] shrink-0'
                          : 'text-[#38bdf8] shrink-0'
                      }
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider truncate">
                      {feedbackBanner.title}
                    </div>
                    <div className="text-[10px] text-zinc-300 truncate">
                      {feedbackBanner.subtitle}
                    </div>
                  </div>
                </div>

                {roundResolved && playMode !== 'menu' && (
                  <button
                    type="button"
                    onClick={() => startNextCountryRound()}
                    className="px-3 py-1 rounded-xl bg-[#22e584] text-[#091527] font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md hover:bg-[#22e584]/80 transition-colors"
                  >
                    Siguiente
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Answer Area */}
          {playMode === 'guess_country' && targetCountry && (
            <div className="mt-1 space-y-2">
              {inputMethod === 'multiple_choice' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {multipleChoiceOptions.map((option, idx) => {
                    const isCorrectOption = roundResolved && option.id === targetCountry.id;
                    const isWrongOption = wrongCountryIds.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={roundResolved}
                        onClick={() => handleMultipleChoiceAnswer(option)}
                        className={cn(
                          'px-3.5 py-2.5 rounded-2xl border text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer backdrop-blur-md',
                          isCorrectOption
                            ? 'bg-emerald-500/80 border-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30'
                            : isWrongOption
                            ? 'bg-rose-500/80 border-rose-400 text-white font-bold shadow-lg shadow-rose-500/30'
                            : 'bg-white/[0.06] hover:bg-white/[0.14] border-white/15 text-white'
                        )}
                      >
                        <span className="truncate">
                          <span className="font-mono text-[#38bdf8] mr-2">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {option.nameEs}
                        </span>
                        {isCorrectOption && <CheckCircle2 size={16} className="shrink-0 text-slate-950" />}
                        {isWrongOption && <XCircle size={16} className="shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleFreeTextSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={freeTextInput}
                    disabled={roundResolved}
                    onChange={(e) => setFreeTextInput(e.target.value)}
                    placeholder="Escribe el nombre del país..."
                    className="flex-1 rounded-2xl bg-white/[0.06] border border-white/20 focus:border-[#38bdf8] px-3.5 py-2 text-xs text-white focus:outline-none backdrop-blur-md placeholder:text-zinc-500"
                  />
                  {!roundResolved ? (
                    <button
                      type="submit"
                      disabled={!freeTextInput.trim()}
                      className="px-4 py-2 rounded-2xl bg-[#38bdf8] hover:bg-[#38bdf8]/80 text-[#091527] font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-40 transition-colors"
                    >
                      <Send size={13} />
                      <span>Enviar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startNextCountryRound()}
                      className="px-4 py-2 rounded-2xl bg-[#22e584] hover:bg-[#22e584]/80 text-[#091527] font-black text-xs uppercase tracking-wider cursor-pointer shrink-0 transition-colors"
                    >
                      Siguiente ▶
                    </button>
                  )}
                </form>
              )}

              {/* Action Buttons: Enfocar & Saltar */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    globeInstanceRef.current?.pointOfView(
                      {
                        lat: targetCountry.lat,
                        lng: targetCountry.lng,
                        altitude: targetCountry.cameraAltitude,
                      },
                      800
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Volver a enfocar el país resaltado"
                >
                  <RotateCcw size={13} />
                  <span>Enfocar País</span>
                </button>

                {(allowSkipButton || roundResolved) && (
                  <button
                    type="button"
                    onClick={handleSkipCountry}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <SkipForward size={13} />
                    <span>{roundResolved ? 'Siguiente País' : 'Saltar'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Locate Guidance & Skip */}
          {playMode === 'locate_country' && targetCountry && (
            <div className="mt-1 space-y-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-zinc-300 leading-relaxed">
                <span>
                  Rota el globo 3D, haz zoom y haz clic sobre el polígono de{' '}
                  <strong className="text-[#38bdf8] font-black">{targetCountry.nameEs}</strong>.
                  {showContinentHint && (
                    <span className="block mt-1 text-[11px] text-zinc-400">
                      Pista: se encuentra en <strong>{targetCountry.continentEs}</strong>.
                    </span>
                  )}
                </span>
              </div>

              {(allowSkipButton || roundResolved) && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSkipCountry}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <SkipForward size={13} />
                    <span>{roundResolved ? 'Siguiente País' : 'Saltar'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menu Mode: Quick Start Selectors */}
          {playMode === 'menu' && (
            <div className="space-y-2.5 mt-1">
              <button
                type="button"
                onClick={() => handleSelectMode('guess_country')}
                className="w-full p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5">
                    <Compass size={14} />
                    <span>1. Adivina el País</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 group-hover:text-white">Jugar ▶</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1 leading-normal">
                  La cámara vuela a un país al azar resaltado en dorado. Adivina cuál es con opciones o texto.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('locate_country')}
                className="w-full p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#22e584] flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>2. Localiza el País</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 group-hover:text-white">Jugar ▶</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1 leading-normal">
                  Te damos el nombre de un país. Rota el globo terráqueo, búscalo y selecciónalo.
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

      {isQrOpen && room?.code && (
        <QRCodeModal roomCode={room.code} onClose={() => setIsQrOpen(false)} />
      )}

      {/* TEACHER CONFIGURATION MODAL IN ACTIVE GLOBE VIEW */}
      <AnimatePresence>
        {isTeacherConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0c15]/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-[#14121d] border border-zinc-700/80 rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs font-sans text-[#f0f0f2] max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-[#38bdf8]" />
                  <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.14em] text-[#f0f0f2]">
                    Configuraciones del Docente · Globo 3D
                  </h3>
                </div>
                <button
                  onClick={() => setIsTeacherConfigOpen(false)}
                  aria-label="Cerrar configuración"
                  className="p-1 text-zinc-400 hover:text-[#f0f0f2] hover:bg-[#25242c] rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 1. Filtro de Continente / Región */}
              <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                  🌍 Región o Continente a Evaluar ({filteredCountriesPool.length} países)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { v: 'ALL', label: 'Todo el Mundo' },
                    { v: 'Americas', label: 'Solo América' },
                    { v: 'Europe', label: 'Solo Europa' },
                    { v: 'Asia', label: 'Solo Asia' },
                    { v: 'Africa', label: 'Solo África' },
                    { v: 'Oceania', label: 'Solo Oceanía' },
                  ].map((reg) => (
                    <button
                      key={reg.v}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setContinentFilter(reg.v as any);
                      }}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                        continentFilter === reg.v
                          ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                          : 'bg-[#14121d] border-zinc-700 text-zinc-300 hover:text-[#f0f0f2]'
                      }`}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Método de Entrada & Intentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                    ⌨️ Método en «Adivina el País»
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { v: 'both', label: 'Ambos' },
                      { v: 'multiple_choice', label: '4 Botones' },
                      { v: 'free_text', label: 'Escritura' },
                    ].map((im) => (
                      <button
                        key={im.v}
                        type="button"
                        onClick={() => setAllowedInputMode(im.v as any)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          allowedInputMode === im.v
                            ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {im.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#f58233] block">
                    ❤️ Intentos por País
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 5].map((att) => (
                      <button
                        key={att}
                        type="button"
                        onClick={() => {
                          setConfiguredMaxAttempts(att);
                          setAttemptsLeft(att);
                        }}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          configuredMaxAttempts === att
                            ? 'bg-[#9e1b24] text-[#f0f0f2] border-[#f58233]'
                            : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {att} Int.
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Tiempo Límite por País */}
              <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#22e584] block">
                  ⏱️ Tiempo Límite por País
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { v: 0, label: 'Sin reloj' },
                    { v: 15, label: '15 seg' },
                    { v: 30, label: '30 seg' },
                    { v: 45, label: '45 seg' },
                    { v: 60, label: '60 seg' },
                  ].map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setCountryTimeLimitSecs(t.v)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        countryTimeLimitSecs === t.v
                          ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                          : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Botón Saltar & Pista de Continente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#f0f0f2] block">
                    ⏭️ Botón «Saltar País»
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAllowSkipButton(true)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        allowSkipButton
                          ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                          : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      Permitido
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllowSkipButton(false)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        !allowSkipButton
                          ? 'bg-[#9e1b24] text-[#f0f0f2] border-[#f58233]'
                          : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      Bloqueado
                    </button>
                  </div>
                </div>

                <div className="bg-[#0e0c15] p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                    🧭 Mostrar Pista de Continente
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowContinentHint(true)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        showContinentHint
                          ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                          : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      Visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContinentHint(false)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        !showContinentHint
                          ? 'bg-[#22e584] text-[#0e0c15] border-[#22e584]'
                          : 'bg-[#14121d] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      Oculta
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  setIsTeacherConfigOpen(false);
                  if (playMode !== 'menu') {
                    startNextCountryRound(playMode);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#25242c] hover:bg-[#2f2e38] border border-zinc-600 text-[#f0f0f2] font-black uppercase tracking-[0.2em] text-xs cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="w-5 h-5 rounded bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[10px] font-black">
                  ▼
                </span>
                <span>Guardar y Aplicar</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
