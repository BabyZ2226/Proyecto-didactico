export interface EscapeRunnerInput {
  id: string;
  name: string;
  avatar: string;
  questionIndex: number;
  totalQuestions: number;
  isVictory: boolean;
  isGameOver: boolean;
  score: number;
  grade: number;
}

export interface EscapeRunnerPosition extends EscapeRunnerInput {
  /** Horizontal position percentage (from left of general stage, e.g., 32% to 86%) */
  leftPct: number;
  /** Vertical depth lane from bottom percentage (e.g., 10% to 38%) */
  bottomPct: number;
  /** Z-index so runners lower on screen render cleanly in front of higher lanes */
  zIndex: number;
  /** Lane index (0..maxLanes-1) */
  laneIndex: number;
  /** Alternating label vertical offset ('top' | 'high-top') to prevent name tag collisions */
  badgeTier: 0 | 1;
}

/**
 * Computes non-overlapping 2.5D corridor positions for all students in the
 * Teacher's Single General Escape Room Screen.
 *
 * - Distributes runners across up to 6 distinct vertical depth tracks (`bottomPct` from 11% to 36%).
 * - Maps chamber progress (`questionIndex / totalQuestions`) onto the horizontal corridor `[36%, 86%]`.
 * - Applies deterministic horizontal staggering within each chamber group so even if 10 students
 *   are on Chamber 1 at the same time, their characters and floating name tags never stack on top of each other.
 */
export function computeEscapeRunnerPositions(
  runners: EscapeRunnerInput[],
  timeRatio: number = 1
): EscapeRunnerPosition[] {
  if (!runners || runners.length === 0) return [];

  const clampedTimeRatio = Math.max(0, Math.min(1, timeRatio));
  const laneBottoms = [11, 16, 21, 26, 31, 36]; // 6 distinct vertical depth tracks

  // Group runners by their current chamber index to stagger those at the exact same chamber
  const chamberGroups = new Map<number, number>();
  const chamberSeen = new Map<number, number>();

  for (const r of runners) {
    const key = r.isVictory ? 999 : r.isGameOver ? -1 : r.questionIndex;
    chamberGroups.set(key, (chamberGroups.get(key) || 0) + 1);
  }

  return runners.map((runner, idx) => {
    const totalQ = Math.max(1, runner.totalQuestions || 4);
    const key = runner.isVictory ? 999 : runner.isGameOver ? -1 : runner.questionIndex;
    const groupSize = chamberGroups.get(key) || 1;
    const indexInGroup = chamberSeen.get(key) || 0;
    chamberSeen.set(key, indexInGroup + 1);

    const laneIndex = idx % laneBottoms.length;
    const bottomPct = laneBottoms[laneIndex];

    // Base horizontal position along the corridor (38% to 84%)
    const progressRatio = runner.isVictory
      ? 1
      : Math.max(0, Math.min(1, runner.questionIndex / totalQ));

    let baseLeft = 40 + progressRatio * 42;

    if (runner.isVictory) {
      baseLeft = 86;
    } else if (runner.isGameOver) {
      baseLeft = 26;
    } else {
      // Slight time-based tension shift so runners stay ahead of the monster
      baseLeft += (clampedTimeRatio - 0.5) * 3;
    }

    // Horizontal spread within the same chamber so multiple students on Chamber 1 don't overlap X
    let staggerX = 0;
    if (groupSize > 1) {
      const spreadWidth = Math.min(16, (groupSize - 1) * 3.8);
      staggerX = -spreadWidth / 2 + (indexInGroup / (groupSize - 1)) * spreadWidth;
    }

    const leftPct = Math.max(24, Math.min(89, Number((baseLeft + staggerX).toFixed(2))));
    // Lower bottomPct means closer to the foreground -> higher zIndex
    const zIndex = 40 - laneIndex * 3;
    const badgeTier: 0 | 1 = (indexInGroup % 2) as 0 | 1;

    return {
      ...runner,
      leftPct,
      bottomPct,
      zIndex,
      laneIndex,
      badgeTier,
    };
  });
}

/**
 * Validates whether a student is allowed to join a room.
 * Once the match has started (`phase !== 'lobby'`), new students are blocked.
 */
export function canStudentJoinRoom(params: {
  roomPhase: string;
  isExistingPlayer: boolean;
  isTeacher: boolean;
}): { allowed: boolean; reason?: string } {
  if (params.isExistingPlayer || params.isTeacher) {
    return { allowed: true };
  }
  if (params.roomPhase !== 'lobby') {
    return {
      allowed: false,
      reason: 'La partida ya está en curso. No se permiten nuevos estudiantes después de iniciar la partida.',
    };
  }
  return { allowed: true };
}

/**
 * Checks if student interactions should be blocked due to teacher global pause.
 */
export function isGameActionBlockedByPause(isPaused?: boolean, isTeacher?: boolean): boolean {
  if (isTeacher) return false;
  return Boolean(isPaused);
}
