import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { PixelGrimoireModal, GrimoireTab } from './PixelGrimoireModal';
import { TeacherGameCatalog } from './TeacherGameCatalog';
import { StudentJoinHub } from './StudentJoinHub';
import { RoleSelectionModal } from './RoleSelectionModal';
import { LatinosLibraryModal } from './LatinosLibraryModal';
import { EscapeRoomLibraryModal } from './EscapeRoomLibraryModal';
import { ImpostorLibraryModal } from './ImpostorLibraryModal';
import { MatchHistoryModal } from './MatchHistoryModal';
import { ProfileModal } from './ProfileModal';
import { AulaPlayLogo } from './AulaPlayLogo';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { EducationalGameType, LatinoGamePack, EscapeRoomPack, ImpostorGamePack } from '../types';

interface BalatroHomeMenuProps {
  userRole: 'teacher' | 'student' | null;
  onSelectRole: (role: 'teacher' | 'student') => void;
  playerName: string;
  playerAvatar: string;
  onUpdatePlayerInfo: (name: string, avatar: string) => void;
  soloBotCount: number;
  onSelectBotCount: (count: number) => void;
  startingChips?: number;
  onSelectStartingChips?: (chips: number) => void;
  onSelectGameType?: (gameType: EducationalGameType, presetRoomName?: string) => void;
  onStartSolo: (botCount: number, gameType?: EducationalGameType, initialLatinosPack?: LatinoGamePack, initialEscapePack?: EscapeRoomPack, initialImpostorPack?: ImpostorGamePack) => void;
  onOpenMultiplayer: (mode?: 'create' | 'join') => void;
  onOpenDeckLab: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onGoLanding?: () => void;
  onCreateRoom?: (playerName: string, avatar: string, botCount: number, maxPlayers: number, roomName?: string) => void;
  onJoinRoom?: (roomCode: string, playerName: string, avatar: string, googleEmail?: string, googleUid?: string) => void;
}

