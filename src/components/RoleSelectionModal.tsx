import React from 'react';
import { motion } from 'motion/react';
import { X, LogIn, Plus, ShieldCheck, GraduationCap } from 'lucide-react';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';
import { RunicSigilsRow } from './SilhouetteColossusArt';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelectRole: (role: 'teacher' | 'student') => void;
  onClose?: () => void;
  currentRole?: 'teacher' | 'student' | null;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
  currentRole = null,
}) => {
  if (!isOpen) return null;

  const handleChoose = (role: 'teacher' | 'student') => {
    playBalatroSound('play');
    onSelectRole(role);
  };

  return (
    <div className="relative w-full min-h-screen h-auto z-50 flex items-start justify-center bg-[#0e0c15] py-8 px-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl my-auto bg-[#f4f4f6] border-2 border-zinc-300 shadow-[0_28px_80px_rgba(0,0,0,0.45)] overflow-hidden text-zinc-900"
      >
        {/* Top Bar — Refined Alabaster Stone Header */}
        <div className="px-5 sm:px-7 py-3 bg-[#eae9ec] border-b border-zinc-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">
              · CAMPAMENTO & BITÁCORA DIDÁCTICA
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                playBalatroSound('click');
                onClose();
              }}
              aria-label="Cerrar selección de modo"
              className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:text-zinc-900 border border-zinc-300 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative bg-[#f0f0f2] text-zinc-900 px-6 py-6 text-center border-b border-zinc-300 overflow-hidden">
          <svg
            className="absolute right-0 top-0 w-72 h-36 text-zinc-400/20 pointer-events-none"
            viewBox="0 0 400 200"
            fill="currentColor"
          >
            <polygon points="180,0 400,0 400,160 280,90" />
            <polygon points="240,0 400,0 400,90" className="text-zinc-500/20" />
            <circle cx="290" cy="48" r="14" className="text-zinc-700/20" />
          </svg>

          <div className="relative z-10 max-w-lg mx-auto">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              I · II
            </div>
            <h1 className="font-serif text-xl sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1.5">
              ¿Cómo vas a ingresar hoy?
            </h1>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-2.5">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2.5 h-2.5 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed font-serif">
              Selecciona tu modo en la bitácora para abrir salas y monitorear cámaras como docente o unirte a la partida como estudiante.
            </p>
          </div>
        </div>

        {/* Two Architectural Monolith Role Cards (Docente vs Estudiante) in Unified Light Palette */}
        <div className="p-5 sm:p-7 bg-[#f4f4f6] grid sm:grid-cols-2 gap-5">
          {/* ROLE I: DOCENTE */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => handleChoose('teacher')}
            className={cn(
              'relative bg-white border-2 p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all group shadow-sm',
              currentRole === 'teacher'
                ? 'border-[#9e1b24] shadow-[0_0_24px_rgba(158,27,36,0.15)] ring-1 ring-[#9e1b24]'
                : 'border-zinc-300 hover:border-[#9e1b24]/80'
            )}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 bg-zinc-100 border border-zinc-300 flex items-center justify-center text-xl shadow-xs">
                    👨‍🏫
                  </div>
                  <div>
                    <span className="font-serif text-xs font-bold tracking-[0.2em] text-[#9e1b24] block">
                      MODO I · DOCENTE ✕
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#9e1b24] transition-colors">
                      Bitácora del Docente
                    </h3>
                  </div>
                </div>
                <ShieldCheck size={18} className="text-[#9e1b24] shrink-0" />
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Crea y configura salas en vivo con código PIN/QR, supervisa a los estudiantes en tiempo real y consulta la tabla de calificaciones (0-100).
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-200">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#9e1b24] hover:bg-[#80141b] text-white font-serif font-bold text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus size={14} />
                  <span>Entrar como Docente</span>
                </span>
                <span>▶</span>
              </button>
            </div>
          </motion.div>

          {/* ROLE II: ESTUDIANTE */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => handleChoose('student')}
            className={cn(
              'relative bg-white border-2 p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all group shadow-sm',
              currentRole === 'student'
                ? 'border-[#0284c7] shadow-[0_0_24px_rgba(2,132,199,0.15)] ring-1 ring-[#0284c7]'
                : 'border-zinc-300 hover:border-[#0284c7]/80'
            )}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 bg-zinc-100 border border-zinc-300 flex items-center justify-center text-xl shadow-xs">
                    🧑‍🎓
                  </div>
                  <div>
                    <span className="font-serif text-xs font-bold tracking-[0.2em] text-[#0284c7] block">
                      MODO II · ESTUDIANTE ✕
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-zinc-900 group-hover:text-[#0284c7] transition-colors">
                      Bitácora del Estudiante
                    </h3>
                  </div>
                </div>
                <GraduationCap size={18} className="text-[#0284c7] shrink-0" />
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Ingresa con el código PIN de tu profesor a la sala en vivo o practica en solitario en cualquiera de los juegos didácticos del campamento.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-200">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#27272a] hover:bg-[#18181b] text-white font-serif font-bold text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <LogIn size={14} />
                  <span>Entrar como Estudiante</span>
                </span>
                <span>▶</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Strip */}
        <div className="px-6 py-3 bg-[#eae9ec] border-t border-zinc-300 text-center text-[11px] font-serif uppercase tracking-[0.14em] text-zinc-600">
          Puedes alternar entre Bitácora Docente y Estudiante en cualquier momento desde la barra superior
        </div>
      </motion.div>
    </div>
  );
};

