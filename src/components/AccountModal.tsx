import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  User,
  Shield,
  Mail,
} from 'lucide-react';
import { UserAccount } from '../types';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (account: UserAccount) => void;
  initialRole?: 'teacher' | 'student';
}

const AVAILABLE_SUBJECTS = [
  { id: 'quimica', name: 'Química', icon: '🧪', desc: 'Tabla periódica, enlaces y moléculas' },
  { id: 'fisica', name: 'Física', icon: '⚡', desc: 'Mecánica, termodinámica y ondas' },
  { id: 'matematicas', name: 'Matemáticas', icon: '📐', desc: 'Álgebra, geometría y lógica' },
  { id: 'biologia', name: 'Biología', icon: '🧬', desc: 'Genética, células y ecosistemas' },
  { id: 'historia', name: 'Historia', icon: '🏛️', desc: 'Civilizaciones, hechos y épocas' },
  { id: 'geografia', name: 'Geografía', icon: '🌍', desc: 'Cartografía, continentes y clima' },
  { id: 'lenguaje', name: 'Lenguaje y Literatura', icon: '📚', desc: 'Gramática, redacción y textos' },
  { id: 'cultura', name: 'Cultura General', icon: '🧠', desc: 'Conocimientos y trivias mundiales' },
  { id: 'ciencias', name: 'Ciencias Naturales', icon: '🌿', desc: 'Medio ambiente y naturaleza' },
  { id: 'tecnologia', name: 'Tecnología e Informática', icon: '💻', desc: 'Programación, redes y digital' },
  { id: 'arte', name: 'Arte y Creatividad', icon: '🎨', desc: 'Historia del arte, diseño y expresión' },
  { id: 'filosofia', name: 'Filosofía y Ética', icon: '📜', desc: 'Pensamiento crítico y valores' },
];

const AVATARS = [
  { emoji: '👨‍🏫', name: 'Profesor', category: 'Docente' },
  { emoji: '👩‍🏫', name: 'Profesora', category: 'Docente' },
  { emoji: '👨‍🔬', name: 'Científico', category: 'Ciencia' },
  { emoji: '👩‍🔬', name: 'Científica', category: 'Ciencia' },
  { emoji: '🧑‍🎓', name: 'Estudiante', category: 'Alumno' },
  { emoji: '👩‍🎓', name: 'Investigadora', category: 'Alumno' },
  { emoji: '🦉', name: 'Búho Sabio', category: 'Mítico' },
  { emoji: '⚛️', name: 'Átomo Cuántico', category: 'Ciencia' },
  { emoji: '🧪', name: 'Alquimista', category: 'Química' },
  { emoji: '🧬', name: 'Bio-Explorer', category: 'Biología' },
  { emoji: '🚀', name: 'Cosmonauta', category: 'Espacio' },
  { emoji: '🏛️', name: 'Historiador', category: 'Humanidades' },
];

