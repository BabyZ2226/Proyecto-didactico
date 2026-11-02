import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { KeyRound, CheckCircle2, Mail } from 'lucide-react';
import { PokerCompendiumModal } from './PokerCompendiumModal';
import { SilhouetteColossusArt, RunicSigilsRow, DiamondRankBadge } from './SilhouetteColossusArt';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import {
  initAuth,
  signInWithGoogle,
  linkGoogleEmailDirectly,
  logoutGoogle,
  getCachedGoogleUser,
  getOrCreateDeviceUid,
  GoogleUserSession,
} from '../lib/firebaseAuth';

interface StudentJoinHubProps {
  initialCode?: string;
  playerName: string;
  playerAvatar: string;
  onUpdatePlayerInfo: (name: string, avatar: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string, googleEmail?: string, googleUid?: string) => void;
  onStartSoloPractice: (gameType?: 'poker_quimico' | 'escape_room' | 'cien_latinos' | 'el_impostor' | 'geografia_3d') => void;
  onOpenGrimorio: () => void;
  onOpenLatinosLibrary?: () => void;
  onOpenEscapeLibrary?: () => void;
  onOpenImpostorLibrary?: () => void;
}

const AVATARS = [
  { emoji: '🧑‍🎓', label: 'Estudiante' },
  { emoji: '👩‍🎓', label: 'Alumna' },
  { emoji: '🔬', label: 'Científico' },
  { emoji: '🚀', label: 'Explorador' },
  { emoji: '🧠', label: 'Mente Ágil' },
  { emoji: '⚡', label: 'Física' },
  { emoji: '🧬', label: 'Biología' },
  { emoji: '🏆', label: 'Campeón' },
];

