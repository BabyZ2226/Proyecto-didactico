import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeEscapeRunnerPositions,
  canStudentJoinRoom,
  isGameActionBlockedByPause,
  EscapeRunnerInput,
} from '../escapeRoomStageLogic';

describe('escapeRoomStageLogic', () => {
  it('assigns non-overlapping positions when multiple students are on the same chamber', () => {
    const runners: EscapeRunnerInput[] = [
      { id: '1', name: 'Ana', avatar: '👩‍🔬', questionIndex: 0, totalQuestions: 4, isVictory: false, isGameOver: false, score: 0, grade: 0 },
      { id: '2', name: 'Luis', avatar: '🧑‍🎓', questionIndex: 0, totalQuestions: 4, isVictory: false, isGameOver: false, score: 0, grade: 0 },
      { id: '3', name: 'Sofía', avatar: '👩‍🚀', questionIndex: 0, totalQuestions: 4, isVictory: false, isGameOver: false, score: 0, grade: 0 },
      { id: '4', name: 'Carlos', avatar: '🕵️', questionIndex: 0, totalQuestions: 4, isVictory: false, isGameOver: false, score: 0, grade: 0 },
    ];

    const positioned = computeEscapeRunnerPositions(runners, 0.8);
    assert.equal(positioned.length, 4);

    // Every runner should have a distinct (leftPct, bottomPct) pair so none stack directly on top of another
    const coords = new Set(positioned.map((p) => `${p.leftPct}_${p.bottomPct}`));
    assert.equal(coords.size, 4);

    // Runners on the same chamber should also be horizontally staggered
    const lefts = new Set(positioned.map((p) => p.leftPct));
    assert.equal(lefts.size, 4);
  });

  it('orders runners horizontally by chamber progress and places victorious runners near the exit', () => {
    const runners: EscapeRunnerInput[] = [
      { id: '1', name: 'Atrasado', avatar: '🐢', questionIndex: 0, totalQuestions: 4, isVictory: false, isGameOver: false, score: 0, grade: 25 },
      { id: '2', name: 'Avanzado', avatar: '🐇', questionIndex: 3, totalQuestions: 4, isVictory: false, isGameOver: false, score: 750, grade: 75 },
      { id: '3', name: 'Escapado', avatar: '🏆', questionIndex: 4, totalQuestions: 4, isVictory: true, isGameOver: false, score: 1000, grade: 100 },
    ];

    const positioned = computeEscapeRunnerPositions(runners, 0.5);
    assert.ok(positioned[0].leftPct < positioned[1].leftPct);
    assert.ok(positioned[1].leftPct < positioned[2].leftPct);
    assert.ok(positioned[2].leftPct >= 84);
  });

  it('blocks new students from joining once match has started, while allowing teachers and existing players', () => {
    assert.equal(
      canStudentJoinRoom({ roomPhase: 'lobby', isExistingPlayer: false, isTeacher: false }).allowed,
      true
    );
    const midGameStudent = canStudentJoinRoom({
      roomPhase: 'playing',
      isExistingPlayer: false,
      isTeacher: false,
    });
    assert.equal(midGameStudent.allowed, false);
    assert.ok(midGameStudent.reason?.includes('en curso'));

    assert.equal(
      canStudentJoinRoom({ roomPhase: 'playing', isExistingPlayer: true, isTeacher: false }).allowed,
      true
    );
    assert.equal(
      canStudentJoinRoom({ roomPhase: 'playing', isExistingPlayer: false, isTeacher: true }).allowed,
      true
    );
  });

  it('blocks student actions when game is paused, but never blocks teacher controls', () => {
    assert.equal(isGameActionBlockedByPause(true, false), true);
    assert.equal(isGameActionBlockedByPause(false, false), false);
    assert.equal(isGameActionBlockedByPause(true, true), false);
  });
});
