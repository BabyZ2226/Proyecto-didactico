import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  BookOpen,
  Atom,
  Users,
  User,
  Sparkles,
  Play,
  Plus,
  LogIn,
  Save,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getFullDeckOrdered } from '../data/deck';
import { ALL_COMBINATIONS } from '../data/combinations';
import { createBotPlayer } from '../data/bots';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';

export type GrimoireTab = 'play' | 'rules' | 'collection' | 'multiplayer' | 'profile';

interface PixelGrimoireModalProps {
  isOpen: boolean;
  initialTab?: GrimoireTab;
  onClose: () => void;
  // Solo Mode Props
  soloBotCount: number;
  onSelectBotCount: (count: number) => void;
  startingChips?: number;
  onSelectStartingChips?: (chips: number) => void;
  onStartSolo: (botCount: number) => void;
  // Multiplayer Props
  onCreateRoom: (playerName: string, avatar: string, botCount: number, maxPlayers: number, roomName?: string) => void;
  onJoinRoom: (roomCode: string, playerName: string, avatar: string) => void;
  // Initial room code if any
  initialJoinCode?: string;
}

const AVATARS = [
  { emoji: '👨‍🔬', label: 'Químico', title: 'Orgánico' },
  { emoji: '👩‍🔬', label: 'Científica', title: 'Cuántica' },
  { emoji: '🧪', label: 'Tubo Reactivo', title: 'Ácido' },
  { emoji: '⚛️', label: 'Átomo Sp3', title: 'Orbital' },
  { emoji: '⚡', label: 'Ion Libre', title: 'Electrón' },
  { emoji: '🧬', label: 'ADN Enlace', title: 'Polímero' },
  { emoji: '💎', label: 'Cristal Iónico', title: 'Red Salina' },
  { emoji: '🔥', label: 'Exotérmico', title: 'Entalpía' },
];

