import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PokerCompendiumModal } from './PokerCompendiumModal';
import { SilhouetteColossusArt, RunicSigilsRow, DiamondRankBadge } from './SilhouetteColossusArt';
import { playBalatroSound } from '../lib/soundEffects';
import { EducationalGameType } from '../types';

export interface EducationalGameCatalogItem {
  id: string;
  engineType: EducationalGameType;
  title: string;
  subtitle: string;
  subject: 'Multidisciplinar' | 'Química';
  level: string;
  players: string;
  icon: string;
  description: string;
  learningObjectives: string[];
  durationMinutes: number;
  createButtonLabel: string;
  demoButtonLabel: string;
  defaultRoomName: string;
  hasInfiniteLibrary?: boolean;
  hasEscapeLibrary?: boolean;
  hasImpostorLibrary?: boolean;
}

export const GAMES_CATALOG: EducationalGameCatalogItem[] = [
  {
    id: 'cien_latinos',
    engineType: 'cien_latinos',
    title: '100 Latinos Dicen: Duelo por Equipos',
    subtitle: 'Biblioteca Infinita en la Web + Creador con IA',
    subject: 'Multidisciplinar',
    level: 'Primaria / Secundaria / Bachillerato',
    players: '2 Equipos en Clase o Dispositivos',
    icon: '🎤',
    description: 'El clásico tablero de encuestas por equipos (Equipo Sol vs Equipo Rayo) con sistema de 3 Strikes y Robo de Puntos. Incluye una Biblioteca Comunitaria Infinita para buscar y jugar packs ya creados sin tener que usar IA cada vez.',
    learningObjectives: [
      'Biblioteca pública infinita con buscador por tema y asignatura',
      'Generador IA que guarda cada nuevo pack para toda la comunidad',
      'Competencia dinámica por equipos con robo de puntos en vivo',
    ],
    durationMinutes: 12,
    createButtonLabel: 'Crear Sala de 100 Latinos Dicen',
    demoButtonLabel: 'Jugar en Tablero / Ver Biblioteca',
    defaultRoomName: '100 Latinos Dicen en Clase',
    hasInfiniteLibrary: true,
  },
  {
    id: 'escape_room',
    engineType: 'escape_room',
    title: 'Escape Room Educativo: Aventura de 10 Cámaras',
    subtitle: 'Biblioteca Infinita de 10 Cámaras + Generador IA',
    subject: 'Multidisciplinar',
    level: 'Primaria / Secundaria / Bachillerato',
    players: 'Hasta 16 Estudiantes en Vivo',
    icon: '🔐',
    description: 'Juego de persecución contrarreloj de 10 cámaras donde tus alumnos resuelven enigmas de cualquier asignatura. Incluye una Biblioteca Comunitaria de 10 preguntas y generador con IA que guarda cada nuevo reto para todos.',
    learningObjectives: [
      'Desafío completo de 10 cámaras pedagógicas por partida',
      'Biblioteca infinita pública de Escape Rooms por materia y autor',
      'Generador con IA que crea y guarda salas de 10 preguntas al instante',
    ],
    durationMinutes: 10,
    createButtonLabel: 'Crear Sala de Escape Room (10 Cámaras)',
    demoButtonLabel: 'Demostración Escape Room (Solitario)',
    defaultRoomName: 'Escape Room de la Clase',
    hasEscapeLibrary: true,
  },
  {
    id: 'poker_quimico',
    engineType: 'poker_quimico',
    title: 'Póker del Octeto: Estrategia Molecular',
    subtitle: 'Juego de Cartas Didáctico · Enlaces y Tabla Periódica',
    subject: 'Química',
    level: 'Secundaria / Bachillerato',
    players: '2 a 7 Estudiantes o Bots IA',
    icon: '🧪',
    description: 'Los estudiantes combinan cartas de elementos químicos con las cartas comunitarias de la mesa para sintetizar compuestos reales (H₂O, CO₂, CH₄, NaCl) cumpliendo la regla del octeto.',
    learningObjectives: [
      'Electrones de valencia, grupos periódicos y regla del octeto',
      'Enlaces iónicos, covalentes simples, dobles y triples',
      'Visualización en vivo de estructuras de Lewis',
    ],
    durationMinutes: 15,
    createButtonLabel: 'Crear Sala de Póker',
    demoButtonLabel: 'Demostración Póker (Solitario)',
    defaultRoomName: 'Laboratorio de Química',
  },
  {
    id: 'el_impostor',
    engineType: 'el_impostor',
    title: 'El Impostor (Estilo "Among Us" / Verdades y una Mentira)',
    subtitle: 'Pensamiento Crítico Individual + Biblioteca y Creador con IA',
    subject: 'Multidisciplinar',
    level: 'Primaria / Secundaria / Bachillerato',
    players: 'Individual o Clase Completa',
    icon: '🕵️',
    description: 'Presenta un conjunto de afirmaciones, fórmulas o conceptos sobre un tema visto en clase. Todas las afirmaciones son correctas excepto una que tiene un error sutil (el "impostor"). Cada estudiante analiza las opciones y vota para expulsar al impostor.',
    learningObjectives: [
      'Pensamiento crítico e investigación individual',
      'Detección de errores sutiles en fórmulas y conceptos',
      'Votación individual directa y biblioteca infinita con IA',
    ],
    durationMinutes: 12,
    createButtonLabel: 'Crear Sala de El Impostor',
    demoButtonLabel: 'Probar Debate de El Impostor',
    defaultRoomName: 'Debate: El Impostor en Clase',
    hasImpostorLibrary: true,
  },
  {
    id: 'geografia_3d',
    engineType: 'geografia_3d',
    title: 'Globo Terráqueo 3D: Geografía Mundial',
    subtitle: 'Adivina el País (Vuelo 3D) y Localiza en el Globo',
    subject: 'Multidisciplinar',
    level: 'Primaria / Secundaria / Bachillerato',
    players: 'Individual o Aula en Vivo',
    icon: '🌍',
    description: 'Globo terráqueo interactivo en 3D con fronteras reales de países y continentes. Incluye modo "Adivina el País" (con vuelo de cámara automático, opción múltiple del mismo continente o escritura libre sin tildes) y modo "Localiza el País" haciendo clic sobre el polígono.',
    learningObjectives: [
      'Ubicación espacial de países y continentes en un globo 3D interactivo',
      'Modo Adivina el País con vuelo 3D (Opción Múltiple o Escritura Libre)',
      'Modo Localiza el País con retroalimentación cromática y racha de aciertos',
    ],
    durationMinutes: 12,
    createButtonLabel: 'Crear Sala de Geografía 3D',
    demoButtonLabel: 'Explorar Globo 3D (Solitario)',
    defaultRoomName: 'Atlas 3D: Geografía en Clase',
  },
];

