import { ElementCard } from '../types';

export const BASE_ELEMENTS = {
  H: { symbol: 'H', group: 1, name: 'Hidrógeno', en: 2.20 },
  Li: { symbol: 'Li', group: 1, name: 'Litio', en: 0.98 },
  Na: { symbol: 'Na', group: 1, name: 'Sodio', en: 0.93 },
  K: { symbol: 'K', group: 1, name: 'Potasio', en: 0.82 },
  Be: { symbol: 'Be', group: 2, name: 'Berilio', en: 1.57 },
  Mg: { symbol: 'Mg', group: 2, name: 'Magnesio', en: 1.31 },
  Ca: { symbol: 'Ca', group: 2, name: 'Calcio', en: 1.00 },
  B: { symbol: 'B', group: 3, name: 'Boro', en: 2.04 },
  Al: { symbol: 'Al', group: 3, name: 'Aluminio', en: 1.61 },
  C: { symbol: 'C', group: 4, name: 'Carbono', en: 2.55 },
  Si: { symbol: 'Si', group: 4, name: 'Silicio', en: 1.90 },
  N: { symbol: 'N', group: 5, name: 'Nitrógeno', en: 3.04 },
  P: { symbol: 'P', group: 5, name: 'Fósforo', en: 2.19 },
  O: { symbol: 'O', group: 6, name: 'Oxígeno', en: 3.44 },
  S: { symbol: 'S', group: 6, name: 'Azufre', en: 2.58 },
  F: { symbol: 'F', group: 7, name: 'Flúor', en: 3.98 },
  Cl: { symbol: 'Cl', group: 7, name: 'Cloro', en: 3.16 },
  Br: { symbol: 'Br', group: 7, name: 'Bromo', en: 2.96 },
  I: { symbol: 'I', group: 7, name: 'Yodo', en: 2.66 },
  Ne: { symbol: 'Ne', group: 8, name: 'Neón', en: 0 },
  Ar: { symbol: 'Ar', group: 8, name: 'Argón', en: 0 },
};

export const DECK_COMPOSITION = [
  { element: 'H', count: 12 },
  { element: 'Li', count: 2 },
  { element: 'Na', count: 2 },
  { element: 'K', count: 2 },
  { element: 'Be', count: 2 },
  { element: 'Mg', count: 2 },
  { element: 'Ca', count: 2 },
  { element: 'B', count: 2 },
  { element: 'Al', count: 2 },
  { element: 'C', count: 4 },
  { element: 'Si', count: 2 },
  { element: 'N', count: 3 },
  { element: 'P', count: 1 },
  { element: 'O', count: 4 },
  { element: 'S', count: 2 },
  { element: 'F', count: 2 },
  { element: 'Cl', count: 2 },
  { element: 'Br', count: 1 },
  { element: 'I', count: 1 },
  { element: 'Ne', count: 1 },
  { element: 'Ar', count: 1 },
];