export function AccountModal({
  isOpen,
  onClose,
  onAccountCreated,
  initialRole,
}: AccountModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [googleEmail, setGoogleEmail] = useState<string>(() => {
    return (
      localStorage.getItem('aulaplay_google_email') ||
      'babycrak2009@gmail.com'
    );
  });
  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('aulaplay_google_email') || true);
  });
  const [googleName, setGoogleName] = useState<string>(() => {
    return localStorage.getItem('aulaplay_google_name') || 'Usuario AulaPlay';
  });

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('po_player_name') || 'Prof. Marie';
  });

  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('po_player_avatar') || '👨‍🏫';
  });

  const [role, setRole] = useState<'teacher' | 'student'>(() => {
    if (initialRole) return initialRole;
    const saved = localStorage.getItem('po_user_role');
    return saved === 'teacher' || saved === 'student' ? saved : 'teacher';
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('aulaplay_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ['Química', 'Física', 'Biología', 'Cultura General'];
  });

  if (!isOpen) return null;

  const toggleSubject = (subjName: string) => {
    playBalatroSound('select');
    setSelectedSubjects((prev) =>
      prev.includes(subjName) ? prev.filter((s) => s !== subjName) : [...prev, subjName]
    );
  };

  const handleLinkGoogle = () => {
    playBalatroSound('play');
    setIsGoogleLinked(true);
    localStorage.setItem('aulaplay_google_email', googleEmail);
    localStorage.setItem('aulaplay_google_name', googleName);
  };

  const handleFinish = () => {
    playBalatroSound('play');
    const finalUsername = username.trim() || (role === 'teacher' ? 'Docente AulaPlay' : 'Estudiante AulaPlay');

    const newAccount: UserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: finalUsername,
      role,
      avatar,
      googleEmail: googleEmail.trim().toLowerCase(),
      googleName,
      subjects: selectedSubjects,
      createdAt: Date.now(),
    };

    // Persist in localStorage
    localStorage.setItem('aulaplay_account', JSON.stringify(newAccount));
    localStorage.setItem('aulaplay_google_email', newAccount.googleEmail);
    localStorage.setItem('aulaplay_google_name', newAccount.googleName || finalUsername);
    localStorage.setItem('po_user_role', role);
    localStorage.setItem('po_player_name', finalUsername);
    localStorage.setItem('po_player_avatar', avatar);
    localStorage.setItem('aulaplay_subjects', JSON.stringify(selectedSubjects));

    onAccountCreated(newAccount);
    onClose();
  };

  return (
    <div className="relative w-full min-h-screen h-auto z-[120] flex items-start justify-center bg-[#0e0c15] py-8 px-3 sm:p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl h-auto bg-[#120a1f] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-5 text-white"
      >
        {/* Decorative Ambient Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Header & Steps Indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎓</span>
              <h2 className="text-lg sm:text-xl font-bold font-vintage-title text-amber-300 flex items-center gap-2">
                <span>Crear Cuenta en</span>
                <AulaPlayLogo size="md" theme="light" />
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paso {step} de 4: {
                step === 1 ? 'Vincular Cuenta de Google' :
                step === 2 ? 'Nombre de Usuario y Avatar' :
                step === 3 ? 'Seleccionar Rol (Docente o Estudiante)' :
                'Materias de Interés'
              }
            </p>
          </div>

          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Track */}
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              onClick={() => {
                if (s < step) {
                  playBalatroSound('select');
                  setStep(s as any);
                }
              }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                s <= step
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-white/10'
              )}
            />
          ))}
        </div>

        {/* STEP CONTENT BODY */}
        <div className="min-h-[290px] flex flex-col justify-between relative z-10">
          <AnimatePresence mode="wait">
            {/* STEP 1: GOOGLE ACCOUNT LINK */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-4"
              >
                <div className="text-center sm:text-left">
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Mail size={18} className="text-amber-400" />
                    <span>Vinculación con Cuenta de Google</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Vincula tu correo de Google para guardar tus partidas, calificaciones históricas y sincronizar el progreso de tus alumnos.
                  </p>
                </div>

                {/* Google Sign-in Interactive Card */}
                <div className="p-4 bg-[#1a0f2c] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2.5 shadow-md shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Google Identity</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          Verificado
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-300 block truncate max-w-[240px] sm:max-w-[280px]">
                        {googleEmail}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLinkGoogle}
                    className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>{isGoogleLinked ? 'Google Vinculado' : 'Vincular Google'}</span>
                  </button>
                </div>

                {/* Email customizer input if using another school email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Correo Institucional o Personal de Google:
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => {
                      setGoogleEmail(e.target.value);
                      setIsGoogleLinked(true);
                    }}
                    placeholder="tucorreo@gmail.com o @colegio.edu"
                    className="w-full bg-[#160c26] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: USERNAME AND AVATAR */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <User size={18} className="text-amber-400" />
                    <span>Nombre de Usuario y Avatar</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Este nombre y avatar te identificarán en las salas de clase y actas de calificaciones.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {avatar}
                  </div>
                  <div className="w-full space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                      Nombre de Pantalla / Usuario:
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={role === 'teacher' ? 'Ej. Prof. García' : 'Ej. Camila Quintero'}
                      maxLength={24}
                      className="w-full bg-[#160c26] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                    Selecciona tu Avatar Académico:
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av.name}
                        type="button"
                        onClick={() => {
                          playBalatroSound('select');
                          setAvatar(av.emoji);
                        }}
                        className={cn(
                          'p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                          avatar === av.emoji
                            ? 'bg-amber-500/30 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                        )}
                      >
                        <span className="text-2xl">{av.emoji}</span>
                        <span className="text-[10px] font-mono font-medium truncate max-w-full">
                          {av.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ROLE SELECTION (DOCENTE VS ESTUDIANTE) */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Shield size={18} className="text-amber-400" />
                    <span>¿Cómo usarás AulaPlay?</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Selecciona si eres Docente (anfitrión supervisor) o Estudiante (jugador activo en clases).
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Option 1: DOCENTE */}
                  <div
                    onClick={() => {
                      playBalatroSound('select');
                      setRole('teacher');
                      if (!avatar || avatar === '🧑‍🎓') setAvatar('👨‍🏫');
                    }}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left relative group',
                      role === 'teacher'
                        ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                        👨‍🏫
                      </div>
                      {role === 'teacher' && (
                        <span className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                          Seleccionado
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-amber-300">Soy Docente / Profesor</h4>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        Control de la clase, proyector en vivo, generador de preguntas con IA, rúbrica automática 0-100 y supervisión como espectador.
                      </p>
                    </div>

                    <div className="text-[11px] font-mono text-amber-200/80 pt-2 border-t border-white/10">
                      ✓ No juegas en la mesa · Control total
                    </div>
                  </div>

                  {/* Option 2: ESTUDIANTE */}
                  <div
                    onClick={() => {
                      playBalatroSound('select');
                      setRole('student');
                      if (avatar === '👨‍🏫' || avatar === '👩‍🏫') setAvatar('🧑‍🎓');
                    }}
                    className={cn(
                      'p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left relative group',
                      role === 'student'
                        ? 'bg-fuchsia-950/40 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.35)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-2xl">
                        🧑‍🎓
                      </div>
                      {role === 'student' && (
                        <span className="text-[10px] font-mono font-bold bg-fuchsia-500 text-slate-950 px-2 py-0.5 rounded-full">
                          Seleccionado
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-fuchsia-300">Soy Estudiante / Alumno</h4>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        Únete con el código PIN de tu profesor, participa en partidas por equipos o practica en solitario para mejorar tus notas.
                      </p>
                    </div>

                    <div className="text-[11px] font-mono text-fuchsia-200/80 pt-2 border-t border-white/10">
                      ✓ Jugador activo · Retos y logros
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUBJECTS TO TEACH OR LEARN */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-3"
              >
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-400" />
                    <span>
                      {role === 'teacher'
                        ? 'Materias que quiero Enseñar'
                        : 'Materias que quiero Aprender'}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Elige una o más áreas temáticas para personalizar tus salas y biblioteca educativa:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-auto p-1">
                  {AVAILABLE_SUBJECTS.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj.name);
                    return (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => toggleSubject(subj.name)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1',
                          isSelected
                            ? 'bg-amber-500/25 border-amber-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{subj.icon}</span>
                          {isSelected && <Check size={14} className="text-amber-400" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-zinc-100 leading-tight">
                            {subj.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 truncate block mt-0.5">
                            {subj.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Actions Navigation */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('click');
                  setStep((s) => (s - 1) as any);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-zinc-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Atrás</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('select');
                  setStep((s) => (s + 1) as any);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Siguiente</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-7 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Completar Registro</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
