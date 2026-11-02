import React, { useState, useMemo } from 'react';
import { X, BookOpen, Atom, ChevronLeft, ChevronRight, Sparkles, MoveHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_COMBINATIONS } from '../data/combinations';
import { playBalatroSound } from '../lib/soundEffects';

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalBookPages = 2; // Spread 1 = Cap. I & II, Spread 2 = Cap. III & IV

  // Group all valid unique molecule formulas by hierarchy rank
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

  const tiers = [
    { rank: 8, name: 'Flor Imperial', sub: 'Octeto Orgánico (5 cartas)', mult: 'x100', desc: 'Cadena aromática u orgánica perfecta de 5 átomos (ej. Benzeno, Pentano).' },
    { rank: 7, name: 'Escalera de Color', sub: 'Cadena Conjugada (5 cartas)', mult: 'x50', desc: '5 elementos consecutivos del mismo grupo o familia con enlaces alternos.' },
    { rank: 6, name: 'Póker', sub: 'Tetratómica (4 cartas)', mult: 'x25', desc: '4 átomos idénticos o isotópicos en resonancia (ej. CH4, CCl4, SF4).' },
    { rank: 5, name: 'Full House', sub: 'Enlace Triple + Doble (3+2 cartas)', mult: 'x15', desc: 'Combinación de Triatómica + Pareja Química (ej. N2O + H2O, CO2 + NaCl).' },
    { rank: 4, name: 'Trío Molecular', sub: 'Triatómica (3 cartas)', mult: 'x10', desc: '3 átomos en molécula coordinada (ej. H2O, CO2, O3, NO2, HCN).' },
    { rank: 3, name: 'Doble Pareja', sub: 'Enlace Doble (2+2 cartas)', mult: 'x5', desc: 'Dos moléculas diatómicas independientes (ej. O2 + HCl, NaCl + H2).' },
    { rank: 2, name: 'Pareja Química', sub: 'Enlace Simple (2 cartas)', mult: 'x2', desc: '2 átomos enlazados por enlace covalente o iónico (ej. H2, Cl2, CO, NaCl).' },
    { rank: 1, name: 'Gas Inerte', sub: 'Octeto Cerrado (+100 ptos)', mult: 'x1', desc: 'Átomo noble (He, Ne, Ar) o elemento individual de alta estabilidad.' },
  ];

  const handlePrevSpread = () => {
    if (currentPage > 1) {
      playBalatroSound('deal');
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextSpread = () => {
    if (currentPage < totalBookPages) {
      playBalatroSound('deal');
      setCurrentPage((p) => p + 1);
    }
  };

  return (
    <div className="relative w-full min-h-screen h-auto z-50 flex items-start justify-center bg-[#0e0c15] py-8 px-2 sm:p-4 md:p-6 select-none">
      
      {/* Overhead Ambient Light Beam */}
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
        {/* Left Bookmark Tab (Amber / Scroll / Rules) */}
        <div className="absolute -left-9 sm:-left-12 top-14 flex flex-col gap-2 z-40">
          <div className="w-10 sm:w-14 h-10 sm:h-12 bg-[#d97c38] border-2 border-r-0 border-[#964a18] rounded-l-md text-white flex items-center justify-center shadow-md shadow-[0_4px_0_0_#692f0c] -translate-x-1 sm:-translate-x-2">
            <BookOpen size={18} />
          </div>
        </div>

        {/* Right Bookmark Tab (Close / Return Bookmark) */}
        <div className="absolute -right-9 sm:-right-12 top-14 z-40">
          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            title="Cerrar Manual"
            className="w-10 sm:w-14 h-10 sm:h-12 bg-[#8b2335] hover:bg-[#a62c41] border-2 border-l-0 border-[#5e1220] rounded-r-md text-white flex items-center justify-center cursor-pointer shadow-md shadow-[0_4px_0_0_#420b15] transition-all hover:translate-x-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* The Open Book Frame (Burgundy Hardcover + Double Parchment Pages) */}
        <div className="w-full bg-[#832334] border-[5px] border-[#571420] rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_0_rgba(255,255,255,0.2)] relative h-auto">
          
          <div className="w-full bg-[#f1ddb6] border-2 border-[#b89559] rounded-lg sm:rounded-xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.35)] relative min-h-[520px] h-auto flex flex-col justify-between">
            
            {/* Center Book Spine Crease Shadow */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-[#70522a]/30 to-transparent pointer-events-none z-30" />
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#96723e]/50 pointer-events-none z-30" />

            {/* Interactive Swipable / Draggable Book Spread */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50 || info.velocity.x < -200) {
                    handleNextSpread();
                  } else if (info.offset.x > 50 || info.velocity.x > 200) {
                    handlePrevSpread();
                  }
                }}
                initial={{ opacity: 0, x: currentPage === 1 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: currentPage === 1 ? 30 : -30 }}
                transition={{ duration: 0.2 }}
                className="w-full flex-1 flex flex-col lg:flex-row h-auto cursor-grab active:cursor-grabbing select-none"
              >
                {/* SPREAD 1 (PAG I & II): Fundamentals & Phase Sequence */}
                {currentPage === 1 && (
                  <>
                    {/* LEFT PAGE: Fundamentals & The Octet Rule */}
                    <div className="flex-1 p-5 sm:p-7 bg-[#f4e0ba] text-[#2c1d10] border-b-2 lg:border-b-0 lg:border-r-2 border-[#c8a56b] h-auto relative flex flex-col justify-between">
                      <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                              Reglas del Octeto
                            </h2>
                            <p className="text-xs font-mono text-[#745028]">
                              Manual Alquímico Oficial • Edición Completa
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
                            Capítulo I
                          </span>
                        </div>

                        {/* Medieval Filigree Divider */}
                        <div className="flex items-center justify-center gap-2 py-0.5 opacity-70">
                          <span className="text-[#a57f49] text-xs">❧ ──────</span>
                          <span className="text-sm">📜</span>
                          <span className="text-[#a57f49] text-xs">────── ☙</span>
                        </div>

                        {/* §1. Regla de Oro */}
                        <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1 text-xs shadow-sm">
                          <strong className="font-medieval text-sm text-[#3b2311] flex items-center gap-1.5">
                            <Atom size={15} className="text-[#3b7e2e]" />
                            §1. La Regla de Oro Molecular
                          </strong>
                          <p className="text-[#4a3116] leading-relaxed text-[11px]">
                            Cada científico recibe <strong>2 cartas en mano</strong> ("electrones de enlace") y se revelan <strong>5 cartas comunitarias</strong> ("sustrato reactivo") en la mesa. Tu objetivo es sintetizar la combinación de 5 cartas de mayor estabilidad donde todos los átomos cumplan <strong>8 electrones de valencia</strong> (el Hidrógeno completa su dueto con 2 e⁻).
                          </p>
                        </div>

                        {/* §2. La Baraja Atómica */}
                        <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1.5 text-xs shadow-sm">
                          <strong className="font-medieval text-sm text-[#3b2311] flex items-center gap-1.5">
                            <Sparkles size={15} className="text-[#d97c38]" />
                            §2. La Baraja Atómica (52 Cartas)
                          </strong>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-[#4a3116]">
                            <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                              <strong className="text-[#3b2311]">Hidrógeno (H):</strong> 1 e⁻ valencia. Enlace simple.
                            </div>
                            <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                              <strong className="text-[#3b2311]">Carbono (C):</strong> 4 e⁻ valencia. Columna orgánica.
                            </div>
                            <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                              <strong className="text-[#3b2311]">Nitrógeno (N):</strong> 5 e⁻ valencia. Enlaces triples.
                            </div>
                            <div className="p-1 bg-[#f0d8b0] rounded border border-[#c2a270]">
                              <strong className="text-[#3b2311]">Oxígeno (O):</strong> 6 e⁻ valencia. Oxidante fuerte.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-3">
                        <span>MANUAL ALQUÍMICO</span>
                        <span>PAG. I</span>
                      </div>
                    </div>

                    {/* RIGHT PAGE: Phases of the Round & Actions */}
                    <div className="flex-1 p-5 sm:p-7 bg-[#f2deb7] text-[#2c1d10] h-auto relative flex flex-col justify-between">
                      <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                              Fases y Apuestas
                            </h2>
                            <p className="text-xs font-mono text-[#745028]">
                              Dinámica de Reacción en Mesa
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
                            Capítulo II
                          </span>
                        </div>

                        {/* §3. Fases de la Ronda */}
                        <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1.5 text-xs shadow-sm">
                          <strong className="font-medieval text-sm text-[#3b2311] block">
                            §3. Secuencia de la Ronda
                          </strong>
                          <ul className="space-y-1 text-[11px] text-[#4a3116]">
                            <li><strong>1. Pre-Flop:</strong> Ciegas ($10/$20) y repartición de 2 cartas privadas.</li>
                            <li><strong>2. El Flop:</strong> Se destapan las primeras 3 cartas comunitarias.</li>
                            <li><strong>3. El Turn:</strong> Se añade la 4ª carta comunitaria (El Catalizador).</li>
                            <li><strong>4. El River:</strong> Se revela la 5ª y última carta comunitaria.</li>
                            <li><strong>5. Showdown:</strong> Evaluación química y entrega del bote al ganador.</li>
                          </ul>
                        </div>

                        {/* §4. Acciones Alquímicas */}
                        <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1 text-xs shadow-sm">
                          <strong className="font-medieval text-sm text-[#3b2311] block">
                            §4. Decisiones de Apuesta
                          </strong>
                          <p className="text-[11px] text-[#4a3116] leading-relaxed">
                            • <strong>Pasar (Check):</strong> Mantenerse sin apostar si nadie ha subido.<br />
                            • <strong>Igualar (Call):</strong> Pagar el valor actual del bote.<br />
                            • <strong>Subir (Raise):</strong> Incrementar la apuesta para forzar al resto.<br />
                            • <strong>Retirarse (Fold):</strong> Abandonar la mano y perder lo apostado.<br />
                            • <strong>All-In:</strong> Apostar todas tus fichas en una reacción en cadena.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-3">
                        <span>SECUENCIA EN MESA</span>
                        <span>PAG. II</span>
                      </div>
                    </div>
                  </>
                )}

                {/* SPREAD 2 (PAG III & IV): The 8 Chemical Hierarchies & Tiebreakers */}
                {currentPage === 2 && (
                  <>
                    {/* LEFT PAGE: The 8 Hierarchies */}
                    <div className="flex-1 p-5 sm:p-7 bg-[#f4e0ba] text-[#2c1d10] border-b-2 lg:border-b-0 lg:border-r-2 border-[#c8a56b] h-auto relative flex flex-col justify-between">
                      <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                              Las 8 Jerarquías
                            </h2>
                            <p className="text-xs font-mono text-[#745028]">
                              Tabla de Combinaciones & Multiplicadores
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
                            Capítulo III
                          </span>
                        </div>

                        {/* Formula Blocks */}
                        <div className="space-y-1.5 h-auto pr-1">
                          {tiers.map((t) => (
                            <div key={t.rank} className="p-2 rounded-lg bg-[#e4c99e] border border-[#ba9663] flex flex-col gap-1 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medieval font-bold text-[#3d2712] text-xs sm:text-sm">
                                  {t.rank}º {t.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 bg-[#3d7a36] text-white rounded text-[10px] font-mono font-bold">
                                    {t.mult}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#7d5a2d]">{t.sub}</span>
                                </div>
                              </div>
                              <p className="text-[10px] font-mono text-[#4d3215] leading-tight">
                                {t.desc}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {(formulasByRank[t.rank] || []).slice(0, 6).map((formula, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.2 bg-[#d5b686] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#322010]"
                                  >
                                    {formula}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-3">
                        <span>TABLA DE ENLACES</span>
                        <span>PAG. III</span>
                      </div>
                    </div>

                    {/* RIGHT PAGE: Tiebreakers & Chemical Terminology */}
                    <div className="flex-1 p-5 sm:p-7 bg-[#f2deb7] text-[#2c1d10] h-auto relative flex flex-col justify-between">
                      <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                              Desempates y Criterios
                            </h2>
                            <p className="text-xs font-mono text-[#745028]">
                              Evaluación Termodinámica de Igualdad
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#e2c79b] border border-[#ba9663] rounded text-[10px] font-mono font-bold text-[#54391b]">
                            Capítulo IV
                          </span>
                        </div>

                        {/* Medieval Filigree Divider */}
                        <div className="flex items-center justify-center gap-2 py-0.5 opacity-70">
                          <span className="text-[#a57f49] text-xs">❧ ──────</span>
                          <span className="text-sm">⚖️</span>
                          <span className="text-[#a57f49] text-xs">────── ☙</span>
                        </div>

                        {/* §5. Criterios de Desempate */}
                        <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1 text-xs shadow-sm">
                          <strong className="font-medieval text-sm text-[#3b2311] block">
                            §5. Orden de Resolución en Empate
                          </strong>
                          <ol className="space-y-1 text-[11px] text-[#4a3116] list-decimal list-inside">
                            <li><strong>Multiplicidad de Enlace:</strong> Enlace Triple (≡) &gt; Enlace Doble (=) &gt; Enlace Simple (-).</li>
                            <li><strong>Naturaleza Química:</strong> Ácido Fuerte &gt; Base Fuerte &gt; Sal Iónica &gt; Compuesto Neutro.</li>
                            <li><strong>Suma de Números Atómicos (Σ Z):</strong> Mayor masa atómica combinada de los 5 átomos.</li>
                            <li><strong>Kicker Libre:</strong> La carta individual más alta en número atómico fuera del enlace.</li>
                          </ol>
                        </div>

                        {/* §6. Consejos de Estrategia Alquímica */}
                        <div className="p-3 rounded-lg bg-[#e2c79b] border border-[#ba9663] space-y-1 text-xs shadow-sm">
                          <strong className="font-medieval text-sm text-[#3b2311] block">
                            §6. Estrategia en la Mesa
                          </strong>
                          <p className="text-[11px] text-[#4a3116] leading-relaxed">
                            • Conserva siempre el <strong>Carbono (C)</strong> o <strong>Nitrógeno (N)</strong> en mano; abren la puerta a moléculas triatómicas y octetos orgánicos de alto valor.<br />
                            • Vigila las cartas de Oxígeno en el Flop: facilitan la formación de H2O, CO2 y sales de alto puntaje.
                          </p>
                        </div>

                        {/* Return button */}
                        <button
                          type="button"
                          onClick={() => {
                            playBalatroSound('click');
                            onClose();
                          }}
                          className="w-full py-2.5 bg-[#d97c38] hover:bg-[#eb8c47] text-white font-medieval text-base font-bold rounded-lg border-2 border-[#964a18] shadow-[0_3px_0_0_#692f0c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                        >
                          <BookOpen size={16} />
                          <span>¡ENTENDIDO! VOLVER A LA MESA</span>
                        </button>
                      </div>

                      <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-3">
                        <span>TERMODINÁMICA</span>
                        <span>PAG. IV</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Book Controls Bar (Page Turn Navigation & Swipe Hint) */}
            <div className="bg-[#e2c89d] border-t-2 border-[#ba9663] px-4 py-2 flex items-center justify-between text-[#3b2311] z-30">
              <button
                disabled={currentPage === 1}
                onClick={handlePrevSpread}
                className="px-3 py-1.5 bg-[#d6b785] disabled:opacity-40 hover:enabled:bg-[#c9a770] text-[#3d2712] font-medieval text-xs font-bold rounded border border-[#a6824a] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6b471d]">
                <MoveHorizontal size={14} className="animate-pulse text-[#a06828]" />
                <span className="hidden sm:inline">Desliza con ratón/táctil o usa los botones</span>
                <span className="sm:hidden">Desliza la página</span>
                <span className="px-2 py-0.5 bg-[#f2deb7] rounded border border-[#c8a56b] text-[10px]">
                  {currentPage} / {totalBookPages}
                </span>
              </div>

              <button
                disabled={currentPage === totalBookPages}
                onClick={handleNextSpread}
                className="px-3 py-1.5 bg-[#d97c38] disabled:opacity-40 hover:enabled:bg-[#eb8c47] text-white font-medieval text-xs font-bold rounded border border-[#964a18] shadow-[0_2px_0_0_#692f0c] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <span>Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
}
