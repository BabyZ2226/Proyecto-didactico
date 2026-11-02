import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  QrCode,
  Users,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Palette,
  Share2,
  Clock,
  LogOut,
  Crown,
  Minus,
  Plus,
  Info,
  Sparkles,
  Settings,
} from 'lucide-react';
import { playBalatroSound, isSfxMuted, setSfxMuted } from '../lib/soundEffects';
import { QRCodeSVG } from 'qrcode.react';
import { RoomState, GamePlayer } from '../types';
import { cn } from '../lib/utils';
import { ExpandableIconButton } from './MatchControlUI';
import { HeatGuardianLobbyShell, HeatGuardianMenuItem } from './HeatGuardianBackdrop';

export interface LobbyViewProps {
  room: RoomState;
  currentUserId: string;
  startingChips?: number;
  onSelectStartingChips?: (chips: number) => void;
  onStartGame: () => void;
  onSetBotCount: (count: number) => void;
  onLeaveRoom: () => void;
  onOpenRules: () => void;
}

export function LobbyView({
  room,
  currentUserId,
  startingChips = 1000,
  onSelectStartingChips,
  onStartGame,
  onSetBotCount,
  onLeaveRoom,
  onOpenRules,
}: LobbyViewProps) {
  const isHost = room.hostId === currentUserId;
  const isTeacherOrSpectator = (p: GamePlayer) => {
    return Boolean(
      p.isSpectator ||
      p.role === 'teacher' ||
      p.name.toLowerCase().includes('profesor') ||
      p.name.toLowerCase().includes('docente') ||
      (room.hostIsSpectator && p.id === room.hostId)
    );
  };

  const studentPlayers = useMemo(() => {
    return room.players.filter((p) => !p.isBot && !isTeacherOrSpectator(p));
  }, [room.players, room.hostIsSpectator, room.hostId]);

  const botPlayers = useMemo(() => {
    return room.players.filter((p) => p.isBot);
  }, [room.players]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTeacherConfigOpen, setIsTeacherConfigOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSfxMuted());

  // Teacher Pre-game Configuration State for Póker del Octeto
  const [localChips, setLocalChips] = useState<number>(startingChips);
  const [betCapLimit, setBetCapLimit] = useState<number>(300); // 0 = Sin límite
  const [blindAmount, setBlindAmount] = useState<number>(25);
  const [chemicalHintsEnabled, setChemicalHintsEnabled] = useState<boolean>(true);
  const [winnerBonusPts, setWinnerBonusPts] = useState<number>(100);
  const [turnTimerSecs, setTurnTimerSecs] = useState<number>(0); // 0 = Sin límite

  const hostDisplay = typeof window !== 'undefined' ? window.location.host : 'pokerocteto.edu';
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${room.code}&game=${room.gameType || 'poker_quimico'}`
    : `https://pokerocteto.edu?room=${room.code}&game=${room.gameType || 'poker_quimico'}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      playBalatroSound('select');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedUrl(true);
      playBalatroSound('select');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
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

  const pokerMenuItems: HeatGuardianMenuItem[] = [
    {
      id: 'play',
      label: isHost ? 'Jugar' : 'En Espera',
      active: true,
      disabled: !isHost,
      onClick: () => {
        if (isHost) {
          playBalatroSound('play');
          onStartGame();
        }
      },
    },
    {
      id: 'settings',
      label: 'Ajustes',
      onClick: () => {
        playBalatroSound('select');
        setIsTeacherConfigOpen(true);
      },
    },
    {
      id: 'rules',
      label: 'Reglas',
      onClick: () => {
        playBalatroSound('click');
        onOpenRules();
      },
    },
    {
      id: 'qr',
      label: 'Código QR',
      onClick: () => setIsQrModalOpen(true),
    },
    {
      id: 'exit',
      label: 'Salir',
      onClick: onLeaveRoom,
    },
  ];

  return (
    <HeatGuardianLobbyShell
      titleLine1="PÓKER DEL"
      titleLine2="OCTETO"
      subtitleBadge="SÍNTESIS QUÍMICA · MESA DEL AULA"
      roomCode={room.code}
      menuItems={pokerMenuItems}
      soundMuted={soundMuted}
      onToggleSound={toggleSound}
      onToggleFullscreen={toggleFullscreen}
      variant="emerald_lab"
      footerCredit={room.name || 'PÓKER DEL OCTETO'}
    >
      {/* OPEN TYPOGRAPHIC LOBBY STAGE (IMAGE_543572EC STYLE + NYNÄ PALETTE) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl text-[#E3D9FC] space-y-9 py-4"
      >
        {/* Top Wide-Tracked Header ("Settings" style) + Floating QR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-[0.22em] text-[#E3D9FC] drop-shadow-[0_4px_20px_rgba(4,6,7,0.9)]">
              Sala de Clase
            </h1>
            <p className="text-xs font-mono tracking-[0.16em] text-[#BF40FA] mt-1">
              {room.name || 'Laboratorio de Enlaces Químicos · Póker del Octeto'}
            </p>
          </div>

          <div
            onClick={() => setIsQrModalOpen(true)}
            className="w-20 h-20 rounded-2xl bg-[#E3D9FC] p-2 shadow-[0_8px_25px_rgba(191,64,250,0.4)] border-2 border-[#BF40FA] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center shrink-0"
            title="Clic para agrandar QR"
          >
            <QRCodeSVG value={joinUrl} size={68} level="M" includeMargin={false} />
          </div>
        </div>

        {/* SECTION 1: Código PIN & Enlace (Horizontal dot-and-underline bar) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.18em] text-[#E3D9FC]">
              Código PIN
            </h2>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-3xl sm:text-5xl font-black font-mono tracking-[0.25em] text-[#E3D9FC] hover:text-[#BF40FA] transition-colors cursor-pointer drop-shadow-[0_4px_18px_rgba(191,64,250,0.45)]"
              title="Clic para copiar PIN"
            >
              {room.code}
            </button>
          </div>

          <div className="relative grid grid-cols-3 border-b border-[#E3D9FC]/40">
            <button
              type="button"
              onClick={handleCopyCode}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC] font-bold cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC] shadow-[0_0_10px_#BF40FA]" />
              <span>{copiedCode ? 'PIN Copiado' : 'Copiar PIN'}</span>
              <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#BF40FA] shadow-[0_0_12px_#BF40FA]" />
            </button>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC]/80 hover:text-[#E3D9FC] cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC]/60" />
              <span>{copiedUrl ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC]/80 hover:text-[#E3D9FC] cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC]/60" />
              <span>Ampliar QR</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Configuración de Mesa (Horizontal dot-and-underline bar) */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-medium tracking-[0.18em] text-[#E3D9FC]">
            Configuración de Partida
          </h2>

          <div className="relative grid grid-cols-3 border-b border-[#E3D9FC]/40">
            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setIsTeacherConfigOpen(true);
              }}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC] font-bold cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC] shadow-[0_0_10px_#BF40FA]" />
              <span>💰 ${localChips.toLocaleString()}</span>
              <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#BF40FA] shadow-[0_0_12px_#BF40FA]" />
            </button>

            <div className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC]/85">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC]/60" />
              <span>🤖 {botPlayers.length} Bots</span>
              {isHost && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => onSetBotCount(Math.max(0, botPlayers.length - 1))}
                    disabled={botPlayers.length <= 0}
                    className="w-5 h-5 rounded-full bg-[#5B2A62] hover:bg-[#BF40FA] hover:text-[#040607] disabled:opacity-30 text-[#E3D9FC] flex items-center justify-center cursor-pointer text-xs transition-colors"
                  >
                    <Minus size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetBotCount(Math.min(5, botPlayers.length + 1))}
                    disabled={botPlayers.length >= 5}
                    className="w-5 h-5 rounded-full bg-[#5B2A62] hover:bg-[#BF40FA] hover:text-[#040607] disabled:opacity-30 text-[#E3D9FC] flex items-center justify-center cursor-pointer text-xs transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenRules}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC]/80 hover:text-[#E3D9FC] cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC]/60" />
              <span>Reglas Químicas</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: Estudiantes y Bots en Sala (Horizontal dot-and-underline bar) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-medium tracking-[0.18em] text-[#E3D9FC]">
              Estudiantes ({studentPlayers.length}/{room.maxPlayers})
            </h2>
            {isHost ? (
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onStartGame();
                }}
                className="px-6 py-2.5 rounded-full bg-[#040607]/90 hover:bg-[#4928C2] border-2 border-[#BF40FA] text-[#E3D9FC] font-black text-xs uppercase tracking-[0.2em] cursor-pointer shadow-[0_0_24px_rgba(191,64,250,0.45)] transition-all flex items-center gap-2"
              >
                <Play size={14} fill="currentColor" />
                <span>Iniciar Mesa</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-[#BF40FA] flex items-center gap-1.5">
                <Clock size={13} className="animate-spin" />
                <span>Esperando al profesor...</span>
              </span>
            )}
          </div>

          <div className="relative flex flex-wrap items-center gap-6 border-b border-[#E3D9FC]/40 pb-3.5 pt-1">
            {studentPlayers.length === 0 && botPlayers.length === 0 ? (
              <div className="relative flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.12em] text-[#E3D9FC]/75">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BF40FA] animate-pulse" />
                <span>Esperando estudiantes con el PIN {room.code}...</span>
                <span className="pointer-events-none absolute bottom-[-15px] left-0 right-0 h-[3px] bg-[#BF40FA]" />
              </div>
            ) : (
              <>
                {studentPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="relative flex items-center gap-2 text-xs sm:text-sm tracking-[0.1em] text-[#E3D9FC] font-bold"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E3D9FC] shadow-[0_0_8px_#BF40FA]" />
                    <span>{p.avatar} {p.name}</span>
                    {p.isHost && <Crown size={11} className="text-[#BF40FA]" />}
                    {idx === 0 && (
                      <span className="pointer-events-none absolute bottom-[-15px] left-0 right-0 h-[3px] bg-[#BF40FA]" />
                    )}
                  </div>
                ))}
                {botPlayers.map((bot) => (
                  <div
                    key={bot.id}
                    className="relative flex items-center gap-2 text-xs sm:text-sm tracking-[0.1em] text-[#E3D9FC]/80 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#BF40FA]/70" />
                    <span>{bot.avatar} {bot.name} (Bot)</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* QR MODAL PREVIEW */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040607]/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#040607] border-2 border-[#BF40FA] p-6 rounded-[32px] max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <h3 className="font-medieval text-xl font-bold text-[#E3D9FC]">
                Código QR de la Mesa
              </h3>
              <p className="font-mono text-xs text-[#E3D9FC]/80">
                Los estudiantes pueden escanear este código con su móvil para unirse a la partida:
              </p>
              
              <div className="w-56 h-56 bg-[#E3D9FC] p-3 rounded-3xl mx-auto shadow-2xl flex items-center justify-center border-2 border-[#4928C2]">
                <QRCodeSVG
                  value={joinUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="bg-[#4928C2]/30 p-3.5 rounded-2xl border border-[#BF40FA]/40 text-center font-mono">
                <span className="text-[11px] text-[#E3D9FC]/75 block">PIN de la mesa:</span>
                <span className="text-3xl font-black text-[#E3D9FC] tracking-widest">{room.code}</span>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-3 bg-[#BF40FA] hover:bg-[#E3D9FC] text-[#040607] font-black text-xs uppercase tracking-wider rounded-full cursor-pointer transition-colors"
              >
                Cerrar QR
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEACHER PRE-GAME CONFIGURATION MODAL (PÓKER DEL OCTETO) */}
      <AnimatePresence>
        {isTeacherConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#140b24] border-2 border-emerald-500/70 p-5 sm:p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs font-sans text-zinc-200 h-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-emerald-400" />
                  <h3 className="font-medieval text-base font-bold text-amber-300">
                    Configuraciones del Docente · Póker del Octeto
                  </h3>
                </div>
                <button
                  onClick={() => setIsTeacherConfigOpen(false)}
                  aria-label="Cerrar configuración"
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 1. Fichas Iniciales por Estudiante */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">
                  💰 Fichas Iniciales por Estudiante / Químico
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[500, 1000, 2500, 5000].map((chips) => (
                    <button
                      key={chips}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setLocalChips(chips);
                        onSelectStartingChips?.(chips);
                      }}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                        localChips === chips
                          ? 'bg-amber-500 text-zinc-950 border-amber-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300 hover:text-white'
                      }`}
                    >
                      ${chips.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Cantidad de Bots IA en la Mesa */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-cyan-300 block">
                  🤖 Cantidad de Bots IA Químicos en la Mesa
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        onSetBotCount(cnt);
                      }}
                      className={`py-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                        botPlayers.length === cnt
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {cnt} {cnt === 1 ? 'Bot' : 'Bots'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Límite de Apuesta por Ronda & Ciega Inicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-fuchsia-300 block">
                    📈 Tope de Subida por Ronda
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { v: 150, label: '$150' },
                      { v: 300, label: '$300 (Est.)' },
                      { v: 500, label: '$500' },
                      { v: 0, label: 'All-In Libre' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setBetCapLimit(opt.v)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          betCapLimit === opt.v
                            ? 'bg-fuchsia-500 text-white border-fuchsia-400'
                            : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-emerald-300 block">
                    🎯 Apuesta Base Inicial (Ciega)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { v: 0, label: '$0 (Libre)' },
                      { v: 25, label: '$25 Fichas' },
                      { v: 50, label: '$50 Fichas' },
                      { v: 100, label: '$100 Fichas' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setBlindAmount(opt.v)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          blindAmount === opt.v
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Asistente Químico & Tiempo por Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-300 block">
                    🧪 Asistente de Enlaces Químicos
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setChemicalHintsEnabled(true)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        chemicalHintsEnabled
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      🧪 Pistas ON
                    </button>
                    <button
                      type="button"
                      onClick={() => setChemicalHintsEnabled(false)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        !chemicalHintsEnabled
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      📝 Modo Examen
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300 block">
                    🏆 Bonificación al Ganador
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[100, 200, 300].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setWinnerBonusPts(pts)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          winnerBonusPts === pts
                            ? 'bg-purple-500 text-white border-purple-400'
                            : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        +{pts} pts
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Reloj de Decisión por Turno */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-cyan-300 block">
                  ⏱️ Tiempo Límite de Decisión por Turno
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { v: 0, label: 'Sin límite' },
                    { v: 20, label: '20 seg' },
                    { v: 30, label: '30 seg' },
                    { v: 45, label: '45 seg' },
                  ].map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setTurnTimerSecs(t.v)}
                      className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                        turnTimerSecs === t.v
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  localStorage.setItem(
                    'po_poker_teacher_config',
                    JSON.stringify({
                      startingChips: localChips,
                      betCapLimit,
                      blindAmount,
                      chemicalHintsEnabled,
                      winnerBonusPts,
                      turnTimerSecs,
                    })
                  );
                  setIsTeacherConfigOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl cursor-pointer shadow-lg transition-colors"
              >
                Guardar y Aplicar Configuraciones del Docente
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </HeatGuardianLobbyShell>
  );
}
