import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  BookOpen,
  Layers,
  Search,
  Sparkles,
  Award,
  Filter,
} from 'lucide-react';
import { BASE_ELEMENTS, DECK_COMPOSITION, ELEMENT_DETAILS } from '../data/deck';
import { HIERARCHY_TIERS, ALL_COMBINATIONS } from '../data/combinations';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';

interface PokerCompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeckLab?: () => void;
  onOpenRulesManual?: () => void;
}

export const PokerCompendiumModal: React.FC<PokerCompendiumModalProps> = ({
  isOpen,
  onClose,
  onOpenDeckLab,
  onOpenRulesManual,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'hierarchy'>('hierarchy');
  const [familyFilter, setFamilyFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedElementSymbol, setSelectedElementSymbol] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.classList.add('library-open');
    } else {
      document.documentElement.classList.remove('library-open');
    }
    return () => {
      document.documentElement.classList.remove('library-open');
    };
  }, [isOpen]);

  // Build card collection summary from deck composition
  const allElements = useMemo(() => {
    return DECK_COMPOSITION.map((item) => {
      const base = BASE_ELEMENTS[item.element as keyof typeof BASE_ELEMENTS];
      const details = ELEMENT_DETAILS[item.element];
      return {
        symbol: item.element,
        name: base?.name || item.element,
        group: base?.group || 1,
        en: base?.en || 0,
        count: item.count,
        atomicNumber: details?.atomicNumber || 0,
        period: details?.period || 1,
        family: details?.family || 'Elemento',
        description: details?.description || '',
      };
    });
  }, []);

  const families = useMemo(() => {
    const set = new Set<string>();
    allElements.forEach((el) => set.add(el.family));
    return ['Todos', ...Array.from(set)];
  }, [allElements]);

  const filteredElements = useMemo(() => {
    return allElements.filter((el) => {
      const matchesFamily = familyFilter === 'Todos' || el.family === familyFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        el.family.toLowerCase().includes(q);
      return matchesFamily && matchesSearch;
    });
  }, [allElements, familyFilter, searchQuery]);

  // Group sample molecules for each rank
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
    ALL_COMBINATIONS.forEach((c) => {
      if (map[c.rank] && map[c.rank].length < 6 && !map[c.rank].includes(c.formula)) {
        map[c.rank].push(`${c.name} (${c.formula})`);
      }
    });
    return map;
  }, []);

  const selectedElement = selectedElementSymbol
    ? allElements.find((e) => e.symbol === selectedElementSymbol)
    : null;

  if (!isOpen) return null;

  return (
    <div className="relative w-full min-h-screen h-auto z-[130] flex items-start justify-center bg-[#0e0c15] py-6 px-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="w-full max-w-5xl h-auto bg-[#faf5ea] border-2 border-[#c5b596] rounded-3xl shadow-2xl flex flex-col text-[#2c2217]"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#ece2cd] border-b border-[#d6c7ab] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#445437] border border-[#36442b] flex items-center justify-center text-xl text-[#f4eee1] shadow-xs">
              🧪
            </div>
            <div>
              <h2 className="font-vintage-title text-lg sm:text-xl font-black text-[#261c10] leading-tight">
                Compendio de Póker Químico del Octeto
              </h2>
              <span className="text-[11px] font-typewriter text-[#6a563f] block">
                Mazo de 52 Cartas de Elementos & Jerarquía de Moléculas y Enlaces
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#e0d3b8] hover:bg-[#d4c5a6] border border-[#b8a788] text-[#3d3021] transition-colors cursor-pointer"
            title="Cerrar compendio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-5 py-2.5 bg-[#f3ebd9] border-b border-[#dfd2b9] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('hierarchy');
              }}
              className={cn(
                'px-4 py-2 rounded-xl font-typewriter font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border shadow-xs',
                activeTab === 'hierarchy'
                  ? 'bg-[#445437] text-[#f7f2e4] border-[#36442b]'
                  : 'bg-[#ebd2aa]/50 text-[#3f3120] border-[#d4c4a6] hover:bg-[#e4d4b3]'
              )}
            >
              <Award size={15} />
              <span>👑 Reglas de Jerarquía (Manos del Póker)</span>
            </button>

            <button
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('collection');
              }}
              className={cn(
                'px-4 py-2 rounded-xl font-typewriter font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border shadow-xs',
                activeTab === 'collection'
                  ? 'bg-[#445437] text-[#f7f2e4] border-[#36442b]'
                  : 'bg-[#ebd2aa]/50 text-[#3f3120] border-[#d4c4a6] hover:bg-[#e4d4b3]'
              )}
            >
              <Layers size={15} />
              <span>🃏 Colección de Cartas (52 Cartas)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDeckLab && (
              <button
                onClick={() => {
                  playBalatroSound('click');
                  onClose();
                  onOpenDeckLab();
                }}
                className="px-3 py-1.5 bg-[#ede4ce] hover:bg-[#e2d5bc] text-[#2c2214] font-typewriter font-bold text-xs rounded-lg border border-[#c4b595] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                title="Abrir mesa de laboratorio de síntesis química"
              >
                <Sparkles size={13} className="text-[#6d573d]" />
                <span className="hidden sm:inline">Laboratorio</span> Sandbox
              </button>
            )}

            {onOpenRulesManual && (
              <button
                onClick={() => {
                  playBalatroSound('click');
                  onClose();
                  onOpenRulesManual();
                }}
                className="px-3 py-1.5 bg-[#ede4ce] hover:bg-[#e2d5bc] text-[#2c2214] font-typewriter font-bold text-xs rounded-lg border border-[#c4b595] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                title="Abrir manual en libro encuadernado"
              >
                <BookOpen size={13} className="text-[#6d573d]" />
                <span className="hidden sm:inline">Grimorio</span> Manual
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Hierarchy Rules */}
        {activeTab === 'hierarchy' && (
          <div className="p-5 h-auto space-y-4 flex-1">
            {/* Quick Pedagogical Octet Rule Guide */}
            <div className="bg-[#f0e6d2] border border-[#d6c7ab] p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-typewriter shadow-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#352718] flex items-center gap-1.5 text-sm">
                  <span>⚛️ La Regla del Octeto & Formación de Enlaces</span>
                </span>
                <p className="text-[#5f4e3b] leading-relaxed max-w-2xl">
                  Para que una mano gane puntos, los electrones de valencia deben combinarse formando enlaces
                  covalentes o iónicos estables (8 electrones alrededor del átomo central, o 2 para el Hidrógeno).
                  Las manos de mayor complejidad molecular ganan la ronda en Showdown.
                </p>
              </div>
              <div className="bg-[#e4d6bf] px-3 py-1.5 rounded-xl border border-[#c9b897] font-bold text-[#3d2e1b] shrink-0 text-center">
                <span>8 Rangos Didácticos</span>
                <span className="block text-[10px] text-[#6b553e]">Jerarquía de Victoria</span>
              </div>
            </div>

            {/* List of 8 Hierarchy Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 library-invisible-scroll max-h-[62vh] pr-1">
              {HIERARCHY_TIERS.map((tier) => {
                const samples = formulasByRank[tier.rank] || [];
                return (
                  <div
                    key={tier.rank}
                    className="bg-[#fcf9f2] border border-[#d6c7ab] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#bfae8f] transition-all"
                  >
                    <div>
                      {/* Top Rank Badge & Title */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#ebd2aa]/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#445437] text-white flex items-center justify-center font-vintage-title font-black text-sm shadow-xs">
                            {tier.rank}
                          </span>
                          <div>
                            <h4 className="font-vintage-title text-sm sm:text-base font-black text-[#261c10] leading-tight">
                              {tier.title}
                            </h4>
                          </div>
                        </div>
                        <span className="font-vintage-title text-xs font-bold bg-[#ede3cc] px-2 py-0.5 rounded border border-[#cfc0a3] text-[#3d2e1a] shrink-0">
                          {tier.baseScore}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="font-typewriter text-xs text-[#524332] mt-2.5 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    {/* Example Compounds */}
                    {samples.length > 0 && (
                      <div className="bg-[#f4ebd9] p-2.5 rounded-xl border border-[#c8b796] space-y-1">
                        <span className="text-[10px] font-typewriter font-bold text-[#6a563f] uppercase block">
                          Ejemplos Químicos Válidos:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {samples.map((formula, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-typewriter bg-[#fcf9f2] px-2 py-0.5 rounded border border-[#d4c4a6] text-[#2c1f12] font-semibold"
                            >
                              {formula}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Deck Card Collection */}
        {activeTab === 'collection' && (
          <div className="p-5 h-auto space-y-4 flex-1">
            {/* Filter and Search Bar */}
            <div className="bg-[#f0e6d2] border border-[#d6c7ab] p-3 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
              {/* Family Filters */}
              <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                <Filter size={14} className="text-[#6a563f] shrink-0 mr-1" />
                {families.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      playBalatroSound('select');
                      setFamilyFilter(f);
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-typewriter font-bold transition-all whitespace-nowrap cursor-pointer border',
                      familyFilter === f
                        ? 'bg-[#445437] text-[#f7f2e4] border-[#36442b] shadow-xs'
                        : 'bg-[#ede3cc] text-[#4d3f2e] border-[#cfc0a3] hover:bg-[#e2d5bc]'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Search Element */}
              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7f694e]" />
                <input
                  type="text"
                  placeholder="Buscar elemento (H, Carbono...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#fcf9f2] border border-[#cfc0a3] rounded-lg pl-8 pr-3 py-1.5 text-xs font-typewriter text-[#281d11] placeholder:text-[#917d65] focus:outline-none focus:border-[#445437]"
                />
              </div>
            </div>

            {/* Total Cards Banner */}
            <div className="flex items-center justify-between text-xs font-typewriter text-[#6a563f] px-1">
              <span>
                Mostrando <strong>{filteredElements.length}</strong> tipos de elementos en el mazo didáctico (52 cartas en total).
              </span>
              <span className="text-[11px] text-[#8c7457]">
                Haz clic en una carta para ver sus electrones de valencia y enlaces
              </span>
            </div>

            {/* Grid of Element Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 library-invisible-scroll max-h-[58vh] pr-1">
              {filteredElements.map((el) => {
                const isSelected = selectedElementSymbol === el.symbol;
                return (
                  <button
                    key={el.symbol}
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      setSelectedElementSymbol(isSelected ? null : el.symbol);
                    }}
                    className={cn(
                      'p-3 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer text-left shadow-xs hover:-translate-y-0.5',
                      isSelected
                        ? 'bg-[#e4eed8] border-[#445437] ring-2 ring-[#445437]/20 shadow-md'
                        : 'bg-[#fcf9f2] border-[#d6c7ab] hover:border-[#bfae8f] hover:bg-[#faf4e6]'
                    )}
                  >
                    {/* Top: Atomic Number & Count */}
                    <div className="flex items-center justify-between text-[11px] font-typewriter font-bold text-[#78644e]">
                      <span>{el.atomicNumber}</span>
                      <span className="bg-[#ede3cc] px-1.5 py-0.2 rounded border border-[#cfc0a3] text-[10px]">
                        x{el.count}
                      </span>
                    </div>

                    {/* Chemical Symbol */}
                    <div className="my-1.5 text-center">
                      <span className="font-vintage-title text-2xl sm:text-3xl font-black text-[#261c10] tracking-tight block">
                        {el.symbol}
                      </span>
                      <span className="font-typewriter text-[11px] font-bold text-[#445437] truncate block">
                        {el.name}
                      </span>
                    </div>

                    {/* Bottom: Valence Dots & EN */}
                    <div className="pt-1.5 border-t border-[#ebd2aa]/60 flex items-center justify-between text-[10px] font-typewriter text-[#6e5942]">
                      <span title="Electrones de Valencia">
                        {Array.from({ length: Math.min(el.group, 8) }).map((_, i) => '•').join('')}
                      </span>
                      <span title="Electronegatividad de Pauling">
                        EN {el.en > 0 ? el.en.toFixed(1) : 'Inerte'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Element Detailed Inspector Card */}
            {selectedElement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#f0e6d2] border-2 border-[#c5b596] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-16 rounded-xl bg-[#faf5ea] border-2 border-[#445437] flex flex-col items-center justify-center shadow-xs">
                    <span className="text-[10px] font-typewriter font-bold text-[#6b553e]">
                      {selectedElement.atomicNumber}
                    </span>
                    <span className="font-vintage-title text-2xl font-black text-[#261c10] leading-none">
                      {selectedElement.symbol}
                    </span>
                    <span className="text-[9px] font-typewriter text-[#445437] font-bold">
                      G{selectedElement.group}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-vintage-title text-lg font-black text-[#261c10]">
                        {selectedElement.name} ({selectedElement.symbol})
                      </h4>
                      <span className="bg-[#445437] text-white text-[10px] font-typewriter font-bold px-2 py-0.5 rounded-full">
                        {selectedElement.family}
                      </span>
                    </div>
                    <p className="font-typewriter text-xs text-[#544432] max-w-xl">
                      {selectedElement.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-typewriter text-[#6b553e] pt-0.5">
                      <span>Electronegatividad: <strong>{selectedElement.en > 0 ? selectedElement.en : '0 (Gas Inerte)'}</strong></span>
                      <span>·</span>
                      <span>Copias en el mazo: <strong>{selectedElement.count} cartas</strong></span>
                      <span>·</span>
                      <span>Período: <strong>{selectedElement.period}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedElementSymbol(null)}
                  className="px-3 py-1 bg-[#e0d3b8] hover:bg-[#d4c5a6] rounded-lg text-xs font-typewriter font-bold border border-[#b8a788] cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-[#ece2cd] border-t border-[#d6c7ab] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs font-typewriter text-[#6a563f]">
            Didáctica Química: Basado en electrones de valencia reales y enlaces moleculares.
          </span>
          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="px-5 py-2 bg-[#445437] hover:bg-[#38462d] text-[#f7f2e4] font-typewriter font-bold text-xs rounded-xl cursor-pointer shadow-xs border border-[#36442b]"
          >
            Cerrar Compendio
          </button>
        </div>
      </motion.div>
    </div>
  );
};
