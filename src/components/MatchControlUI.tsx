import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, AlertTriangle, DoorOpen, Home, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { playBalatroSound } from '../lib/soundEffects';

/**
 * II SILHOUETTE Editorial Palette:
 * - Alabaster Stone: #f0f0f2
 * - Obsidian Night: #0e0c15
 * - Charcoal Slate: #25242c
 * - Crimson Red: #9e1b24
 * - Emerald Mint: #22e584
 * - Sunset Amber: #f58233
 * - Azure Cobalt: #0284c7
 */
export const NYNA_PALETTE = {
  periwinkle: '#f0f0f2',
  hyperMagenta: '#22e584',
  ultrasonicBlue: '#9e1b24',
  velvetPurple: '#25242c',
  black: '#0e0c15',
} as const;

export interface ExpandableIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'primary' | 'magenta' | 'danger' | 'warning' | 'active';
  disabled?: boolean;
  title?: string;
  className?: string;
  badge?: string | number;
  alwaysShowLabelOnMobile?: boolean;
}

/**
 * Circular / compact icon button that NEVER stretches horizontally (preventing layout shifts)
 * and instead superimposes a floating mini-label badge on hover.
 */
export const ExpandableIconButton: React.FC<ExpandableIconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
  title,
  className,
  badge,
}) => {
  const variantClasses: Record<NonNullable<ExpandableIconButtonProps['variant']>, string> = {
    default:
      'bg-[#181622]/90 hover:bg-[#25242c] border-zinc-700/80 hover:border-[#22e584] text-[#f0f0f2] shadow-[0_4px_14px_rgba(14,12,21,0.85)]',
    secondary:
      'bg-[#181622]/90 hover:bg-[#25242c] border-zinc-700/80 hover:border-[#22e584] text-[#f0f0f2] shadow-[0_4px_14px_rgba(14,12,21,0.85)]',
    primary:
      'bg-[#25242c] hover:bg-[#22e584] border-[#22e584]/60 hover:border-[#22e584] text-[#f0f0f2] hover:text-[#0e0c15] shadow-[0_4px_18px_rgba(34,229,132,0.25)]',
    magenta:
      'bg-[#22e584] hover:bg-[#f0f0f2] border-[#f0f0f2]/70 text-[#0e0c15] shadow-[0_4px_18px_rgba(34,229,132,0.45)]',
    danger:
      'bg-[#181622]/95 hover:bg-[#9e1b24] border-[#9e1b24]/70 hover:border-rose-300 text-[#f0f0f2] hover:text-white shadow-[0_4px_14px_rgba(14,12,21,0.85)]',
    warning:
      'bg-[#f58233] hover:bg-amber-400 border-amber-200 text-[#0e0c15] shadow-[0_4px_18px_rgba(245,130,51,0.4)]',
    active:
      'bg-[#22e584] border-[#f0f0f2] text-[#0e0c15] shadow-[0_0_20px_rgba(34,229,132,0.55)]',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title || label}
      aria-label={label}
      className={cn(
        'group relative inline-flex items-center justify-center h-10 min-w-10 px-2.5 rounded-full border font-sans font-bold text-xs tracking-wide transition-colors duration-200 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed select-none shrink-0',
        variantClasses[variant] || variantClasses.default,
        className
      )}
    >
      <span className="shrink-0 flex items-center justify-center">{icon}</span>
      {badge !== undefined && (
        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#0e0c15]/90 border border-[#22e584]/40 text-[#f0f0f2] font-mono text-[10px] font-black leading-none">
          {badge}
        </span>
      )}
      {/* Superimposed mini-label on hover (no width stretching / zero layout shift) */}
      <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[160] px-2.5 py-1 rounded-full bg-[#0e0c15]/95 border border-[#22e584]/80 text-[#f0f0f2] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 shadow-[0_8px_20px_rgba(14,12,21,0.95)]">
        {label}
      </span>
    </button>
  );
};