export const BalatroHomeMenu: React.FC<BalatroHomeMenuProps> = ({
  userRole,
  onSelectRole,
  playerName,
  playerAvatar,
  onUpdatePlayerInfo,
  soloBotCount,
  onSelectBotCount,
  startingChips = 1000,
  onSelectStartingChips,
  onSelectGameType,
  onStartSolo,
  onOpenMultiplayer,
  onOpenDeckLab,
  onOpenRules,
  onGoLanding,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [grimoireTab, setGrimoireTab] = useState<GrimoireTab>('play');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(userRole === null);
  const [isLatinosLibraryOpen, setIsLatinosLibraryOpen] = useState(false);
  const [isEscapeLibraryOpen, setIsEscapeLibraryOpen] = useState(false);
  const [isImpostorLibraryOpen, setIsImpostorLibraryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  React.useEffect(() => {
    if (userRole === null) {
      setIsRoleModalOpen(true);
    }
  }, [userRole]);

  React.useEffect(() => {
    if (
      isGrimoireOpen ||
      isProfileModalOpen ||
      isRoleModalOpen ||
      isLatinosLibraryOpen ||
      isEscapeLibraryOpen ||
      isImpostorLibraryOpen ||
      isHistoryOpen
    ) {
      window.scrollTo(0, 0);
    }
  }, [
    isGrimoireOpen,
    isProfileModalOpen,
    isRoleModalOpen,
    isLatinosLibraryOpen,
    isEscapeLibraryOpen,
    isImpostorLibraryOpen,
    isHistoryOpen,
  ]);

  const handleSoundClick = (type: 'hover' | 'click' | 'play' | 'deal' | 'bubble' | 'select') => {
    playBalatroSound(type);
  };

  const openGrimoire = (tab: GrimoireTab) => {
    handleSoundClick('click');
    if (tab === 'profile') {
      setIsProfileModalOpen(true);
      return;
    }
    setGrimoireTab(tab);
    setIsGrimoireOpen(true);
  };

  const handleRoleChange = (newRole: 'teacher' | 'student') => {
    onSelectRole(newRole);
    setIsRoleModalOpen(false);
  };

  const isAnyOverlayOpen =
    isRoleModalOpen ||
    isGrimoireOpen ||
    isLatinosLibraryOpen ||
    isEscapeLibraryOpen ||
    isImpostorLibraryOpen ||
    isHistoryOpen ||
    isProfileModalOpen;

  return (
    <div className="relative w-full h-auto min-h-screen bg-[#0e0c15] text-[#27272a] select-none flex flex-col justify-between font-sans">
      {/* 1. Barra Superior Editorial Coherente con la Bitácora Didáctica */}
      {!isAnyOverlayOpen && (
        <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 flex items-center justify-between gap-4 bg-[#0e0c15]/95 backdrop-blur-xl border-b border-white/10 text-zinc-100 shadow-[0_10px_30px_rgba(9,8,15,0.45)] relative after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-[#9e1b24]/65 after:to-transparent">
          {/* Zona Izquierda: Marca + Subtítulo Editorial con Ornamento Diamante */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onGoLanding) {
                  handleSoundClick('click');
                  onGoLanding();
                }
              }}
              className="group flex items-center gap-3 text-left cursor-pointer focus:outline-none"
              title="Ir a la portada de AulaPlay"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9e1b24] via-[#5B2A62] to-[#4928C2] p-[1px] shadow-[0_0_16px_rgba(158,27,36,0.35)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#12101b] flex items-center justify-center">
                  <div className="w-2 h-2 rotate-45 bg-[#9e1b24] group-hover:bg-[#E3D9FC] transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AulaPlayLogo size="sm" theme="light" />
                <span className="hidden lg:inline-block h-4 w-px bg-white/15" />
                <span className="hidden lg:inline-flex items-center gap-2 font-serif text-[10px] tracking-[0.22em] text-zinc-300/85 uppercase">
                  <span className="text-[#9e1b24]">◇</span>
                  <span>Campamento & Bitácora Didáctica</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zona Central: Acceso a Historial & Notas */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => {
                handleSoundClick('click');
                setIsHistoryOpen(true);
              }}
              className="px-4 py-1.5 rounded-full text-[11px] font-medium tracking-[0.14em] uppercase text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <BarChart3 size={13} className="text-[#22e584]" />
              <span>Historial & Notas</span>
            </button>
          </nav>

          {/* Zona Derecha: Selector de Rol y Perfil en Cápsulas Redondeadas */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleSoundClick('click');
                setIsRoleModalOpen(true);
              }}
              className={cn(
                'group flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-semibold tracking-[0.14em] uppercase transition-all cursor-pointer whitespace-nowrap shadow-sm',
                userRole === 'teacher'
                  ? 'bg-[#9e1b24]/15 border-[#9e1b24]/60 text-zinc-100 hover:bg-[#9e1b24]/25 hover:border-[#9e1b24]'
                  : 'bg-[#22e584]/15 border-[#22e584]/50 text-[#f0f0f2] hover:bg-[#22e584]/25 hover:border-[#22e584]'
              )}
              title="Cambiar entre modo Docente y Estudiante"
            >
              <span
                className={cn(
                  'w-2 h-2 rotate-45 shrink-0 transition-transform group-hover:scale-125',
                  userRole === 'teacher' ? 'bg-[#9e1b24]' : 'bg-[#22e584]'
                )}
              />
              <span>
                {userRole === 'teacher' ? 'Modo Docente' : 'Modo Estudiante'}
              </span>
              <RefreshCw
                size={11}
                className="opacity-75 ml-0.5 shrink-0 group-hover:rotate-180 transition-transform duration-300"
              />
            </button>

            <button
              type="button"
              onClick={() => openGrimoire('profile')}
              className="group flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-white/30 text-xs text-zinc-100 transition-all cursor-pointer whitespace-nowrap shadow-inner"
              title="Editar perfil y medallas"
            >
              <span className="w-6 h-6 rounded-full bg-[#1c1829] border border-white/15 flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform">
                {playerAvatar || (userRole === 'teacher' ? '👨‍🏫' : '🧑‍🎓')}
              </span>
              <span className="truncate max-w-[105px] hidden sm:inline-block font-medium tracking-wide text-[11px] text-zinc-200 group-hover:text-white">
                {playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* 2. Encabezado Principal en Alabastro (#f0f0f2) */}
      {!isAnyOverlayOpen && (
        <div className="relative w-full h-auto bg-[#f0f0f2] pt-8 pb-9 px-4 border-b border-zinc-200/60">
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-45"
            style={{
              background:
                'radial-gradient(ellipse at 65% 0%, rgba(161,161,170,0.45) 0%, rgba(240,240,242,0) 72%)',
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9e1b24] font-bold">
              {userRole === 'teacher' ? 'MODO I · DOCENTE' : 'MODO II · ESTUDIANTE'}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.14em] uppercase text-zinc-900 font-bold mt-1">
              {userRole === 'teacher'
                ? 'Bitácora del Docente'
                : 'Bitácora del Estudiante'}
            </h1>

            {/* Divisor con diamante central (───◇───) */}
            <div className="flex items-center justify-center w-48 sm:w-60 my-2">
              <div className="flex-1 h-px bg-zinc-300" />
              <div className="w-2 h-2 rotate-45 border border-zinc-500 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-300" />
            </div>

            <p className="text-xs text-zinc-600 max-w-md">
              {userRole === 'teacher'
                ? 'Abre salas con código PIN para proyectar en el aula o explora las actividades didácticas.'
                : 'Ingresa con el código PIN de tu profesor o practica cualquiera de los juegos por tu cuenta.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Contenido Principal (Catálogo Docente / Cuaderno Estudiante) */}
      <main className="relative z-20 flex-1 w-full">
        {isRoleModalOpen ? (
          <RoleSelectionModal
            isOpen={isRoleModalOpen}
            currentRole={userRole}
            onSelectRole={handleRoleChange}
            onClose={userRole ? () => setIsRoleModalOpen(false) : undefined}
          />
        ) : isGrimoireOpen ? (
          <PixelGrimoireModal
            isOpen={isGrimoireOpen}
            initialTab={grimoireTab}
            onClose={() => setIsGrimoireOpen(false)}
            soloBotCount={soloBotCount}
            onSelectBotCount={onSelectBotCount}
            startingChips={startingChips}
            onSelectStartingChips={onSelectStartingChips}
            onStartSolo={(count) => {
              setIsGrimoireOpen(false);
              if (onSelectGameType) onSelectGameType('poker_quimico');
              onStartSolo(count, 'poker_quimico');
            }}
            onCreateRoom={(pName, pAvatar, bCount, maxP, rName) => {
              setIsGrimoireOpen(false);
              if (onCreateRoom) {
                onCreateRoom(pName, pAvatar, bCount, maxP, rName);
              } else {
                onOpenMultiplayer('create');
              }
            }}
            onJoinRoom={(rCode, pName, pAvatar) => {
              setIsGrimoireOpen(false);
              if (onJoinRoom) {
                onJoinRoom(rCode, pName, pAvatar);
              } else {
                onOpenMultiplayer('join');
              }
            }}
          />
        ) : isLatinosLibraryOpen ? (
          <LatinosLibraryModal
            isOpen={isLatinosLibraryOpen}
            authorDefaultName={playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
            onClose={() => setIsLatinosLibraryOpen(false)}
            onSelectPack={(pack) => {
              setIsLatinosLibraryOpen(false);
              if (onSelectGameType) onSelectGameType('cien_latinos', `100 Latinos: ${pack.title}`);
              onStartSolo(soloBotCount, 'cien_latinos', pack);
            }}
          />
        ) : isEscapeLibraryOpen ? (
          <EscapeRoomLibraryModal
            isOpen={isEscapeLibraryOpen}
            defaultAuthorName={playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
            onClose={() => setIsEscapeLibraryOpen(false)}
            onSelectPack={(pack) => {
              setIsEscapeLibraryOpen(false);
              if (onSelectGameType) onSelectGameType('escape_room', pack.title);
              onStartSolo(soloBotCount, 'escape_room', undefined, pack);
            }}
          />
        ) : isImpostorLibraryOpen ? (
          <ImpostorLibraryModal
            isOpen={isImpostorLibraryOpen}
            defaultAuthorName={playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
            onClose={() => setIsImpostorLibraryOpen(false)}
            onSelectPack={(pack) => {
              setIsImpostorLibraryOpen(false);
              if (onSelectGameType) onSelectGameType('el_impostor', pack.title);
              onStartSolo(soloBotCount, 'el_impostor', undefined, undefined, pack);
            }}
          />
        ) : isHistoryOpen ? (
          <MatchHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            userRole={userRole}
            currentStudentName={playerName}
          />
        ) : isProfileModalOpen ? (
          <ProfileModal
            onClose={() => setIsProfileModalOpen(false)}
            onSaveProfile={onUpdatePlayerInfo}
          />
        ) : userRole === 'teacher' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <TeacherGameCatalog
              onCreateRoomForGame={(gameType, presetRoomName) => {
                if (onSelectGameType) onSelectGameType(gameType, presetRoomName);
                onOpenMultiplayer('create');
              }}
              onPracticeSoloGame={(gameType) => {
                if (onSelectGameType) onSelectGameType(gameType);
                onStartSolo(soloBotCount, gameType);
              }}
              onOpenLatinosLibrary={() => setIsLatinosLibraryOpen(true)}
              onOpenEscapeLibrary={() => setIsEscapeLibraryOpen(true)}
              onOpenImpostorLibrary={() => setIsImpostorLibraryOpen(true)}
              onOpenDeckLab={onOpenDeckLab}
              onOpenRulesManual={onOpenRules}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <StudentJoinHub
              playerName={playerName}
              playerAvatar={playerAvatar}
              onUpdatePlayerInfo={onUpdatePlayerInfo}
              onJoinRoom={(code, pName, pAvatar, gEmail, gUid) => {
                if (onJoinRoom) {
                  onJoinRoom(code, pName, pAvatar, gEmail, gUid);
                } else {
                  onOpenMultiplayer('join');
                }
              }}
              onStartSoloPractice={(gt) => {
                const target = gt || 'escape_room';
                if (onSelectGameType) onSelectGameType(target);
                onStartSolo(soloBotCount, target);
              }}
              onOpenGrimorio={() => openGrimoire('collection')}
              onOpenLatinosLibrary={() => setIsLatinosLibraryOpen(true)}
              onOpenEscapeLibrary={() => setIsEscapeLibraryOpen(true)}
              onOpenImpostorLibrary={() => setIsImpostorLibraryOpen(true)}
            />
          </motion.div>
        )}
      </main>

      {/* 4. Pie de Página (#0a090f) */}
      <footer className="w-full bg-[#0a090f] text-zinc-400 py-8 px-4 sm:px-8 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.12em] uppercase">
          <div className="flex items-center gap-2.5">
            <span>©</span>
            <AulaPlayLogo size="xs" theme="light" />
            <span>· Campamento de Juegos Didácticos de Enseñanza</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsEscapeLibraryOpen(true)}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              🗝️ Biblioteca 10 Cámaras
            </button>
            <button
              type="button"
              onClick={() => setIsLatinosLibraryOpen(true)}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              🎤 Biblioteca 100 Latinos
            </button>
            <button
              type="button"
              onClick={() => setIsImpostorLibraryOpen(true)}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              🕵️ Biblioteca El Impostor
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
