export interface StudentMatchScore {
  id: string;
  name: string;
  avatar: string;
  grade: number; // 0-100 coherent academic grade
  score?: number; // raw points (e.g. 380 pts, 2500 pts)
  escapedOrWon: boolean;
  details: string;
}

export interface MatchHistoryRecord {
  id: string;
  dateStr: string;
  timestamp: number;
  gameType: 'poker_quimico' | 'escape_room' | 'cien_latinos' | 'el_impostor' | 'geografia_3d';
  gameTitle: string;
  role: 'teacher' | 'student';
  playerName: string;
  playerAvatar: string;
  grade: number; // Coherent academic grade on standard 0-100 scale (e.g. 95, 88, 72, 100)
  score: number; // Raw points (e.g. 380 pts, 2850 pts)
  maxScore?: number;
  isVictory: boolean;
  statusText: string;
  detailsText: string;
  roomCode?: string;
  studentResults?: StudentMatchScore[];
}

const HISTORY_STORAGE_KEY = 'po_match_history_v2';
const LEGACY_STORAGE_KEY = 'po_match_history_v1';

export function getGradeDescriptor(grade: number): {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  const safeGrade = Math.max(0, Math.min(100, Math.round(grade)));
  if (safeGrade >= 90) {
    return {
      label: 'Sobresaliente',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-300',
    };
  }
  if (safeGrade >= 75) {
    return {
      label: 'Notable',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-300',
    };
  }
  if (safeGrade >= 60) {
    return {
      label: 'Aprobado',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-300',
    };
  }
  return {
    label: 'Por Mejorar',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300',
  };
}

export function getMatchHistory(): MatchHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    // If the storage key doesn't exist at all, populate seed once and save it
    if (raw === null) {
      // Check if user had legacy v1 items
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const normalized = parsedLegacy.map(normalizeLegacyRecord);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(normalized));
            return normalized;
          }
        } catch {
          // ignore
        }
      }
      const initial = getSeedHistory();
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    // Key exists (even if empty array '[]'). Return parsed content directly!
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading match history:', e);
  }
  return [];
}

export function saveMatchRecord(
  record: Omit<MatchHistoryRecord, 'id' | 'dateStr' | 'timestamp'>
): MatchHistoryRecord {
  const currentHistory = getMatchHistory();
  const now = new Date();
  
  // Ensure grade is strictly in coherent 0-100 range
  const coherentGrade = Math.max(0, Math.min(100, Math.round(record.grade ?? 0)));

  const newRecord: MatchHistoryRecord = {
    ...record,
    grade: coherentGrade,
    score: record.score ?? 0,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.getTime(),
    dateStr: now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated = [newRecord, ...currentHistory].slice(0, 100);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving match record:', e);
  }
  return newRecord;
}

export function clearMatchHistory(): void {
  try {
    // Explicitly write empty array so getMatchHistory does not reload seed
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing match history:', e);
  }
}

export function deleteMatchRecord(id: string): MatchHistoryRecord[] {
  try {
    const current = getMatchHistory();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting match record:', e);
    return [];
  }
}

export function restoreDefaultDemoData(): MatchHistoryRecord[] {
  const seeds = getSeedHistory();
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(seeds));
  } catch (e) {
    console.error('Error restoring demo data:', e);
  }
  return seeds;
}

function normalizeLegacyRecord(rec: any): MatchHistoryRecord {
  let grade = typeof rec.grade === 'number' ? rec.grade : (rec.gradeOrScore ?? 85);
  let score = typeof rec.score === 'number' ? rec.score : (rec.gradeOrScore ?? 0);

  // If grade was stored as raw score (e.g. 380)
  if (grade > 100) {
    score = grade;
    grade = Math.round(Math.min(100, 70 + (score / 500) * 25));
  }

  return {
    id: rec.id || `legacy_${Date.now()}`,
    dateStr: rec.dateStr || 'Reciente',
    timestamp: rec.timestamp || Date.now(),
    gameType: rec.gameType || 'escape_room',
    gameTitle: rec.gameTitle || 'Sesión Didáctica',
    role: rec.role || 'student',
    playerName: rec.playerName || 'Estudiante',
    playerAvatar: rec.playerAvatar || '🧑‍🎓',
    grade: Math.max(0, Math.min(100, grade)),
    score: score,
    maxScore: rec.maxScore || 100,
    isVictory: Boolean(rec.isVictory),
    statusText: rec.statusText || 'Completado',
    detailsText: rec.detailsText || '',
    roomCode: rec.roomCode,
    studentResults: rec.studentResults || [],
  };
}

