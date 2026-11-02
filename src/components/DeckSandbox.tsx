import React, { useState, useMemo } from 'react';
import { ElementCard } from '../types';
import { BASE_ELEMENTS, DECK_COMPOSITION, ELEMENT_DETAILS, getFullDeckOrdered, generateDeck } from '../data/deck';
import { ALL_COMBINATIONS, HIERARCHY_TIERS } from '../data/combinations';
import { evaluateCards } from '../lib/evaluator';
import { Card } from './Card';
import { ReactionVisualizer } from './ReactionVisualizer';
import { CombinationsCatalog } from './CombinationsCatalog';
import { MusicControl } from './MusicControl';
import {
  Beaker,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Shuffle,
  Search,
  CheckCircle2,
  Plus,
  Trash2,
  Layers,
  Zap,
  Atom,
  Gamepad2,
  Award,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Home,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DeckSandboxProps {
  onBackToGame?: () => void;
  onBackToHome?: () => void;
  initialCards?: ElementCard[];
}

export const RANK_THEMES: Record<number, { bg: string; border: string; text: string; badge: string; dot: string; title: string; subtitle: string; score: string }> = {
  8: { 
    bg: 'bg-amber-950/30 hover:bg-amber-950/50', 
    border: 'border-amber-500/40 hover:border-amber-400', 
    text: 'text-amber-300', 
    badge: 'bg-amber-500 text-slate-950 font-black', 
    dot: 'bg-amber-400',
    title: 'R8: Flor Imperial',
    subtitle: 'Octeto Orgánico sp³ Saturado',
    score: '1000+ pts'
  },
  7: { 
    bg: 'bg-purple-950/30 hover:bg-purple-950/50', 
    border: 'border-purple-500/40 hover:border-purple-400', 
    text: 'text-purple-300', 
    badge: 'bg-purple-500 text-white font-black', 
    dot: 'bg-purple-400',
    title: 'R7: Escalera Color',
    subtitle: 'Cadenas Conjugadas Continuas',
    score: '800 pts'
  },
  6: { 
    bg: 'bg-cyan-950/30 hover:bg-cyan-950/50', 
    border: 'border-cyan-500/40 hover:border-cyan-400', 
    text: 'text-cyan-300', 
    badge: 'bg-cyan-500 text-slate-950 font-black', 
    dot: 'bg-cyan-400',
    title: 'R6: Póker Tetratómico',
    subtitle: '4 Átomos Saturados',
    score: '600 pts'
  },
  5: { 
    bg: 'bg-emerald-950/30 hover:bg-emerald-950/50', 
    border: 'border-emerald-500/40 hover:border-emerald-400', 
    text: 'text-emerald-300', 
    badge: 'bg-emerald-500 text-slate-950 font-black', 
    dot: 'bg-emerald-400',
    title: 'R5: Full House',
    subtitle: '3 Ligandos + Sal o Gas',
    score: '450 pts'
  },
  4: { 
    bg: 'bg-blue-950/30 hover:bg-blue-950/50', 
    border: 'border-blue-500/40 hover:border-blue-400', 
    text: 'text-blue-300', 
    badge: 'bg-blue-500 text-white font-black', 
    dot: 'bg-blue-400',
    title: 'R4: Trío Molecular',
    subtitle: 'Triatómicas Estables (H₂O, CO₂)',
    score: '300 pts'
  },
  3: { 
    bg: 'bg-orange-950/30 hover:bg-orange-950/50', 
    border: 'border-orange-500/40 hover:border-orange-400', 
    text: 'text-orange-300', 
    badge: 'bg-orange-500 text-slate-950 font-black', 
    dot: 'bg-orange-400',
    title: 'R3: Doble Pareja',
    subtitle: '2 Diatómicas o Sales Simples',
    score: '200 pts'
  },
  2: { 
    bg: 'bg-rose-950/30 hover:bg-rose-950/50', 
    border: 'border-rose-500/40 hover:border-rose-400', 
    text: 'text-rose-300', 
    badge: 'bg-rose-500 text-white font-black', 
    dot: 'bg-rose-400',
    title: 'R2: Pareja Diatómica',
    subtitle: 'Gases Homonucleares (O₂, N₂, Cl₂)',
    score: '100 pts'
  },
  1: { 
    bg: 'bg-fuchsia-950/30 hover:bg-fuchsia-950/50', 
    border: 'border-fuchsia-500/40 hover:border-fuchsia-400', 
    text: 'text-fuchsia-300', 
    badge: 'bg-fuchsia-500 text-white font-black', 
    dot: 'bg-fuchsia-400',
    title: 'R1: Gas Noble',
    subtitle: 'Elemento con Capa Llena',
    score: '50 pts'
  },
};

const CATEGORIES_LIST = ['Todas', 'Orgánico', 'Inorgánico Covalente', 'Sal Iónica', 'Gas Noble', 'Hidruro'] as const;

const GROUP_FILTERS = [
  { id: 'all', label: 'Todos (52)', color: 'text-zinc-200 border-zinc-700 bg-zinc-800' },
  { id: '1', label: 'G1: Alcalinos (H, Na, K)', color: 'text-sky-300 border-sky-500/30 bg-sky-950/40' },
  { id: '2', label: 'G2: Alcalinotérreos (Mg, Ca)', color: 'text-orange-300 border-orange-500/30 bg-orange-950/40' },
  { id: '3', label: 'G3: Térreos (B, Al)', color: 'text-amber-300 border-amber-500/30 bg-amber-950/40' },
  { id: '4', label: 'G4: Carbonoides (C, Si)', color: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/40' },
  { id: '5', label: 'G5: Nitrogenoides (N, P)', color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40' },
  { id: '6', label: 'G6: Calcógenos (O, S)', color: 'text-rose-300 border-rose-500/30 bg-rose-950/40' },
  { id: '7', label: 'G7: Halógenos (F, Cl, Br)', color: 'text-teal-300 border-teal-500/30 bg-teal-950/40' },
  { id: '8', label: 'G8: Gases Nobles (He, Ne)', color: 'text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-950/40' },
];

export function DeckSandbox({ onBackToGame, onBackToHome, initialCards }: DeckSandboxProps) {
  // Sandbox active tab: 'workbench' (Mesa de reacción) | 'combinations' (Jerarquía y catálogo) | 'deck' (Baraja 52)
  const [sandboxTab, setSandboxTab] = useState<'workbench' | 'combinations' | 'deck'>('workbench');
  const [activeLoadedFormula, setActiveLoadedFormula] = useState<string>('H₂O');
  const [loadedFeedback, setLoadedFeedback] = useState<string | null>(null);

  // Hierarchy Explorer States
  const [hierarchyRank, setHierarchyRank] = useState<number | 'all'>('all');
  const [hierarchySearch, setHierarchySearch] = useState<string>('');
  const [hierarchyCategory, setHierarchyCategory] = useState<string>('Todas');
  const [hierarchyViewMode, setHierarchyViewMode] = useState<'cards' | 'compact'>('cards');
  const [isHierarchyExpanded, setIsHierarchyExpanded] = useState<boolean>(true);

  // Test workbench slots: max 5 cards (matching poker's 5-card combinations)
  const [testCards, setTestCards] = useState<ElementCard[]>(() => {
    if (initialCards && initialCards.length > 0) {
      return initialCards.slice(0, 5);
    }
    // Default initial sample: Water (H2O)
    const h1 = { id: 'test-H-1', ...BASE_ELEMENTS.H };
    const h2 = { id: 'test-H-2', ...BASE_ELEMENTS.H };
    const o1 = { id: 'test-O-1', ...BASE_ELEMENTS.O };
    return [h1, h2, o1];
  });

  // Catalog Filters & Search for Deck Explorer
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'elements' | 'deck52'>('elements');

  // Full 52 card deck ordered
  const full52Deck = useMemo(() => getFullDeckOrdered(), []);

  // Chemical evaluation of cards placed in the testing workbench
  const evaluation = useMemo(() => {
    return evaluateCards(testCards);
  }, [testCards]);

  // Counts of combinations per rank
  const countsByRank = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const item of ALL_COMBINATIONS) {
      counts[item.rank] = (counts[item.rank] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered molecules by hierarchy, category and search
  const filteredHierarchyCombinations = useMemo(() => {
    return ALL_COMBINATIONS.filter((item) => {
      if (hierarchyRank !== 'all' && item.rank !== hierarchyRank) {
        return false;
      }
      if (hierarchyCategory !== 'Todas' && item.category !== hierarchyCategory) {
        return false;
      }
      if (hierarchySearch.trim()) {
        const q = hierarchySearch.toLowerCase().trim();
        return (
          item.formula.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.cards.some((s) => s.toLowerCase() === q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.formula.localeCompare(b.formula);
    });
  }, [hierarchyRank, hierarchyCategory, hierarchySearch]);

  // Handle adding card from catalog to workbench
  const handleAddCard = (symbol: string) => {
    if (testCards.length >= 5) {
      return;
    }
    const base = BASE_ELEMENTS[symbol as keyof typeof BASE_ELEMENTS];
    if (!base) return;

    const newCard: ElementCard = {
      id: `sandbox-${symbol}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...base,
    };
    setTestCards((prev) => [...prev, newCard]);
  };

  // Remove card from workbench by index or id
  const handleRemoveCard = (cardId: string) => {
    setTestCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Clear workbench
  const handleClearWorkbench = () => {
    setTestCards([]);
  };

  // Draw 5 random cards from deck
  const handleRandom5 = () => {
    const shuffled = generateDeck();
    const random5 = shuffled.slice(0, 5);
    setTestCards(random5);
  };

  // Load preset molecule
  const handleLoadPreset = (symbols: string[], name: string) => {
    const newCards: ElementCard[] = symbols.map((sym, idx) => {
      const base = BASE_ELEMENTS[sym as keyof typeof BASE_ELEMENTS];
      return {
        id: `preset-${sym}-${idx}-${Date.now()}`,
        ...base,
      };
    });
    setTestCards(newCards);
    setLoadedFeedback(`¡${name} cargada!`);
    setTimeout(() => setLoadedFeedback(null), 2500);
  };

  // Select combination from Catalog and transfer to workbench
  const handleSelectCombinationFromCatalog = (symbols: string[]) => {
    const newCards: ElementCard[] = symbols.map((sym, idx) => {
      const base = BASE_ELEMENTS[sym as keyof typeof BASE_ELEMENTS];
      return {
        id: `combo-${sym}-${idx}-${Date.now()}`,
        ...base,
      };
    });
    setTestCards(newCards.slice(0, 5));
    setSandboxTab('workbench');
    setLoadedFeedback(`¡Molécula cargada en la mesa!`);
    setTimeout(() => setLoadedFeedback(null), 2500);
  };

  // Filtered elements catalog
  const filteredElements = useMemo(() => {
    return Object.entries(BASE_ELEMENTS).filter(([sym, el]) => {
      const details = ELEMENT_DETAILS[sym];
      if (selectedGroup !== 'all' && el.group.toString() !== selectedGroup) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          el.symbol.toLowerCase().includes(query) ||
          el.name.toLowerCase().includes(query) ||
          details?.family.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedGroup, searchQuery]);

  // Filtered 52 deck list
  const filteredDeck52 = useMemo(() => {
    return full52Deck.filter((c) => {
      if (selectedGroup !== 'all' && c.group.toString() !== selectedGroup) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return c.symbol.toLowerCase().includes(query) || c.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [full52Deck, selectedGroup, searchQuery]);

  // Calculate copies of each element currently in testCards
  const inUseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of testCards) {
      counts[c.symbol] = (counts[c.symbol] || 0) + 1;
    }
    return counts;
  }, [testCards]);

  return (
    <div className="flex-1 flex flex-col min-h-screen h-auto bg-slate-950 text-zinc-100 select-none">
      
      {/* Top Header Banner with vibrant energetic styling */}
      <div className="relative border-b border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Beaker className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-200">
                Laboratorio Molecular
              </h1>
              <span className="text-[10px] font-bold font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40 shadow-sm">
                Sandbox Químico
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Experimenta con enlaces de Lewis, crea moléculas y explora las 52 cartas químicas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <MusicControl />

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title="Volver al Menú Principal"
            >
              <Home size={15} className="text-amber-400" />
              <span>Volver al Menú</span>
            </button>
          )}

          {onBackToGame && (
            <button
              type="button"
              onClick={onBackToGame}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Gamepad2 size={16} />
              <span>Volver a la Mesa</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar with vibrant pills */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md sticky top-0 z-30">
        <div className="flex flex-wrap items-center gap-2 py-0.5">
          <button
            type="button"
            onClick={() => setSandboxTab('workbench')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer',
              sandboxTab === 'workbench'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
            )}
          >
            <Beaker size={14} />
            <span>Mesa de Pruebas</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40">
              {testCards.length}/5
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSandboxTab('combinations')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer',
              sandboxTab === 'combinations'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
            )}
          >
            <Award size={14} />
            <span>Catálogo de Manos</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40">
              {ALL_COMBINATIONS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSandboxTab('deck')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer',
              sandboxTab === 'deck'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
            )}
          >
            <Layers size={14} />
            <span>Baraja de 52 Cartas</span>
          </button>
        </div>

        {/* Action toast feedback */}
        {loadedFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <Check size={13} className="text-emerald-400" />
            <span>{loadedFeedback}</span>
          </motion.div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto space-y-4">
        
        {/* ========================================================= */}
        {/* TAB 1: MESA DE REACCIÓN INTERACTIVA (WORKBENCH)           */}
        {/* ========================================================= */}
        {sandboxTab === 'workbench' && (
          <div className="space-y-4">
            
            {/* ========================================================= */}
            {/* ENHANCED MOLECULE HIERARCHY EXPLORER                      */}
            {/* ========================================================= */}
            <div className="bg-slate-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-2xl space-y-4">
              
              {/* Header: Title, Total Counter & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                        Explorador de Moléculas por Jerarquía
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase font-mono">
                        R8 al R1
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Selecciona cualquier rango o familia para explorar y cargar directamente en la mesa de pruebas
                    </p>
                  </div>
                </div>

                {/* Search Bar & View Mode Toggle */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search input */}
                  <div className="relative flex-1 sm:w-60">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={hierarchySearch}
                      onChange={(e) => setHierarchySearch(e.target.value)}
                      placeholder="Buscar H₂O, CH₄, Sal, C..."
                      className="w-full pl-8 pr-7 py-1.5 bg-zinc-950/90 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                    />
                    {hierarchySearch && (
                      <button
                        type="button"
                        onClick={() => setHierarchySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle: Cards vs Compact */}
                  <div className="flex items-center p-0.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setHierarchyViewMode('cards')}
                      className={cn(
                        'p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                        hierarchyViewMode === 'cards'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      )}
                      title="Vista en tarjetas completas"
                    >
                      <LayoutGrid size={13} />
                      <span className="text-[11px] hidden sm:inline">Tarjetas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHierarchyViewMode('compact')}
                      className={cn(
                        'p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                        hierarchyViewMode === 'compact'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      )}
                      title="Vista compacta de botones rápidos"
                    >
                      <List size={13} />
                      <span className="text-[11px] hidden sm:inline">Compacto</span>
                    </button>
                  </div>

                  {/* Expand/Collapse Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsHierarchyExpanded(!isHierarchyExpanded)}
                    className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={isHierarchyExpanded ? 'Ocultar explorador' : 'Expandir explorador'}
                  >
                    <ChevronDown
                      size={15}
                      className={cn('transition-transform duration-200', !isHierarchyExpanded && '-rotate-90')}
                    />
                  </button>
                </div>
              </div>

              {isHierarchyExpanded && (
                <div className="space-y-3.5">
                  
                  {/* Hierarchy Tier Selector Tabs (All + R8 down to R1) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Award size={13} className="text-amber-400" />
                        <span>Rangos de Póker Químico:</span>
                      </span>
                      <span className="font-mono text-cyan-300">
                        {filteredHierarchyCombinations.length} moléculas encontradas
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
                      {/* 'ALL' Button */}
                      <button
                        type="button"
                        onClick={() => setHierarchyRank('all')}
                        className={cn(
                          'p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col justify-between items-start shadow-sm active:scale-95',
                          hierarchyRank === 'all'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 font-black ring-2 ring-white/40 scale-[1.02]'
                            : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-black uppercase">TODAS</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-black/20">
                            {ALL_COMBINATIONS.length}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold truncate mt-0.5">Catálogo</span>
                      </button>

                      {/* Tiers 8 to 1 */}
                      {[8, 7, 6, 5, 4, 3, 2, 1].map((rankNum) => {
                        const theme = RANK_THEMES[rankNum];
                        const isSelected = hierarchyRank === rankNum;
                        const count = countsByRank[rankNum] || 0;

                        return (
                          <button
                            key={`tier-btn-${rankNum}`}
                            type="button"
                            onClick={() => setHierarchyRank(isSelected ? 'all' : rankNum)}
                            className={cn(
                              'p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col justify-between items-start shadow-sm active:scale-95',
                              isSelected
                                ? `${theme.bg} ${theme.border} ring-2 ring-white/40 scale-[1.02]`
                                : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={cn('text-[9px] px-1.5 py-0.2 rounded font-black', theme.badge)}>
                                R{rankNum}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {count}
                              </span>
                            </div>
                            <span className={cn('text-[11px] font-bold truncate mt-0.5 w-full text-left', isSelected ? theme.text : 'text-zinc-200')}>
                              {theme.title.split(':')[1]?.trim() || `Rango ${rankNum}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary Filter: Chemical Families & Reset */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5 pb-0.5 text-xs">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-0.5">
                        Familia:
                      </span>
                      {CATEGORIES_LIST.map((cat) => {
                        const isCatSelected = hierarchyCategory === cat;
                        return (
                          <button
                            key={`cat-${cat}`}
                            type="button"
                            onClick={() => setHierarchyCategory(cat)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border cursor-pointer',
                              isCatSelected
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                            )}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Reset Button if filtered */}
                    {(hierarchyRank !== 'all' || hierarchyCategory !== 'Todas' || hierarchySearch) && (
                      <button
                        type="button"
                        onClick={() => {
                          setHierarchyRank('all');
                          setHierarchyCategory('Todas');
                          setHierarchySearch('');
                        }}
                        className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                      >
                        <RotateCcw size={11} /> Limpiar filtros
                      </button>
                    )}
                  </div>

                  {/* Active Tier Description Banner (When a specific tier is selected) */}
                  {hierarchyRank !== 'all' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2',
                        RANK_THEMES[hierarchyRank].bg,
                        RANK_THEMES[hierarchyRank].border
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-black', RANK_THEMES[hierarchyRank].badge)}>
                            {RANK_THEMES[hierarchyRank].title}
                          </span>
                          <span className="font-bold text-white text-xs">
                            {RANK_THEMES[hierarchyRank].subtitle}
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 font-bold ml-auto sm:ml-0">
                            Puntuación: {RANK_THEMES[hierarchyRank].score}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          {HIERARCHY_TIERS.find((t) => t.rank === hierarchyRank)?.description}
                        </p>
                      </div>

                      {/* Random from tier button */}
                      <button
                        type="button"
                        onClick={() => {
                          const tierCombos = ALL_COMBINATIONS.filter((c) => c.rank === hierarchyRank);
                          if (tierCombos.length > 0) {
                            const randomPick = tierCombos[Math.floor(Math.random() * tierCombos.length)];
                            handleLoadPreset(randomPick.cards, randomPick.name);
                            setActiveLoadedFormula(randomPick.formula);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
                      >
                        <Shuffle size={12} />
                        <span>Probar al Azar</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Molecules List / Cards Grid */}
                  <div className="pt-1">
                    {filteredHierarchyCombinations.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center space-y-2">
                        <p className="text-xs text-zinc-400 font-medium">
                          No se encontraron moléculas con los filtros actuales.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setHierarchyRank('all');
                            setHierarchyCategory('Todas');
                            setHierarchySearch('');
                          }}
                          className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
                        >
                          Mostrar todas ({ALL_COMBINATIONS.length})
                        </button>
                      </div>
                    ) : hierarchyViewMode === 'cards' ? (
                      /* DETAILED CARDS GRID */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 h-auto">
                        {filteredHierarchyCombinations.map((combo) => {
                          const theme = RANK_THEMES[combo.rank] || RANK_THEMES[1];
                          const isCurrentlyLoaded = activeLoadedFormula === combo.formula;

                          return (
                            <div
                              key={combo.id}
                              onClick={() => {
                                handleLoadPreset(combo.cards, combo.name);
                                setActiveLoadedFormula(combo.formula);
                              }}
                              className={cn(
                                'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-sm relative group',
                                isCurrentlyLoaded
                                  ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                  : `${theme.bg} ${theme.border} hover:border-zinc-500 hover:scale-[1.01]`
                              )}
                            >
                              <div>
                                {/* Top Header: Rank & Category */}
                                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                  <span className={cn('text-[9px] px-1.5 py-0.2 rounded font-black uppercase', theme.badge)}>
                                    R{combo.rank}: {theme.title.split(':')[1]?.trim()}
                                  </span>
                                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950/80 px-2 py-0.2 rounded-full border border-zinc-800">
                                    {combo.category}
                                  </span>
                                </div>

                                {/* Formula and Common Name */}
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                  <h4 className="text-sm font-bold text-white leading-tight truncate">
                                    {combo.name}
                                  </h4>
                                  <span className="font-mono text-base font-black text-cyan-300 drop-shadow-sm shrink-0">
                                    {combo.formula}
                                  </span>
                                </div>

                                {/* Chemical details & Geometry */}
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-2">
                                  <span className="px-1.5 py-0.2 rounded bg-zinc-950/80 border border-zinc-800">
                                    {combo.bondType}
                                  </span>
                                  {combo.geometry && (
                                    <span className="px-1.5 py-0.2 rounded bg-zinc-950/80 border border-zinc-800 truncate">
                                      {combo.geometry}
                                    </span>
                                  )}
                                </div>

                                {/* Recipe Elements Chips */}
                                <div className="p-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 flex items-center justify-between gap-1 mb-2">
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                    Cartas ({combo.cards.length}):
                                  </span>
                                  <div className="flex flex-wrap gap-1 items-center justify-end">
                                    {combo.cards.map((sym, idx) => (
                                      <span
                                        key={`${combo.id}-sym-${idx}-${sym}`}
                                        className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-mono text-[11px] font-bold"
                                      >
                                        {sym}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Button */}
                              <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-400 font-medium">
                                  {isCurrentlyLoaded ? (
                                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                                      <Check size={11} /> Cargada en Mesa
                                    </span>
                                  ) : (
                                    'Toca para probar'
                                  )}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadPreset(combo.cards, combo.name);
                                    setActiveLoadedFormula(combo.formula);
                                  }}
                                  className={cn(
                                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95',
                                    isCurrentlyLoaded
                                      ? 'bg-cyan-400 text-slate-950 font-black'
                                      : 'bg-zinc-800 hover:bg-cyan-500 hover:text-slate-950 text-zinc-200 border border-zinc-700'
                                  )}
                                >
                                  <Beaker size={12} />
                                  <span>{isCurrentlyLoaded ? 'En Mesa' : 'Cargar'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* COMPACT VIEW (FAST CHIPS) */
                      <div className="flex flex-wrap gap-1.5 h-auto">
                        {filteredHierarchyCombinations.map((combo) => {
                          const theme = RANK_THEMES[combo.rank] || RANK_THEMES[1];
                          const isCurrentlyLoaded = activeLoadedFormula === combo.formula;

                          return (
                            <button
                              key={combo.id}
                              type="button"
                              onClick={() => {
                                handleLoadPreset(combo.cards, combo.name);
                                setActiveLoadedFormula(combo.formula);
                              }}
                              className={cn(
                                'px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 hover:scale-105',
                                isCurrentlyLoaded
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-white/40'
                                  : `${theme.bg} ${theme.border} text-zinc-200 hover:border-cyan-400`
                              )}
                              title={`Cargar ${combo.name} (${combo.formula})`}
                            >
                              <span className={cn('text-[9px] px-1 py-0.2 rounded font-black', theme.badge)}>
                                R{combo.rank}
                              </span>
                              <span className="font-mono text-xs font-bold tracking-tight text-white">
                                {combo.formula}
                              </span>
                              <span className="text-[11px] font-normal text-zinc-400 truncate max-w-[100px]">
                                {combo.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Workbench Section */}
            <section className="bg-slate-900/60 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
              
              {/* Workbench Actions Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Mesa de Enlaces Químicos
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      {testCards.length}/5 cartas
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandom5}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-200 text-xs font-bold border border-indigo-500/40 shadow-sm transition-all cursor-pointer active:scale-95"
                    title="Extraer 5 cartas aleatorias de la baraja"
                  >
                    <Shuffle size={13} className="text-indigo-400" />
                    <span>Azar (5)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearWorkbench}
                    disabled={testCards.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-500/40 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
                    title="Vaciar mesa de pruebas"
                  >
                    <Trash2 size={13} className="text-rose-400" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              {/* Card Slots (5 Max) */}
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-5">
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const card = testCards[slotIdx];

                  if (card) {
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative flex flex-col items-center justify-center p-1.5 sm:p-2.5 bg-zinc-950/80 rounded-2xl border border-zinc-700/80 shadow-md group"
                      >
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(card.id)}
                          className="absolute -top-2 -right-2 z-30 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:scale-110 active:scale-90"
                          title="Quitar de la mesa"
                        >
                          ✕
                        </button>

                        <Card
                          card={card}
                          className="w-13 h-19 sm:w-16 sm:h-24 md:w-18 md:h-26 cursor-pointer hover:brightness-110"
                          onClick={() => handleRemoveCard(card.id)}
                        />

                        <span className="mt-1.5 text-[10px] text-zinc-300 font-bold truncate max-w-full font-mono">
                          {card.name}
                        </span>
                      </motion.div>
                    );
                  }

                  return (
                    <div
                      key={`empty-slot-${slotIdx}`}
                      className="aspect-[5/7] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/40 p-2 text-center text-zinc-600 hover:border-zinc-700 transition-colors"
                    >
                      <span className="text-xs font-mono font-bold text-zinc-500 mb-0.5">
                        #{slotIdx + 1}
                      </span>
                      <span className="text-[10px] text-zinc-600 hidden sm:block">
                        Vacío
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chemical Verdict and Lewis Visualizer Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 border-t border-zinc-800">
                
                {/* Left: Verdict & Summary (5 Cols) */}
                <div className="lg:col-span-5 space-y-3 flex flex-col justify-center">
                  
                  {/* Verdict Status Card */}
                  {testCards.length === 0 ? (
                    <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-center text-zinc-400 text-xs font-medium">
                      Elige cartas abajo o pulsa una muestra rápida para ver la reacción de Lewis.
                    </div>
                  ) : evaluation.isValid ? (
                    <div className="p-4 bg-gradient-to-br from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-1.5">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>¡MOLÉCULA ESTABLE!</span>
                      </div>
                      <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                        {evaluation.desc}
                      </p>
                    </div>
                  ) : evaluation.nobleGasBonus && evaluation.nobleGasBonus.count > 0 ? (
                    <div className="p-4 bg-gradient-to-br from-fuchsia-950/80 to-purple-950/80 border border-fuchsia-500/40 rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                      <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-sm mb-1.5">
                        <Sparkles size={18} className="text-fuchsia-400 shrink-0" />
                        <span>GAS NOBLE ESTABLE</span>
                      </div>
                      <p className="text-xs text-fuchsia-200/90 leading-relaxed font-sans">
                        {evaluation.nobleGasBonus.desc}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-amber-950/80 to-orange-950/80 border border-amber-500/40 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1.5">
                        <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                        <span>OCTETO INCOMPLETO</span>
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                        {evaluation.violationReason || evaluation.desc || 'Los electrones no alcanzan los 8 necesarios para completar la capa.'}
                      </p>
                    </div>
                  )}

                  {/* Formula and Details Card */}
                  {testCards.length > 0 && (
                    <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-3 shadow-md">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                            Molécula
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {evaluation.name}
                          </h4>
                        </div>
                        {evaluation.formula && (
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                              Fórmula
                            </span>
                            <div className="text-lg font-black font-mono text-cyan-300">
                              {evaluation.formula}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chemical Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                          <span className="text-zinc-500 block text-[10px] font-bold">Rango</span>
                          <span className="text-amber-300 font-bold font-mono">{evaluation.pokerHandRank || 'Rango 0'}</span>
                        </div>

                        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                          <span className="text-zinc-500 block text-[10px] font-bold">Tipo Enlace</span>
                          <span className="text-cyan-300 font-bold truncate block">{evaluation.bondType || 'N/A'}</span>
                        </div>

                        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
                          <span className="text-zinc-500 block text-[10px] font-bold">Naturaleza</span>
                          <span className="text-emerald-300 font-bold truncate block">{evaluation.chemicalNature || 'Neutro'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Embedded Reaction Visualizer (Lewis Structure) (7 Cols) */}
                <div className="lg:col-span-7 bg-zinc-950/90 border border-indigo-500/30 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[260px] h-auto shadow-inner relative">
                  <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-mono mb-2 px-1">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Zap size={14} /> Estructura de Lewis Cuántica
                    </span>
                    <span className="text-zinc-500">{testCards.length} {testCards.length === 1 ? 'átomo' : 'átomos'}</span>
                  </div>

                  {testCards.length > 0 ? (
                    <ReactionVisualizer cards={testCards} className="w-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-xs font-mono">
                      <Atom className="w-12 h-12 text-zinc-700 mb-2 animate-spin-slow" />
                      <span>Selecciona cartas para ver los enlaces y geometría</span>
                    </div>
                  )}
                </div>

              </div>

            </section>

            {/* Direct Element Picker Section */}
            <section className="bg-slate-900/60 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus size={16} className="text-emerald-400" />
                  Añadir Elementos a la Mesa ({testCards.length}/5)
                </h3>
                <span className="text-xs text-zinc-400">
                  Toca para agregar
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-11 gap-2">
                {Object.entries(BASE_ELEMENTS).map(([sym, el]) => {
                  const details = ELEMENT_DETAILS[sym];
                  const inUse = inUseCounts[sym] || 0;
                  const isFull = testCards.length >= 5;

                  return (
                    <button
                      key={`bench-pick-${sym}`}
                      type="button"
                      disabled={isFull}
                      onClick={() => handleAddCard(sym)}
                      className={cn(
                        'flex flex-col items-center p-2.5 rounded-2xl border transition-all relative group text-left cursor-pointer active:scale-95',
                        isFull
                          ? 'opacity-40 cursor-not-allowed bg-zinc-950/40 border-zinc-800'
                          : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      )}
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Z={details?.atomicNumber}</span>
                        {inUse > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
                            {inUse}
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-black font-mono text-white my-0.5">
                        {sym}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium truncate max-w-full">
                        {el.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: JERARQUÍA & TODAS LAS COMBINACIONES POSIBLES       */}
        {/* ========================================================= */}
        {sandboxTab === 'combinations' && (
          <CombinationsCatalog onSelectCombination={handleSelectCombinationFromCatalog} />
        )}

        {/* ========================================================= */}
        {/* TAB 3: EXPLORADOR DE LA BARAJA COMPLETA (52 CARTAS)       */}
        {/* ========================================================= */}
        {sandboxTab === 'deck' && (
          <section className="bg-slate-900/60 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
            
            {/* Header & Mode Switch */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-purple-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Baraja Química Oficial ({viewMode === 'deck52' ? '52 Cartas en Juego' : '21 Especies Atómicas'})
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('elements')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                    viewMode === 'elements'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  Por Especie (21)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('deck52')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                    viewMode === 'deck52'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  Mazo Completo (52)
                </button>
              </div>
            </div>

            {/* Search and Group Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por símbolo o nombre..."
                  className="w-full pl-9 pr-8 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Group filter badges */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {GROUP_FILTERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(g.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                      selectedGroup === g.id
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : g.color
                    )}
                  >
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display */}
            {viewMode === 'elements' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {filteredElements.map(([sym, el]) => {
                  const details = ELEMENT_DETAILS[sym];
                  const deckCount = DECK_COMPOSITION.find((d) => d.element === sym)?.count || 1;
                  const isFull = testCards.length >= 5;

                  return (
                    <div
                      key={sym}
                      className="flex flex-col items-center bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 transition-all group relative hover:border-purple-500/40 hover:shadow-lg"
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-mono mb-1.5 px-0.5">
                        <span className="text-zinc-500">Z={details?.atomicNumber}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 font-bold">
                          {deckCount}× mazo
                        </span>
                      </div>

                      <div className="relative my-1">
                        <Card
                          card={{ id: `cat-${sym}`, ...el }}
                          className="w-14 h-20 sm:w-16 sm:h-24 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => {
                            handleAddCard(sym);
                            setSandboxTab('workbench');
                          }}
                        />
                      </div>

                      <div className="w-full text-center mt-1.5">
                        <span className="text-xs font-bold text-white block truncate">
                          {el.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {el.group} e⁻ valencia
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleAddCard(sym);
                          setSandboxTab('workbench');
                        }}
                        disabled={isFull}
                        className={cn(
                          'w-full mt-2 py-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all border cursor-pointer',
                          isFull
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-500/30'
                        )}
                      >
                        <Plus size={12} />
                        <span>{isFull ? 'Mesa llena' : 'Probar'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2">
                {filteredDeck52.map((card, idx) => {
                  const isFull = testCards.length >= 5;
                  const isSlotted = testCards.some((c) => c.symbol === card.symbol);

                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        if (!isFull) {
                          handleAddCard(card.symbol);
                          setSandboxTab('workbench');
                        }
                      }}
                      className={cn(
                        'flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer relative group active:scale-95',
                        isSlotted
                          ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900'
                      )}
                      title={`Carta #${idx + 1}: ${card.name} (${card.symbol}). Toca para probar.`}
                    >
                      <Card
                        card={card}
                        className="w-10 h-15 sm:w-12 sm:h-18"
                      />
                      <span className="text-[10px] font-mono font-bold text-zinc-300 mt-1 truncate max-w-full">
                        {card.symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </section>
        )}

      </div>

    </div>
  );
}