export const PixelGrimoireModal: React.FC<PixelGrimoireModalProps> = ({
  isOpen,
  initialTab = 'play',
  onClose,
  soloBotCount,
  onSelectBotCount,
  startingChips = 1000,
  onSelectStartingChips,
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
  initialJoinCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<GrimoireTab>(initialTab);

  // Sync tab if initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Profile state
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('po_player_name') || 'Marie Curie');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('po_player_avatar') || '👨‍🔬');

  // Multiplayer room state
  const [roomName, setRoomName] = useState('Laboratorio de Octetos');
  const [multiBotCount, setMultiBotCount] = useState(2);
  const [joinCode, setJoinCode] = useState(initialJoinCode);

  // Collection state
  const [collectionSubtab, setCollectionSubtab] = useState<'elements' | 'molecules'>('elements');
  const [collectionPage, setCollectionPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Rules state
  const [rulesSpread, setRulesSpread] = useState(1);

  // All 52 element cards in the ordered deck
  const allDeckCards = useMemo(() => getFullDeckOrdered(), []);

  const collectionItems = useMemo(() => {
    return collectionSubtab === 'elements' ? allDeckCards : ALL_COMBINATIONS;
  }, [collectionSubtab, allDeckCards]);

  const ITEMS_PER_PAGE = 8; // Fits neatly on the left page of the book
  const totalPages = Math.ceil(collectionItems.length / ITEMS_PER_PAGE);
  const paginatedCollection = useMemo(() => {
    const start = (collectionPage - 1) * ITEMS_PER_PAGE;
    return collectionItems.slice(start, start + ITEMS_PER_PAGE);
  }, [collectionItems, collectionPage]);

  // Rules formulas grouped by rank
  const formulasByRank = useMemo(() => {
    const map: Record<number, string[]> = {
      8: [],
      7: [],
      6: [],
      5: [],
      4: [],
      3: [],
      2: [],
      1: [],
    };
    ALL_COMBINATIONS.forEach((comb) => {
      if (map[comb.rank] && !map[comb.rank].includes(comb.formula)) {
        map[comb.rank].push(comb.formula);
      }
    });
    return map;
  }, []);

  if (!isOpen) return null;

  const handleTabClick = (tab: GrimoireTab) => {
    playBalatroSound('deal');
    setActiveTab(tab);
  };

  const handleSaveProfile = () => {
    playBalatroSound('play');
    localStorage.setItem('po_player_name', playerName);
    localStorage.setItem('po_player_avatar', avatar);
  };

  return (
    <div className="relative w-full min-h-screen h-auto z-50 flex items-start justify-center bg-[#0e0c15] py-8 px-2 sm:p-4 md:p-6 select-none">
      
      {/* Ambient Overhead Light Beam (Alchemy Library Atmosphere) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-60">
        <div className="w-1.5 h-6 bg-slate-700/80 shadow-md" />
        <div className="w-14 h-5 bg-gradient-to-b from-slate-600 via-slate-800 to-amber-900/60 rounded-t-full border-t-2 border-slate-400/60 shadow-lg relative flex items-center justify-center">
          <div className="w-6 h-1.5 bg-amber-300 rounded-full shadow-[0_0_12px_#f59e0b] animate-pulse" />
        </div>
        <div className="w-[500px] sm:w-[800px] h-[800px] bg-gradient-to-b from-amber-400/10 via-amber-300/5 to-transparent blur-2xl -mt-1 rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl flex items-center justify-center"
      >
        {/* =========================================================================
            LEFT BOOKMARK TABS (Pixel art tabs protruding from the left edge of the book)
        ========================================================================= */}
        <div className="absolute -left-9 sm:-left-12 top-10 sm:top-14 flex flex-col gap-2 z-40">
          
          {/* Tab 1: Jugar / Play (Coral Red) */}
          <button
            onClick={() => handleTabClick('play')}
            title="Jugar / Modo Solitario"
            className={cn(
              'w-10 sm:w-14 h-9 sm:h-11 rounded-l-md border-2 border-r-0 flex items-center justify-center transition-all cursor-pointer shadow-md',
              activeTab === 'play'
                ? 'bg-[#c94a4a] border-[#8b2323] text-white -translate-x-1 sm:-translate-x-2 shadow-[0_4px_0_0_#5c1414]'
                : 'bg-[#913838] border-[#5e1e1e] text-[#ffd6d6] hover:bg-[#b04242]'
            )}
          >
            <Play size={18} className="fill-current" />
          </button>

          {/* Tab 2: Reglas / Manual (Orange/Amber) */}
          <button
            onClick={() => handleTabClick('rules')}
            title="Reglamento Oficial"
            className={cn(
              'w-10 sm:w-14 h-9 sm:h-11 rounded-l-md border-2 border-r-0 flex items-center justify-center transition-all cursor-pointer shadow-md',
              activeTab === 'rules'
                ? 'bg-[#d97c38] border-[#964a18] text-white -translate-x-1 sm:-translate-x-2 shadow-[0_4px_0_0_#692f0c]'
                : 'bg-[#9e5420] border-[#66320e] text-[#ffe6d4] hover:bg-[#bd6729]'
            )}
          >
            <BookOpen size={18} />
          </button>

          {/* Tab 3: Colección / Compendio (Green/Emerald) */}
          <button
            onClick={() => handleTabClick('collection')}
            title="Colección Atómica"
            className={cn(
              'w-10 sm:w-14 h-9 sm:h-11 rounded-l-md border-2 border-r-0 flex items-center justify-center transition-all cursor-pointer shadow-md',
              activeTab === 'collection'
                ? 'bg-[#5ea84e] border-[#386b2d] text-white -translate-x-1 sm:-translate-x-2 shadow-[0_4px_0_0_#23471c]'
                : 'bg-[#407334] border-[#294c20] text-[#e0ffd6] hover:bg-[#4f8f41]'
            )}
          >
            <Atom size={18} />
          </button>

          {/* Tab 4: Multijugador (Sky Blue) */}
          <button
            onClick={() => handleTabClick('multiplayer')}
            title="Multijugador Online"
            className={cn(
              'w-10 sm:w-14 h-9 sm:h-11 rounded-l-md border-2 border-r-0 flex items-center justify-center transition-all cursor-pointer shadow-md',
              activeTab === 'multiplayer'
                ? 'bg-[#3b82f6] border-[#1d4ed8] text-white -translate-x-1 sm:-translate-x-2 shadow-[0_4px_0_0_#1e3a8a]'
                : 'bg-[#2563eb] border-[#1e40af] text-[#dbeafe] hover:bg-[#3b82f6]'
            )}
          >
            <Users size={18} />
          </button>

          {/* Tab 5: Perfil / Científico (Purple/Violet) */}
          <button
            onClick={() => handleTabClick('profile')}
            title="Perfil de Científico"
            className={cn(
              'w-10 sm:w-14 h-9 sm:h-11 rounded-l-md border-2 border-r-0 flex items-center justify-center transition-all cursor-pointer shadow-md',
              activeTab === 'profile'
                ? 'bg-[#8b5cf6] border-[#6d28d9] text-white -translate-x-1 sm:-translate-x-2 shadow-[0_4px_0_0_#4c1d95]'
                : 'bg-[#6d28d9] border-[#4c1d95] text-[#ede9fe] hover:bg-[#7c3aed]'
            )}
          >
            <User size={18} />
          </button>
        </div>

        {/* =========================================================================
            RIGHT BOOKMARK TAB (Close / Return Bookmark protruding on the right edge)
        ========================================================================= */}
        <div className="absolute -right-9 sm:-right-12 top-14 sm:top-20 z-40">
          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            title="Cerrar Grimorio / Volver"
            className="w-10 sm:w-14 h-10 sm:h-12 bg-[#8b2335] hover:bg-[#a62c41] border-2 border-l-0 border-[#5e1220] rounded-r-md text-white flex items-center justify-center cursor-pointer shadow-md shadow-[0_4px_0_0_#420b15] transition-all hover:translate-x-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================================================
            THE OPEN BOOK FRAME (Outer Burgundy Hardcover + Inner Double Parchment Pages)
        ========================================================================= */}
        <div className="w-full bg-[#832334] border-[5px] border-[#571420] rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_0_rgba(255,255,255,0.2)] relative h-auto">
          
          {/* Outer Leather Stitching Effect */}
          <div className="w-full bg-[#f1ddb6] border-2 border-[#b89559] rounded-lg sm:rounded-xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.35)] relative flex flex-col lg:flex-row min-h-[480px] sm:min-h-[520px] h-auto">
            
            {/* Center Book Spine Crease Shadow (Divides Left & Right Pages) */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-[#70522a]/30 to-transparent pointer-events-none z-30" />
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#96723e]/50 pointer-events-none z-30" />

            {/* =====================================================================
                LEFT PAGE OF THE BOOK
            ===================================================================== */}
            <div className="flex-1 p-4 sm:p-6 bg-[#f4e0ba] text-[#2c1d10] border-b-2 lg:border-b-0 lg:border-r-2 border-[#c8a56b] h-auto relative flex flex-col justify-between">
              
              {/* Decorative Left Page Inner Border */}
              <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

              <motion.div
                key={activeTab === 'rules' ? `rules-left-${rulesSpread}` : `left-${activeTab}`}
                drag={activeTab === 'rules' ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (activeTab === 'rules') {
                    if (info.offset.x < -50 || info.velocity.x < -200) {
                      playBalatroSound('deal');
                      setRulesSpread(2);
                    } else if (info.offset.x > 50 || info.velocity.x > 200) {
                      playBalatroSound('deal');
                      setRulesSpread(1);
                    }
                  }
                }}
                className={cn(activeTab === 'rules' && "cursor-grab active:cursor-grabbing")}
              >
                {/* Dynamic Content based on activeTab */}
                {activeTab === 'play' && (
                  <PlayLeftPage
                    soloBotCount={soloBotCount}
                    onSelectBotCount={onSelectBotCount}
                    startingChips={startingChips}
                    onSelectStartingChips={onSelectStartingChips}
                  />
                )}

                {activeTab === 'rules' && (
                  <RulesLeftPage
                    spread={rulesSpread}
                    onNextSpread={() => {
                      playBalatroSound('deal');
                      setRulesSpread(2);
                    }}
                    onPrevSpread={() => {
                      playBalatroSound('deal');
                      setRulesSpread(1);
                    }}
                  />
                )}

                {activeTab === 'collection' && (
                  <CollectionLeftPage
                    subtab={collectionSubtab}
                    onSelectSubtab={(s) => {
                      setCollectionSubtab(s);
                      setCollectionPage(1);
                    }}
                    items={paginatedCollection}
                    currentPage={collectionPage}
                    totalPages={totalPages}
                    onPrevPage={() => setCollectionPage((p) => Math.max(1, p - 1))}
                    onNextPage={() => setCollectionPage((p) => Math.min(totalPages, p + 1))}
                    selectedItem={selectedCard}
                    onSelectItem={setSelectedCard}
                  />
                )}

                {activeTab === 'multiplayer' && (
                  <MultiplayerLeftPage
                    roomName={roomName}
                    setRoomName={setRoomName}
                    multiBotCount={multiBotCount}
                    setMultiBotCount={setMultiBotCount}
                    playerName={playerName}
                    avatar={avatar}
                    onCreateRoom={onCreateRoom}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileLeftPage
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    avatar={avatar}
                  />
                )}
              </motion.div>

              {/* Left Page Footer Indicator */}
              <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-4">
                <span>PÓKER DEL OCTETO</span>
                <span>PAG. I</span>
              </div>
            </div>

            {/* =====================================================================
                RIGHT PAGE OF THE BOOK
            ===================================================================== */}
            <div className="flex-1 p-4 sm:p-6 bg-[#f2deb7] text-[#2c1d10] h-auto relative flex flex-col justify-between">
              
              {/* Decorative Right Page Inner Border */}
              <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

              <motion.div
                key={activeTab === 'rules' ? `rules-right-${rulesSpread}` : `right-${activeTab}`}
                drag={activeTab === 'rules' ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (activeTab === 'rules') {
                    if (info.offset.x < -50 || info.velocity.x < -200) {
                      playBalatroSound('deal');
                      setRulesSpread(2);
                    } else if (info.offset.x > 50 || info.velocity.x > 200) {
                      playBalatroSound('deal');
                      setRulesSpread(1);
                    }
                  }
                }}
                className={cn(activeTab === 'rules' && "cursor-grab active:cursor-grabbing")}
              >
                {/* Dynamic Right Page Content */}
                {activeTab === 'play' && (
                  <PlayRightPage
                    soloBotCount={soloBotCount}
                    startingChips={startingChips}
                    onStartSolo={() => {
                      onClose();
                      onStartSolo(soloBotCount);
                    }}
                    onSwitchToMultiplayer={() => setActiveTab('multiplayer')}
                  />
                )}

                {activeTab === 'rules' && (
                  <RulesRightPage spread={rulesSpread} formulasByRank={formulasByRank} onClose={onClose} />
                )}

                {activeTab === 'collection' && (
                  <CollectionRightPage
                    selectedItem={selectedCard || paginatedCollection[0]}
                    subtab={collectionSubtab}
                  />
                )}

                {activeTab === 'multiplayer' && (
                  <MultiplayerRightPage
                    joinCode={joinCode}
                    setJoinCode={setJoinCode}
                    playerName={playerName}
                    avatar={avatar}
                    onJoinRoom={onJoinRoom}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileRightPage
                    avatar={avatar}
                    onSelectAvatar={setAvatar}
                    onSave={handleSaveProfile}
                  />
                )}
              </motion.div>

              {/* Right Page Footer Indicator & Close Action */}
              <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-4">
                <span>GRIMORIO ALQUÍMICO</span>
                <span>PAG. II</span>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};

