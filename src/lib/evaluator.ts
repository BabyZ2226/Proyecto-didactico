import { ElementCard, EvaluationResult, ChemicalNature } from '../types';

export const CHEMICAL_NATURE_ORDER: Record<ChemicalNature, number> = {
  'Ácido': 4,
  'Base': 3,
  'Sal': 2,
  'Neutro': 1,
};

export const ELEMENT_Z: Record<string, number> = {
  H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10,
  Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18,
  K: 19, Ca: 20, Br: 35, I: 53,
};

// Classifies any molecule into Ácido, Base, Sal, or Neutro for chemical tie-breaking
export function classifyChemicalNature(
  formula: string,
  cards: ElementCard[],
  name?: string
): ChemicalNature {
  const normName = (name || '').toLowerCase();
  const symbols = cards.map(c => c.symbol);
  const count = (sym: string) => symbols.filter(s => s === sym).length;
  const alkaliMetals = ['Li', 'Na', 'K'];
  const alkEarthMetals = ['Be', 'Mg', 'Ca'];
  const halogens = ['F', 'Cl', 'Br', 'I'];

  const hasAlkali = symbols.some(s => alkaliMetals.includes(s));
  const hasAlkEarth = symbols.some(s => alkEarthMetals.includes(s));
  const hasMetal = hasAlkali || hasAlkEarth;
  const hasHalogen = symbols.some(s => halogens.includes(s));
  const hasH = symbols.includes('H');
  const hasO = symbols.includes('O');
  const hasN = symbols.includes('N');
  const hasS = symbols.includes('S');
  const hasP = symbols.includes('P');
  const hasC = symbols.includes('C');

  // 1. ÁCIDO (Priority 4)
  // - Haluros de hidrógeno sin metales: HF, HCl, HBr, HI
  if (hasH && hasHalogen && !hasMetal && !hasC && symbols.length === 2) {
    return 'Ácido';
  }
  // - Ácido sulfhídrico: H2S
  if (hasH && hasS && !hasMetal && !hasC && count('H') === 2 && count('S') === 1) {
    return 'Ácido';
  }
  // - Ácido cianhídrico / fosfocianhídrico: HCN, HCP
  if (hasH && hasC && (hasN || hasP) && !hasMetal && !hasO) {
    return 'Ácido';
  }
  // - Haluros de ácido / Fosgenos: COCl2, COF2, CSCl2
  if (hasC && (hasO || hasS) && hasHalogen && !hasMetal && !hasH) {
    return 'Ácido';
  }
  // - Por nombre químico
  if (normName.includes('ácido') || normName.includes('haluro de hidrógeno') || normName.includes('fosgeno')) {
    return 'Ácido';
  }

  // 2. BASE (Priority 3)
  // - Hidróxidos alcalinos: LiOH, NaOH, KOH
  if (hasAlkali && hasO && hasH && symbols.length === 3) {
    return 'Base';
  }
  // - Amoníaco (NH3) y Fosfina (PH3)
  if ((count('N') === 1 && count('H') === 3) || (count('P') === 1 && count('H') === 3)) {
    return 'Base';
  }
  // - Amidas alcalinas: LiNH2, NaNH2, KNH2
  if (hasAlkali && (hasN || hasP) && hasH) {
    return 'Base';
  }
  // - Nitruros alcalinos básicos: Li3N, Na3N
  if (hasAlkali && hasN && !hasO && !hasH) {
    return 'Base';
  }
  // - Por nombre químico
  if (normName.includes('hidróxido') || normName.includes('amoníaco') || normName.includes('amida') || normName.includes('base')) {
    return 'Base';
  }

  // 3. SAL (Priority 2)
  // - Metal + Halógeno (Sales binarias: NaCl, LiF, KCl, MgCl2, CaCl2, etc.)
  if (hasMetal && hasHalogen) {
    return 'Sal';
  }
  // - Metal + Calcógeno (Óxidos/sulfuros iónicos: MgO, CaO, MgS, CaS, Li2O, Na2S, etc.)
  if (hasMetal && (hasO || hasS) && !hasH) {
    return 'Sal';
  }
  // - Hidruros metálicos salinos: LiH, NaH, KH, CaH2
  if (hasMetal && hasH && symbols.length <= 3) {
    return 'Sal';
  }
  // - Por nombre químico
  if (normName.includes('sal') || normName.includes('cloruro') || normName.includes('fluoruro') ||
      normName.includes('bromuro') || normName.includes('yoduro') || normName.includes('óxido/sulfuro iónico') ||
      normName.includes('hidruro metálico') || normName.includes('salina')) {
    return 'Sal';
  }

  // 4. NEUTRO (Priority 1)
  // Diatómicos homonucleares (H2, O2, N2, F2, Cl2, Br2, I2, S2), hidrocarburos neutros (CH4, C2H2, H2CO), óxidos neutros (CO, CO2, SO2, SiO2), agua (H2O), gases nobles (Ne, Ar)
  return 'Neutro';
}

// Calculates non-electronegativity tiebreaker:
// Level 1: moleculeCount (1000 pts per molecule)
// Level 2: natureScore (100 pts per tier: Ácido=400, Base=300, Sal=200, Neutro=100)
// Level 3: nobleGasBonus (15 pts per gas noble)
// Level 4: totalZ * 0.1 (capped at 99 so it never interferes with higher tiers)
export function computeTiebreaker(params: {
  moleculeCount: number;
  nature: ChemicalNature;
  cards: ElementCard[];
  nobleGasBonusCount?: number;
}): number {
  const natureScore = CHEMICAL_NATURE_ORDER[params.nature] || 1;
  const count = Math.max(1, params.moleculeCount || 1);
  const totalZ = params.cards.reduce((sum, c) => sum + (ELEMENT_Z[c.symbol] || c.group), 0);
  const nobleBonus = (params.nobleGasBonusCount || 0) * 15;

  return (count * 1000) + (natureScore * 100) + nobleBonus + Math.min(99, totalZ * 0.1);
}

// Explains tiebreaker resolution in natural, clear language
export function explainTiebreaker(
  winnerEval?: EvaluationResult | null,
  runnerUpEval?: EvaluationResult | null
): string {
  if (!winnerEval || !runnerUpEval || !winnerEval.isValid || !runnerUpEval.isValid) {
    return '';
  }
  if (winnerEval.rank !== runnerUpEval.rank) {
    return '';
  }

  const countW = winnerEval.moleculeCount || 1;
  const countR = runnerUpEval.moleculeCount || 1;
  if (countW > countR) {
    return `Desempate por cantidad de moléculas: ${countW} moléculas (${winnerEval.formula}) vs ${countR} molécula (${runnerUpEval.formula})`;
  }

  const natureW = winnerEval.chemicalNature || 'Neutro';
  const natureR = runnerUpEval.chemicalNature || 'Neutro';
  if (natureW !== natureR) {
    return `Desempate por jerarquía química: ${natureW} (${winnerEval.formula}) supera a ${natureR} (${runnerUpEval.formula}) [Ácido > Base > Sales > Neutro]`;
  }

  const zW = winnerEval.cards.reduce((sum, c) => sum + (ELEMENT_Z[c.symbol] || 1), 0);
  const zR = runnerUpEval.cards.reduce((sum, c) => sum + (ELEMENT_Z[c.symbol] || 1), 0);
  if (zW !== zR) {
    return `Desempate por masa atómica/complejidad molecular (${winnerEval.formula} Z=${zW} vs ${runnerUpEval.formula} Z=${zR})`;
  }

  return 'Empate exacto';
}

export interface BondDetail {
  ligandId: string;
  bondOrder: number;
}

// Convert numbers to unicode subscripts
export function toSubscript(n: number): string {
  if (n <= 1) return '';
  const subs: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  };
  return n.toString().split('').map(c => subs[c] || c).join('');
}