function getSeedHistory(): MatchHistoryRecord[] {
  const now = new Date();
  const formatTime = (offsetMs: number) =>
    new Date(now.getTime() - offsetMs).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return [
    {
      id: 'seed-rec-1',
      dateStr: formatTime(3600000 * 2), // 2 hours ago
      timestamp: Date.now() - 3600000 * 2,
      gameType: 'escape_room',
      gameTitle: 'Escape Room: Las 10 Cámaras del Saber',
      role: 'student',
      playerName: 'Marie Curie',
      playerAvatar: '👩‍🔬',
      grade: 96, // 96/100 Sobresaliente
      score: 2850,
      maxScore: 3000,
      isVictory: true,
      statusText: '🗝️ Escape Exitoso (10/10 Cámaras)',
      detailsText: '10 de 10 cámaras resueltas. Tiempo restante: 04:12 min. 0 errores cometidos.',
      roomCode: '191440',
      studentResults: [
        {
          id: 'std-1',
          name: 'Marie Curie',
          avatar: '👩‍🔬',
          grade: 96,
          score: 2850,
          escapedOrWon: true,
          details: '10/10 cámaras resueltas · 0 errores · 04:12 restante',
        },
        {
          id: 'std-2',
          name: 'Linus Pauling',
          avatar: '👨‍🔬',
          grade: 88,
          score: 2400,
          escapedOrWon: true,
          details: '9/10 cámaras resueltas · 1 error · 02:45 restante',
        },
        {
          id: 'std-3',
          name: 'Dmitri Mendeléyev',
          avatar: '🧔',
          grade: 82,
          score: 2100,
          escapedOrWon: true,
          details: '8/10 cámaras resueltas · 2 errores · 01:10 restante',
        },
      ],
    },
    {
      id: 'seed-rec-2',
      dateStr: formatTime(86400000), // Yesterday
      timestamp: Date.now() - 86400000,
      gameType: 'cien_latinos',
      gameTitle: '100 Latinos Dicen: Química en la Vida Cotidiana',
      role: 'student',
      playerName: 'Marie Curie',
      playerAvatar: '👩‍🔬',
      grade: 92, // 92/100 Sobresaliente
      score: 380,
      maxScore: 400,
      isVictory: true,
      statusText: '¡Victoria por Equipos! (Equipo Sol ☀️)',
      detailsText: 'Equipo Sol (380 pts) vs Equipo Rayo (140 pts) · 4 rondas completadas.',
      roomCode: '100500',
      studentResults: [
        {
          id: 'std-1',
          name: 'Marie Curie',
          avatar: '👩‍🔬',
          grade: 92,
          score: 380,
          escapedOrWon: true,
          details: 'Equipo Sol ☀️ · 4 de 4 respuestas en tiempo',
        },
        {
          id: 'std-4',
          name: 'Antoine Lavoisier',
          avatar: '🧑‍🏫',
          grade: 75,
          score: 140,
          escapedOrWon: false,
          details: 'Equipo Rayo ⚡ · 2 respuestas correctas · 1 robo fallido',
        },
      ],
    },
    {
      id: 'seed-rec-3',
      dateStr: formatTime(86400000 * 2), // 2 days ago
      timestamp: Date.now() - 86400000 * 2,
      gameType: 'poker_quimico',
      gameTitle: 'Póker Químico: Síntesis y Enlaces Moleculares',
      role: 'student',
      playerName: 'Marie Curie',
      playerAvatar: '👩‍🔬',
      grade: 90, // 90/100 Sobresaliente
      score: 1450,
      maxScore: 2000,
      isVictory: true,
      statusText: '🏆 Victoria en Showdown (Bote ganado)',
      detailsText: 'Compuesto C2H6O (Etanol) sintetizado con éxito · 1450 fichas obtenidas.',
      roomCode: 'MESA-01',
      studentResults: [
        {
          id: 'std-1',
          name: 'Marie Curie',
          avatar: '👩‍🔬',
          grade: 90,
          score: 1450,
          escapedOrWon: true,
          details: 'Síntesis de Molécula Orgánica Estable (Etanol)',
        },
        {
          id: 'std-2',
          name: 'Linus Pauling',
          avatar: '👨‍🔬',
          grade: 70,
          score: 600,
          escapedOrWon: false,
          details: 'Enlace simple inestable en Flop',
        },
      ],
    },
  ];
}