export interface LeaveMatchConfirmModalProps {
  isOpen: boolean;
  targetDestination: 'lobby' | 'home' | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation modal shown when clicking "Sala" or "Menú / Salir" during an active match.
 */
export const LeaveMatchConfirmModal: React.FC<LeaveMatchConfirmModalProps> = ({
  isOpen,
  targetDestination,
  onCancel,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && targetDestination && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#0e0c15]/88 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl bg-[#14121d] border border-zinc-700/80 p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.85)] space-y-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#9e1b24]/20 border border-[#9e1b24] flex items-center justify-center mx-auto text-[#f0f0f2]">
              <AlertTriangle size={28} className="text-[#9e1b24]" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#25242c] border border-zinc-700 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#22e584]">
                ◇ Partida en Curso
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#f0f0f2] tracking-[0.08em] uppercase">
                {targetDestination === 'lobby'
                  ? '¿Volver a la Sala de Espera?'
                  : '¿Salir al Menú Principal?'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                La partida está actualmente en curso. ¿Estás seguro de que deseas{' '}
                {targetDestination === 'lobby'
                  ? 'regresar a la sala de espera y detener la partida actual'
                  : 'abandonar la partida en curso e ir al menú principal'}
                ?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('click');
                  onCancel();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#25242c] hover:bg-[#22e584] text-[#f0f0f2] hover:text-[#0e0c15] font-bold text-xs uppercase tracking-wider border border-zinc-700 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <span className="w-3.5 h-3.5 bg-[#22e584] text-[#0e0c15] flex items-center justify-center text-[8px] font-black">
                  ▼
                </span>
                <span>Seguir en la Partida</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playBalatroSound('select');
                  onConfirm();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#9e1b24]/25 hover:bg-[#9e1b24] text-[#f0f0f2] hover:text-white font-bold text-xs uppercase tracking-wider border border-[#9e1b24]/70 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {targetDestination === 'lobby' ? <DoorOpen size={15} /> : <Home size={15} />}
                <span>
                  {targetDestination === 'lobby' ? 'Sí, Ir a la Sala' : 'Sí, Salir al Menú'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export interface StudentPauseLockOverlayProps {
  isPaused?: boolean;
  isTeacher?: boolean;
  onResumeByTeacher?: () => void;
}

/**
 * When the teacher pauses the game (`isPaused === true`):
 * - Students see a full-screen interactive lock overlay and cannot perform any action.
 * - Teachers see a compact floating banner at the bottom-center reminding them the game is paused with a 1-click Resume button.
 */
export const StudentPauseLockOverlay: React.FC<StudentPauseLockOverlayProps> = ({
  isPaused,
  isTeacher,
  onResumeByTeacher,
}) => {
  if (!isPaused) return null;

  if (isTeacher) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[170] pointer-events-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-5 py-2.5 rounded-full bg-[#14121d]/95 border border-[#22e584] shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center gap-3 text-[#f0f0f2]"
        >
          <span className="w-2.5 h-2.5 rotate-45 bg-[#22e584] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">
            ⏸️ Juego Pausado para Todos los Estudiantes
          </span>
          {onResumeByTeacher && (
            <button
              type="button"
              onClick={() => {
                playBalatroSound('play');
                onResumeByTeacher();
              }}
              className="px-3.5 py-1 rounded-full bg-[#22e584] hover:bg-[#f0f0f2] text-[#0e0c15] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Play size={13} fill="currentColor" />
              <span>Reanudar</span>
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0e0c15]/92 backdrop-blur-md p-4 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-[#14121d] border border-[#9e1b24]/80 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.9)] space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#9e1b24]/20 border border-[#9e1b24] flex items-center justify-center mx-auto text-[#f0f0f2] animate-pulse">
          <Pause size={32} className="text-[#9e1b24]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#25242c] border border-zinc-700 text-[#22e584] text-[11px] font-mono font-bold uppercase tracking-widest">
          <Lock size={12} className="text-[#22e584]" />
          <span>Controles Bloqueados</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#f0f0f2] tracking-[0.08em] uppercase">
          Juego Pausado por el Docente
        </h2>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          El docente ha pausado temporalmente la actividad para toda la sala. El reloj está detenido y las respuestas están bloqueadas hasta que se reanude la partida.
        </p>
      </motion.div>
    </div>
  );
};

export interface TeacherPauseToggleButtonProps {
  isPaused: boolean;
  onTogglePause?: () => void;
  onToggle?: () => void;
}

export const TeacherPauseToggleButton: React.FC<TeacherPauseToggleButtonProps> = ({
  isPaused,
  onTogglePause,
  onToggle,
}) => {
  const handlePress = onTogglePause || onToggle;
  return (
    <ExpandableIconButton
      icon={isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
      label={isPaused ? 'Reanudar Juego' : 'Pausar Juego'}
      variant={isPaused ? 'magenta' : 'primary'}
      onClick={() => {
        playBalatroSound('select');
        handlePress?.();
      }}
      title={
        isPaused
          ? 'Reanudar el juego para todos los estudiantes'
          : 'Pausar el juego y bloquear controles para todos los estudiantes'
      }
    />
  );
};
