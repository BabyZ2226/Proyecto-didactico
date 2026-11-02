import React, { useState } from 'react';
import { ElementCard } from '../types';
import { Card } from './Card';
import { evaluateCards } from '../lib/evaluator';
import { cn } from '../lib/utils';
import { Sparkles, AlertTriangle, Zap, CircleDot, CheckCircle2 } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

export function ReactionVisualizer({ cards, className }: { cards: ElementCard[]; className?: string }) {
  const [viewMode, setViewMode] = useState<'lines' | 'dots'>('lines');

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-zinc-500 text-xs font-mono">
        <CircleDot className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
        <span>Selecciona o añade elementos para ver la estructura</span>
      </div>
    );
  }

  const evaluation = evaluateCards(cards);
  const nobleGases = cards.filter((c) => c.group === 8);
  const reactiveCards = cards.filter((c) => c.group !== 8);

  // Case 1: Only Noble Gas(es) selected
  if (reactiveCards.length === 0) {
    return (
      <div className={cn('relative w-full flex flex-col items-center justify-center p-4', className)}>
        <div className="flex items-center gap-4 justify-center flex-wrap">
          {nobleGases.map((gas) => (
            <div key={gas.id} className="relative flex flex-col items-center">
              <Card
                card={gas}
                overrideDots={8}
                lewisMode={true}
                className="w-16 h-22 sm:w-20 sm:h-28 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
              />
              <span className="mt-2 text-[10px] font-mono font-bold text-fuchsia-300 bg-fuchsia-950/80 px-2.5 py-0.5 rounded-full border border-fuchsia-500/40 shadow-sm flex items-center gap-1">
                <Sparkles size={11} className="text-fuchsia-400" /> Octeto Completo (8 e⁻)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Case 2: Invalid Combination (Octeto Incompleto o Molécula Inestable)
  if (!evaluation.isValid) {
    return (
      <div className={cn('relative w-full flex flex-col items-center justify-center p-3 sm:p-4', className)}>
        <div className="flex items-center justify-center gap-3 flex-wrap my-2">
          {reactiveCards.map((c) => (
            <div key={c.id} className="relative flex flex-col items-center">
              <Card
                card={c}
                overrideDots={c.group}
                lewisMode={true}
                className="w-14 h-20 sm:w-16 sm:h-24 opacity-85 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>

        <div className="w-full mt-3 p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-left backdrop-blur-sm">
          <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-200">
              {evaluation.name}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed font-sans">
              {evaluation.violationReason || evaluation.desc || 'Los átomos no completan sus 8 electrones de valencia.'}
            </div>
          </div>
        </div>

        {nobleGases.length > 0 && (
          <div className="w-full mt-2 p-2 bg-purple-950/30 border border-purple-500/30 rounded-xl flex items-center justify-between text-[11px] text-purple-300 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-purple-400" /> Gas noble inerte (+{nobleGases.length * 100} pts)
            </span>
            <div className="flex items-center gap-1.5">
              {nobleGases.map((gas) => (
                <Card
                  key={gas.id}
                  card={gas}
                  overrideDots={8}
                  lewisMode={true}
                  className="w-7 h-10 shadow-sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 3: 1 Reactive Card (Single atom isolated)
  if (reactiveCards.length === 1 && nobleGases.length === 0) {
    return (
      <div className={cn('relative flex flex-col items-center justify-center w-full py-4', className)}>
        <Card card={reactiveCards[0]} lewisMode={true} className="w-18 h-26 sm:w-20 sm:h-28 shadow-lg" />
        <span className="mt-2 text-xs text-zinc-400 font-mono">Átomo libre con {reactiveCards[0].group} e⁻ de valencia</span>
      </div>
    );
  }

  // Case 3.5: Multi-Molecule Hand (e.g. 2 Diatomics like H2 + Cl2, or Triatomic + Diatomic like H2O + H2)
  if (evaluation.isValid && evaluation.subMolecules && evaluation.subMolecules.length > 1) {
    return (
      <div className={cn('relative w-full flex flex-col items-center justify-center p-3', className)}>
        {/* Multi-Molecule Header Badge */}
        <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <CheckCircle2 size={13} /> {evaluation.moleculeCount || evaluation.subMolecules.length} Moléculas Estables
        </div>

        {/* Side-by-side independent molecules */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {evaluation.subMolecules.map((sub, idx) => (
            <div key={idx} className="flex flex-col items-center bg-zinc-900/90 p-3 rounded-2xl border border-emerald-500/30 shadow-md">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                  {sub.formula}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
                  {sub.chemicalNature}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sub.cards.map((c) => (
                  <Card key={c.id} card={c} lewisMode={true} className="w-13 h-19 sm:w-15 sm:h-22" />
                ))}
              </div>
              <div className="mt-2 text-[11px] text-zinc-300 text-center font-medium">
                {sub.name}
              </div>
            </div>
          ))}

          {/* Any companion atom not bonded */}
          {cards.length === 5 && evaluation.subMolecules.reduce((sum, s) => sum + s.cards.length, 0) === 4 && (
            <div className="flex flex-col items-center bg-zinc-900/40 p-3 rounded-2xl border border-dashed border-zinc-700">
              <span className="text-[10px] font-mono text-zinc-400 mb-1.5">Átomo Libre</span>
              {cards.filter(c => !evaluation.subMolecules!.some(sm => sm.cards.some(sc => sc.id === c.id))).map(c => (
                <Card key={c.id} card={c} lewisMode={true} className="w-13 h-19 sm:w-15 sm:h-22 opacity-60" />
              ))}
              <span className="mt-1.5 text-[10px] text-zinc-500">Sin reaccionar</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Case 4: Valid Reactive Molecule
  let center: ElementCard;
  let ligands: ElementCard[];

  if (evaluation.centerId) {
    center = reactiveCards.find((c) => c.id === evaluation.centerId) || reactiveCards[0];
    ligands = reactiveCards.filter((c) => c.id !== center.id);
  } else {
    const getCapacity = (g: number) => (g <= 4 ? g : 8 - g);
    const sorted = [...reactiveCards].sort((a, b) => getCapacity(b.group) - getCapacity(a.group));
    center = sorted[0];
    ligands = sorted.slice(1);
  }

  const bondDetails = evaluation.bondDetails || {};

  // Standard Canvas Dimensions for coordinate mapping
  const width = 420;
  const height = 310;
  const cx = 210;
  const cy = 155;

  // Determine positions of center and ligand cards
  let centerPos: Position = { x: cx, y: cy };
  const ligandPositions: Position[] = [];

  const totalLigands = ligands.length;

  if (totalLigands === 1) {
    // 2 Reactive Cards: Diatomic layout (Horizontal side-by-side)
    centerPos = { x: 135, y: cy };
    ligandPositions.push({ x: 285, y: cy });
  } else if (totalLigands === 2) {
    // Check if Linear (e.g. CO2, CS2, HCN, SiO2) or Angular (e.g. H2O, SO2, OF2)
    const isLinear =
      (center.group === 4 && ligands.every((l) => l.group === 6)) || // CO2, CS2, SiO2
      (center.group === 4 && ligands.some((l) => l.group === 5)) || // HCN
      (center.group === 2); // MgCl2, CaCl2

    if (isLinear) {
      centerPos = { x: cx, y: cy };
      ligandPositions.push({ x: 90, y: cy });
      ligandPositions.push({ x: 330, y: cy });
    } else {
      // Angular / Bent geometry (H2O, OF2, SO2, O3, etc.)
      centerPos = { x: cx, y: 100 };
      ligandPositions.push({ x: 110, y: 235 });
      ligandPositions.push({ x: 310, y: 235 });
    }
  } else if (totalLigands === 3) {
    // Trigonal planar / Pyramidal (NH3, H2CO, COCl2, SO3)
    if (center.group === 5) {
      // Pyramidal with lone pair clearly on TOP (e.g. NH3, PH3, PCl3)
      centerPos = { x: cx, y: 145 };
      ligandPositions.push({ x: 95, y: 175 }); // Left
      ligandPositions.push({ x: cx, y: 250 }); // Bottom
      ligandPositions.push({ x: 325, y: 175 }); // Right
    } else {
      // Trigonal planar (e.g. H2CO, COCl2, SO3)
      centerPos = { x: cx, y: 155 };
      ligandPositions.push({ x: cx, y: 55 }); // Top
      ligandPositions.push({ x: 100, y: 245 }); // Bottom-left
      ligandPositions.push({ x: 320, y: 245 }); // Bottom-right
    }
  } else if (totalLigands === 4) {
    // Tetrahedral cross (CH4, CCl4, CF4, SiH4, SiCl4)
    centerPos = { x: cx, y: cy };
    ligandPositions.push({ x: cx, y: 52 }); // Top
    ligandPositions.push({ x: 345, y: cy }); // Right
    ligandPositions.push({ x: cx, y: 258 }); // Bottom
    ligandPositions.push({ x: 75, y: cy }); // Left
  } else {
    // Fallback radial layout
    centerPos = { x: cx, y: cy };
    const radius = 110;
    for (let i = 0; i < totalLigands; i++) {
      const angle = (i * 2 * Math.PI) / totalLigands - Math.PI / 2;
      ligandPositions.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
  }

  // Helper to determine which quadrant of a card is occupied by a bond
  const getOccupiedSide = (from: Position, to: Position): 'top' | 'bottom' | 'left' | 'right' => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'bottom' : 'top';
    }
  };

  const isIonic = evaluation.bondType?.toLowerCase().includes('iónico');

  // Center occupied sides: all directions towards ligands
  const centerOccupiedSides = ligands.map((_, i) => getOccupiedSide(centerPos, ligandPositions[i]));

  // Total bonds on center
  const totalCenterBonds = ligands.reduce((sum, ligand) => sum + (bondDetails[ligand.id] || 1), 0);

  // Center remaining dots and ionic charge
  let centerRemaining: number;
  let centerIonicCharge: string | undefined;

  if (isIonic) {
    if (center.group === 1 && center.symbol !== 'H') {
      centerRemaining = 0;
      centerIonicCharge = '+';
    } else {
      centerRemaining = 8;
      centerIonicCharge = '-';
    }
  } else {
    centerRemaining = Math.max(0, center.group - totalCenterBonds);
  }

  // Ligand data resolver
  const getLigandData = (ligand: ElementCard, index: number) => {
    const lPos = ligandPositions[index] || { x: 0, y: 0 };
    const bondOrder = bondDetails[ligand.id] || 1;
    const occupiedSide = getOccupiedSide(lPos, centerPos);

    let remaining = Math.max(0, ligand.group - bondOrder);
    let ionicCharge: string | undefined;

    if (isIonic) {
      if (ligand.group === 1 && ligand.symbol !== 'H') {
        remaining = 0;
        ionicCharge = '+';
      } else if (ligand.group === 7) {
        remaining = 8;
        ionicCharge = '-';
      } else if (ligand.symbol === 'O') {
        remaining = 6;
        ionicCharge = '-';
      }
    }

    return {
      pos: lPos,
      bondOrder,
      occupiedSides: [occupiedSide] as ('top' | 'bottom' | 'left' | 'right')[],
      remaining,
      ionicCharge,
    };
  };

  // Educational counts
  const totalBondsCount = ligands.reduce((acc, l) => acc + (bondDetails[l.id] || 1), 0);
  const totalSharedElectrons = isIonic ? 0 : totalBondsCount * 2;
  const totalLoneElectrons =
    centerRemaining +
    ligands.reduce((acc, l) => {
      const bo = bondDetails[l.id] || 1;
      return acc + (isIonic ? (l.group === 7 ? 8 : l.group === 1 ? 0 : 6) : Math.max(0, l.group - bo));
    }, 0);

  return (
    <div className={cn('relative w-full flex flex-col items-center', className)}>
      
      {/* Top View Mode Selector */}
      <div className="flex items-center bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs mb-3 z-20 shadow-inner">
        <button
          type="button"
          onClick={() => setViewMode('lines')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
            viewMode === 'lines'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Zap size={13} />
          <span>Líneas de Enlace</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('dots')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
            viewMode === 'dots'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <CircleDot size={13} />
          <span>Puntos de Lewis</span>
        </button>
      </div>

      {/* Visualizer Canvas Frame */}
      <div className="relative w-full max-w-[420px] aspect-[420/290] flex items-center justify-center select-none overflow-visible">
        
        {/* SVG Lewis Bonds Layer */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        >
          {/* Render bonds between Center and Ligands */}
          {ligands.map((ligand, i) => {
            const data = getLigandData(ligand, i);
            const lPos = data.pos;
            if (!lPos) return null;

            const bondOrder = data.bondOrder;

            const x1 = centerPos.x;
            const y1 = centerPos.y;
            const x2 = lPos.x;
            const y2 = lPos.y;

            // Compute unit vector & perpendicular vector
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;
            const nx = -uy;
            const ny = ux;

            // Precision rectangle boundary intersection (Center: 56x80, Ligand: 52x76)
            const trim1 = Math.min(28 / (Math.abs(ux) + 1e-5), 40 / (Math.abs(uy) + 1e-5)) + 2;
            const trim2 = Math.min(26 / (Math.abs(ux) + 1e-5), 38 / (Math.abs(uy) + 1e-5)) + 2;
            const sx = x1 + ux * trim1;
            const sy = y1 + uy * trim1;
            const ex = x2 - ux * trim2;
            const ey = y2 - uy * trim2;
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;

            return (
              <g key={`svg-bond-${ligand.id}-${i}`}>
                {/* Ionic Transfer Bond */}
                {isIonic ? (
                  <g>
                    <line
                      x1={sx}
                      y1={sy}
                      x2={ex}
                      y2={ey}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                      className="animate-pulse"
                    />
                    <circle cx={mx} cy={my} r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px rgba(56,189,248,0.8))" />
                    {/* Ionic Transfer Badge */}
                    <g transform={`translate(${mx}, ${my + 16})`}>
                      <rect x="-35" y="-9" width="70" height="18" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        Transferencia e⁻
                      </text>
                    </g>
                  </g>
                ) : viewMode === 'lines' ? (
                  /* Modo Líneas de Enlace (Kekulé) con brillo de neón */
                  <g>
                    {/* Single Bond */}
                    {bondOrder === 1 && (
                      <g>
                        {/* Glow halo */}
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke="#22d3ee"
                          strokeWidth="6"
                          strokeLinecap="round"
                          opacity="0.35"
                        />
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Double Bond */}
                    {bondOrder === 2 && (
                      <g>
                        {/* Glow halo */}
                        <line
                          x1={sx + nx * 4}
                          y1={sy + ny * 4}
                          x2={ex + nx * 4}
                          y2={ey + ny * 4}
                          stroke="#38bdf8"
                          strokeWidth="6"
                          strokeLinecap="round"
                          opacity="0.35"
                        />
                        <line
                          x1={sx - nx * 4}
                          y1={sy - ny * 4}
                          x2={ex - nx * 4}
                          y2={ey - ny * 4}
                          stroke="#38bdf8"
                          strokeWidth="6"
                          strokeLinecap="round"
                          opacity="0.35"
                        />
                        <line
                          x1={sx + nx * 4}
                          y1={sy + ny * 4}
                          x2={ex + nx * 4}
                          y2={ey + ny * 4}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <line
                          x1={sx - nx * 4}
                          y1={sy - ny * 4}
                          x2={ex - nx * 4}
                          y2={ey - ny * 4}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Triple Bond */}
                    {bondOrder >= 3 && (
                      <g>
                        {/* Center line with purple glow */}
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke="#c084fc"
                          strokeWidth="6"
                          strokeLinecap="round"
                          opacity="0.35"
                        />
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <line
                          x1={sx + nx * 5.5}
                          y1={sy + ny * 5.5}
                          x2={ex + nx * 5.5}
                          y2={ey + ny * 5.5}
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <line
                          x1={sx - nx * 5.5}
                          y1={sy - ny * 5.5}
                          x2={ex - nx * 5.5}
                          y2={ey - ny * 5.5}
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Electron count pill indicator at midpoint */}
                    <g transform={`translate(${mx}, ${my})`}>
                      <rect x="-16" y="-8" width="32" height="16" rx="5" fill="#09090b" stroke="#06b6d4" strokeWidth="1.5" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        {bondOrder === 1 ? '2 e⁻' : bondOrder === 2 ? '4 e⁻' : `${bondOrder * 2} e⁻`}
                      </text>
                    </g>
                  </g>
                ) : (
                  /* Modo Puntos de Lewis (Electrones Compartidos con orbes brillantes) */
                  <g>
                    <line
                      x1={sx}
                      y1={sy}
                      x2={ex}
                      y2={ey}
                      stroke="#71717a"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Single Bond: 1 shared electron pair (2 dots) */}
                    {bondOrder === 1 && (
                      <g>
                        <circle cx={mx - nx * 5} cy={my - ny * 5} r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx + nx * 5} cy={my + ny * 5} r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                      </g>
                    )}

                    {/* Double Bond: 2 shared electron pairs (4 dots) */}
                    {bondOrder === 2 && (
                      <g>
                        <circle cx={mx - ux * 6 - nx * 5} cy={my - uy * 6 - ny * 5} r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx - ux * 6 + nx * 5} cy={my - uy * 6 + ny * 5} r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx + ux * 6 - nx * 5} cy={my + uy * 6 - ny * 5} r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx + ux * 6 + nx * 5} cy={my + uy * 6 + ny * 5} r="4.5" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                      </g>
                    )}

                    {/* Triple Bond: 3 shared electron pairs (6 dots) */}
                    {bondOrder >= 3 && (
                      <g>
                        <circle cx={mx - ux * 9 - nx * 5} cy={my - uy * 9 - ny * 5} r="4" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx - ux * 9 + nx * 5} cy={my - uy * 9 + ny * 5} r="4" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx - nx * 5} cy={my - ny * 5} r="4" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx + nx * 5} cy={my + ny * 5} r="4" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx + ux * 9 - nx * 5} cy={my + uy * 9 - ny * 5} r="4" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                        <circle cx={mx + ux * 9 + nx * 5} cy={my + uy * 9 + ny * 5} r="4" fill="#fbbf24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.9))" />
                      </g>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Center Atom Card */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
          style={{
            left: `${(centerPos.x / width) * 100}%`,
            top: `${(centerPos.y / height) * 100}%`,
          }}
        >
          <Card
            card={center}
            overrideDots={centerRemaining}
            occupiedSides={centerOccupiedSides}
            lewisMode={true}
            ionicCharge={centerIonicCharge}
            className="w-14 h-20 sm:w-16 sm:h-24 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40"
          />
        </div>

        {/* Ligand Cards */}
        {ligands.map((ligand, i) => {
          const data = getLigandData(ligand, i);
          const lPos = data.pos;
          if (!lPos) return null;

          return (
            <div
              key={`ligand-${ligand.id}-${i}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{
                left: `${(lPos.x / width) * 100}%`,
                top: `${(lPos.y / height) * 100}%`,
              }}
            >
              <Card
                card={ligand}
                overrideDots={data.remaining}
                occupiedSides={data.occupiedSides}
                lewisMode={true}
                ionicCharge={data.ionicCharge}
                className="w-12 h-18 sm:w-14 sm:h-20 shadow-md hover:scale-105 transition-transform"
              />
            </div>
          );
        })}
      </div>

      {/* Educational Lewis Breakdown Bar */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs font-mono backdrop-blur-md">
        <div className="flex items-center gap-1 text-cyan-300">
          <span className="text-zinc-500">Enlazantes:</span> <strong className="text-white">{totalSharedElectrons} e⁻</strong> ({totalBondsCount} {totalBondsCount === 1 ? 'enlace' : 'enlaces'})
        </div>
        <div className="flex items-center gap-1 text-amber-300">
          <span className="text-zinc-500">Libres:</span> <strong className="text-white">{totalLoneElectrons} e⁻</strong>
        </div>
        <div className="text-emerald-400 font-bold flex items-center gap-1">
          <CheckCircle2 size={13} /> Octeto Cumplido (8 e⁻)
        </div>
      </div>

      {/* Noble Gas Bonus Display */}
      {nobleGases.length > 0 && (
        <div className="w-full mt-2 p-2.5 bg-fuchsia-950/40 border border-fuchsia-500/30 rounded-2xl flex items-center justify-between gap-2">
          <div className="text-xs text-fuchsia-300 font-mono font-bold flex items-center gap-1.5">
            <Sparkles size={14} className="text-fuchsia-400" /> Gas noble inerte: +{nobleGases.length * 100} pts
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {nobleGases.map((gas) => (
              <Card
                key={gas.id}
                card={gas}
                overrideDots={8}
                lewisMode={true}
                className="w-8 h-11"
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

