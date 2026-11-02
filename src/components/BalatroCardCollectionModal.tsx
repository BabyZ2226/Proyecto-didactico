import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Atom } from 'lucide-react';
import { getFullDeckOrdered } from '../data/deck';
import { ALL_COMBINATIONS } from '../data/combinations';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';

interface BalatroCardCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeckLab?: () => void;
}

type CollectionTab = 'elements' | 'molecules';

export const BalatroCardCollectionModal: React.FC<BalatroCardCollectionModalProps> = ({
  isOpen,
  onClose,
  onOpenDeckLab,
}) => {
  const [activeTab, setActiveTab] = useState<CollectionTab>('elements');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<{
    type: 'element' | 'molecule';
    data: any;
  } | null>(null);

  // All 52 element cards in the ordered deck
  const allDeckCards = useMemo(() => getFullDeckOrdered(), []);

  // Items per page (8 slots like equipment inventory on the left page)
  const ITEMS_PER_PAGE = 8;

  const currentItems = useMemo(() => {
    return activeTab === 'elements' ? allDeckCards : ALL_COMBINATIONS;
  }, [activeTab, allDeckCards]);

  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return currentItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentItems, safeCurrentPage, ITEMS_PER_PAGE]);

  const handlePrevPage = () => {
    if (safeCurrentPage > 1) {
      playBalatroSound('deal');
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (safeCurrentPage < totalPages) {
      playBalatroSound('deal');
      setCurrentPage((p) => p + 1);
    }
  };

  const handleTabSwitch = (tab: CollectionTab) => {
    playBalatroSound('hover');
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 select-none">
      
      {/* Overhead Light Beam */}
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
        {/* Left Bookmark Tab (Green / Emerald / Compendium) */}
        <div className="absolute -left-9 sm:-left-12 top-14 flex flex-col gap-2 z-40">
          <div className="w-10 sm:w-14 h-10 sm:h-12 bg-[#5ea84e] border-2 border-r-0 border-[#386b2d] rounded-l-md text-white flex items-center justify-center shadow-md shadow-[0_4px_0_0_#23471c] -translate-x-1 sm:-translate-x-2">
            <Atom size={18} />
          </div>
        </div>

        {/* Right Bookmark Tab (Close) */}
        <div className="absolute -right-9 sm:-right-12 top-14 z-40">
          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            title="Cerrar Compendio"
            className="w-10 sm:w-14 h-10 sm:h-12 bg-[#8b2335] hover:bg-[#a62c41] border-2 border-l-0 border-[#5e1220] rounded-r-md text-white flex items-center justify-center cursor-pointer shadow-md shadow-[0_4px_0_0_#420b15] transition-all hover:translate-x-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* The Open Book Frame */}
        <div className="w-full bg-[#832334] border-[5px] border-[#571420] rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_0_rgba(255,255,255,0.2)] relative h-auto">
          
          <div className="w-full bg-[#f1ddb6] border-2 border-[#b89559] rounded-lg sm:rounded-xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.35)] relative flex flex-col lg:flex-row min-h-[480px] h-auto">
            
            {/* Center Spine Shadow */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-[#70522a]/30 to-transparent pointer-events-none z-30" />
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#96723e]/50 pointer-events-none z-30" />

            {/* LEFT PAGE: Grid of Cards */}
            <div className="flex-1 p-5 sm:p-7 bg-[#f4e0ba] text-[#2c1d10] border-b-2 lg:border-b-0 lg:border-r-2 border-[#c8a56b] h-auto relative flex flex-col justify-between">
              
              <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

              <div className="space-y-3">
                {/* Header & Subtabs */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                      Compendio
                    </h2>
                    <p className="text-[11px] font-mono text-[#745028]">
                      {activeTab === 'elements' ? '52 Cartas de la Baraja' : 'Moléculas Descubiertas'}
                    </p>
                  </div>

                  <div className="flex gap-1 bg-[#dfc397] p-1 rounded-md border border-[#b89559]">
                    <button
                      onClick={() => handleTabSwitch('elements')}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer',
                        activeTab === 'elements' ? 'bg-[#407a38] text-white shadow-sm' : 'text-[#5a3e1f] hover:text-[#322010]'
                      )}
                    >
                      Átomos
                    </button>
                    <button
                      onClick={() => handleTabSwitch('molecules')}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer',
                        activeTab === 'molecules' ? 'bg-[#d97c38] text-white shadow-sm' : 'text-[#5a3e1f] hover:text-[#322010]'
                      )}
                    >
                      Moléculas
                    </button>
                  </div>
                </div>

                {/* Grid of 8 Slots */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {paginatedItems.map((item, idx) => {
                    const isSelected = selectedCard?.data === item;
                    const label = activeTab === 'elements' ? item.symbol : item.formula;
                    const sub = activeTab === 'elements' ? item.name : item.name;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          playBalatroSound('deal');
                          setSelectedCard({
                            type: activeTab === 'elements' ? 'element' : 'molecule',
                            data: item,
                          });
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

                {/* Pagination */}
                <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#5a3e1f]">
                  <button
                    onClick={handlePrevPage}
                    disabled={safeCurrentPage <= 1}
                    className="px-2.5 py-1 rounded bg-[#dfc397] border border-[#ba9663] hover:bg-[#d4b585] disabled:opacity-40 cursor-pointer font-bold"
                  >
                    ◄ Ant.
                  </button>
                  <span className="font-bold">
                    Pág. {safeCurrentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={safeCurrentPage >= totalPages}
                    className="px-2.5 py-1 rounded bg-[#dfc397] border border-[#ba9663] hover:bg-[#d4b585] disabled:opacity-40 cursor-pointer font-bold"
                  >
                    Sig. ►
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-4">
                <span>BARAJA ALQUÍMICA</span>
                <span>PAG. I</span>
              </div>
            </div>

            {/* RIGHT PAGE: Inspector & Details */}
            <div className="flex-1 p-5 sm:p-7 bg-[#f2deb7] text-[#2c1d10] h-auto relative flex flex-col justify-between">
              
              <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

              <div className="space-y-3">
                {selectedCard ? (
                  <>
                    <div>
                      <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                        {selectedCard.type === 'element' ? selectedCard.data.name : selectedCard.data.formula}
                      </h2>
                      <p className="text-xs font-mono text-[#745028]">
                        {selectedCard.type === 'element'
                          ? `Símbolo: ${selectedCard.data.symbol} • Grupo ${selectedCard.data.group}`
                          : selectedCard.data.name}
                      </p>
                    </div>

                    {/* Medieval Filigree Divider */}
                    <div className="flex items-center justify-center gap-2 py-0.5 opacity-70">
                      <span className="text-[#a57f49] text-xs">❧ ──────</span>
                      <span className="text-sm">{selectedCard.type === 'element' ? '⚛️' : '🧪'}</span>
                      <span className="text-[#a57f49] text-xs">────── ☙</span>
                    </div>

                    {/* Details in Parchment Box */}
                    <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] text-xs font-mono space-y-2 text-[#3b2311]">
                      {selectedCard.type === 'element' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="font-bold">Electrones de Valencia:</span>
                            <span className="font-bold text-[#407a38]">{selectedCard.data.valency} e⁻</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Masa Atómica:</span>
                            <span>{selectedCard.data.atomicMass} u</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Electronegatividad:</span>
                            <span>{selectedCard.data.electronegativity || 2.2}</span>
                          </div>
                          <div className="pt-1 text-[11px] leading-snug text-[#4f361c]">
                            {selectedCard.data.lore || 'Átomo fundamental para la síntesis de enlaces moleculares.'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="font-bold">Jerarquía Energética:</span>
                            <span className="font-bold text-[#d97c38]">Rango {selectedCard.data.rank}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Estabilidad Molecular:</span>
                            <span className="text-[#407a38] font-bold">Octeto Completo</span>
                          </div>
                          <div className="pt-1 text-[11px] leading-snug text-[#4f361c]">
                            <strong>Fórmula:</strong> {selectedCard.data.formula} • {selectedCard.data.description || 'Octeto cerrado de alta estabilidad.'}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-[#7d5f34]">
                    <Atom size={40} className="mb-2 opacity-60" />
                    <p className="font-medieval text-lg">Selecciona una carta en la página izquierda</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-4">
                <span>ANÁLISIS MOLECULAR</span>
                <span>PAG. II</span>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};
