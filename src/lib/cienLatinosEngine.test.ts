import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeLatinoText,
  matchLatinoAnswer,
  createInitialLatinosMatchState,
  submitTeamGuess,
  advanceToNextRound,
  filterAndSortLibrary,
  SEED_LATINOS_LIBRARY,
} from './cienLatinosEngine';

test('normalizeLatinoText removes accents, articles, and punctuation', () => {
  assert.equal(normalizeLatinoText('¡El Ácido Acético!'), 'acido acetico');
  assert.equal(normalizeLatinoText('  Las Pirámides de Egipto '), 'piramides egipto');
});

test('matchLatinoAnswer matches exact text, synonyms, and ignores already revealed slots', () => {
  const answers = SEED_LATINOS_LIBRARY[0].rounds[0].answers;
  // #0 is Oxígeno (O), #1 is Oro (Au)
  assert.equal(matchLatinoAnswer('oxigeno', answers, []), 0);
  assert.equal(matchLatinoAnswer('Au', answers, []), 1);
  // If index 0 is already revealed, guessing oxigeno returns -1
  assert.equal(matchLatinoAnswer('oxigeno', answers, [0]), -1);
});

test('submitTeamGuess awards points on correct answer and triggers steal after 3 strikes', () => {
  const pack = SEED_LATINOS_LIBRARY[0];
  let state = createInitialLatinosMatchState(pack, 'Tigres', 'Leones');

  // Correct guess for Team A (#1 Oxígeno = 36 pts)
  state = submitTeamGuess(state, 'Oxígeno', 'Ana');
  assert.equal(state.roundPot, 36);
  assert.deepEqual(state.revealedIndices, [0]);
  assert.equal(state.strikes, 0);

  // 3 wrong guesses -> 3 strikes -> steal opportunity for Team B
  state = submitTeamGuess(state, 'Plástico', 'Ana');
  assert.equal(state.strikes, 1);
  state = submitTeamGuess(state, 'Madera', 'Ana');
  assert.equal(state.strikes, 2);
  state = submitTeamGuess(state, 'Vidrio', 'Ana');
  assert.equal(state.strikes, 3);
  assert.equal(state.stealOpportunity, true);
  assert.equal(state.activeTeam, 'B');

  // Team B steals with 'Oro' (+24 pts) -> wins entire pot (36 + 24 = 60 pts)
  state = submitTeamGuess(state, 'Oro', 'Carlos');
  assert.equal(state.roundFinished, true);
  assert.equal(state.roundWinnerTeam, 'B');
  assert.equal(state.teamBScore, 60);
  assert.equal(state.teamAScore, 0);
});

test('advanceToNextRound resets board and alternates starting team', () => {
  const pack = SEED_LATINOS_LIBRARY[0];
  let state = createInitialLatinosMatchState(pack);
  state = advanceToNextRound(state);
  assert.equal(state.currentRoundIndex, 1);
  assert.equal(state.activeTeam, 'B');
  assert.equal(state.roundPot, 0);
  assert.equal(state.strikes, 0);
});

test('filterAndSortLibrary filters by subject and search query', () => {
  const chemResults = filterAndSortLibrary(SEED_LATINOS_LIBRARY, '', 'Química', 'popular');
  assert.equal(chemResults.length, 1);
  assert.equal(chemResults[0].id, 'pack-quimica-cotidiana');

  const queryResults = filterAndSortLibrary(SEED_LATINOS_LIBRARY, 'fotosintesis', 'Todos', 'popular');
  assert.equal(queryResults.length, 1);
  assert.equal(queryResults[0].subject, 'Biología');
});