interface TeacherGameCatalogProps {
  onCreateRoomForGame: (gameType: EducationalGameType, presetRoomName?: string) => void;
  onPracticeSoloGame: (gameType: EducationalGameType) => void;
  onOpenLatinosLibrary?: () => void;
  onOpenEscapeLibrary?: () => void;
  onOpenImpostorLibrary?: () => void;
  onOpenDeckLab?: () => void;
  onOpenRulesManual?: () => void;
}

export const TeacherGameCatalog: React.FC<TeacherGameCatalogProps> = ({
  onCreateRoomForGame,
  onPracticeSoloGame,
  onOpenLatinosLibrary,
  onOpenEscapeLibrary,
  onOpenImpostorLibrary,
  onOpenDeckLab,
  onOpenRulesManual,
}) => {
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);

  if (isCompendiumOpen) {
    return (
      <PokerCompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
        onOpenDeckLab={onOpenDeckLab}
        onOpenRulesManual={onOpenRulesManual}
      />
    );
  }

  return (
    <div className="w-full">
      {/* =====================================================================
          SECCIÓN SUPERIOR CLARA (#f0f0f2)
          1. 100 Latinos Dicen: Duelo por Equipos
          2. Escape Room Educativo: Aventura de 10 Cámaras
      ===================================================================== */}
      <div className="w-full h-auto bg-[#f0f0f2] text-[#27272a] relative pb-16">
        <svg
          className="absolute right-10 top-12 w-80 h-80 text-zinc-300/35 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
          <polygon points="100,15 185,100 100,185 15,100" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <svg
          className="absolute left-4 bottom-32 w-96 h-96 text-zinc-300/35 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" />
          <rect x="36" y="36" width="128" height="128" stroke="currentColor" strokeWidth="1" />
          <polygon points="100,10 190,100 100,190 10,100" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16 relative z-10">
          {/* -----------------------------------------------------------------
              JUEGO 1: 100 LATINOS DICEN
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
                Duelo por Equipos · 2 Equipos en Aula · 12 min
              </p>

              <p className="text-xs leading-relaxed text-zinc-600 mt-3 max-w-sm">
                Tablero de encuestas interactivas con sistema de 3 strikes y robo de puntos. Incluye biblioteca comunitaria infinita y generador con IA.
              </p>

              <div className="mt-5 flex flex-wrap md:justify-end gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onCreateRoomForGame('cien_latinos', '100 Latinos Dicen en Clase');
                  }}
                  className="flex items-center gap-2 bg-[#27272a] hover:bg-[#18181b] text-white text-xs tracking-wider uppercase font-semibold px-4 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span className="w-4 h-4 bg-[#9e1b24] text-white flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Crear Sala</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onPracticeSoloGame('cien_latinos');
                  }}
                  className="flex items-center gap-1.5 bg-[#9e1b24] hover:bg-[#b5222c] text-white text-xs tracking-wider uppercase font-semibold px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>▶ Probar Solo</span>
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
                    <span>Biblioteca / IA</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              JUEGO 2: ESCAPE ROOM EDUCATIVO
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
                Persecución Contrarreloj · Hasta 16 Alumnos · 10 min
              </p>

              <p className="text-xs leading-relaxed text-zinc-600 mt-3 max-w-sm">
                Aventura de 10 enigmas pedagógicos donde los alumnos escapan de la sombra. Incluye biblioteca pública de 10 cámaras y generador con IA.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onCreateRoomForGame('escape_room', 'Escape Room de la Clase');
                  }}
                  className="flex items-center gap-2 bg-[#27272a] hover:bg-[#18181b] text-white text-xs tracking-wider uppercase font-semibold px-4 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span className="w-4 h-4 bg-[#0284c7] text-white flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Crear Sala</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onPracticeSoloGame('escape_room');
                  }}
                  className="flex items-center gap-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs tracking-wider uppercase font-semibold px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>▶ Probar Solo</span>
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
                    <span>Biblioteca / IA</span>
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
              JUEGO 3: PÓKER DEL OCTETO
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
                Cartas Periódicas · 2 a 7 Alumnos · 15 min
              </p>

              <p className="text-xs leading-relaxed text-zinc-300 mt-3 max-w-sm">
                Combina elementos químicos con cartas de la mesa para sintetizar compuestos reales cumpliendo la regla del octeto y estructuras de Lewis.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onCreateRoomForGame('poker_quimico', 'Laboratorio de Química');
                  }}
                  className="flex items-center gap-2 bg-[#25242c] hover:bg-[#31303a] text-zinc-100 text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Crear Sala</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onPracticeSoloGame('poker_quimico');
                  }}
                  className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] text-[#0e0c15] text-xs tracking-wider uppercase font-bold px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>▶ Probar con Bots</span>
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
              JUEGO 4: EL IMPOSTOR
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
                Pensamiento Crítico · Individual o Aula · 12 min
              </p>

              <p className="text-xs leading-relaxed text-zinc-300 mt-3 max-w-sm">
                Afirmaciones donde solo una contiene un error sutil. Cada alumno analiza y vota individualmente para detectar y expulsar al impostor.
              </p>

              <div className="mt-5 flex flex-wrap md:justify-end items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onCreateRoomForGame('el_impostor', 'Debate: El Impostor en Clase');
                  }}
                  className="flex items-center gap-2 bg-[#25242c] hover:bg-[#31303a] text-zinc-100 text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Crear Sala</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onPracticeSoloGame('el_impostor');
                  }}
                  className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] text-[#0e0c15] text-xs tracking-wider uppercase font-bold px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>▶ Probar Solo</span>
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
                    <span>Biblioteca / IA</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              JUEGO 5: GLOBO TERRÁQUEO 3D
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
                Atlas Mundial · Adivina y Localiza · 12 min
              </p>

              <p className="text-xs leading-relaxed text-zinc-300 mt-3 max-w-sm">
                Globo interactivo 3D con fronteras reales. Vuela automáticamente a cada país en modo adivinanza o localiza territorios directamente en el mapa.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onCreateRoomForGame('geografia_3d', 'Atlas 3D: Geografía en Clase');
                  }}
                  className="flex items-center gap-2 bg-[#25242c] hover:bg-[#31303a] text-zinc-100 text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[8px]">
                    ▼
                  </span>
                  <span>Crear Sala</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onPracticeSoloGame('geografia_3d');
                  }}
                  className="flex items-center gap-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-[#071426] text-xs tracking-wider uppercase font-bold px-3.5 py-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>▶ Probar Atlas 3D (Solo)</span>
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

      {/* Modal de Colección de Cartas y Reglas de Jerarquía */}
      <PokerCompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
        onOpenDeckLab={onOpenDeckLab}
        onOpenRulesManual={onOpenRulesManual}
      />
    </div>
  );
};
