import React, { useState, useMemo } from 'react';
import { ALL_COMBINATIONS, HIERARCHY_TIERS } from '../data/combinations';
import {
  Award,
  Search,
  Beaker,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CombinationsCatalogProps {
  onSelectCombination?: (cards: string[]) => void;
}

const CATEGORIES = ['Todas', 'Orgánico', 'Inorgánico Covalente', 'Sal Iónica', 'Gas Noble'] as const;

const RANK_COLORS: Record<number, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  8: { bg: 'bg-amber-950/30', border: 'border-amber-500/40', text: 'text-amber-300', badge: 'bg-amber-500 text-slate-950 font-black', dot: 'bg-amber-400' },
  7: { bg: 'bg-purple-950/30', border: 'border-purple-500/40', text: 'text-purple-300', badge: 'bg-purple-500 text-white font-black', dot: 'bg-purple-400' },
  6: { bg: 'bg-cyan-950/30', border: 'border-cyan-500/40', text: 'text-cyan-300', badge: 'bg-cyan-500 text-slate-950 font-black', dot: 'bg-cyan-400' },
  5: { bg: 'bg-emerald-950/30', border: 'border-emerald-500/40', text: 'text-emerald-300', badge: 'bg-emerald-500 text-slate-950 font-black', dot: 'bg-emerald-400' },
  4: { bg: 'bg-blue-950/30', border: 'border-blue-500/40', text: 'text-blue-300', badge: 'bg-blue-500 text-white font-black', dot: 'bg-blue-400' },
  3: { bg: 'bg-orange-950/30', border: 'border-orange-500/40', text: 'text-orange-300', badge: 'bg-orange-500 text-slate-950 font-black', dot: 'bg-orange-400' },
  2: { bg: 'bg-rose-950/30', border: 'border-rose-500/40', text: 'text-rose-300', badge: 'bg-rose-500 text-white font-black', dot: 'bg-rose-400' },
  1: { bg: 'bg-fuchsia-950/30', border: 'border-fuchsia-500/40', text: 'text-fuchsia-300', badge: 'bg-fuchsia-500 text-white font-black', dot: 'bg-fuchsia-400' },
  0: { bg: 'bg-zinc-950/30', border: 'border-zinc-800', text: 'text-zinc-400', badge: 'bg-zinc-800 text-zinc-300 font-black', dot: 'bg-zinc-500' },
};