// Generates an accurate chemical formula string adhering to IUPAC nomenclature conventions
export function generateFormula(cards: ElementCard[]): string {
  if (cards.length === 0) return '';
  const counts: Record<string, number> = {};
  const enMap: Record<string, number> = {};

  for (const c of cards) {
    counts[c.symbol] = (counts[c.symbol] || 0) + 1;
    enMap[c.symbol] = c.en;
  }

  const symbols = Object.keys(counts);
  const hasC = counts['C'] !== undefined;

  // 1. Organic and Carbon Compounds (Hill system / IUPAC standard structural formulas)
  if (hasC) {
    if (counts['C'] === 1 && counts['O'] === 1 && symbols.length === 2) return 'CO';
    if (counts['C'] === 1 && counts['S'] === 1 && symbols.length === 2) return 'CS';
    if (counts['C'] === 1 && counts['O'] === 2 && symbols.length === 2) return 'CO₂';
    if (counts['C'] === 1 && counts['S'] === 2 && symbols.length === 2) return 'CS₂';
    if (counts['C'] === 1 && counts['O'] === 1 && counts['S'] === 1 && symbols.length === 3) return 'COS';
    if (counts['C'] === 1 && counts['H'] === 1 && counts['N'] === 1 && symbols.length === 3) return 'HCN';
    if (counts['C'] === 1 && counts['H'] === 1 && counts['P'] === 1 && symbols.length === 3) return 'HCP';
    if (counts['C'] === 1 && counts['Cl'] === 1 && counts['N'] === 1 && symbols.length === 3) return 'ClCN';
    if (counts['C'] === 1 && counts['F'] === 1 && counts['N'] === 1 && symbols.length === 3) return 'FCN';
    if (counts['C'] === 1 && counts['Br'] === 1 && counts['N'] === 1 && symbols.length === 3) return 'BrCN';
    if (counts['C'] === 1 && counts['I'] === 1 && counts['N'] === 1 && symbols.length === 3) return 'ICN';
    if (counts['C'] === 1 && counts['H'] === 2 && counts['O'] === 1 && symbols.length === 3) return 'H₂CO';
    if (counts['C'] === 1 && counts['O'] === 1 && counts['Cl'] === 2 && symbols.length === 3) return 'COCl₂';
    if (counts['C'] === 1 && counts['O'] === 1 && counts['F'] === 2 && symbols.length === 3) return 'COF₂';
    if (counts['C'] === 1 && counts['S'] === 1 && counts['Cl'] === 2 && symbols.length === 3) return 'CSCl₂';
    if (counts['C'] === 2 && counts['H'] === 2 && counts['O'] === 1 && symbols.length === 3) return 'H₂C₂O';
    if (counts['C'] === 3 && counts['O'] === 2 && symbols.length === 2) return 'C₃O₂';

    symbols.sort((a, b) => {
      if (a === 'C') return -1;
      if (b === 'C') return 1;
      if (a === 'H') return -1;
      if (b === 'H') return 1;
      return a.localeCompare(b);
    });
    return symbols.map(s => `${s}${toSubscript(counts[s])}`).join('');
  }

  // 2. Inorganic Compounds (Electropositive / Cation / Center first, Electronegative last)
  if (counts['N'] && counts['H'] && symbols.length === 2) return `NH${toSubscript(counts['H'])}`;
  if (counts['P'] && counts['H'] && symbols.length === 2) return `PH${toSubscript(counts['H'])}`;
  if (counts['H'] && (counts['O'] || counts['S']) && symbols.length === 2) {
    const nonH = symbols.find(s => s !== 'H')!;
    return `H${toSubscript(counts['H'])}${nonH}${toSubscript(counts[nonH])}`;
  }
  if (counts['H'] && counts['F'] && symbols.length === 2) return 'HF';
  if (counts['H'] && counts['Cl'] && symbols.length === 2) return 'HCl';
  if (counts['H'] && counts['Br'] && symbols.length === 2) return 'HBr';
  if (counts['H'] && counts['I'] && symbols.length === 2) return 'HI';
  if (counts['Si'] && counts['O']) return `SiO${toSubscript(counts['O'])}`;
  if (counts['Si'] && counts['H']) return `SiH${toSubscript(counts['H'])}`;
  if (counts['Si'] && counts['Cl']) return `SiCl${toSubscript(counts['Cl'])}`;
  if (counts['Si'] && counts['F']) return `SiF${toSubscript(counts['F'])}`;
  if (counts['S'] && counts['O']) return `SO${toSubscript(counts['O'])}`;
  if (counts['N'] && counts['O']) return `N${toSubscript(counts['N'])}O${toSubscript(counts['O'])}`;

  // Default inorganic sorting: Low electronegativity to high electronegativity
  symbols.sort((a, b) => {
    const enA = enMap[a] ?? 2.5;
    const enB = enMap[b] ?? 2.5;
    if (Math.abs(enA - enB) > 0.05) {
      return enA - enB; // Cation / metal first (e.g. Na before Cl -> NaCl; Ca before O -> CaO; Si before O -> SiO2)
    }
    return a.localeCompare(b);
  });

  return symbols.map(s => `${s}${toSubscript(counts[s])}`).join('');
}

export function getPokerHierarchyInfo(rank: number, isValid: boolean, isCarbonRadical?: boolean): { title: string; tier: string; shortTitle: string } {
  if (!isValid || rank === 0) {
    if (isCarbonRadical) {
      return { title: '¡DERROTA MOLECULAR! (Radical Inestable)', shortTitle: '¡Derrota Molecular!', tier: 'Inestable (Rango 0)' };
    }
    return { title: 'Carta Alta / Sin Combinación', shortTitle: 'Sin Combinación', tier: 'Rango 0' };
  }
  switch (rank) {
    case 8:
      return { title: 'Flor Imperial (Octeto Orgánico Perfecto)', shortTitle: 'Flor Imperial', tier: 'Rango 8' };
    case 7:
      return { title: 'Escalera de Color (Cadena Conjugada)', shortTitle: 'Escalera de Color', tier: 'Rango 7' };
    case 6:
      return { title: 'Póker (Molécula Tetratómica)', shortTitle: 'Póker Tetratómico', tier: 'Rango 6' };
    case 5:
      return { title: 'Full House (Enlace Covalente Triple)', shortTitle: 'Full House', tier: 'Rango 5' };
    case 4:
      return { title: 'Trío Molecular (Molécula Triatómica)', shortTitle: 'Trío Molecular', tier: 'Rango 4' };
    case 3:
      return { title: 'Doble Pareja (Enlace Covalente Doble)', shortTitle: 'Doble Pareja', tier: 'Rango 3' };
    case 2:
      return { title: 'Pareja Química (Enlace Simple / Sal Binaria)', shortTitle: 'Pareja Química', tier: 'Rango 2' };
    case 1:
      return { title: 'Gas Inerte Natural (Octeto Espontáneo)', shortTitle: 'Gas Inerte', tier: 'Rango 1' };
    default:
      return { title: `Rango ${rank}`, shortTitle: `Rango ${rank}`, tier: `Rango ${rank}` };
  }
}

function makeCarbonRadicalRejection(selected: ElementCard[], formula: string, customReason?: string): EvaluationResult {
  const carbonCount = selected.filter(c => c.symbol === 'C').length;
  const hasMultipleC = carbonCount >= 2;

  let reason = customReason;
  if (!reason) {
    if (hasMultipleC) {
      reason = `La estructura contiene ${carbonCount} átomos de Carbono con valencias insatisfechas y enlaces abiertos. Para formar una molécula orgánica estable, cada carbono debe cerrar rigurosamente sus 4 enlaces (tetravalencia) con hidrógenos o sustituyentes adecuados sin dejar cabos sueltos ni electrones desapareados.`;
    } else {
      reason = 'El átomo de Carbono (C) posee valencias insatisfechas y electrones libres. Carece de los átomos o hidrógenos necesarios para saturar sus 4 enlaces covalentes y cerrar su octeto.';
    }
  }

  return {
    rank: 0,
    name: '¡DERROTA MOLECULAR! Radical Inestable',
    pokerHandRank: '¡DERROTA MOLECULAR! (Radical Inestable)',
    hierarchyTier: 'Inestable (Rango 0)',
    formula,
    desc: `¡DERROTA MOLECULAR! ${reason} Al dejar valencias del carbono al descubierto con electrones libres, la especie es un radical altamente inestable prohibido en la naturaleza.`,
    bondType: 'Radical Inestable (Prohibido)',
    mechanism: 'Valencias insatisfechas en carbono: Cadena insaturada con electrones libres que violan la estabilidad química.',
    tiebreaker: 0,
    cards: selected,
    isValid: false,
    bondDetails: {},
  };
}

function makeGeneralInvalidRejection(selected: ElementCard[], formula: string, customReason: string): EvaluationResult {
  return {
    rank: 0,
    name: '¡Inválido! Esta molécula tiene un octeto incompleto',
    pokerHandRank: 'Carta Alta / Sin Combinación',
    hierarchyTier: 'Rango 0',
    formula,
    desc: `¡Inválido! ${customReason}`,
    bondType: 'Octeto Incompleto',
    mechanism: 'Los átomos no completan sus 8 electrones de valencia (ni dueto en H).',
    tiebreaker: 0,
    cards: selected,
    isValid: false,
    bondDetails: {},
  };
}

const evalCache = new Map<string, EvaluationResult>();

export function evaluateCards(selected: ElementCard[]): EvaluationResult {
  if (!selected || selected.length === 0) {
    return {
      rank: 0,
      name: 'Ninguna carta seleccionada',
      pokerHandRank: 'Sin Combinación',
      hierarchyTier: 'Rango 0',
      formula: '',
      desc: 'Selecciona de 1 a 5 cartas para formar una molécula.',
      bondType: '',
      mechanism: '',
      tiebreaker: 0,
      cards: [],
      isValid: false,
      bondDetails: {},
    };
  }

  const cacheKey = selected.map(c => c.id).sort().join('|');
  const cached = evalCache.get(cacheKey);
  if (cached) return cached;

  const result = computeEvaluateCards(selected);
  const isCarbonRadical = !result.isValid && selected.some(c => c.symbol === 'C');
  const hierarchy = getPokerHierarchyInfo(result.rank, result.isValid, isCarbonRadical);
  if (!result.pokerHandRank) {
    result.pokerHandRank = hierarchy.title;
  }
  if (!result.hierarchyTier) {
    result.hierarchyTier = hierarchy.tier;
  }

  if (evalCache.size > 2000) evalCache.clear();
  evalCache.set(cacheKey, result);
  return result;
}

