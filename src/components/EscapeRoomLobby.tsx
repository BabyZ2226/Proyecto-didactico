import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  QrCode,
  Users,
  Play,
  Settings,
  Sparkles,
  Clock,
  Award,
} from 'lucide-react';
import { playBalatroSound, isSfxMuted, setSfxMuted } from '../lib/soundEffects';
import { QRCodeSVG } from 'qrcode.react';
import { HeatGuardianLobbyShell, HeatGuardianMenuItem } from './HeatGuardianBackdrop';
import { ExpandableIconButton } from './MatchControlUI';

export interface EscapeRoomLobbyProps {
  roomCode: string;
  roomName?: string;
  totalInitialSeconds: number;
  questionsCount: number;
  activePackTitle?: string;
  wrongPenaltySecs?: number;
  enableJumpscare?: boolean;
  onStartMatch: () => void;
  onOpenSettings: (tab: 'time' | 'rules' | 'ai' | 'questions') => void;
  onOpenEscapeLibrary?: () => void;
  onExit: () => void;
  players?: Array<{ id: string; name: string; avatar: string; ready: boolean }>;
  isHost?: boolean;
  isTeacherSpectator?: boolean;
  onOpenTeacherSummary?: () => void;
}

export const EscapeRoomLobby: React.FC<EscapeRoomLobbyProps> = ({
  roomCode,
  roomName,
  totalInitialSeconds,
  questionsCount,
  activePackTitle,
  wrongPenaltySecs = 20,
  onStartMatch,
  onOpenSettings,
  onOpenEscapeLibrary,
  onExit,
  players = [],
  isHost = true,
  isTeacherSpectator = false,
  onOpenTeacherSummary,
}) => {
  const uniquePlayers = useMemo(() => {
    const seen = new Set<string>();
    return players.filter((p) => {
      const anyP = p as any;
      if (
        anyP.isSpectator ||
        anyP.role === 'teacher' ||
        p.name.toLowerCase().includes('profesor') ||
        p.name.toLowerCase().includes('docente') ||
        (isTeacherSpectator && anyP.isHost)
      ) {
        return false;
      }
      const key = `${p.name.trim().toLowerCase()}_${p.avatar}`;
      if (seen.has(key) || seen.has(p.id)) return false;
      seen.add(key);
      seen.add(p.id);
      return true;
    });
  }, [players, isTeacherSpectator]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSfxMuted());

  const hostDisplay = typeof window !== 'undefined' ? window.location.host : 'escaperoom.edu';
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&game=escape_room`
      : `https://escaperoom.edu?room=${roomCode}&game=escape_room`;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  const menuItems: HeatGuardianMenuItem[] = [
    ...(isHost || isTeacherSpectator
      ? [
          {
            id: 'play',
            label: 'Jugar',
            isPrimary: true,
            onClick: onStartMatch,
          },
          {
            id: 'settings',
            label: 'Ajustes',
            badge: `${formatTime(totalInitialSeconds)}`,
            onClick: () => onOpenSettings('rules'),
          },
        ]
      : []),
    ...(onOpenEscapeLibrary
      ? [
          {
            id: 'library',
            label: 'Biblioteca',
            badge: `${questionsCount} Cám`,
            onClick: onOpenEscapeLibrary,
          },
        ]
      : []),
    {
      id: 'qr',
      label: 'Código QR',
      onClick: () => setIsQrModalOpen(true),
    },
    {
      id: 'exit',
      label: 'Salir',
      isDanger: true,
      onClick: onExit,
    },
  ];

  return (
    <HeatGuardianLobbyShell
      titleLine1="ESCAPE"
      titleLine2="GUARDIAN"
      subtitleBadge="SUPERVIVENCIA ACADÉMICA"
      roomCode={roomCode}
      menuItems={menuItems}
      soundMuted={soundMuted}
      onToggleSound={toggleSound}
      onToggleFullscreen={toggleFullscreen}
      variant="crimson_mist"
      footerCredit={roomName || 'ESCAPE ROOM EDUCATIVO'}
    >
      {/* OPEN TYPOGRAPHIC LOBBY STAGE (II SILHOUETTE PALETTE & STYLE) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl text-[#f0f0f2] space-y-9 py-4"
      >
        {/* Top Wide-Tracked Header + Floating QR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9e1b24] font-bold block mb-1">
              ◇ ESCAPE ROOM · 10 CÁMARAS
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-[0.18em] text-[#f0f0f2] drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              Sala de Clase
            </h1>
            <p className="text-xs font-mono tracking-[0.16em] text-[#22e584] mt-1">
              {activePackTitle || 'Escape Multidisciplinar: Las 10 Cámaras del Saber'}
            </p>
          </div>

          <div
            onClick={() => setIsQrModalOpen(true)}
            className="w-20 h-20 rounded-xl bg-[#f0f0f2] p-2 shadow-[0_8px_25px_rgba(0,0,0,0.6)] border border-[#22e584] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center shrink-0"
            title="Clic para agrandar QR"
          >
            <QRCodeSVG value={joinUrl} size={68} level="M" includeMargin={false} />
          </div>
        </div>

        {/* SECTION 1: Código PIN & Enlace (Horizontal dot-and-underline bar) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
              Código PIN
            </h2>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-3xl sm:text-5xl font-black font-mono tracking-[0.25em] text-[#f0f0f2] hover:text-[#22e584] transition-colors cursor-pointer drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)]"
              title="Clic para copiar PIN"
            >
              {roomCode}
            </button>
          </div>

          <div className="relative grid grid-cols-3 border-b border-zinc-600/60">
            <button
              type="button"
              onClick={handleCopyCode}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#22e584] font-bold cursor-pointer"
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

        {/* SECTION 2: Parámetros y Herramientas (Horizontal dot-and-underline bar) */}
        <div className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
            Configuración de Partida
          </h2>

          <div className="relative grid grid-cols-3 border-b border-zinc-600/60">
            <button
              type="button"
              onClick={() => {
                onOpenSettings('time');
                playBalatroSound('click');
              }}
              className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-[#f0f0f2] font-bold cursor-pointer"
            >
              <span className="w-2 h-2 rotate-45 bg-[#9e1b24] shadow-[0_0_10px_#9e1b24]" />
              <span>⏱️ {formatTime(totalInitialSeconds)}</span>
              <span className="pointer-events-none absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#9e1b24] shadow-[0_0_12px_#9e1b24]" />
            </button>

            {onOpenEscapeLibrary ? (
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('select');
                  onOpenEscapeLibrary();
                }}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>Biblioteca ({questionsCount})</span>
              </button>
            ) : (
              <div className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400">
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>{questionsCount} Cámaras</span>
              </div>
            )}

            {onOpenTeacherSummary ? (
              <button
                type="button"
                onClick={onOpenTeacherSummary}
                className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400 hover:text-[#f0f0f2] cursor-pointer"
              >
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>Notas 0-100</span>
              </button>
            ) : (
              <div className="relative pb-3.5 pt-1 flex items-center gap-2 text-xs sm:text-sm tracking-[0.12em] text-zinc-400">
                <span className="w-2 h-2 rotate-45 bg-zinc-500" />
                <span>{wrongPenaltySecs > 0 ? `-${wrongPenaltySecs}s Error` : 'Libre'}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Estudiantes en Sala (Horizontal dot-and-underline bar) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-[#f0f0f2]">
              Estudiantes ({uniquePlayers.length})
            </h2>
            {isHost || isTeacherSpectator ? (
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  onStartMatch();
                }}
                className="px-6 py-2.5 bg-[#25242c] hover:bg-[#31303a] border border-zinc-600 hover:border-[#22e584] text-[#f0f0f2] font-bold text-xs uppercase tracking-[0.2em] cursor-pointer shadow-lg transition-all flex items-center gap-2.5"
              >
                <span className="w-4 h-4 bg-[#22e584] text-[#0e0c15] font-black flex items-center justify-center text-[9px]">
                  ▼
                </span>
                <span>Iniciar Partida</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-[#22e584] flex items-center gap-1.5">
                <Clock size={13} className="animate-spin" />
                <span>Esperando al docente...</span>
              </span>
            )}
          </div>

          <div className="relative flex flex-wrap items-center gap-6 border-b border-zinc-600/60 pb-3.5 pt-1">
            {uniquePlayers.length === 0 ? (
              <div className="relative flex items-center gap-2.5 text-xs sm:text-sm tracking-[0.12em] text-zinc-300">
                <span className="w-2 h-2 rotate-45 bg-[#22e584] animate-pulse" />
                <span>Esperando estudiantes con el PIN {roomCode}...</span>
                <span className="pointer-events-none absolute bottom-[-15px] left-0 right-0 h-[3px] bg-[#22e584]" />
              </div>
            ) : (
              uniquePlayers.map((p, idx) => (
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0c15]/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              className="rounded-2xl bg-[#14121d] border border-zinc-700 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-[#f0f0f2]">
                ◇ Código QR · Escape Guardian
              </h3>
              <p className="font-mono text-xs text-zinc-400">
                Escanea con la cámara para ingresar a la sala antes de iniciar:
              </p>

              <div className="w-56 h-56 rounded-xl bg-[#f0f0f2] p-3 mx-auto shadow-2xl flex items-center justify-center border border-[#22e584]">
                <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} />
              </div>

              <div className="rounded-xl bg-[#0e0c15] p-3 border border-zinc-700 text-center font-mono">
                <span className="text-[11px] text-zinc-400 block uppercase">
                  PIN de la partida:
                </span>
                <span className="text-3xl font-black text-[#22e584] tracking-widest">
                  {roomCode}
                </span>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-3 bg-[#25242c] hover:bg-[#22e584] text-[#f0f0f2] hover:text-[#0e0c15] border border-zinc-700 font-bold uppercase tracking-wider text-xs cursor-pointer transition-colors"
              >
                Cerrar QR
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HeatGuardianLobbyShell>
  );
};
