import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ESCAPE_10_QUESTIONS,
  SEED_ESCAPE_ROOM_LIBRARY,
  filterAndSortEscapeLibrary,
} from './escapeRoomEngine';

test('DEFAULT_ESCAPE_10_QUESTIONS contains exactly 10 chambers with valid options and lockCodes', () => {
  assert.equal(DEFAULT_ESCAPE_10_QUESTIONS.length, 10);
  DEFAULT_ESCAPE_10_QUESTIONS.forEach((q, index) => {
    assert.equal(typeof q.id, 'string');
    assert.equal(typeof q.chamberTitle, 'string');
    assert.ok(q.chamberTitle.includes(`Cámara ${index + 1}`));
    assert.ok(q.options.length >= 2, 'Must have at least 2 options');
    assert.ok(q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length);
    assert.ok(q.lockCode.length > 0);
  });
});

test('SEED_ESCAPE_ROOM_LIBRARY has 6 packs, each with exactly 10 chambers', () => {
  assert.equal(SEED_ESCAPE_ROOM_LIBRARY.length, 6);
  for (const pack of SEED_ESCAPE_ROOM_LIBRARY) {
    assert.equal(pack.chambers.length, 10, `Pack ${pack.title} must have exactly 10 chambers`);
    assert.ok(pack.title.length > 0);
    assert.ok(pack.subject.length > 0);
    assert.ok(pack.authorName.length > 0);
  }
});

test('filterAndSortEscapeLibrary filters by subject and search query accurately', () => {
  const quimicaOnly = filterAndSortEscapeLibrary(SEED_ESCAPE_ROOM_LIBRARY, 'Química', '', 'popular');
  assert.ok(quimicaOnly.length >= 1);
  assert.ok(quimicaOnly.every((p) => p.subject === 'Química'));

  const searchResult = filterAndSortEscapeLibrary(SEED_ESCAPE_ROOM_LIBRARY, 'Todos', 'Lavoisier', 'popular');
  assert.ok(searchResult.length >= 1);
  assert.equal(searchResult[0].subject, 'Química');

  const popularSorted = filterAndSortEscapeLibrary(SEED_ESCAPE_ROOM_LIBRARY, 'Todos', '', 'popular');
  assert.ok(popularSorted[0].playsCount >= popularSorted[1].playsCount);
});