// Helper: checks if 4 cards can form 2 independent stable diatomic molecules
function tryFormDoubleDiatomic(cards: ElementCard[]): EvaluationResult | null {
  if (cards.length !== 4) return null;
  const partitions: [[number, number], [number, number]][] = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
  ];

  let bestResult: EvaluationResult | null = null;
  let bestTiebreaker = -1;

  for (const [pairAIdx, pairBIdx] of partitions) {
    const pairA = [cards[pairAIdx[0]], cards[pairAIdx[1]]];
    const pairB = [cards[pairBIdx[0]], cards[pairBIdx[1]]];

    const evalA = computeEvaluateReactiveCards(pairA);
    const evalB = computeEvaluateReactiveCards(pairB);

    if (evalA.isValid && evalB.isValid) {
      const natureA = evalA.chemicalNature || classifyChemicalNature(evalA.formula || '', pairA, evalA.name);
      const natureB = evalB.chemicalNature || classifyChemicalNature(evalB.formula || '', pairB, evalB.name);
      const overallNature: ChemicalNature =
        CHEMICAL_NATURE_ORDER[natureA] >= CHEMICAL_NATURE_ORDER[natureB] ? natureA : natureB;

      const overallRank = Math.max(evalA.rank, evalB.rank);
      const tiebreakerVal = computeTiebreaker({
        moleculeCount: 2,
        nature: overallNature,
        cards,
      });

      if (tiebreakerVal > bestTiebreaker) {
        bestTiebreaker = tiebreakerVal;

        const isIdentical = evalA.formula === evalB.formula;
        const formulaStr = isIdentical ? `2 ${evalA.formula}` : `${evalA.formula} + ${evalB.formula}`;
        const nameStr = isIdentical
          ? `Doble Diatómico (${formulaStr})`
          : `Doble Diatómico (${evalA.name} + ${evalB.name})`;

        bestResult = {
          rank: overallRank,
          name: nameStr,
          formula: formulaStr,
          desc: `¡Doble molécula diatómica independiente! Se forman 2 moléculas estables con octetos cerrados simultáneamente: ${evalA.name} (${evalA.formula}) y ${evalB.name} (${evalB.formula}).`,
          bondType: `${evalA.bondType} / ${evalB.bondType}`,
          mechanism: `Formación de 2 moléculas independientes cerradas. Ambos enlaces satisfacen la regla del octeto en todos sus átomos.`,
          isValid: true,
          cards,
          moleculeCount: 2,
          chemicalNature: overallNature,
          subMolecules: [
            {
              formula: evalA.formula || '',
              name: evalA.name,
              rank: evalA.rank,
              chemicalNature: natureA,
              cards: pairA,
              bondType: evalA.bondType,
            },
            {
              formula: evalB.formula || '',
              name: evalB.name,
              rank: evalB.rank,
              chemicalNature: natureB,
              cards: pairB,
              bondType: evalB.bondType,
            },
          ],
          tiebreaker: tiebreakerVal,
          bondDetails: {
            ...evalA.bondDetails,
            ...evalB.bondDetails,
          },
        };
      }
    }
  }

  return bestResult;
}

// Helper: checks if 5 cards can form 1 Triatomic + 1 Diatomic molecule (e.g. H2O + H2, CO2 + NaCl)
function tryFormTriatomicAndDiatomic(cards: ElementCard[]): EvaluationResult | null {
  if (cards.length !== 5) return null;

  const subsets3: number[][] = [
    [0, 1, 2], [0, 1, 3], [0, 1, 4], [0, 2, 3], [0, 2, 4],
    [0, 3, 4], [1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4],
  ];

  let bestResult: EvaluationResult | null = null;
  let bestTiebreaker = -1;

  for (const idxs of subsets3) {
    const subset3 = idxs.map(i => cards[i]);
    const subset2 = [0, 1, 2, 3, 4].filter(i => !idxs.includes(i)).map(i => cards[i]);

    const eval3 = computeEvaluateReactiveCards(subset3);
    const eval2 = computeEvaluateReactiveCards(subset2);

    if (eval3.isValid && eval2.isValid) {
      const nature3 = eval3.chemicalNature || classifyChemicalNature(eval3.formula || '', subset3, eval3.name);
      const nature2 = eval2.chemicalNature || classifyChemicalNature(eval2.formula || '', subset2, eval2.name);
      const overallNature: ChemicalNature =
        CHEMICAL_NATURE_ORDER[nature3] >= CHEMICAL_NATURE_ORDER[nature2] ? nature3 : nature2;

      const overallRank = Math.max(eval3.rank, eval2.rank);
      const tiebreakerVal = computeTiebreaker({
        moleculeCount: 2,
        nature: overallNature,
        cards,
      });

      if (tiebreakerVal > bestTiebreaker) {
        bestTiebreaker = tiebreakerVal;
        const formulaStr = `${eval3.formula} + ${eval2.formula}`;
        const nameStr = `${eval3.name} + ${eval2.name} (2 Moléculas)`;

        bestResult = {
          rank: overallRank,
          name: nameStr,
          formula: formulaStr,
          desc: `Formación simultánea de 2 moléculas independientes estables con octetos cerrados: ${eval3.name} (${eval3.formula}) y ${eval2.name} (${eval2.formula}).`,
          bondType: `${eval3.bondType} / ${eval2.bondType}`,
          mechanism: `Combinación bi-molecular coordinada con octetos completos en todos sus átomos (3 átomos + 2 átomos).`,
          isValid: true,
          cards,
          moleculeCount: 2,
          chemicalNature: overallNature,
          subMolecules: [
            {
              formula: eval3.formula || '',
              name: eval3.name,
              rank: eval3.rank,
              chemicalNature: nature3,
              cards: subset3,
              bondType: eval3.bondType,
            },
            {
              formula: eval2.formula || '',
              name: eval2.name,
              rank: eval2.rank,
              chemicalNature: nature2,
              cards: subset2,
              bondType: eval2.bondType,
            },
          ],
          tiebreaker: tiebreakerVal,
          bondDetails: {
            ...eval3.bondDetails,
            ...eval2.bondDetails,
          },
        };
      }
    }
  }

  return bestResult;
}

// Helper: checks if 4 cards form 2 Diatomics with 1 companion card (kicker)
function tryFormDoubleDiatomicWithCompanion(cards: ElementCard[]): EvaluationResult | null {
  if (cards.length !== 5) return null;

  let bestResult: EvaluationResult | null = null;
  let bestTiebreaker = -1;

  for (let i = 0; i < cards.length; i++) {
    const companion = cards[i];
    const subset4 = cards.filter((_, idx) => idx !== i);
    const res = tryFormDoubleDiatomic(subset4);
    if (res && res.isValid) {
      if (res.tiebreaker > bestTiebreaker) {
        bestTiebreaker = res.tiebreaker;
        bestResult = {
          ...res,
          name: `${res.name} + Átomo Acompañante (${companion.symbol})`,
          formula: `${res.formula} · ${companion.symbol}`,
          desc: `${res.desc} (La carta de ${companion.name} queda como átomo acompañante sin enlazarse).`,
          cards,
        };
      }
    }
  }

  return bestResult;
}