export const StudentJoinHub: React.FC<StudentJoinHubProps> = ({
  initialCode = '',
  playerName,
  playerAvatar,
  onUpdatePlayerInfo,
  onJoinRoom,
  onStartSoloPractice,
  onOpenGrimorio,
  onOpenLatinosLibrary,
  onOpenEscapeLibrary,
  onOpenImpostorLibrary,
}) => {
  const [code, setCode] = useState(initialCode);
  const [nameInput, setNameInput] = useState(playerName);
  const [avatarInput, setAvatarInput] = useState(playerAvatar);

  const [googleUser, setGoogleUser] = useState<GoogleUserSession | null>(() => getCachedGoogleUser());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showDirectEmail, setShowDirectEmail] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);

  useEffect(() => {
    const unsub = initAuth((user) => {
      setGoogleUser(user);
      if (user.displayName && (!nameInput || nameInput === 'Marie Curie')) {
        setNameInput(user.displayName);
        onUpdatePlayerInfo(user.displayName, avatarInput);
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleConnect = async () => {
    setIsSigningIn(true);
    try {
      const user = await signInWithGoogle();
      setGoogleUser(user);
      setShowDirectEmail(false);
      if (user.displayName) {
        setNameInput(user.displayName);
        onUpdatePlayerInfo(user.displayName, avatarInput);
      }
      playBalatroSound('select');
    } catch {
      setShowDirectEmail(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDirectEmailSave = () => {
    const clean = directEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    const session = linkGoogleEmailDirectly(clean, nameInput);
    setGoogleUser(session);
    setShowDirectEmail(false);
    playBalatroSound('select');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    let activeUser = googleUser;
    if (!activeUser && directEmail.trim().includes('@')) {
      activeUser = linkGoogleEmailDirectly(directEmail.trim(), nameInput);
      setGoogleUser(activeUser);
    }
    const finalName = nameInput.trim() || 'Estudiante';
    playBalatroSound('play');
    onUpdatePlayerInfo(finalName, avatarInput);
    onJoinRoom(
      code.trim().toUpperCase(),
      finalName,
      avatarInput,
      activeUser?.email || undefined,
      activeUser?.uid || getOrCreateDeviceUid()
    );
  };

  const handleAvatarChange = (emoji: string) => {
    playBalatroSound('select');
    setAvatarInput(emoji);
    onUpdatePlayerInfo(nameInput, emoji);
  };

  return (
    <div className="w-full">
      {/* =====================================================================
          SECCIÓN SUPERIOR CLARA (#f0f0f2)
          1. Unirse a la Sala de Clase (PIN)
          2. 100 Latinos Dicen
          3. Escape Room (10 Cámaras)
      ===================================================================== */}
      <div className="w-full h-auto bg-[#f0f0f2] text-[#27272a] relative pb-16">
        <svg
          className="absolute right-8 top-20 w-80 h-80 text-zinc-300/35 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
          <polygon points="100,15 185,100 100,185 15,100" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="32" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-20 relative z-10">
          {/* -----------------------------------------------------------------
              UNIRSE A LA SALA DE CLASE (CÓDIGO PIN)
          ----------------------------------------------------------------- */}
          <div className="bg-white border border-zinc-300 p-6 sm:p-7 shadow-sm relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 pb-3.5 mb-5">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9e1b24] font-bold block">
                  AULA EN VIVO
                </span>
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.1em] uppercase text-zinc-900 font-bold mt-0.5">
                  Unirse a la Partida de Clase
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ingresa el código PIN proyectado por tu profesor en la pizarra.
                </p>
              </div>

              {/* Google Account Status / Link Button */}
              <div className="w-full md:w-auto">
                {googleUser ? (
                  <div className="px-3 py-1.5 bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#10b981] shrink-0" />
                    <span className="truncate max-w-[170px] font-medium">{googleUser.email}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await logoutGoogle();
                        setGoogleUser(null);
                      }}
                      className="text-[10px] text-[#9e1b24] hover:underline ml-1 cursor-pointer uppercase tracking-wider font-semibold"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : !showDirectEmail ? (
                  <div className="flex flex-col md:items-end gap-1">
                    <button
                      type="button"
                      onClick={handleGoogleConnect}
                      disabled={isSigningIn}
                      className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDirectEmail(true)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                    >
                      O escribir correo escolar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 p-1">
                    <Mail size={13} className="text-zinc-500 ml-1 shrink-0" />
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDirectEmailSave();
                        }
                      }}
                      placeholder="alumno@colegio.edu"
                      className="bg-transparent text-xs text-zinc-800 px-1 py-0.5 focus:outline-none w-36"
                    />
                    <button
                      type="button"
                      onClick={handleDirectEmailSave}
                      className="px-2 py-0.5 bg-[#9e1b24] text-white text-[10px] font-bold uppercase cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-[#f7f7f8] border border-zinc-300 px-4 py-2.5">
                  <KeyRound size={18} className="text-[#9e1b24] shrink-0" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO PIN (EJ. 191440)"
                    maxLength={10}
                    className="w-full bg-transparent font-serif text-lg sm:text-xl font-bold tracking-[0.22em] text-zinc-900 focus:outline-none placeholder:text-zinc-400 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!code.trim()}
                  className="flex items-center justify-center gap-2 bg-[#27272a] hover:bg-[#18181b] disabled:opacity-40 text-white text-xs tracking-[0.14em] uppercase font-semibold px-6 py-3 transition-all cursor-pointer shrink-0"
                >
                  <span className="w-5 h-5 bg-[#9e1b24] text-white flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                  <span>Entrar a la Sala</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[10px] tracking-[0.16em] uppercase text-zinc-500 font-semibold block mb-1">
                    Tu Nombre:
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      onUpdatePlayerInfo(e.target.value, avatarInput);
                    }}
                    maxLength={18}
                    className="w-full bg-[#f7f7f8] border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9e1b24]"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.16em] uppercase text-zinc-500 font-semibold block mb-1">
                    Tu Avatar:
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                    {AVATARS.map((item) => (
                      <button
                        key={item.emoji}
                        type="button"
                        onClick={() => handleAvatarChange(item.emoji)}
                        className={cn(
                          'w-8 h-8 flex items-center justify-center text-base border transition-all shrink-0 cursor-pointer',
                          avatarInput === item.emoji
                            ? 'bg-[#27272a] text-white border-[#9e1b24]'
                            : 'bg-[#f7f7f8] border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                        )}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* -----------------------------------------------------------------
              1. 100 LATINOS DICEN
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-7 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="sunset_crimson"
                className="w-full max-w-[420px] h-[380px] sm:h-[440px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="md:col-span-5 flex flex-col items-start md:items-end md:text-right"
            >
              <div className="flex items-center gap-2 mb-1">
                <DiamondRankBadge numeral="I" theme="light" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9e1b24] font-bold">
                  MULTIDISCIPLINAR
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.1em] font-bold text-zinc-900 uppercase">
                100 Latinos Dicen
              </h2>

              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Duelo por Equipos · Sol vs Rayo
              </p>

              <p className="text-xs leading-relaxed text-zinc-600 mt-3 max-w-sm">
                Adivina las respuestas más populares de encuestas multidisciplinares o explora packs creados por la comunidad.
              </p>

              <div className="mt-5 flex flex-wrap md:justify-end gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('cien_latinos');
                  }}
                  className="flex items-center gap-2 bg-[#27272a] hover:bg-[#18181b] text-white text-xs tracking-wider uppercase font-semibold px-4 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span className="w-4 h-4 bg-[#9e1b24] text-white flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Jugar Tablero</span>
                </button>

                {onOpenLatinosLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onOpenLatinosLibrary();
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs tracking-wider uppercase font-medium px-3.5 py-2 transition-all cursor-pointer"
                  >
                    <span>Biblioteca</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              2. ESCAPE ROOM (10 CÁMARAS)
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-5 order-2 md:order-1 flex flex-col items-start text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <DiamondRankBadge numeral="II" theme="light" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#0284c7] font-bold">
                  MULTIDISCIPLINAR
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.1em] font-bold text-zinc-900 uppercase">
                Escape Room (10 Cámaras)
              </h2>

              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Persecución · 10 Enigmas
              </p>

              <p className="text-xs leading-relaxed text-zinc-600 mt-3 max-w-sm">
                Corre y resuelve enigmas de asignaturas para abrir las compuertas antes de que la sombra te alcance.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('escape_room');
                  }}
                  className="flex items-center gap-2 bg-[#27272a] hover:bg-[#18181b] text-white text-xs tracking-wider uppercase font-semibold px-4 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span className="w-4 h-4 bg-[#0284c7] text-white flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Practicar</span>
                </button>

                {onOpenEscapeLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onOpenEscapeLibrary();
                    }}
                    className="flex items-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs tracking-wider uppercase font-medium px-3.5 py-2 transition-all cursor-pointer"
                  >
                    <span>Biblioteca</span>
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="md:col-span-7 order-1 md:order-2 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="azure_cobalt"
                className="w-full max-w-[420px] h-[380px] sm:h-[440px]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          TRANSICIÓN DIAGONAL CON JINETE EN SILUETA (#f0f0f2 -> #0e0c15)
      ===================================================================== */}
      <div className="relative w-full h-auto bg-[#f0f0f2] leading-none select-none -mt-6">
        <svg
          viewBox="0 0 1440 190"
          className="w-full h-20 sm:h-32 md:h-36 block"
          preserveAspectRatio="none"
        >
          <polygon points="0,155 1440,55 1440,195 0,195" fill="#0e0c15" />
          <path
            d="M0,155 L260,137 L265,133 L272,136 L580,115 L585,111 L592,114 L960,88 L1440,55 L1440,195 L0,195 Z"
            fill="#0e0c15"
          />
        </svg>

        <svg
          viewBox="0 0 220 140"
          className="w-24 sm:w-36 md:w-44 h-auto absolute left-6 sm:left-16 bottom-2 sm:bottom-4 pointer-events-none"
        >
          <g fill="#0e0c15">
            <path d="M55 106 L38 132 L44 134 L64 110 Z" />
            <path d="M68 106 L58 134 L65 135 L76 108 Z" />
            <path d="M126 98 L144 126 L138 129 L118 102 Z" />
            <path d="M135 95 L162 114 L156 119 L129 100 Z" />
            <path d="M52 92 C65 78, 108 76, 134 84 L158 58 L174 66 L166 76 L146 74 L138 98 C110 108, 72 108, 52 92 Z" />
            <path d="M54 90 C34 86, 18 96, 8 108 C24 104, 40 102, 54 96 Z" />
            <path d="M88 82 L94 48 L108 50 L104 82 Z" />
            <circle cx="101" cy="40" r="6" />
            <path d="M92 52 C74 48, 56 54, 44 64 C62 62, 78 60, 92 60 Z" />
            <path d="M84 22 L114 68" stroke="#0e0c15" strokeWidth="2.5" />
            <path d="M106 26 C122 36, 124 52, 114 66" stroke="#0e0c15" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </div>

      {/* =====================================================================
          SECCIÓN INFERIOR OSCURA (#0e0c15)
          3. Póker del Octeto
          4. El Impostor
          5. Globo Terráqueo 3D
      ===================================================================== */}
      <div className="w-full h-auto bg-[#0e0c15] text-zinc-100 relative pt-6 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-20 relative z-10">
          {/* -----------------------------------------------------------------
              3. PÓKER DEL OCTETO
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-5 order-2 md:order-1 flex flex-col items-start text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <DiamondRankBadge numeral="III" theme="dark" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#22e584] font-bold">
                  QUÍMICA MOLECULAR
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.1em] font-bold text-[#22e584] uppercase">
                Póker del Octeto
              </h2>

              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Cartas Periódicas · 2 a 7 Alumnos
              </p>

              <p className="text-xs leading-relaxed text-zinc-300 mt-3 max-w-sm">
                Sintetiza moléculas combinando elementos químicos en mano con la mesa central para completar la regla del octeto.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('poker_quimico');
                  }}
                  className="flex items-center gap-2 bg-[#25242c] hover:bg-[#31303a] text-zinc-100 text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Practicar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('click');
                    setIsCompendiumOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-[#1a1822] hover:bg-[#25242c] text-zinc-300 text-xs tracking-wider uppercase px-3.5 py-2 border border-zinc-800 transition-all cursor-pointer"
                >
                  <span>Compendio & Reglas</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="md:col-span-7 order-1 md:order-2 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="violet_knight"
                className="w-full max-w-[420px] h-[380px] sm:h-[440px]"
              />
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              4. EL IMPOSTOR
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-7 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="emerald_abyss"
                className="w-full max-w-[420px] h-[380px] sm:h-[440px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="md:col-span-5 flex flex-col items-start md:items-end md:text-right"
            >
              <div className="flex items-center gap-2 mb-1">
                <DiamondRankBadge numeral="IV" theme="dark" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#22e584] font-bold">
                  MULTIDISCIPLINAR
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.1em] font-bold text-[#22e584] uppercase">
                El Impostor
              </h2>

              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Pensamiento Crítico · Detección de Errores
              </p>

              <p className="text-xs leading-relaxed text-zinc-300 mt-3 max-w-sm">
                Lee las afirmaciones de clase, identifica la única que tiene una falsedad oculta y vota para expulsarla.
              </p>

              <div className="mt-5 flex flex-wrap md:justify-end items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('el_impostor');
                  }}
                  className="flex items-center gap-2 bg-[#25242c] hover:bg-[#31303a] text-zinc-100 text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Jugar</span>
                </button>

                {onOpenImpostorLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onOpenImpostorLibrary();
                    }}
                    className="flex items-center gap-1.5 bg-[#1a1822] hover:bg-[#25242c] text-zinc-300 text-xs tracking-wider uppercase px-3.5 py-2 border border-zinc-800 transition-all cursor-pointer"
                  >
                    <span>Biblioteca</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              5. GLOBO TERRÁQUEO 3D
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-5 order-2 md:order-1 flex flex-col items-start text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <DiamondRankBadge numeral="V" theme="dark" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#22e584] font-bold">
                  GEOGRAFÍA 3D
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.1em] font-bold text-[#22e584] uppercase">
                Globo Terráqueo 3D
              </h2>

              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Atlas Mundial · Adivina y Localiza
              </p>

              <p className="text-xs leading-relaxed text-zinc-300 mt-3 max-w-sm">
                Explora el globo terráqueo en 3D, vuela a diferentes países o localiza territorios directamente girando la Tierra.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('geografia_3d');
                  }}
                  className="flex items-center gap-2 bg-[#25242c] hover:bg-[#31303a] text-zinc-100 text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Jugar Globo 3D</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="md:col-span-7 order-1 md:order-2 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="golden_atlas"
                className="w-full max-w-[420px] h-[380px] sm:h-[440px]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <PokerCompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
      />
    </div>
  );
};