export const ELEMENT_DETAILS: Record<string, { atomicNumber: number; period: number; family: string; color: string; description: string }> = {
  H: { atomicNumber: 1, period: 1, family: 'No Metal / Alcalino', color: 'text-sky-400 border-sky-500/40 bg-sky-950/30', description: 'Gas diatómico no metal. Necesita 1 e⁻ para completar su dueto estable.' },
  Li: { atomicNumber: 3, period: 2, family: 'Metal Alcalino', color: 'text-sky-300 border-sky-400/40 bg-sky-950/30', description: 'Metal blando muy reactivo. Cede 1 e⁻ para formar catión Li⁺.' },
  Na: { atomicNumber: 11, period: 3, family: 'Metal Alcalino', color: 'text-sky-300 border-sky-400/40 bg-sky-950/30', description: 'Metal alcalino esencial. Forma sales iónicas como NaCl cediendo 1 e⁻.' },
  K: { atomicNumber: 19, period: 4, family: 'Metal Alcalino', color: 'text-sky-300 border-sky-400/40 bg-sky-950/30', description: 'Metal alcalino altamente electropositivo (EN: 0.82).' },
  Be: { atomicNumber: 4, period: 2, family: 'Metal Alcalinotérreo', color: 'text-orange-400 border-orange-500/40 bg-orange-950/30', description: 'Metal alcalinotérreo ligero con 2 electrones de valencia.' },
  Mg: { atomicNumber: 12, period: 3, family: 'Metal Alcalinotérreo', color: 'text-orange-400 border-orange-500/40 bg-orange-950/30', description: 'Metal alcalinotérreo divalente (Mg²⁺), común en clorofila y aleaciones.' },
  Ca: { atomicNumber: 20, period: 4, family: 'Metal Alcalinotérreo', color: 'text-orange-400 border-orange-500/40 bg-orange-950/30', description: 'Metal alcalinotérreo esencial para huesos y carbonatos (Ca²⁺).' },
  B: { atomicNumber: 5, period: 2, family: 'Metaloide / Térreo', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30', description: 'Semimetal con 3 electrones de valencia.' },
  Al: { atomicNumber: 13, period: 3, family: 'Metal Térreo', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30', description: 'Metal ligero de valencia 3, muy resistente a la corrosión.' },
  C: { atomicNumber: 6, period: 2, family: 'No Metal / Carbonoide', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30', description: 'Eje de la química orgánica. Tetravalente estricto: forma 4 enlaces.' },
  Si: { atomicNumber: 14, period: 3, family: 'Semimetal / Carbonoide', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30', description: 'Semiconductor esencial en microelectrónica. Tetravalente.' },
  N: { atomicNumber: 7, period: 2, family: 'No Metal / Nitrogenoide', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30', description: 'Trivalente. Forma 3 enlaces y conserva 1 par solitario (octeto).' },
  P: { atomicNumber: 15, period: 3, family: 'No Metal / Nitrogenoide', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30', description: 'Elemento biológico vital (ATP, ADN). Trivalente básico.' },
  O: { atomicNumber: 8, period: 2, family: 'No Metal / Calcógeno', color: 'text-rose-400 border-rose-500/40 bg-rose-950/30', description: 'Muy electronegativo (3.44). Divalente: forma 2 enlaces y 2 pares libres.' },
  S: { atomicNumber: 16, period: 3, family: 'No Metal / Calcógeno', color: 'text-rose-400 border-rose-500/40 bg-rose-950/30', description: 'Análogo al oxígeno con 6 electrones de valencia. Divalente estándar.' },
  F: { atomicNumber: 9, period: 2, family: 'Halógeno', color: 'text-teal-400 border-teal-500/40 bg-teal-950/30', description: 'El elemento más electronegativo (3.98). Forma 1 enlace y 3 pares libres.' },
  Cl: { atomicNumber: 17, period: 3, family: 'Halógeno', color: 'text-teal-400 border-teal-500/40 bg-teal-950/30', description: 'Halógeno reactivo (3.16). Muy común en enlaces covalentes e iónicos.' },
  Br: { atomicNumber: 35, period: 4, family: 'Halógeno', color: 'text-teal-400 border-teal-500/40 bg-teal-950/30', description: 'Líquido halógeno pardo-rojizo. Monovalente (1 enlace, 3 pares libres).' },
  I: { atomicNumber: 53, period: 5, family: 'Halógeno', color: 'text-teal-400 border-teal-500/40 bg-teal-950/30', description: 'Sólido halógeno violáceo pesado. Monovalente estándar.' },
  Ne: { atomicNumber: 10, period: 2, family: 'Gas Noble', color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/30', description: 'Gas inerte con octeto completo natural (8 e⁻). Bonus especial en el juego.' },
  Ar: { atomicNumber: 18, period: 3, family: 'Gas Noble', color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/30', description: 'Gas inerte noble con capa completa (8 e⁻). No forma enlaces ordinarios.' },
};

export function getFullDeckOrdered(): ElementCard[] {
  const deck: ElementCard[] = [];
  let idCounter = 1;

  for (const { element, count } of DECK_COMPOSITION) {
    const base = BASE_ELEMENTS[element as keyof typeof BASE_ELEMENTS];
    for (let i = 0; i < count; i++) {
      deck.push({
        id: `deck-${element}-${idCounter++}`,
        ...base,
      });
    }
  }

  return deck;
}

export function generateDeck(): ElementCard[] {
  const deck: ElementCard[] = [];
  let idCounter = 1;

  for (const { element, count } of DECK_COMPOSITION) {
    const base = BASE_ELEMENTS[element as keyof typeof BASE_ELEMENTS];
    for (let i = 0; i < count; i++) {
      deck.push({
        id: `card-${idCounter++}`,
        ...base,
      });
    }
  }

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