function computeEvaluateCards(selected: ElementCard[]): EvaluationResult {
  const result: EvaluationResult = {
    rank: 0,
    name: 'Ninguna',
    formula: '',
    desc: '',
    bondType: '',
    mechanism: '',
    tiebreaker: 0,
    cards: selected,
    isValid: false,
    bondDetails: {},
  };

  if (selected.length === 0) {
    result.name = 'Ninguna carta seleccionada';
    result.desc = 'Selecciona de 1 a 5 cartas para formar una molécula con octetos cerrados.';
    return result;
  }

  // Identify Noble Gases (Group 8: Ne, Ar)
  const nobleGases = selected.filter(c => c.group === 8);
  const reactiveCards = selected.filter(c => c.group !== 8);

  // CASE 1: All selected cards are Noble Gases (Pure Noble Gas Hand)
  if (nobleGases.length > 0 && reactiveCards.length === 0) {
    const tb = computeTiebreaker({
      moleculeCount: nobleGases.length,
      nature: 'Neutro',
      cards: selected,
      nobleGasBonusCount: nobleGases.length,
    });

    result.rank = 1;
    result.formula = nobleGases.map(g => g.symbol).join(' · ');
    result.name = nobleGases.length === 1
      ? `Gas Noble Inerte (${nobleGases[0].name})`
      : `Gases Nobles Inertes (${nobleGases.map(g => g.name).join(' + ')})`;
    result.desc = `Capa de valencia saturada con 8 electrones (Octeto Natural). Cumple la Ley del Octeto de forma inerte sin necesidad de formar enlaces (+${nobleGases.length * 100} pts extra).`;
    result.bondType = 'Inerte (Octeto Natural Completo)';
    result.mechanism = 'Configuración electrónica de máxima estabilidad (s²p⁶ con 8 e⁻). No requiere transferir ni compartir electrones.';
    result.isValid = true;
    result.centerId = nobleGases[0].id;
    result.chemicalNature = 'Neutro';
    result.moleculeCount = nobleGases.length;
    result.tiebreaker = tb;
    result.nobleGasBonus = {
      count: nobleGases.length,
      points: nobleGases.length * 100,
      cards: nobleGases,
      desc: 'Ley del Octeto Natural Cumplida',
    };
    return result;
  }

  // CASE 2: Mixed Cards (Reactive Molecule + Noble Gas Bonus)
  if (nobleGases.length > 0 && reactiveCards.length > 0) {
    const reactiveEval = computeEvaluateReactiveCards(reactiveCards);

    if (reactiveEval.isValid) {
      const nature = reactiveEval.chemicalNature || classifyChemicalNature(reactiveEval.formula || '', reactiveCards, reactiveEval.name);
      const molCount = (reactiveEval.moleculeCount || 1) + nobleGases.length;
      const tb = computeTiebreaker({
        moleculeCount: molCount,
        nature,
        cards: selected,
        nobleGasBonusCount: nobleGases.length,
      });

      result.rank = reactiveEval.rank;
      result.formula = `${reactiveEval.formula} + ${nobleGases.map(g => g.symbol).join(' + ')}`;
      result.name = `${reactiveEval.name} + Bonus Gas Noble (+${nobleGases.length * 100} pts)`;
      result.desc = `${reactiveEval.desc} ✨ ¡BONUS LEY DEL OCTETO!: Posee ${nobleGases.map(g => `${g.name} (${g.symbol})`).join(', ')} con octeto natural cerrado (8 e⁻) sumando +${nobleGases.length * 100} pts extra.`;
      result.bondType = reactiveEval.bondType;
      result.mechanism = reactiveEval.mechanism;
      result.isValid = true;
      result.centerId = reactiveEval.centerId;
      result.bondDetails = reactiveEval.bondDetails;
      result.chemicalNature = nature;
      result.moleculeCount = molCount;
      result.subMolecules = reactiveEval.subMolecules;
      result.tiebreaker = tb;
      result.nobleGasBonus = {
        count: nobleGases.length,
        points: nobleGases.length * 100,
        cards: nobleGases,
        desc: `Bonus Ley del Octeto Natural (${nobleGases.map(g => g.symbol).join(', ')})`,
      };
      return result;
    } else {
      result.rank = 0;
      result.formula = `${reactiveEval.formula} + ${nobleGases.map(g => g.symbol).join(' + ')}`;
      result.name = reactiveEval.name;
      result.desc = `${reactiveEval.desc} (Nota: El gas noble ${nobleGases.map(g => g.symbol).join(', ')} tiene octeto natural, pero las demás cartas reactivas no logran cerrar sus octetos).`;
      result.bondType = reactiveEval.bondType;
      result.mechanism = reactiveEval.mechanism;
      result.isValid = false;
      result.tiebreaker = nobleGases.length * 15;
      result.nobleGasBonus = {
        count: nobleGases.length,
        points: nobleGases.length * 50,
        cards: nobleGases,
        desc: `Gas Noble Presente (${nobleGases.map(g => g.symbol).join(', ')})`,
      };
      return result;
    }
  }

  // CASE 3: Only Reactive Cards (Standard Molecule Evaluation)
  const reactiveRes = computeEvaluateReactiveCards(selected);
  if (reactiveRes.isValid) {
    if (!reactiveRes.chemicalNature) {
      reactiveRes.chemicalNature = classifyChemicalNature(reactiveRes.formula || '', reactiveRes.cards, reactiveRes.name);
    }
    if (!reactiveRes.moleculeCount) {
      reactiveRes.moleculeCount = 1;
    }
    reactiveRes.tiebreaker = computeTiebreaker({
      moleculeCount: reactiveRes.moleculeCount,
      nature: reactiveRes.chemicalNature,
      cards: reactiveRes.cards,
    });
  } else {
    reactiveRes.tiebreaker = 0;
  }
  return reactiveRes;
}