export function CombinationsCatalog({ onSelectCombination }: CombinationsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Count formulas per rank
  const countsByRank = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const item of ALL_COMBINATIONS) {
      counts[item.rank] = (counts[item.rank] || 0) + 1;
    }
    return counts;
  }, []);

  // Filter combinations
  const filteredCombinations = useMemo(() => {
    return ALL_COMBINATIONS.filter((item) => {
      if (selectedRank !== 'all' && item.rank !== selectedRank) return false;
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.formula.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.cards.some((sym) => sym.toLowerCase() === q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.formula.localeCompare(b.formula);
    });
  }, [selectedRank, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      
      {/* 1. Top Header & Quick Search */}
      <div className="bg-slate-900/70 border border-zinc-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
              Catálogo de Manos
            </span>
            <span className="text-xs text-amber-300 font-bold font-mono">
              {ALL_COMBINATIONS.length} Moléculas Válidas
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            Jerarquía de Manos de Póker Químico (Rango 8 al 1)
          </h2>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar H₂O, NaCl, CH₄..."
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Hierarchy Ladder (Tabs for Ranks 8 -> 1) */}
      <div className="bg-slate-900/70 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-md space-y-2.5">
        <div className="text-xs font-bold text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Award size={14} className="text-amber-400" />
            <span>Selecciona una Jerarquía para Filtrar:</span>
          </span>
          {(selectedRank !== 'all' || selectedCategory !== 'Todas' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedRank('all');
                setSelectedCategory('Todas');
                setSearchQuery('');
              }}
              className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw size={11} /> Ver Todas ({ALL_COMBINATIONS.length})
            </button>
          )}
        </div>

        {/* 8 Tier Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {HIERARCHY_TIERS.filter((t) => t.rank > 0).map((tier) => {
            const count = countsByRank[tier.rank] || 0;
            const isSelected = selectedRank === tier.rank;
            const theme = RANK_COLORS[tier.rank] || RANK_COLORS[0];

            return (
              <button
                key={tier.rank}
                type="button"
                onClick={() => setSelectedRank(isSelected ? 'all' : tier.rank)}
                className={cn(
                  'p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-sm active:scale-95',
                  isSelected
                    ? `${theme.bg} ${theme.border} ring-2 ring-white/40 scale-[1.02]`
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={cn('text-[10px] px-1.5 py-0.2 rounded font-black', theme.badge)}>
                    R{tier.rank}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    {count}
                  </span>
                </div>
                <div className={cn('text-xs font-bold truncate leading-tight', isSelected ? theme.text : 'text-zinc-200')}>
                  {tier.shortTitle}
                </div>
                <div className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">
                  {tier.baseScore}
                </div>
              </button>
            );
          })}
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-0.5 text-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1">
            Familia:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border cursor-pointer',
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Streamlined, Easy-to-Read Molecule Cards Grid */}
      <div className="space-y-2">
        <div className="text-xs text-zinc-400 font-bold px-1 flex items-center justify-between">
          <span>
            Mostrando <strong className="text-white font-mono">{filteredCombinations.length}</strong> moléculas:
          </span>
          {onSelectCombination && (
            <span className="text-cyan-400 text-xs font-normal">
              Pulsa "Probar" para cargar en la mesa de juego
            </span>
          )}
        </div>

        {filteredCombinations.length === 0 ? (
          <div className="bg-slate-900/60 border border-zinc-800 rounded-2xl p-8 text-center space-y-2">
            <h4 className="text-sm font-bold text-white">No se encontraron moléculas</h4>
            <p className="text-xs text-zinc-400">Intenta con otro filtro de rango o término de búsqueda.</p>
            <button
              onClick={() => {
                setSelectedRank('all');
                setSelectedCategory('Todas');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCombinations.map((combo) => {
              const tier = HIERARCHY_TIERS.find((t) => t.rank === combo.rank);
              const theme = RANK_COLORS[combo.rank] || RANK_COLORS[0];

              return (
                <div
                  key={combo.id}
                  className={cn(
                    'border rounded-2xl p-3.5 transition-all flex flex-col justify-between shadow-sm hover:border-zinc-500',
                    theme.bg,
                    theme.border
                  )}
                >
                  <div>
                    {/* Top Row: Rank Tag & Category */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm', theme.badge)}>
                        Rango {combo.rank}: {tier?.shortTitle || combo.hierarchyTier}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800">
                        {combo.category}
                      </span>
                    </div>

                    {/* Formula & Name */}
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="text-base font-black text-white leading-tight">
                          {combo.name}
                        </h4>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {combo.bondType}
                        </span>
                      </div>
                      <div className="text-xl font-black font-mono text-cyan-300 drop-shadow-sm">
                        {combo.formula}
                      </div>
                    </div>

                    {/* Recipe Elements Chips */}
                    <div className="my-2 p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Cartas:
                      </span>
                      <div className="flex flex-wrap gap-1 items-center justify-end">
                        {combo.cards.map((sym, idx) => (
                          <span
                            key={`${combo.id}-${idx}-${sym}`}
                            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-mono text-xs font-bold shadow-sm"
                          >
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-zinc-300 leading-snug line-clamp-2 mt-1">
                      {combo.description}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  {onSelectCombination && (
                    <div className="pt-2.5 mt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {combo.isSingleDeckCraftable ? '✓ Mazo 52' : '⚠ Extra'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectCombination(combo.cards)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      >
                        <Beaker size={12} />
                        <span>Probar en Mesa</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
