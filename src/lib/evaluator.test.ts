import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCards,
  explainTiebreaker,
  getBestAIHand,
} from './evaluator';
import { ElementCard } from '../types';

const card = (id: string, symbol: string, name: string, group: number, en: number): ElementCard => ({
  id,
  symbol,
  name,
  group,
  en,
});

test('evaluateCards: empty selection returns invalid rank 0', () => {
  const res = evaluateCards([]);
  assert.equal(res.isValid, false);
  assert.equal(res.rank, 0);
});

test('evaluateCards: single Noble Gas (Ne) is valid rank 1 (Carta Alta)', () => {
  const ne = card('ne1', 'Ne', 'Neón', 8, 0);
  const res = evaluateCards([ne]);
  assert.equal(res.isValid, true);
  assert.equal(res.rank, 1);
  assert.equal(res.formula, 'Ne');
});

test('evaluateCards: diatomic HCl is valid rank 2 and classified as Ácido', () => {
  const h = card('h1', 'H', 'Hidrógeno', 1, 2.2);
  const cl = card('cl1', 'Cl', 'Cloro', 7, 3.16);
  const res = evaluateCards([h, cl]);
  assert.equal(res.isValid, true);
  assert.equal(res.rank, 2);
  assert.equal(res.formula, 'HCl');
  assert.equal(res.chemicalNature, 'Ácido');
});

test('evaluateCards: triatomic H2O is valid rank 4 (Trío)', () => {
  const h1 = card('h1', 'H', 'Hidrógeno', 1, 2.2);
  const h2 = card('h2', 'H', 'Hidrógeno', 1, 2.2);
  const o = card('o1', 'O', 'Oxígeno', 6, 3.44);
  const res = evaluateCards([h1, h2, o]);
  assert.equal(res.isValid, true);
  assert.equal(res.rank, 4);
  assert.equal(res.formula, 'H₂O');
  assert.ok(res.name.includes('Agua'));
});

test('evaluateCards: tetratomic NH3 is valid rank 6 (Póker)', () => {
  const n = card('n1', 'N', 'Nitrógeno', 5, 3.04);
  const h1 = card('h1', 'H', 'Hidrógeno', 1, 2.2);
  const h2 = card('h2', 'H', 'Hidrógeno', 1, 2.2);
  const h3 = card('h3', 'H', 'Hidrógeno', 1, 2.2);
  const res = evaluateCards([n, h1, h2, h3]);
  assert.equal(res.isValid, true);
  assert.equal(res.rank, 6);
  assert.equal(res.formula, 'NH₃');
  assert.equal(res.chemicalNature, 'Base');
});

test('evaluateCards: pentatomic CH4 is valid rank 8 (Flor Imperial)', () => {
  const c = card('c1', 'C', 'Carbono', 4, 2.55);
  const h1 = card('h1', 'H', 'Hidrógeno', 1, 2.2);
  const h2 = card('h2', 'H', 'Hidrógeno', 1, 2.2);
  const h3 = card('h3', 'H', 'Hidrógeno', 1, 2.2);
  const h4 = card('h4', 'H', 'Hidrógeno', 1, 2.2);
  const res = evaluateCards([c, h1, h2, h3, h4]);
  assert.equal(res.isValid, true);
  assert.equal(res.rank, 8);
  assert.equal(res.formula, 'CH₄');
  assert.ok(res.name.includes('Metano'));
});

test('evaluateCards: odd-valence radical (CH) and unsaturated carbon radical (C2) are rejected as invalid', () => {
  const c1 = card('c1', 'C', 'Carbono', 4, 2.55);
  const c2 = card('c2', 'C', 'Carbono', 4, 2.55);
  const h1 = card('h1', 'H', 'Hidrógeno', 1, 2.2);

  const resCH = evaluateCards([c1, h1]);
  assert.equal(resCH.isValid, false);
  assert.equal(resCH.rank, 0);
  assert.ok(resCH.name.includes('DERROTA MOLECULAR'));

  const resC2 = evaluateCards([c1, c2]);
  assert.equal(resC2.isValid, false);
  assert.equal(resC2.rank, 0);
  assert.ok(resC2.name.includes('DERROTA MOLECULAR'));
});

test('computeTiebreaker & explainTiebreaker: Ácido beats Neutro at same rank', () => {
  const h = card('h1', 'H', 'Hidrógeno', 1, 2.2);
  const cl = card('cl1', 'Cl', 'Cloro', 7, 3.16);
  const h2a = card('h2', 'H', 'Hidrógeno', 1, 2.2);
  const h2b = card('h3', 'H', 'Hidrógeno', 1, 2.2);

  const evalHCl = evaluateCards([h, cl]);
  const evalH2 = evaluateCards([h2a, h2b]);

  assert.equal(evalHCl.rank, evalH2.rank);
  assert.ok(evalHCl.tiebreaker > evalH2.tiebreaker);

  const explanation = explainTiebreaker(evalHCl, evalH2);
  assert.ok(explanation.includes('Ácido'));
});

test('getBestAIHand: finds CH4 (rank 8) from hole + community cards', () => {
  const hole = [
    card('c1', 'C', 'Carbono', 4, 2.55),
    card('h1', 'H', 'Hidrógeno', 1, 2.2),
  ];
  const community = [
    card('h2', 'H', 'Hidrógeno', 1, 2.2),
    card('h3', 'H', 'Hidrógeno', 1, 2.2),
    card('h4', 'H', 'Hidrógeno', 1, 2.2),
    card('na1', 'Na', 'Sodio', 1, 0.93),
    card('o1', 'O', 'Oxígeno', 6, 3.44),
  ];

  const best = getBestAIHand(hole, community);
  assert.equal(best.isValid, true);
  assert.equal(best.rank, 8);
  assert.equal(best.formula, 'CH₄');
});