/* =================================================================================
   1. PLAY (JUGAR) BOOK PAGES
================================================================================= */
function PlayLeftPage({
  soloBotCount,
  onSelectBotCount,
  startingChips = 1000,
  onSelectStartingChips,
}: {
  soloBotCount: number;
  onSelectBotCount: (c: number) => void;
  startingChips?: number;
  onSelectStartingChips?: (chips: number) => void;
}) {
  const CHIP_OPTIONS = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Gothic Title */}
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          Modo Solitario
        </h2>
        <p className="text-xs font-mono text-[#745028] mt-0.5">
          Duelo contra la Inteligencia Alquímica
        </p>
      </div>

      {/* Opponents Selection Slots */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#54391b] block">
          Científicos Rivales en Mesa:
        </label>

        <div className="grid grid-cols-6 gap-1">
          {[1, 2, 3, 4, 5, 6].map((count) => {
            const isSelected = soloBotCount === count;
            return (
              <button
                key={count}
                onClick={() => {
                  playBalatroSound('select');
                  onSelectBotCount(count);
                }}
                className={cn(
                  'h-10 rounded-lg border-2 flex flex-col items-center justify-center font-medieval font-bold transition-all cursor-pointer',
                  isSelected
                    ? 'bg-[#407a38] text-white border-[#244f1f] shadow-[0_2px_0_0_#173314] scale-105'
                    : 'bg-[#e5caa0] border-[#ba9663] text-[#4d3215] hover:bg-[#d9b889]'
                )}
              >
                <span className="text-sm">{count}</span>
                <span className="text-[8px] font-mono -mt-1 opacity-90">{count === 1 ? 'Bot' : 'Bots'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Starting Chips / Dinero Inicial Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#54391b]">
            Dinero Inicial por Jugador:
          </label>
          <div className="flex items-center gap-1 bg-[#ddbf91] border border-[#ba9663] px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-[#3b2311]">
            <span>$</span>
            <input
              type="number"
              min={100}
              max={1000000}
              step={100}
              value={startingChips}
              onChange={(e) => {
                const val = Math.max(100, Math.min(1000000, Number(e.target.value) || 100));
                if (onSelectStartingChips) onSelectStartingChips(val);
              }}
              className="w-16 bg-[#f4e0ba] border border-[#ba9663] text-[#3b2311] font-bold font-mono text-center px-1 py-0.2 rounded outline-none focus:border-[#b45309]"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {CHIP_OPTIONS.map((amt) => {
            const isSelected = startingChips === amt;
            return (
              <button
                key={amt}
                onClick={() => {
                  playBalatroSound('select');
                  if (onSelectStartingChips) onSelectStartingChips(amt);
                }}
                className={cn(
                  'h-8 rounded-lg border-2 flex items-center justify-center font-mono font-bold transition-all cursor-pointer text-xs',
                  isSelected
                    ? 'bg-[#b45309] text-white border-[#78350f] shadow-[0_2px_0_0_#451a03] scale-105'
                    : 'bg-[#e5caa0] border-[#ba9663] text-[#4d3215] hover:bg-[#d9b889]'
                )}
              >
                <span>${amt >= 1000 ? `${amt / 1000}k` : amt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bot Roster Display (Slots with parchment insets) */}
      <div className="space-y-1 pt-0.5">
        <span className="text-[10px] font-mono font-bold text-[#67441e] uppercase block">
          Alineación ({soloBotCount + 1} Jugadores • ${startingChips.toLocaleString()} c/u):
        </span>
        <div className="grid grid-cols-4 gap-1">
          <div className="p-1 rounded-lg bg-[#ddbf91] border border-[#ba9663] flex items-center gap-1 text-[11px] font-mono font-bold text-[#322010]">
            <span>👨‍🔬</span>
            <span className="truncate">Tú</span>
          </div>
          {Array.from({ length: soloBotCount }).map((_, i) => {
            const bot = createBotPlayer(i);
            return (
              <div
                key={bot.id}
                className="p-1 rounded-lg bg-[#ddbf91] border border-[#ba9663] flex items-center gap-1 text-[11px] font-mono text-[#322010]"
              >
                <span>{bot.avatar}</span>
                <span className="truncate text-[10px]">{bot.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlayRightPage({
  soloBotCount,
  startingChips = 1000,
  onStartSolo,
  onSwitchToMultiplayer,
}: {
  soloBotCount: number;
  startingChips?: number;
  onStartSolo: () => void;
  onSwitchToMultiplayer: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Gothic Title */}
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          Parámetros de Mesa
        </h2>
        <p className="text-xs font-mono text-[#745028] mt-0.5">
          Estadísticas & Reglas de la Partida
        </p>
      </div>

      {/* Pixel Sliders / Stat Bars like reference image */}
      <div className="space-y-2.5 pt-1 font-mono text-xs">
        <PixelStatBar label="DINERO INICIAL" value={`$${startingChips.toLocaleString()}`} progress={Math.min(100, Math.max(20, (startingChips / 10000) * 100))} />
        <PixelStatBar label="CIEGA PEQUEÑA" value={`$${Math.round(startingChips * 0.01)}`} progress={20} />
        <PixelStatBar label="CIEGA GRANDE" value={`$${Math.round(startingChips * 0.02)}`} progress={40} />
        <PixelStatBar label="BARAJA ATÓMICA" value="52 Cartas" progress={100} />
        <PixelStatBar label="DIFICULTAD IA" value="Adaptativa" progress={85} />
      </div>

      {/* Medieval Filigree Divider */}
      <div className="flex items-center justify-center gap-2 py-1 opacity-70">
        <span className="text-[#a57f49] text-xs">❧ ──────</span>
        <span className="text-sm">🧪</span>
        <span className="text-[#a57f49] text-xs">────── ☙</span>
      </div>

      {/* Big Action Buttons with 3D press effect */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => {
            playBalatroSound('play');
            onStartSolo();
          }}
          className="w-full py-3 bg-[#3d7a36] hover:bg-[#488e40] text-white font-medieval text-lg font-bold rounded-lg border-2 border-[#1f471a] shadow-[0_4px_0_0_#143011] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play size={18} className="fill-white" />
          <span>INICIAR PARTIDA ({soloBotCount} BOTS)</span>
        </button>

        <button
          onClick={() => {
            playBalatroSound('click');
            onSwitchToMultiplayer();
          }}
          className="w-full py-2 bg-[#d6b785] hover:bg-[#cbab77] text-[#3d2712] font-mono text-xs font-bold rounded-lg border-2 border-[#a6824a] shadow-[0_3px_0_0_#7d5c2c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Users size={14} />
          <span>O cambiar a Multijugador Online</span>
        </button>
      </div>
    </div>
  );
}

/* =================================================================================
   2. RULES (REGLAS) BOOK PAGES
================================================================================= */
function RulesLeftPage({
  spread,
  onNextSpread,
  onPrevSpread,
}: {
  spread: number;
  onNextSpread: () => void;
  onPrevSpread: () => void;
}) {
  const tiers = [
    { rank: 8, name: 'Flor Imperial', sub: 'Octeto Orgánico (5 cartas)', mult: 'x100', desc: 'Cadena aromática u orgánica perfecta (ej. C5H12, C6H6).' },
    { rank: 7, name: 'Escalera de Color', sub: 'Cadena Conjugada (5 cartas)', mult: 'x50', desc: '5 elementos consecutivos del mismo grupo con enlaces alternos.' },
    { rank: 6, name: 'Póker', sub: 'Tetratómica (4 cartas)', mult: 'x25', desc: '4 átomos idénticos o isotópicos en resonancia (ej. CH4, CCl4).' },
    { rank: 5, name: 'Full House', sub: 'Enlace Triple + Doble (3+2)', mult: 'x15', desc: 'Molécula Triatómica + Pareja Química (ej. N2O + H2O).' },
    { rank: 4, name: 'Trío Molecular', sub: 'Triatómica (3 cartas)', mult: 'x10', desc: '3 átomos en molécula coordinada (ej. H2O, CO2, O3, NO2).' },
    { rank: 3, name: 'Doble Pareja', sub: 'Enlace Doble (2+2 cartas)', mult: 'x5', desc: 'Dos moléculas diatómicas independientes (ej. O2 + HCl).' },
    { rank: 2, name: 'Pareja Química', sub: 'Enlace Simple (2 cartas)', mult: 'x2', desc: '2 átomos enlazados por enlace covalente o iónico (ej. H2, NaCl).' },
    { rank: 1, name: 'Gas Inerte', sub: 'Octeto Cerrado (+100 ptos)', mult: 'x1', desc: 'Átomo noble (He, Ne, Ar) o elemento individual de valencia cerrada.' },
  ];

  if (spread === 1) {
    return (
      <div className="space-y-3.5 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
              Reglas del Octeto
            </h2>
            <p className="text-[11px] font-mono text-[#745028]">
              Manual Alquímico Oficial • Edición Completa
            </p>
          </div>
          <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
            Capítulo I
          </span>
        </div>

        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1">
            <strong className="font-medieval text-sm text-[#3b2311] flex items-center gap-1.5">
              <Atom size={15} className="text-[#3b7e2e]" />
              §1. La Regla de Oro Molecular
            </strong>
            <p className="text-[#4a3116] leading-relaxed text-[11px]">
              Cada científico recibe <strong>2 cartas en mano</strong> ("electrones de enlace") y <strong>5 cartas comunitarias</strong> ("sustrato reactivo") en la mesa. Tu objetivo es sintetizar la molécula más estable donde todos los átomos completen <strong>8 electrones de valencia</strong> (el Hidrógeno cumple con 2 e⁻).
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1">
            <strong className="font-medieval text-sm text-[#3b2311] flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#d97c38]" />
              §2. La Baraja Atómica (52 Cartas)
            </strong>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[#4a3116]">
              <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                <strong>Hidrógeno (H):</strong> 1 e⁻ valencia (Dueto 2e⁻).
              </div>
              <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                <strong>Carbono (C):</strong> 4 e⁻. Columna orgánica.
              </div>
              <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                <strong>Nitrógeno (N):</strong> 5 e⁻. Enlaces triples.
              </div>
              <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                <strong>Oxígeno (O):</strong> 6 e⁻. Oxidante divalente.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              playBalatroSound('deal');
              onNextSpread();
            }}
            className="px-3 py-1.5 bg-[#d97c38] hover:bg-[#eb8c47] text-white font-medieval text-xs font-bold rounded-md border border-[#964a18] shadow-[0_2px_0_0_#692f0c] active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Jerarquías</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
            Las 8 Jerarquías
          </h2>
          <p className="text-[11px] font-mono text-[#745028]">
            Tabla de Combinaciones Moleculares
          </p>
        </div>
        <button
          onClick={() => {
            playBalatroSound('deal');
            onPrevSpread();
          }}
          className="px-2.5 py-1 bg-[#d6b785] hover:bg-[#cbab77] text-[#3d2712] font-medieval text-xs font-bold rounded border border-[#a6824a] flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Atrás</span>
        </button>
      </div>

      <div className="space-y-1.5 h-auto pr-1">
        {tiers.map((t) => (
          <div key={t.rank} className="p-2 rounded-md bg-[#e4c99e] border border-[#ba9663] flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-medieval font-bold text-[#3d2712]">
                {t.rank}º {t.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.2 bg-[#3d7a36] text-white rounded text-[9px] font-mono font-bold">
                  {t.mult}
                </span>
                <span className="text-[10px] font-mono text-[#7d5a2d]">{t.sub}</span>
              </div>
            </div>
            <p className="text-[10px] font-mono text-[#4d3215]">
              {t.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesRightPage({
  spread,
  formulasByRank,
  onClose,
}: {
  spread: number;
  formulasByRank: Record<number, string[]>;
  onClose: () => void;
}) {
  if (spread === 1) {
    return (
      <div className="space-y-3.5 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
              Fases y Apuestas
            </h2>
            <p className="text-[11px] font-mono text-[#745028]">
              Secuencia de Reacción en Mesa
            </p>
          </div>
          <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
            Capítulo II
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1">
          <strong className="font-medieval text-sm text-[#3b2311] block mb-0.5">§3. Secuencia de la Ronda</strong>
          <ul className="space-y-1 text-[11px] text-[#4a3116]">
            <li><strong>1. Pre-Flop:</strong> Ciegas ($10/$20) e iniciación con 2 cartas en mano.</li>
            <li><strong>2. Flop:</strong> 3 cartas comunitarias al centro de la mesa.</li>
            <li><strong>3. Turn:</strong> 4ª carta comunitaria (El Catalizador).</li>
            <li><strong>4. River:</strong> 5ª carta final de mesa (Saturación).</li>
            <li><strong>5. Showdown:</strong> Evaluación química y entrega del bote.</li>
          </ul>
        </div>

        <div className="p-2.5 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1">
          <strong className="font-medieval text-sm text-[#3b2311] block mb-0.5">§4. Decisiones de Apuesta</strong>
          <p className="text-[11px] text-[#4a3116] leading-relaxed">
            • <strong>Pasar (Check):</strong> Continuar sin apostar si no hay apuesta previa.<br />
            • <strong>Igualar (Call):</strong> Pagar la apuesta más alta de la mesa.<br />
            • <strong>Subir (Raise):</strong> Aumentar la presión exigiendo más fichas a los rivales.<br />
            • <strong>Retirarse (Fold):</strong> Abandonar la mano y descartar las cartas.<br />
            • <strong>All-In:</strong> Apostar todas tus fichas en una reacción descontrolada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
            Desempates y Criterios
          </h2>
          <p className="text-[11px] font-mono text-[#745028]">
            Termodinámica de Empate Químico
          </p>
        </div>
        <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
          Capítulo IV
        </span>
      </div>

      <div className="p-2.5 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1 text-xs">
        <strong className="font-medieval text-sm text-[#3b2311] block">
          §5. Orden de Resolución en Empate
        </strong>
        <ol className="space-y-1 text-[11px] text-[#4a3116] list-decimal list-inside">
          <li><strong>Multiplicidad de Enlace:</strong> Triple (≡) &gt; Doble (=) &gt; Simple (-).</li>
          <li><strong>Naturaleza Química:</strong> Ácido Fuerte &gt; Base Fuerte &gt; Sal Iónica &gt; Neutro.</li>
          <li><strong>Suma de Números Atómicos (Σ Z):</strong> Mayor masa atómica combinada.</li>
          <li><strong>Kicker Libre:</strong> Átomo individual de mayor Z fuera del enlace.</li>
        </ol>
      </div>

      <div className="p-2.5 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1 text-xs">
        <strong className="font-medieval text-sm text-[#3b2311] block">
          §6. Consejos de Estrategia Alquímica
        </strong>
        <p className="text-[11px] text-[#4a3116] leading-relaxed">
          • Guarda Carbono (C) o Nitrógeno (N) en mano: desbloquean moléculas triatómicas y octetos orgánicos de alto multiplicador.<br />
          • El Oxígeno (O) en mesa permite cerrar reacciones estables (H2O, CO2, NO2).
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          playBalatroSound('click');
          onClose();
        }}
        className="w-full py-2 bg-[#d97c38] hover:bg-[#eb8c47] text-white font-medieval text-sm font-bold rounded-lg border-2 border-[#964a18] shadow-[0_3px_0_0_#692f0c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
      >
        <BookOpen size={15} />
        <span>¡ENTENDIDO! ENTRAMOS AL LABORATORIO</span>
      </button>
    </div>
  );
}

/* =================================================================================
   3. COLLECTION (COLECCIÓN) BOOK PAGES
================================================================================= */
function CollectionLeftPage({
  subtab,
  onSelectSubtab,
  items,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  selectedItem,
  onSelectItem,
}: {
  subtab: 'elements' | 'molecules';
  onSelectSubtab: (s: 'elements' | 'molecules') => void;
  items: any[];
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  selectedItem: any;
  onSelectItem: (item: any) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Gothic Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
            Compendio
          </h2>
          <p className="text-[11px] font-mono text-[#745028]">
            {subtab === 'elements' ? '52 Cartas Atómicas' : 'Moléculas Descubiertas'}
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex gap-1 bg-[#dfc397] p-1 rounded-md border border-[#b89559]">
          <button
            onClick={() => onSelectSubtab('elements')}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer',
              subtab === 'elements' ? 'bg-[#407a38] text-white shadow-sm' : 'text-[#5a3e1f] hover:text-[#322010]'
            )}
          >
            Átomos
          </button>
          <button
            onClick={() => onSelectSubtab('molecules')}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer',
              subtab === 'molecules' ? 'bg-[#d97c38] text-white shadow-sm' : 'text-[#5a3e1f] hover:text-[#322010]'
            )}
          >
            Moléculas
          </button>
        </div>
      </div>

      {/* Grid of Cards (8 slots like equipment inventory) */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {items.map((item, idx) => {
          const isSelected = selectedItem === item;
          const label = subtab === 'elements' ? item.symbol : item.formula;
          const sub = subtab === 'elements' ? item.name : item.name;

          return (
            <button
              key={idx}
              onClick={() => {
                playBalatroSound('deal');
                onSelectItem(item);
              }}
              className={cn(
                'h-16 rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all cursor-pointer relative',
                isSelected
                  ? 'bg-[#3b6e34] border-[#1d4219] text-white shadow-[0_3px_0_0_#143011] scale-105 z-10'
                  : 'bg-[#e2c79b] border-[#ba9663] hover:bg-[#d8bb8d] text-[#3b2311]'
              )}
            >
              <span className="font-medieval font-bold text-base">{label}</span>
              <span className="text-[9px] font-mono truncate max-w-full opacity-80">{sub}</span>
            </button>
          );
        })}
      </div>

      {/* Pagination in Parchment Style */}
      <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#5a3e1f]">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="px-2.5 py-1 rounded bg-[#dfc397] border border-[#ba9663] hover:bg-[#d4b585] disabled:opacity-40 cursor-pointer"
        >
          ◄ Ant.
        </button>
        <span className="font-bold">
          Pág. {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded bg-[#dfc397] border border-[#ba9663] hover:bg-[#d4b585] disabled:opacity-40 cursor-pointer"
        >
          Sig. ►
        </button>
      </div>
    </div>
  );
}

function CollectionRightPage({ selectedItem, subtab }: { selectedItem: any; subtab: string }) {
  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#7d5f34]">
        <Atom size={40} className="mb-2 opacity-60" />
        <p className="font-medieval text-lg">Selecciona un elemento</p>
      </div>
    );
  }

  const isElement = subtab === 'elements';

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          {isElement ? selectedItem.name : selectedItem.formula}
        </h2>
        <p className="text-xs font-mono text-[#745028]">
          {isElement ? `Número Atómico: ${selectedItem.atomicNumber}` : selectedItem.name}
        </p>
      </div>

      {/* Medieval Filigree Divider */}
      <div className="flex items-center justify-center gap-2 py-0.5 opacity-70">
        <span className="text-[#a57f49] text-xs">❧ ──────</span>
        <span className="text-sm">{isElement ? '⚛️' : '🧪'}</span>
        <span className="text-[#a57f49] text-xs">────── ☙</span>
      </div>

      {/* Details Box */}
      <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] text-xs font-mono space-y-1.5 text-[#3b2311]">
        {isElement ? (
          <>
            <PixelStatBar label="VALENCIA" value={`${selectedItem.valency} e⁻`} progress={selectedItem.valency * 12.5} />
            <PixelStatBar label="MASA ATÓMICA" value={`${selectedItem.atomicMass} u`} progress={selectedItem.atomicMass * 0.4} />
            <PixelStatBar label="ELECTRONEGAT." value={`${selectedItem.electronegativity || 2.2}`} progress={(selectedItem.electronegativity || 2.2) * 22} />
          </>
        ) : (
          <>
            <PixelStatBar label="JERARQUÍA" value={`Rango ${selectedItem.rank}`} progress={selectedItem.rank * 12.5} />
            <PixelStatBar label="ESTABILIDAD" value="Completa" progress={100} />
            <div className="pt-1 text-[11px] leading-snug text-[#4f361c]">
              <strong>Fórmula:</strong> {selectedItem.formula} • {selectedItem.description || 'Octeto completo.'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =================================================================================
   4. MULTIPLAYER (MULTIJUGADOR) BOOK PAGES
================================================================================= */
function MultiplayerLeftPage({
  roomName,
  setRoomName,
  multiBotCount,
  setMultiBotCount,
  playerName,
  avatar,
  onCreateRoom,
}: {
  roomName: string;
  setRoomName: (s: string) => void;
  multiBotCount: number;
  setMultiBotCount: (n: number) => void;
  playerName: string;
  avatar: string;
  onCreateRoom: (playerName: string, avatar: string, botCount: number, maxPlayers: number, roomName?: string) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          Crear Sala Online
        </h2>
        <p className="text-xs font-mono text-[#745028]">
          Configura una mesa y comparte el código
        </p>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="text-xs font-mono font-bold uppercase text-[#54391b] block mb-1">
            Nombre de la Mesa:
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-[#f6ebd4] border-2 border-[#b89559] rounded-lg px-3 py-1.5 font-mono text-sm text-[#3b2311] focus:outline-none focus:border-[#38761d]"
          />
        </div>

        <div>
          <label className="text-xs font-mono font-bold uppercase text-[#54391b] block mb-1">
            Rellenar con Bots IA: ({multiBotCount})
          </label>
          <div className="grid grid-cols-7 gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMultiBotCount(num)}
                className={cn(
                  'py-1 rounded font-medieval font-bold text-xs border cursor-pointer',
                  multiBotCount === num
                    ? 'bg-[#3d7a36] text-white border-[#1f471a]'
                    : 'bg-[#e2c79b] text-[#4d3215] border-[#ba9663]'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playBalatroSound('play');
            onCreateRoom(playerName, avatar, multiBotCount, 7, roomName);
          }}
          className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medieval text-base font-bold rounded-lg border-2 border-[#5b21b6] shadow-[0_3px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
        >
          <Plus size={16} />
          <span>CREAR Y ENTRAR A SALA</span>
        </button>
      </div>
    </div>
  );
}

function MultiplayerRightPage({
  joinCode,
  setJoinCode,
  playerName,
  avatar,
  onJoinRoom,
}: {
  joinCode: string;
  setJoinCode: (s: string) => void;
  playerName: string;
  avatar: string;
  onJoinRoom: (roomCode: string, playerName: string, avatar: string) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          Unirse por Código
        </h2>
        <p className="text-xs font-mono text-[#745028]">
          Ingresa a una mesa con el código de 6 caracteres
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="text-center p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663]">
          <label className="text-xs font-mono font-bold uppercase text-[#54391b] block mb-1">
            Código de Mesa (OCT-XXXX):
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="OCT-XXXX"
            maxLength={10}
            className="w-full max-w-[200px] text-center font-medieval text-xl tracking-widest bg-[#f6ebd4] border-2 border-[#b89559] rounded-lg px-3 py-2 text-[#3b2311] focus:outline-none focus:border-[#2563eb]"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!joinCode.trim()) return;
            playBalatroSound('play');
            onJoinRoom(joinCode.trim(), playerName, avatar);
          }}
          className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medieval text-base font-bold rounded-lg border-2 border-[#1e40af] shadow-[0_3px_0_0_#172554] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogIn size={16} />
          <span>CONECTAR A SALA</span>
        </button>
      </div>
    </div>
  );
}

/* =================================================================================
   5. PROFILE (PERFIL) BOOK PAGES
================================================================================= */
function ProfileLeftPage({
  playerName,
  setPlayerName,
  avatar,
}: {
  playerName: string;
  setPlayerName: (s: string) => void;
  avatar: string;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          Perfil de Científico
        </h2>
        <p className="text-xs font-mono text-[#745028]">
          Tu identidad en la mesa de póker
        </p>
      </div>

      <div className="flex flex-col items-center p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-2">
        <span className="text-5xl filter drop-shadow">{avatar}</span>
        <span className="font-medieval text-lg font-bold text-[#3b2311]">{playerName}</span>
      </div>

      <div>
        <label className="text-xs font-mono font-bold uppercase text-[#54391b] block mb-1">
          Nombre de Químico:
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={18}
          className="w-full bg-[#f6ebd4] border-2 border-[#b89559] rounded-lg px-3 py-1.5 font-mono text-sm text-[#3b2311] focus:outline-none focus:border-[#38761d]"
        />
      </div>
    </div>
  );
}

function ProfileRightPage({
  avatar,
  onSelectAvatar,
  onSave,
}: {
  avatar: string;
  onSelectAvatar: (a: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
          Avatares Alquímicos
        </h2>
        <p className="text-xs font-mono text-[#745028]">
          Selecciona tu personaje favorito
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {AVATARS.map((item) => {
          const isSelected = avatar === item.emoji;
          return (
            <button
              key={item.emoji}
              onClick={() => {
                playBalatroSound('select');
                onSelectAvatar(item.emoji);
              }}
              className={cn(
                'h-14 rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all cursor-pointer',
                isSelected
                  ? 'bg-[#3b6e34] border-[#1d4219] text-white shadow-[0_3px_0_0_#143011] scale-105'
                  : 'bg-[#e2c79b] border-[#ba9663] text-[#3b2311] hover:bg-[#d8bb8d]'
              )}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[9px] font-mono mt-0.5 truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onSave}
        className="w-full py-2.5 bg-[#3d7a36] hover:bg-[#488e40] text-white font-medieval text-base font-bold rounded-lg border-2 border-[#1f471a] shadow-[0_3px_0_0_#143011] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
      >
        <Save size={16} />
        <span>GUARDAR EN GRIMORIO</span>
      </button>
    </div>
  );
}

/* =================================================================================
   PIXEL PROGRESS STAT BAR (Matching reference image slider layout)
================================================================================= */
function PixelStatBar({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[#4d3215]">
      <span className="font-mono font-bold text-[11px] w-28 uppercase truncate">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        {/* Pixel Bar Container with End Brackets like in screenshot */}
        <div className="flex-1 h-3.5 bg-[#dfc397] border border-[#a6824a] rounded-xs relative overflow-hidden flex items-center">
          <div
            className="h-full bg-[#8c5934] transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold w-16 text-right">{value}</span>
      </div>
    </div>
  );
}