function computeEvaluateReactiveCards(selected: ElementCard[]): EvaluationResult {
  const result: EvaluationResult = {
    rank: 0,
    name: 'Ninguna',
    formula: generateFormula(selected),
    desc: '',
    bondType: '',
    mechanism: '',
    tiebreaker: 0,
    cards: selected,
    isValid: false,
    bondDetails: {},
  };

  const maxEn = Math.max(...selected.map(c => c.en));
  const minEn = Math.min(...selected.map(c => c.en));
  const deltaEn = maxEn - minEn;
  result.tiebreaker = 0; // No electronegativity tiebreaker

  // General bond type characterization based on ΔEN
  if (deltaEn >= 1.7) {
    result.bondType = 'Iónico';
    result.mechanism = `Transferencia de electrones (ΔEN = ${deltaEn.toFixed(2)}). Formación de aniones y cationes con octetos completos.`;
  } else if (deltaEn >= 0.4) {
    result.bondType = 'Covalente Polar';
    result.mechanism = `Compartición asimétrica de electrones (ΔEN = ${deltaEn.toFixed(2)}). Octetos completos con dipolo neto.`;
  } else {
    result.bondType = 'Covalente Apolar';
    result.mechanism = `Compartición simétrica y equitativa de electrones (ΔEN = ${deltaEn.toFixed(2)}).`;
  }

  // =========================================================================
  // REGLA ESTRICTA DE OCTETOS (NIVEL SECUNDARIA):
  // PROHIBICIÓN TOTAL DE BORO (B), ALUMINIO (Al) Y OCTETOS INCOMPLETOS
  // =========================================================================
  if (selected.some(c => c.symbol === 'B')) {
    result.rank = 0;
    result.name = '¡Inválido! Esta molécula tiene un octeto incompleto';
    result.desc = '¡Inválido! Esta molécula tiene un octeto incompleto. En la regla clásica del octeto (nivel secundaria), el Boro (B, grupo 3) solo forma 6 electrones a su alrededor (sexteto / deficiencia electrónica) y queda terminantemente prohibido.';
    result.bondType = 'Octeto Incompleto (Prohibido)';
    result.mechanism = 'Deficiencia electrónica: El Boro no puede completar los 8 electrones requeridos por la regla del octeto clásica.';
    result.isValid = false;
    return result;
  }

  if (selected.some(c => c.symbol === 'Al')) {
    result.rank = 0;
    result.name = '¡Inválido! Esta molécula tiene un octeto incompleto';
    result.desc = '¡Inválido! Esta molécula tiene un octeto incompleto. El Aluminio como átomo central en moléculas covalentes solo alcanza 6 electrones de valencia, violando la regla del octeto clásica de 8 electrones.';
    result.bondType = 'Octeto Incompleto (Prohibido)';
    result.mechanism = 'Deficiencia electrónica: El Aluminio no alcanza los 8 electrones obligatorios.';
    result.isValid = false;
    return result;
  }

  // --- 1 CARTA: Átomos aislados sin octeto completo (< 8 electrones) ---
  if (selected.length === 1) {
    const single = selected[0];
    if (single.symbol === 'C') {
      return makeCarbonRadicalRejection(
        selected,
        result.formula,
        'El átomo aislado de Carbono (C) posee 4 valencias insatisfechas y electrones libres. Carece de los 4 enlaces (o hidrógenos) necesarios para saturar su octeto.'
      );
    }
    const reqText = single.symbol === 'H' ? '2 electrones de dueto' : '8 electrones de valencia';
    return makeGeneralInvalidRejection(
      selected,
      result.formula,
      `Esta molécula tiene un octeto incompleto. El átomo aislado de ${single.name} (${single.symbol}) solo posee ${single.group} electrón${single.group > 1 ? 'es' : ''} de valencia (requiere ${reqText} para estabilizarse).`
    );
  }

  const symbols = selected.map(c => c.symbol);
  const groups = selected.map(c => c.group);
  const totalValence = groups.reduce((a, b) => a + b, 0);

  // Group helpers
  const countGroup = (g: number) => selected.filter(c => c.group === g).length;
  const countSymbol = (s: string) => selected.filter(c => c.symbol === s).length;
  const isMonovalentLigand = (c: ElementCard) => c.symbol === 'H' || c.group === 7;

  // --- 2 CARTAS: Diatómicas y Enlaces Binarios ---
  if (selected.length === 2) {
    const [c1, c2] = selected;

    // H2 (Ambos Hidrógenos completan el dueto obligatorio de 2 electrones)
    if (c1.symbol === 'H' && c2.symbol === 'H') {
      result.rank = 2;
      result.name = 'Hidrógeno Molecular (H₂)';
      result.desc = 'Enlace covalente simple apolar (H-H). Ambos átomos de Hidrógeno completan el dueto estable de 2 electrones.';
      result.isValid = true;
      result.centerId = c1.id;
      result.bondDetails = { [c2.id]: 1 };
      return result;
    }

    // Halógeno + Halógeno (F2, Cl2, Br2, I2, ClF, BrCl, etc.) -> Ambos con 8 electrones (1 enlace + 3 pares solitarios)
    if (c1.group === 7 && c2.group === 7) {
      result.rank = 2;
      result.name = `Halógeno Diatómico (${result.formula})`;
      result.desc = `Enlace covalente simple (${c1.symbol}-${c2.symbol}). Cada halógeno aporta 1 e⁻ compartiendo 1 par y reteniendo 3 pares solitarios (8 electrones exactos cada uno).`;
      result.isValid = true;
      result.centerId = c1.id;
      result.bondDetails = { [c2.id]: 1 };
      return result;
    }

    // H + Halógeno (HF, HCl, HBr, HI) -> Halógeno: 8 electrones, H: 2 electrones
    if ((c1.symbol === 'H' && c2.group === 7) || (c2.symbol === 'H' && c1.group === 7)) {
      const halogen = c1.group === 7 ? c1 : c2;
      const hyd = c1.symbol === 'H' ? c1 : c2;
      result.rank = 2;
      result.name = `Haluro de Hidrógeno (${result.formula})`;
      result.desc = `Enlace covalente polar simple (H-${halogen.symbol}). El halógeno (${halogen.name}) completa su octeto de 8 electrones (1 enlace + 3 pares libres) y el Hidrógeno su dueto de 2 electrones.`;
      result.isValid = true;
      result.centerId = halogen.id;
      result.bondDetails = { [hyd.id]: 1 };
      return result;
    }

    // Metal Alcalino (Grupo 1) + Halógeno (Grupo 7) -> Sal Iónica (NaCl, LiF, KBr, etc.)
    if ((c1.group === 1 && c1.symbol !== 'H' && c2.group === 7) || (c2.group === 1 && c2.symbol !== 'H' && c1.group === 7)) {
      const metal = c1.group === 1 ? c1 : c2;
      const nonMetal = c1.group === 7 ? c1 : c2;
      result.rank = 2;
      result.name = `Sal Binaria Iónica (${result.formula})`;
      result.desc = `Enlace iónico: El metal ${metal.name} (${metal.symbol}) cede 1 e⁻ al halógeno ${nonMetal.name} (${nonMetal.symbol}). Ambos iones adquieren configuración de gas noble con octeto cerrado (8 electrones).`;
      result.isValid = true;
      result.centerId = metal.id;
      result.bondDetails = { [nonMetal.id]: 1 };
      return result;
    }

    // Metal Alcalino + H -> Hidruro Metálico (LiH, NaH, KH) -> H⁻ con 2 electrones
    if ((c1.group === 1 && c1.symbol !== 'H' && c2.symbol === 'H') || (c2.group === 1 && c2.symbol !== 'H' && c1.symbol === 'H')) {
      const metal = c1.group === 1 ? c1 : c2;
      result.rank = 2;
      result.name = `Hidruro Metálico (${result.formula})`;
      result.desc = `Enlace iónico/polar: El metal ${metal.name} (${metal.symbol}) cede 1 e⁻ formando el catión ${metal.symbol}⁺ y el anión hidruro (H⁻) con dueto cerrado de 2 electrones.`;
      result.isValid = true;
      result.centerId = c1.id;
      result.bondDetails = { [c2.id]: 1 };
      return result;
    }

    // Grupo 6 + Grupo 6 (O2, S2, SO) -> Enlace Doble (8 electrones cada uno: 4 compartidos + 4 en 2 pares solitarios)
    if (c1.group === 6 && c2.group === 6) {
      result.rank = 3;
      result.name = c1.symbol === 'O' && c2.symbol === 'O' ? 'Oxígeno Molecular (O₂)' : `Diatómico del Grupo 16 (${result.formula})`;
      result.desc = `Enlace doble covalente (${c1.symbol}=${c2.symbol}). Ambos átomos comparten 4 electrones (2 enlaces) y retienen 2 pares solitarios cada uno, completando 8 electrones.`;
      result.isValid = true;
      result.centerId = c1.id;
      result.bondDetails = { [c2.id]: 2 };
      return result;
    }

    // Metal Alcalinotérreo (Grupo 2: Be, Mg, Ca) + Grupo 6 (O, S) -> Óxido / Sulfuro Iónico (CaO, MgO)
    if ((c1.group === 2 && c2.group === 6) || (c2.group === 2 && c1.group === 6)) {
      const metal = c1.group === 2 ? c1 : c2;
      const nonMetal = c1.group === 6 ? c1 : c2;
      result.rank = 3;
      result.name = `Óxido/Sulfuro Iónico (${result.formula})`;
      result.desc = `Enlace iónico: El metal divalente ${metal.name} (${metal.symbol}) cede 2 e⁻ al ${nonMetal.name} (${nonMetal.symbol}), completando ambos sus octetos de 8 electrones (${metal.symbol}²⁺ y ${nonMetal.symbol}²⁻).`;
      result.isValid = true;
      result.centerId = metal.id;
      result.bondDetails = { [nonMetal.id]: 2 };
      return result;
    }

    // Grupo 5 + Grupo 5 (N2, P2) -> Enlace Triple (8 electrones cada uno: 6 compartidos + 2 en 1 par solitario)
    if (c1.group === 5 && c2.group === 5) {
      result.rank = 5;
      result.name = c1.symbol === 'N' && c2.symbol === 'N' ? 'Nitrógeno Molecular (N₂)' : `Diatómico del Grupo 15 (${result.formula})`;
      result.desc = `Enlace triple covalente (${c1.symbol}≡${c2.symbol}). Ambos átomos comparten 6 electrones (3 enlaces) y retienen 1 par libre cada uno, cerrando perfectamente su octeto de 8 electrones.`;
      result.isValid = true;
      result.centerId = c1.id;
      result.bondDetails = { [c2.id]: 3 };
      return result;
    }

    // Carbono (C ÚNICAMENTE) + O o S (Grupo 6) -> Monóxido de Carbono (CO) o Monosulfuro de Carbono (CS)
    if ((c1.symbol === 'C' && c2.group === 6) || (c2.symbol === 'C' && c1.group === 6)) {
      const carbon = c1.symbol === 'C' ? c1 : c2;
      const oxy = c1.group === 6 ? c1 : c2;
      result.rank = 5;
      result.name = oxy.symbol === 'O' ? 'Monóxido de Carbono (CO)' : 'Monosulfuro de Carbono (CS)';
      result.desc = `Enlace triple covalente coordinado (:C≡${oxy.symbol}:). El ${oxy.name} aporta un par libre para formar el tercer enlace dativo, completando 8 electrones tanto en Carbono como en ${oxy.name}.`;
      result.isValid = true;
      result.centerId = carbon.id;
      result.bondDetails = { [oxy.id]: 3 };
      return result;
    }

    // Intento de Silicio diatómico
    if (symbols.includes('Si')) {
      return makeGeneralInvalidRejection(
        selected,
        result.formula,
        'El Silicio (Si) no forma monóxidos diatómicos triples estables como el carbono; requiere obligatoriamente 4 enlaces covalentes (como en el Dióxido de Silicio SiO₂ o Silano SiH₄) para cerrar su octeto de 8 electrones.'
      );
    }

    // Invalid 2-card with Carbon -> Carbon Radical Rejection
    if (selected.some(c => c.symbol === 'C')) {
      return makeCarbonRadicalRejection(
        selected,
        result.formula,
        'Esta combinación deja al descubierto las valencias del carbono con electrones desapareados. Carece de los hidrógenos y enlaces necesarios para saturar la molécula.'
      );
    }

    // Invalid 2-card combination -> Octeto incompleto
    return makeGeneralInvalidRejection(
      selected,
      result.formula,
      `Esta molécula tiene un octeto incompleto. La combinación suma ${totalValence} electrones y no logra cerrar los 8 electrones requeridos (ni el dueto de 2 e⁻ en Hidrógeno).`
    );
  }

  // --- 3 CARTAS: Triatómicas ---
  if (selected.length === 3) {
    const g6Centrals = selected.filter(c => c.group === 6);
    const monoLigands = selected.filter(isMonovalentLigand);
    const g4Centrals = selected.filter(c => c.group === 4);
    const g6Ligands = selected.filter(c => c.group === 6);
    const g5Ligands = selected.filter(c => c.group === 5);

    // 1) Familia del Agua (Grupo 6 central: O o S con 2 ligandos monovalentes H o Halógenos: H2O, H2S, OF2, OCl2)
    if (g6Centrals.length === 1 && monoLigands.length === 2) {
      const center = g6Centrals[0];
      const ligands = selected.filter(c => c.id !== center.id);
      const allH = ligands.every(l => l.symbol === 'H');
      const hasH = ligands.some(l => l.symbol === 'H');

      let molName = `Molécula Triatómica Angular (${result.formula})`;
      if (center.symbol === 'O' && allH) molName = 'Agua (H₂O)';
      else if (center.symbol === 'S' && allH) molName = 'Sulfuro de Hidrógeno (H₂S)';
      else if (center.symbol === 'O' && countSymbol('F') === 2) molName = 'Difluoruro de Oxígeno (OF₂)';
      else if (center.symbol === 'O' && countSymbol('Cl') === 2) molName = 'Dicloruro de Oxígeno (OCl₂)';
      else if (center.symbol === 'S' && countSymbol('Cl') === 2) molName = 'Dicloruro de Azufre (SCl₂)';

      result.rank = 4;
      result.name = molName;

      const ligandDesc = allH
        ? 'ambos átomos de Hidrógeno completan su dueto (2 e⁻ cada uno)'
        : !hasH
        ? `ambos halógenos (${ligands[0].symbol}, ${ligands[1].symbol}) completan su octeto de 8 electrones (1 enlace simple + 3 pares libres cada uno)`
        : 'el Hidrógeno completa su dueto (2 e⁻) y el halógeno su octeto (8 e⁻ con 3 pares libres)';

      result.desc = `Estructura angular: El átomo central ${center.name} (${center.symbol}) completa 8 electrones (2 enlaces simples + 2 pares solitarios) y ${ligandDesc}.`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [ligands[0].id]: 1, [ligands[1].id]: 1 };
      return result;
    }

    // 2) Familia del Dióxido de Carbono y Dióxido de Silicio (C o Si central con 2 átomos del grupo 6: O o S: CO2, CS2, COS, SiO2)
    if (g4Centrals.length === 1 && g6Ligands.length === 2) {
      const center = g4Centrals[0];
      const ligands = g6Ligands;

      let molName = `Molécula Triatómica Lineal (${result.formula})`;
      if (center.symbol === 'C' && countSymbol('O') === 2) molName = 'Dióxido de Carbono (CO₂)';
      else if (center.symbol === 'C' && countSymbol('S') === 2) molName = 'Disulfuro de Carbono (CS₂)';
      else if (center.symbol === 'C' && countSymbol('O') === 1 && countSymbol('S') === 1) molName = 'Sulfuro de Carbonilo (COS)';
      else if (center.symbol === 'Si' && countSymbol('O') === 2) molName = 'Dióxido de Silicio (SiO₂)';

      result.rank = 4;
      result.name = molName;
      result.desc = `Estructura lineal (${ligands[0].symbol}=${center.symbol}=${ligands[1].symbol}): El átomo central ${center.name} (${center.symbol}) forma 2 dobles enlaces (8 e⁻ compartidos), y cada átomo de ${ligands[0].symbol === ligands[1].symbol ? ligands[0].name : `${ligands[0].name} y ${ligands[1].name}`} completa su octeto de 8 electrones (1 doble enlace + 2 pares libres).`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [ligands[0].id]: 2, [ligands[1].id]: 2 };
      return result;
    }

    // 3) Familia del Cianuro de Hidrógeno y Halocianógenos (C central + 1 grupo 5 [N, P] + 1 monovalente [H, F, Cl, Br, I])
    if (g4Centrals.length === 1 && g4Centrals[0].symbol === 'C' && g5Ligands.length === 1 && monoLigands.length === 1) {
      const center = g4Centrals[0];
      const nLigand = g5Ligands[0];
      const hLigand = monoLigands[0];
      const isHCN = hLigand.symbol === 'H' && nLigand.symbol === 'N';

      let molName = `Halocianógeno (${result.formula})`;
      if (isHCN) molName = 'Cianuro de Hidrógeno (HCN)';
      else if (hLigand.symbol === 'Br' && nLigand.symbol === 'N') molName = 'Bromuro de Cianógeno (BrCN)';
      else if (hLigand.symbol === 'Cl' && nLigand.symbol === 'N') molName = 'Cloruro de Cianógeno (ClCN)';
      else if (hLigand.symbol === 'F' && nLigand.symbol === 'N') molName = 'Fluoruro de Cianógeno (FCN)';
      else if (hLigand.symbol === 'I' && nLigand.symbol === 'N') molName = 'Yoduro de Cianógeno (ICN)';
      else if (hLigand.symbol === 'H' && nLigand.symbol === 'P') molName = 'Fosfacianógeno (HCP)';

      result.rank = 4;
      result.name = molName;

      const isHyd = hLigand.symbol === 'H';
      const ligandEnd = isHyd
        ? 'el Hidrógeno completa su dueto de 2 electrones.'
        : `el ${hLigand.name} (${hLigand.symbol}) completa su octeto de 8 electrones con 1 enlace simple y 3 pares solitarios.`;

      result.desc = `Carbono central tetravalente (${hLigand.symbol}-C≡${nLigand.symbol}). El Carbono (C) y el ${nLigand.name} (${nLigand.symbol}) completan 8 electrones por triple enlace; ${ligandEnd}`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [hLigand.id]: 1, [nLigand.id]: 3 };
      return result;
    }

    // 4) Dihaluros Metálicos Iónicos (1 Metal Grupo 2: Be, Mg, Ca + 2 Halógenos: F, Cl, Br, I: MgCl2, CaCl2)
    const g2Metals = selected.filter(c => c.group === 2);
    const halogens = selected.filter(c => c.group === 7);
    if (g2Metals.length === 1 && halogens.length === 2) {
      const center = g2Metals[0];
      result.rank = 4;
      result.name = `Dihaluro Metálico Iónico (${result.formula})`;
      result.desc = `Enlace iónico: El catión metálico ${center.name} (${center.symbol}²⁺) y ambos aniones haluro (${halogens.map(h => h.symbol).join(', ')}) completan sus octetos estables de 8 electrones.`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [halogens[0].id]: 1, [halogens[1].id]: 1 };
      return result;
    }

    // 5) Óxidos / Sulfuros Alcalinos (2 Metales Grupo 1: Li, Na, K + 1 Grupo 6: O, S: Na2O, K2S)
    const g1Metals = selected.filter(c => c.group === 1 && c.symbol !== 'H');
    if (g1Metals.length === 2 && g6Centrals.length === 1) {
      const center = g6Centrals[0];
      result.rank = 4;
      result.name = `Óxido/Sulfuro Alcalino (${result.formula})`;
      result.desc = `Enlace iónico: Dos metales de ${g1Metals[0].name} ceden 1 e⁻ cada uno al átomo central de ${center.name} (${center.symbol}), completando su octeto aniónico de 8 electrones (${center.symbol}²⁻).`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [g1Metals[0].id]: 1, [g1Metals[1].id]: 1 };
      return result;
    }

    // 6) Ozono y Dióxido de Azufre (3 Grupo 6: O3, SO2)
    if (selected.every(c => c.group === 6)) {
      const center = selected.find(c => c.symbol === 'S') || selected[0];
      const ligands = selected.filter(c => c.id !== center.id);
      result.rank = 4;
      result.name = countSymbol('O') === 3 ? 'Ozono (O₃)' : countSymbol('O') === 2 ? 'Dióxido de Azufre (SO₂)' : `Calcógeno Triatómico (${result.formula})`;
      result.desc = 'Estructura angular resonante: Todos los átomos de calcógeno cierran satisfactoriamente su octeto de 8 electrones de valencia.';
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [ligands[0].id]: 2, [ligands[1].id]: 1 };
      return result;
    }

    // 7) Óxido Nitroso (2 Grupo 5 + 1 Grupo 6: N2O)
    if (countGroup(5) === 2 && countGroup(6) === 1) {
      const center = selected.find(c => c.group === 5)!;
      const ligands = selected.filter(c => c.id !== center.id);
      result.rank = 4;
      result.name = `Óxido Nitroso (${result.formula})`;
      result.desc = 'Estructura lineal resonante (N=N=O): Los tres átomos completan satisfactoriamente su octeto de 8 electrones.';
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [ligands[0].id]: 2, [ligands[1].id]: 2 };
      return result;
    }

    // 8) Hidróxidos Alcalinos (1 Metal Grupo 1 + 1 Grupo 6 [O, S] + 1 H: LiOH, NaOH, KOH)
    const g1Metals3 = selected.filter(c => c.group === 1 && c.symbol !== 'H');
    const hLigands3 = selected.filter(c => c.symbol === 'H');
    if (g1Metals3.length === 1 && g6Centrals.length === 1 && hLigands3.length === 1) {
      const metal = g1Metals3[0];
      const center = g6Centrals[0];
      const isLiOH = metal.symbol === 'Li' && center.symbol === 'O';
      const isNaOH = metal.symbol === 'Na' && center.symbol === 'O';
      const isKOH = metal.symbol === 'K' && center.symbol === 'O';

      result.rank = 4;
      result.name = isLiOH ? 'Hidróxido de Litio (LiOH)' : isNaOH ? 'Hidróxido de Sodio (NaOH)' : isKOH ? 'Hidróxido de Potasio (KOH)' : `Hidróxido/Sal Alcalina (${result.formula})`;
      result.desc = `Compuesto iónico-covalente estable ([${metal.symbol}]⁺[${center.symbol}H]⁻): El átomo de ${center.name} (${center.symbol}) completa su octeto cerrado de 8 electrones (1 enlace covalente simple con H y 3 pares libres con la transferencia del electrón del ${metal.name} ${metal.symbol}⁺). El Hidrógeno completa su dueto estable de 2 e⁻.`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = {
        [metal.id]: 1,
        [hLigands3[0].id]: 1,
      };
      return result;
    }

    // Invalid 3-card with Carbon -> Carbon Radical Rejection
    if (selected.some(c => c.symbol === 'C')) {
      return makeCarbonRadicalRejection(
        selected,
        result.formula,
        'La estructura no cuenta con los hidrógenos ni enlaces requeridos para saturar la cadena de carbono. Las valencias del carbono quedan insatisfechas con electrones libres.'
      );
    }

    // Invalid 3-card combination -> Octeto incompleto
    return makeGeneralInvalidRejection(
      selected,
      result.formula,
      g4Centrals.length > 0
        ? `El átomo central de ${g4Centrals[0].name} requiere 4 enlaces totales para alcanzar 8 electrones.`
        : 'Todos los átomos deben terminar exactamente con 8 electrones de valencia (octeto cerrado).'
    );
  }

  // --- 4 CARTAS: Tetratómicas ---
  if (selected.length === 4) {
    const g5Centrals = selected.filter(c => c.group === 5);
    const monoLigands = selected.filter(isMonovalentLigand);
    const g4Centrals = selected.filter(c => c.group === 4);
    const g6Ligands = selected.filter(c => c.group === 6);

    // 1) Familia del Amoníaco (N o P central con 3 ligandos monovalentes H o Halógenos: NH3, PH3, NF3, NCl3, PCl3)
    if (g5Centrals.length === 1 && monoLigands.length === 3) {
      const center = g5Centrals[0];
      const ligands = selected.filter(c => c.id !== center.id);
      const allH = ligands.every(l => l.symbol === 'H');
      const hasH = ligands.some(l => l.symbol === 'H');

      let molName = `Molécula Tetratómica Piramidal (${result.formula})`;
      if (center.symbol === 'N' && allH) molName = 'Amoníaco (NH₃)';
      else if (center.symbol === 'P' && allH) molName = 'Fosfina (PH₃)';
      else if (center.symbol === 'N' && countSymbol('F') === 3) molName = 'Trifluoruro de Nitrógeno (NF₃)';
      else if (center.symbol === 'N' && countSymbol('Cl') === 3) molName = 'Tricloruro de Nitrógeno (NCl₃)';
      else if (center.symbol === 'P' && countSymbol('Cl') === 3) molName = 'Tricloruro de Fósforo (PCl₃)';
      else if (center.symbol === 'P' && countSymbol('F') === 3) molName = 'Trifluoruro de Fósforo (PF₃)';

      result.rank = 6;
      result.name = molName;

      const ligandDesc = allH
        ? 'los 3 átomos de Hidrógeno completan su dueto de 2 electrones cada uno.'
        : !hasH
        ? `los 3 halógenos (${ligands.map(l => l.symbol).join(', ')}) completan su octeto de 8 electrones (1 enlace + 3 pares solitarios cada uno).`
        : 'los ligandos completan sus duetos (H: 2 e⁻) y octetos (halógenos: 8 e⁻ con 3 pares libres).';

      result.desc = `Geometría piramidal trigonal: El átomo central ${center.name} (${center.symbol}, grupo 5) retiene 1 par libre y forma 3 enlaces simples (total 8 e⁻); ${ligandDesc}`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [ligands[0].id]: 1, [ligands[1].id]: 1, [ligands[2].id]: 1 };
      return result;
    }

    // 2) Familia del Formaldehído y Fosgeno (C central con 1 Oxígeno/Azufre y 2 ligandos monovalentes: H2CO, COCl2, COF2, CSCl2)
    if (g4Centrals.length === 1 && g4Centrals[0].symbol === 'C' && g6Ligands.length === 1 && monoLigands.length === 2) {
      const center = g4Centrals[0];
      const doubleLigand = g6Ligands[0];
      const singleLigands = monoLigands;
      const allH = singleLigands.every(l => l.symbol === 'H');
      const hasH = singleLigands.some(l => l.symbol === 'H');

      let molName = `Carbonilo Plano Tetratómico (${result.formula})`;
      if (center.symbol === 'C' && doubleLigand.symbol === 'O' && allH) molName = 'Formaldehído (H₂CO)';
      else if (center.symbol === 'C' && doubleLigand.symbol === 'O' && countSymbol('Cl') === 2) molName = 'Fosgeno (COCl₂)';
      else if (center.symbol === 'C' && doubleLigand.symbol === 'O' && countSymbol('F') === 2) molName = 'Difluoruro de Carbonilo (COF₂)';
      else if (center.symbol === 'C' && doubleLigand.symbol === 'S' && countSymbol('Cl') === 2) molName = 'Tiofosgeno (CSCl₂)';

      result.rank = 6;
      result.name = molName;

      const singleDesc = allH
        ? 'los 2 átomos de Hidrógeno completan su dueto (2 e⁻ cada uno).'
        : !hasH
        ? `los 2 halógenos (${singleLigands.map(l => l.symbol).join(', ')}) completan su octeto de 8 electrones (1 enlace simple + 3 pares solitarios cada uno).`
        : 'los ligandos monovalentes completan sus duetos u octetos respectivos.';

      result.desc = `Geometría trigonal plana: Carbono central tetravalente con 1 enlace doble a ${doubleLigand.name} (=${doubleLigand.symbol}, 8 e⁻ con 2 pares libres) y 2 enlaces simples (${singleLigands.map(l => l.symbol).join(', ')}); ${singleDesc}`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = {
        [doubleLigand.id]: 2,
        [singleLigands[0].id]: 1,
        [singleLigands[1].id]: 1,
      };
      return result;
    }

    // 3) Familia del Acetileno / Alquinos (2 Carbonos + 2 ligandos monovalentes: H-C≡C-H, Cl-C≡C-Cl)
    if (g4Centrals.length === 2 && g4Centrals.every(c => c.symbol === 'C') && monoLigands.length === 2) {
      const [c1, c2] = g4Centrals;
      const [l1, l2] = monoLigands;
      const isAcetylene = l1.symbol === 'H' && l2.symbol === 'H';

      result.rank = 6;
      result.name = isAcetylene ? 'Acetileno / Etino (H-C≡C-H)' : `Haloalquino (${result.formula})`;
      const ligDesc = isAcetylene
        ? 'ambos Hidrógenos completan su dueto de 2 electrones.'
        : `los ligandos (${l1.symbol}, ${l2.symbol}) completan sus octetos/duetos respectivos.`;

      result.desc = `Alquino lineal (${l1.symbol}-C≡C-${l2.symbol}): Triple enlace entre carbonos (C≡C, 6 e⁻) y 1 enlace simple a cada ligando. Ambos carbonos completan estrictamente sus 4 enlaces (8 e⁻); ${ligDesc}`;
      result.isValid = true;
      result.centerId = c1.id;
      result.bondDetails = { [c2.id]: 3, [l1.id]: 1, [l2.id]: 1 };
      return result;
    }

    // 4) Nitruros / Fosfuros Alcalinos (3 Metales Grupo 1 + 1 Grupo 5: Li3N, Na3P)
    const g1Metals = selected.filter(c => c.group === 1 && c.symbol !== 'H');
    if (g1Metals.length === 3 && g5Centrals.length === 1) {
      const center = g5Centrals[0];
      result.rank = 6;
      result.name = `Nitruro/Fosfuro Alcalino (${result.formula})`;
      result.desc = `Enlace iónico: Tres metales de ${g1Metals[0].name} ceden 1 e⁻ cada uno al ${center.name} (${center.symbol}), completando el octeto aniónico de 8 electrones (${center.symbol}³⁻).`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [g1Metals[0].id]: 1, [g1Metals[1].id]: 1, [g1Metals[2].id]: 1 };
      return result;
    }

    // 5) Trióxido de Azufre (1 S + 3 O: SO3)
    if (countSymbol('S') === 1 && countSymbol('O') === 3) {
      const center = selected.find(c => c.symbol === 'S')!;
      const ligands = selected.filter(c => c.id !== center.id);
      result.rank = 6;
      result.name = 'Trióxido de Azufre (SO₃)';
      result.desc = 'Geometría trigonal plana resonante: El Azufre y los 3 átomos de Oxígeno completan satisfactoriamente sus 8 electrones de valencia.';
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = { [ligands[0].id]: 2, [ligands[1].id]: 1, [ligands[2].id]: 1 };
      return result;
    }

    // 6) Amidas y Fosfuros Alcalinos (1 Metal Grupo 1 + 1 Grupo 5 [N, P] + 2 H: LiNH2, NaNH2, KNH2)
    const g1Metals4 = selected.filter(c => c.group === 1 && c.symbol !== 'H');
    const hLigands4 = selected.filter(c => c.symbol === 'H');
    if (g1Metals4.length === 1 && g5Centrals.length === 1 && hLigands4.length === 2) {
      const metal = g1Metals4[0];
      const center = g5Centrals[0];
      const isLiNH2 = metal.symbol === 'Li' && center.symbol === 'N';
      const isNaNH2 = metal.symbol === 'Na' && center.symbol === 'N';
      const isKNH2 = metal.symbol === 'K' && center.symbol === 'N';

      result.rank = 6;
      result.name = isLiNH2 ? 'Amida de Litio (LiNH₂)' : isNaNH2 ? 'Amida de Sodio (NaNH₂)' : isKNH2 ? 'Amida de Potasio (KNH₂)' : `Amida/Sal Alcalina (${result.formula})`;
      result.desc = `Compuesto iónico-covalente estable ([${metal.symbol}]⁺[${center.symbol}H₂]⁻): El átomo central de ${center.name} (${center.symbol}) completa su octeto de 8 electrones formando 2 enlaces simples covalentes con H y alojando 2 pares libres tras la transferencia electrónica del ${metal.name} (${metal.symbol}⁺). Ambos Hidrógenos completan su dueto de 2 e⁻.`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = {
        [metal.id]: 1,
        [hLigands4[0].id]: 1,
        [hLigands4[1].id]: 1,
      };
      return result;
    }

    // Check if the 4 cards can form 2 independent stable diatomic molecules (e.g. H2 + Cl2, 2 HCl, NaCl + LiF)
    const doubleDiatomic = tryFormDoubleDiatomic(selected);
    if (doubleDiatomic) {
      return doubleDiatomic;
    }

    // Invalid 4-card with Carbon -> Carbon Radical Rejection
    if (selected.some(c => c.symbol === 'C')) {
      return makeCarbonRadicalRejection(
        selected,
        result.formula,
        'La estructura carece de los átomos e hidrógenos necesarios para saturar la cadena de carbono, dejando al descubierto valencias con electrones libres.'
      );
    }

    // Invalid 4-card combination -> Octeto incompleto
    return makeGeneralInvalidRejection(
      selected,
      result.formula,
      'Esta molécula tiene un octeto incompleto. Todo átomo debe terminar exactamente con 8 electrones a su alrededor (o 2 en el caso del Hidrógeno).'
    );
  }

  // --- 5 CARTAS: Pentatómicas ---
  if (selected.length === 5) {
    const g4Centrals = selected.filter(c => c.group === 4);
    const monoLigands = selected.filter(isMonovalentLigand);
    const g6Atoms = selected.filter(c => c.group === 6);

    // =========================================================================
    // RANK 8: FLOR IMPERIAL (OCTETO ORGÁNICO PERFECTO)
    // 1 Carbono (o Silicio) central + EXACTAMENTE 4 Ligandos Monovalentes (H, F, Cl, Br, I)
    // =========================================================================
    if (g4Centrals.length === 1 && monoLigands.length === 4) {
      const center = g4Centrals[0];
      const ligands = selected.filter(c => c.id !== center.id);

      const numH = countSymbol('H');
      const numCl = countSymbol('Cl');
      const numF = countSymbol('F');
      const numBr = countSymbol('Br');
      const numI = countSymbol('I');

      let moleculeName = `Molécula Tetraédrica Saturada (${result.formula})`;
      if (center.symbol === 'C') {
        if (numH === 4) moleculeName = 'Metano (CH₄)';
        else if (numCl === 4) moleculeName = 'Tetracloruro de Carbono (CCl₄)';
        else if (numF === 4) moleculeName = 'Tetrafluorometano (CF₄)';
        else if (numBr === 4) moleculeName = 'Tetrabromometano (CBr₄)';
        else if (numH === 3 && numCl === 1) moleculeName = 'Clorometano (CH₃Cl)';
        else if (numH === 2 && numCl === 2) moleculeName = 'Diclorometano (CH₂Cl₂)';
        else if (numH === 1 && numCl === 3) moleculeName = 'Cloroformo (CHCl₃)';
        else if (numH === 3 && numF === 1) moleculeName = 'Fluorometano (CH₃F)';
        else if (numH === 3 && numBr === 1) moleculeName = 'Bromometano (CH₃Br)';
        else if (numH === 3 && numI === 1) moleculeName = 'Yodometano (CH₃I)';
        else if (numF === 2 && numCl === 2) moleculeName = 'Diclorodifluorometano (Freón-12)';
        else moleculeName = `Haloalcano Tetraédrico (${result.formula})`;
      } else if (center.symbol === 'Si') {
        if (numH === 4) moleculeName = 'Silano (SiH₄)';
        else if (numCl === 4) moleculeName = 'Tetracloruro de Silicio (SiCl₄)';
        else if (numF === 4) moleculeName = 'Tetrafluoruro de Silicio (SiF₄)';
        else moleculeName = `Silano Sustituido (${result.formula})`;
      }

      result.rank = 8;
      result.name = `${moleculeName} — Octeto Perfecto`;

      const ligandDesc = numH === 4
        ? 'los 4 átomos de Hidrógeno completan su dueto de 2 electrones.'
        : numH === 0
        ? `los 4 halógenos (${ligands.map(l => l.symbol).join(', ')}) completan su octeto de 8 electrones (1 enlace simple + 3 pares solitarios cada uno).`
        : `los ${numH} átomos de Hidrógeno completan su dueto (2 e⁻) y los halógenos completan su octeto (8 e⁻ con 3 pares libres cada uno).`;

      result.desc = `Tetravalencia perfecta (hibridación sp³): El átomo central ${center.name} (${center.symbol}) forma 4 enlaces simples covalentes (8 e⁻); ${ligandDesc}`;
      result.isValid = true;
      result.centerId = center.id;
      result.bondDetails = {
        [ligands[0].id]: 1,
        [ligands[1].id]: 1,
        [ligands[2].id]: 1,
        [ligands[3].id]: 1,
      };
      return result;
    }

    // =========================================================================
    // RANK 7: ESCALERA DE COLOR (CADENA ORGÁNICA CONJUGADA)
    // 1) Familia de la Cetena: 2 Carbonos + 1 Oxígeno/Azufre + 2 Ligandos IDÉNTICOS (H2C=C=O, Cl2C=C=O, F2C=C=O)
    // =========================================================================
    if (g4Centrals.length === 2 && g4Centrals.every(c => c.symbol === 'C') && g6Atoms.length === 1 && monoLigands.length === 2) {
      const c1 = g4Centrals[0];
      const c2 = g4Centrals[1];
      const oxy = g6Atoms[0];
      const singleLigands = monoLigands;
      const numH = countSymbol('H');
      const numCl = countSymbol('Cl');
      const numF = countSymbol('F');
      const numBr = countSymbol('Br');

      // Solo se aceptan cetenas simétricas cerradas: H2C=C=O, Cl2C=C=O, F2C=C=O, Br2C=C=O
      const isPureKetene = oxy.symbol === 'O' && (numH === 2 || numCl === 2 || numF === 2 || numBr === 2);

      if (isPureKetene) {
        result.rank = 7;
        result.name = numH === 2 ? 'Cetena (H₂C=C=O)' : numCl === 2 ? 'Diclorocetena (Cl₂C=C=O)' : numF === 2 ? 'Difluorocetena (F₂C=C=O)' : `Halo-Cetena (${result.formula})`;

        const singleDesc = numH === 2
          ? 'los 2 átomos de Hidrógeno completan su dueto (2 e⁻ cada uno).'
          : `los 2 halógenos (${singleLigands[0].symbol}) completan su octeto de 8 electrones (1 enlace simple + 3 pares libres cada uno).`;

        result.desc = `Cadena acumulada (${singleLigands.map(l => l.symbol).join('')}C=C=${oxy.symbol}): Dos carbonos tetravalentes conjugados con doble enlace a ${oxy.name} (${oxy.symbol}, 8 e⁻ con 2 pares libres) y 2 enlaces simples; ${singleDesc}`;
        result.isValid = true;
        result.centerId = c1.id;
        result.bondDetails = {
          [c2.id]: 2,
          [oxy.id]: 2,
          [singleLigands[0].id]: 1,
          [singleLigands[1].id]: 1,
        };
        return result;
      }
    }

    // 2) Subóxido de Carbono (3 Carbonos + 2 Oxígenos: O=C=C=C=O)
    if (g4Centrals.length === 3 && g4Centrals.every(c => c.symbol === 'C') && g6Atoms.length === 2 && countSymbol('O') === 2) {
      const centerC = g4Centrals[1] || g4Centrals[0];
      result.rank = 7;
      result.name = 'Subóxido de Carbono (C₃O₂)';
      result.desc = 'Cadena orgánica acumulada (O=C=C=C=O): Tres carbonos tetravalentes consecutivos con 4 dobles enlaces; todos los átomos completan exactamente 8 electrones de valencia.';
      result.isValid = true;
      result.centerId = centerC.id;
      result.bondDetails = {
        [g4Centrals[0].id]: 2,
        [g4Centrals[2]?.id || g6Atoms[0].id]: 2,
        [g6Atoms[0].id]: 2,
        [g6Atoms[1].id]: 2,
      };
      return result;
    }

    // Check if the 5 cards form Triatomic + Diatomic (e.g. H2O + H2, CO2 + NaCl)
    const triAndDia = tryFormTriatomicAndDiatomic(selected);
    if (triAndDia) {
      return triAndDia;
    }

    // Check if 4 cards form 2 Diatomics with 1 companion card (kicker)
    const doubleDiaWithKicker = tryFormDoubleDiatomicWithCompanion(selected);
    if (doubleDiaWithKicker) {
      return doubleDiaWithKicker;
    }

    // Invalid 5-card with Carbon -> Carbon Radical Rejection
    if (selected.some(c => c.symbol === 'C')) {
      return makeCarbonRadicalRejection(
        selected,
        result.formula,
        'La estructura carece de los hidrógenos necesarios para saturar la cadena y deja al descubierto las valencias del carbono con electrones libres.'
      );
    }

    // Invalid 5-card combination -> Octeto incompleto
    return makeGeneralInvalidRejection(
      selected,
      result.formula,
      'Esta molécula tiene un octeto incompleto. Todos los átomos deben terminar exactamente con 8 electrones de valencia (octeto cerrado).'
    );
  }

  if (result.isValid) {
    if (!result.chemicalNature) {
      result.chemicalNature = classifyChemicalNature(result.formula || '', result.cards, result.name);
    }
    if (!result.moleculeCount) {
      result.moleculeCount = 1;
    }
    result.tiebreaker = computeTiebreaker({
      moleculeCount: result.moleculeCount,
      nature: result.chemicalNature,
      cards: result.cards,
    });
  }

  return result;
}

