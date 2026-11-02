import React, { useState, useEffect } from 'react';
import {
  Plus,
  LogIn,
  X,
  Shield,
  GraduationCap,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { motion } from 'motion/react';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { EducationalGameType } from '../types';
import {
  initAuth,
  signInWithGoogle,
  linkGoogleEmailDirectly,
  logoutGoogle,
  getCachedGoogleUser,
  getOrCreateDeviceUid,
  GoogleUserSession,
} from '../lib/firebaseAuth';
import {
  HeatGuardianLobbyShell,
  HeatGuardianMenuItem,
} from './HeatGuardianBackdrop';

interface JoinCreateModalProps {
  initialCode?: string;
  initialRoomName?: string;
  defaultMode?: 'create' | 'join';
  userRole?: 'teacher' | 'student' | null;
  currentGameType?: EducationalGameType;
  isLoading?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  onClose: () => void;
  onCreateRoom: (
    playerName: string,
    avatar: string,
    botCount: number,
    maxPlayers: number,
    roomName?: string,
    gameType?: EducationalGameType,
    googleEmail?: string,
    googleUid?: string
  ) => void;
  onJoinRoom: (
    roomCode: string,
    playerName: string,
    avatar: string,
    googleEmail?: string,
    googleUid?: string
  ) => void;
}

export function JoinCreateModal({
  initialCode = '',
  initialRoomName = '',
  defaultMode = 'create',
  userRole = null,
  currentGameType = 'escape_room',
  isLoading = false,
  errorMessage = null,
  onClearError,
  onClose,
  onCreateRoom,
  onJoinRoom,
}: JoinCreateModalProps) {
  const [mode, setMode] = useState<'create' | 'join'>(
    userRole === 'teacher' ? 'create' : userRole === 'student' ? 'join' : defaultMode
  );
  const [selectedGame, setSelectedGame] = useState<EducationalGameType>(currentGameType);
  const [roomName, setRoomName] = useState(
    initialRoomName ||
      (currentGameType === 'cien_latinos'
        ? '100 Latinos Dicen: Duelo por Equipos'
        : currentGameType === 'escape_room'
        ? 'Escape Room Educativo de la Clase'
        : currentGameType === 'el_impostor'
        ? 'Debate: El Impostor en Clase'
        : currentGameType === 'geografia_3d'
        ? 'Atlas 3D: Geografía en Clase'
        : 'Sala de Póker del Octeto')
  );
  const [joinCode, setJoinCode] = useState(initialCode);
  const [playerName, setPlayerName] = useState(
    () =>
      localStorage.getItem('po_player_name') ||
      (userRole === 'teacher' ? 'Profesor' : 'Estudiante')
  );
  const [avatar] = useState(
    () =>
      localStorage.getItem('po_player_avatar') ||
      (userRole === 'teacher' ? '👨‍🏫' : '🧑‍🎓')
  );

  const [googleUser, setGoogleUser] = useState<GoogleUserSession | null>(() =>
    getCachedGoogleUser()
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showDirectEmailInput, setShowDirectEmailInput] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [emailInputError, setEmailInputError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsub = initAuth((user) => {
      setGoogleUser(user);
      if (
        user.displayName &&
        (!playerName || playerName === 'Marie Curie' || playerName === 'Profesor')
      ) {
        setPlayerName(user.displayName);
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setEmailInputError(null);
    try {
      const user = await signInWithGoogle();
      setGoogleUser(user);
      setShowDirectEmailInput(false);
      if (user.displayName) setPlayerName(user.displayName);
      playBalatroSound('select');
    } catch {
      setShowDirectEmailInput(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDirectEmailSubmit = () => {
    const trimmed = directEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailInputError('Ingresa un correo válido (ej. usuario@gmail.com)');
      return;
    }
    setEmailInputError(null);
    const session = linkGoogleEmailDirectly(trimmed, playerName);
    setGoogleUser(session);
    setShowDirectEmailInput(false);
    playBalatroSound('select');
  };

  const handleLogoutGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setDirectEmail('');
  };

  const handleModeChange = (newMode: 'create' | 'join') => {
    playBalatroSound('deal');
    setMode(newMode);
  };

  const resolveActiveGoogleSession = (): GoogleUserSession | null => {
    if (googleUser) return googleUser;
    if (directEmail.trim().includes('@')) {
      const session = linkGoogleEmailDirectly(directEmail.trim(), playerName);
      setGoogleUser(session);
      return session;
    }
    return null;
  };

  const handleCreate = () => {
    const currentGUser = resolveActiveGoogleSession();
    const finalName =
      playerName.trim() || (userRole === 'teacher' ? 'Profesor' : 'Científico');
    playBalatroSound('play');
    localStorage.setItem('po_player_name', finalName);
    localStorage.setItem('po_player_avatar', avatar);
    onCreateRoom(
      finalName,
      avatar,
      0,
      16,
      roomName,
      selectedGame,
      currentGUser?.email || undefined,
      currentGUser?.uid || getOrCreateDeviceUid()
    );
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;

    const currentGUser = resolveActiveGoogleSession();
    const finalName = playerName.trim() || 'Estudiante';

    playBalatroSound('play');
    localStorage.setItem('po_player_name', finalName);
    localStorage.setItem('po_player_avatar', avatar);
    onJoinRoom(
      joinCode.trim(),
      finalName,
      avatar,
      currentGUser?.email || undefined,
      currentGUser?.uid || getOrCreateDeviceUid()
    );
  };

  const renderGoogleAuthSection = (roleLabel: string) => {
    if (googleUser) {
      return (
        <div className="pt-2 border-b border-[#f0f0f2]/25 pb-2.5 flex items-center justify-between text-xs font-mono text-[#f0f0f2]">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rotate-45 bg-[#22e584] shrink-0 shadow-[0_0_8px_#22e584]" />
            <span className="truncate">
              {roleLabel}: <strong className="text-[#f0f0f2]">{googleUser.email}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogoutGoogle}
            className="text-[11px] text-[#22e584] hover:text-[#f0f0f2] underline font-bold uppercase tracking-wider shrink-0 ml-3 cursor-pointer"
          >
            Cambiar
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2 pt-1">
        {!showDirectEmailInput ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f0f0f2]/25 pb-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="group relative flex items-center gap-2.5 text-xs sm:text-sm font-sans tracking-[0.12em] text-[#f0f0f2] hover:text-[#22e584] cursor-pointer transition-colors"
            >
              <span className="w-2.5 h-2.5 rotate-45 bg-[#22e584] shadow-[0_0_8px_#22e584]" />
              <span>{isSigningIn ? 'Conectando Google...' : 'Vincular Cuenta de Google'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDirectEmailInput(true)}
              className="flex items-center gap-2 text-xs font-sans tracking-[0.1em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rotate-45 bg-[#f0f0f2]/50" />
              <span>Ingresar correo Gmail manual</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 border-b border-[#22e584] pb-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-sans tracking-[0.14em] text-[#f0f0f2] flex items-center gap-2">
                <Mail size={14} className="text-[#22e584]" />
                <span>Correo de Google / Institucional</span>
              </label>
              <button
                type="button"
                onClick={() => setShowDirectEmailInput(false)}
                className="text-[11px] font-mono text-zinc-400 hover:text-[#f0f0f2] underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={directEmail}
                onChange={(e) => {
                  setDirectEmail(e.target.value);
                  setEmailInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDirectEmailSubmit();
                  }
                }}
                placeholder="tu.correo@gmail.com"
                className="flex-1 bg-transparent border-b border-[#f0f0f2]/35 focus:border-[#22e584] py-1.5 text-xs sm:text-sm font-mono text-[#f0f0f2] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleDirectEmailSubmit}
                className="px-4 py-1.5 bg-[#25242c] hover:bg-[#22e584] border border-zinc-700 text-[#f0f0f2] hover:text-[#0e0c15] font-bold uppercase tracking-wider text-xs cursor-pointer shrink-0 transition-colors"
              >
                Vincular
              </button>
            </div>
            {emailInputError && (
              <span className="text-[11px] font-mono text-rose-400 block">
                {emailInputError}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const atmosphereVariant =
    selectedGame === 'cien_latinos'
      ? 'golden_ember'
      : selectedGame === 'geografia_3d'
      ? 'arctic_cyan'
      : selectedGame === 'escape_room'
      ? 'crimson_mist'
      : 'frost_amber';

  const menuItems: HeatGuardianMenuItem[] = [
    {
      id: 'primary_action',
      label: mode === 'create' ? 'Abrir Sala' : 'Conectar',
      isPrimary: true,
      disabled: mode === 'join' && (isLoading || !joinCode.trim()),
      onClick: () => {
        if (mode === 'create') {
          handleCreate();
        } else {
          handleJoin();
        }
      },
    },
    {
      id: 'mode_create',
      label: 'Crear Sala',
      active: mode === 'create',
      badge: 'Docente',
      onClick: () => handleModeChange('create'),
    },
    ...(userRole !== 'teacher'
      ? [
          {
            id: 'mode_join',
            label: 'Unirse PIN',
            active: mode === 'join',
            badge: 'Alumno',
            onClick: () => handleModeChange('join'),
          },
        ]
      : []),
    {
      id: 'close_modal',
      label: 'Salir',
      isDanger: true,
      onClick: onClose,
    },
  ];

  const GAME_OPTIONS: {
    id: EducationalGameType;
    shortLabel: string;
    title: string;
    subtitle: string;
    defaultRoom: string;
  }[] = [
    {
      id: 'cien_latinos',
      shortLabel: '100 Latinos',
      title: '100 Latinos Dicen',
      subtitle: 'Duelo por Equipos + Biblioteca IA',
      defaultRoom: '100 Latinos Dicen: Duelo por Equipos',
    },
    {
      id: 'escape_room',
      shortLabel: 'Escape Room',
      title: 'Escape Room Educativo',
      subtitle: '10 Cámaras · Cualquier Asignatura',
      defaultRoom: 'Escape Room Educativo de la Clase',
    },
    {
      id: 'el_impostor',
      shortLabel: 'El Impostor',
      title: 'El Impostor',
      subtitle: 'Individual · Verdades y Mentira',
      defaultRoom: 'Debate: El Impostor en Clase',
    },
    {
      id: 'geografia_3d',
      shortLabel: 'Globo 3D',
      title: 'Globo Terráqueo 3D',
      subtitle: 'Adivina el País y Localiza en 3D',
      defaultRoom: 'Atlas 3D: Geografía en Clase',
    },
    {
      id: 'poker_quimico',
      shortLabel: 'Póker Octeto',
      title: 'Póker del Octeto',
      subtitle: 'Química · Enlaces y Valencia',
      defaultRoom: 'Sala de Póker del Octeto',
    },
  ];

  return (
    <div className="relative w-full min-h-screen h-auto z-50 select-none">
      <HeatGuardianLobbyShell
        titleLine1={mode === 'create' ? 'CREAR' : 'UNIRSE'}
        titleLine2="SALA"
        subtitleBadge={
          mode === 'create'
            ? 'SALA DOCENTE · PIN & QR EN VIVO'
            : 'ACCESO ESTUDIANTE · PIN DE CLASE'
        }
        roomCode="NUEVA"
        soundMuted={false}
        onToggleSound={() => {}}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }}
        menuItems={menuItems}
        footerCredit="AULAPLAY · SALAS EN VIVO"
        variant={atmosphereVariant}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-[#f0f0f2] space-y-9 py-4"
        >
          {/* Top Wide-Tracked Header ("II SILHOUETTE" serif style) */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9e1b24] font-bold block mb-1">
                ◇ AULAPLAY · EXPEDICIÓN EN VIVO
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-[0.18em] text-[#f0f0f2] drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                {mode === 'create' ? 'Crear Sala' : 'Unirse a Sala'}
              </h1>
            </div>
          </div>

          {mode === 'create' ? (
            <div className="space-y-9">
              {/* SECTION 1: Experiencia Didáctica (Horizontal dot-and-underline style) */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
                  Experiencia Didáctica
                </h2>

                <div className="relative grid grid-cols-2 sm:grid-cols-5 border-b border-zinc-600/60">
                  {GAME_OPTIONS.map((g) => {
                    const isSelected = selectedGame === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGame(g.id);
                          if (!initialRoomName) {
                            setRoomName(g.defaultRoom);
                          }
                          playBalatroSound('select');
                        }}
                        className={cn(
                          'relative pb-3.5 pt-1 px-2 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-[13px] tracking-[0.1em] transition-colors cursor-pointer',
                          isSelected
                            ? 'text-[#22e584] font-bold'
                            : 'text-zinc-400 hover:text-[#f0f0f2]'
                        )}
                      >
                        <span
                          className={cn(
                            'w-2 h-2 rotate-45 shrink-0 transition-all',
                            isSelected
                              ? 'bg-[#22e584] shadow-[0_0_10px_#22e584]'
                              : 'bg-zinc-500'
                          )}
                        />
                        <span className="truncate">{g.shortLabel}</span>
                        {isSelected && (
                          <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#22e584] shadow-[0_0_12px_#22e584]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Modo de Acceso (Horizontal dot-and-underline style) */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
                  Modo de Sala
                </h2>

                <div className="relative grid grid-cols-2 border-b border-zinc-600/60 max-w-lg">
                  <button
                    type="button"
                    onClick={() => handleModeChange('create')}
                    className={cn(
                      'relative pb-3.5 pt-1 flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.14em] cursor-pointer transition-colors',
                      mode === 'create' ? 'text-[#f0f0f2] font-bold' : 'text-zinc-400'
                    )}
                  >
                    <span className="w-2 h-2 rotate-45 bg-[#9e1b24] shadow-[0_0_10px_#9e1b24]" />
                    <span>Sala Docente (PIN / QR)</span>
                    <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#9e1b24] shadow-[0_0_12px_#9e1b24]" />
                  </button>

                  {userRole !== 'teacher' ? (
                    <button
                      type="button"
                      onClick={() => handleModeChange('join')}
                      className="relative pb-3.5 pt-1 flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.14em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                      <span>Ingresar con PIN</span>
                    </button>
                  ) : (
                    <div className="relative pb-3.5 pt-1 flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.14em] text-zinc-300">
                      <span className="w-2 h-2 rotate-45 bg-[#22e584]" />
                      <span>Supervisión en Vivo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Datos de la Sala */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
                  Datos de la Sala
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-1">
                  <div className="relative border-b border-zinc-600/60 focus-within:border-[#22e584] pb-2.5 transition-colors">
                    <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#22e584] mb-1">
                      <span className="w-2 h-2 rotate-45 bg-[#22e584]" />
                      <span>Título de la Sala</span>
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Nombre de la sala..."
                      className="w-full bg-transparent text-sm sm:text-base font-bold tracking-wider text-[#f0f0f2] placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="relative border-b border-zinc-600/60 focus-within:border-[#22e584] pb-2.5 transition-colors">
                    <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#22e584] mb-1">
                      <span className="w-2 h-2 rotate-45 bg-[#9e1b24]" />
                      <span>Docente Anfitrión</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={22}
                      placeholder="Ej: Prof. García"
                      className="w-full bg-transparent text-sm sm:text-base font-bold tracking-wider text-[#f0f0f2] placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                {renderGoogleAuthSection('Docente')}
              </div>

              {/* Primary Action Trigger (II SILHOUETTE signature charcoal button + square icon) */}
              <div className="pt-2 flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-7 py-3.5 bg-[#25242c] hover:bg-[#31303a] border border-zinc-600 hover:border-[#22e584] text-[#f0f0f2] font-bold text-xs sm:text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3 cursor-pointer shadow-lg"
                >
                  <span className="w-4 h-4 bg-[#22e584] text-[#0e0c15] font-black flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                  <span>Crear Sala de Clase</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-9">
              {/* SECTION 1: Modo de Sala */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
                  Modo de Acceso
                </h2>

                <div className="relative grid grid-cols-2 border-b border-zinc-600/60 max-w-lg">
                  <button
                    type="button"
                    onClick={() => handleModeChange('create')}
                    className="relative pb-3.5 pt-1 flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.14em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer transition-colors"
                  >
                    <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                    <span>Crear Sala (Docente)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('join')}
                    className="relative pb-3.5 pt-1 flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.14em] text-[#22e584] font-bold cursor-pointer transition-colors"
                  >
                    <span className="w-2 h-2 rotate-45 bg-[#22e584] shadow-[0_0_10px_#22e584]" />
                    <span>Unirse con PIN</span>
                    <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#22e584] shadow-[0_0_12px_#22e584]" />
                  </button>
                </div>
              </div>

              {/* SECTION 2: Código PIN y Estudiante */}
              <div className="space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
                  Credenciales de Ingreso
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-1">
                  <div className="relative border-b-2 border-[#22e584] pb-2.5">
                    <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#22e584] mb-1">
                      <span className="w-2 h-2 rotate-45 bg-[#22e584]" />
                      <span>Código PIN de la Sala</span>
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        if (errorMessage && onClearError) onClearError();
                      }}
                      placeholder="123456"
                      maxLength={10}
                      className="w-full bg-transparent font-mono text-2xl sm:text-3xl font-black tracking-[0.25em] text-[#f0f0f2] placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="relative border-b border-zinc-600/60 focus-within:border-[#22e584] pb-2.5 transition-colors">
                    <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#22e584] mb-1">
                      <span className="w-2 h-2 rotate-45 bg-[#9e1b24]" />
                      <span>Tu Nombre (Estudiante)</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={22}
                      placeholder="Tu nombre y apellido..."
                      className="w-full bg-transparent text-base sm:text-lg font-bold tracking-wider text-[#f0f0f2] placeholder:text-zinc-500 focus:outline-none pt-1"
                    />
                  </div>
                </div>

                {renderGoogleAuthSection('Estudiante')}
              </div>

              {errorMessage && (
                <div className="py-2 border-b-2 border-[#9e1b24] text-rose-200 font-mono text-xs flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-[#9e1b24] shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={isLoading || !joinCode.trim()}
                  className={cn(
                    'px-7 py-3.5 bg-[#25242c] hover:bg-[#31303a] disabled:opacity-40 border border-zinc-600 hover:border-[#22e584] text-[#f0f0f2] font-bold text-xs sm:text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3 cursor-pointer shadow-lg',
                    isLoading && 'opacity-75 cursor-wait'
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#22e584] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="w-4 h-4 bg-[#22e584] text-[#0e0c15] font-black flex items-center justify-center text-[9px]">
                      ▼
                    </span>
                  )}
                  <span>{isLoading ? 'Conectando...' : 'Unirse a la Partida'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </HeatGuardianLobbyShell>
    </div>
  );
}