export function getCombinations<T>(arr: T[], maxSize: number): T[][] {
  const result: T[][] = [];
  const n = arr.length;
  if (n === 0) return result;

  const f = (start: number, current: T[]) => {
    if (current.length > 0) {
      result.push(current);
    }
    if (current.length === maxSize) return;

    for (let i = start; i < n; i++) {
      f(i + 1, [...current, arr[i]]);
    }
  };

  f(0, []);
  return result;
}

export function getBestAIHand(aiHoleCards: ElementCard[], communityCards: ElementCard[]): EvaluationResult {
  const allCards = [...aiHoleCards, ...communityCards];
  if (allCards.length === 0) return evaluateCards([]);

  const combos = getCombinations(allCards, 5);

  let bestEval: EvaluationResult = {
    rank: -1,
    name: 'Ninguna',
    formula: '',
    desc: '',
    bondType: '',
    mechanism: '',
    tiebreaker: -1,
    cards: [],
    isValid: false,
  };

  for (let i = 0; i < combos.length; i++) {
    const ev = evaluateCards(combos[i]);
    if (ev.rank > bestEval.rank || (ev.rank === bestEval.rank && ev.tiebreaker > bestEval.tiebreaker)) {
      bestEval = ev;
      if (bestEval.rank >= 8) break; // Maximum achievable rank
    }
  }

  return bestEval;
}
