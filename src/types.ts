export interface ElementCard {
  id: string; // Unique ID for the specific card instance in a deck
  symbol: string;
  name: string;
  group: number; // Represents valence electrons
  en: number; // Electronegativity
}

export type GamePhase = 'lobby' | 'countdown' | 'playing' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'game_over';

export type GameMode = 'solo' | 'multiplayer';

export type AppView = 'landing' | 'home' | 'game' | 'deck_lab';

export interface UserAccount {
  id: string;
  username: string;
  role: 'teacher' | 'student';
  avatar: string;
  googleEmail: string;
  googleName?: string;
  googleUid?: string;
  subjects: string[];
  createdAt: number;
}

export type ChemicalNature = 'Ácido' | 'Base' | 'Sal' | 'Neutro';

export interface EvaluationResult {
  rank: number;
  name: string;
  pokerHandRank?: string;
  hierarchyTier?: string;
  formula?: string;
  desc: string;
  bondType?: string;
  mechanism?: string;
  isValid: boolean;
  tiebreaker: number;
  cards: ElementCard[];
  centerId?: string;
  bondDetails?: Record<string, number>;
  chemicalVerdict?: 'VICTORIA' | 'DERROTA';
  violationReason?: string;
  chemicalNature?: ChemicalNature;
  moleculeCount?: number;
  subMolecules?: Array<{
    formula: string;
    name: string;
    rank: number;
    chemicalNature: ChemicalNature;
    cards: ElementCard[];
    bondType?: string;
  }>;
  tiebreakReason?: string;
  nobleGasBonus?: {
    count: number;
    points: number;
    cards: ElementCard[];
    desc: string;
  };
}

export interface BotProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  accentColor: string;
}

export interface GamePlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  isHost: boolean;
  isReady: boolean;
  isSpectator?: boolean;
  role?: 'teacher' | 'student';
  googleEmail?: string;
  googleUid?: string;
  hand: ElementCard[];
  selectedCardIds: string[];
  lockedIn?: boolean;
  evaluation?: EvaluationResult | null;
  score: number;
  statusText?: string;
  chips?: number;
  currentBet?: number;
  hasFolded?: boolean;
  escapeProgress?: {
    questionIndex: number;
    totalQuestions: number;
    wrongAttempts: number;
    isVictory: boolean;
    isGameOver: boolean;
    grade: number;
    score: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  isChemical?: boolean;
  timestamp: number;
}

export interface EscapeRoomQuestion {
  id: string;
  chamberTitle: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  lockCode: string;
  hint?: string;
  subject: string;
}

export interface EscapeRoomPack {
  id: string;
  title: string;
  description: string;
  subject: string;
  authorName: string;
  createdAt: number;
  playsCount: number;
  likesCount: number;
  isAiGenerated?: boolean;
  tags: string[];
  chambers: EscapeRoomQuestion[];
}

export interface LatinoAnswerSlot {
  text: string;
  points: number;
  synonyms?: string[];
}

export interface LatinoRoundQuestion {
  id: string;
  prompt: string;
  subject: string;
  multiplier?: 1 | 2 | 3;
  answers: LatinoAnswerSlot[];
}

export interface LatinoGamePack {
  id: string;
  title: string;
  description: string;
  subject: string;
  authorName: string;
  createdAt: number;
  playsCount: number;
  likesCount: number;
  isAiGenerated?: boolean;
  tags: string[];
  rounds: LatinoRoundQuestion[];
}

export interface LatinosMatchState {
  packId: string;
  packTitle: string;
  rounds: LatinoRoundQuestion[];
  currentRoundIndex: number;
  revealedIndices: number[];
  strikes: number;
  maxStrikes?: number;
  turnDurationSeconds?: number;
  allowSteal?: boolean;
  finalMultiplier?: 1 | 2 | 3;
  activeTeam: 'A' | 'B';
  stealOpportunity: boolean;
  roundFinished: boolean;
  roundWinnerTeam?: 'A' | 'B' | null;
  roundPot: number;
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  lastGuessFeedback?: {
    text: string;
    isCorrect: boolean;
    playerName?: string;
    team?: 'A' | 'B';
    pointsAwarded?: number;
    timestamp: number;
  } | null;
  matchFinished: boolean;
}

// ============================================================================
// EL IMPOSTOR (Estilo "Among Us" / "Verdades y una Mentira") TYPES
// ============================================================================
export interface ImpostorStatement {
  id: string;
  label: string; // e.g. 'Sospechoso A (Rojo)', 'Sospechoso B (Azul)'
  crewColor: 'red' | 'cyan' | 'lime' | 'amber';
  text: string;
  isImpostor: boolean;
}

export interface ImpostorRound {
  id: string;
  topicTitle: string;
  prompt: string;
  subject: string;
  statements: ImpostorStatement[];
  justificationOptions: string[];
  correctJustificationIndex: number;
  impostorExplanation: string;
}

export interface ImpostorGamePack {
  id: string;
  title: string;
  description: string;
  subject: string;
  authorName: string;
  createdAt: number;
  playsCount: number;
  likesCount: number;
  isAiGenerated?: boolean;
  tags: string[];
  rounds: ImpostorRound[];
}

export interface ImpostorVoteRecord {
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  statementIndex: number;
  timestamp: number;
}

export interface ImpostorMatchState {
  packId: string;
  packTitle: string;
  rounds: ImpostorRound[];
  currentRoundIndex: number;
  phase: 'debate' | 'revealed' | 'finished';
  playerScores: Record<string, number>;
  votes: Record<string, ImpostorVoteRecord>;
  ejectedStatementIndex?: number | null;
  roundTimeSeconds?: number;
  pointsPerHit?: number;
  wrongVotePenalty?: number;
  hideLiveVotes?: boolean;
  autoRevealWhenAllVote?: boolean;
}

export type EducationalGameType = 'poker_quimico' | 'escape_room' | 'cien_latinos' | 'el_impostor' | 'geografia_3d';

export interface RoomState {
  code: string;
  name: string;
  gameType?: EducationalGameType;
  hostId: string;
  hostIsSpectator?: boolean;
  teacherName?: string;
  phase: GamePhase;
  isPaused?: boolean;
  deck: ElementCard[];
  communityCards: ElementCard[];
  players: GamePlayer[];
  maxPlayers: number;
  botCount: number;
  roundNumber: number;
  pot?: number;
  chatMessages: ChatMessage[];
  visitedGoogleEmails?: string[];
  escapeRoomQuestions?: EscapeRoomQuestion[];
  escapeRoomTotalSeconds?: number;
  escapeRoomProgress?: {
    unlockedRooms: string[];
    timeRemainingSeconds: number;
    hintsUsed: number;
    currentRoomId: string;
  };
  latinosState?: LatinosMatchState;
  impostorState?: ImpostorMatchState;
  playerTeams?: Record<string, 'A' | 'B'>;
}

export type WSClientMessage =
  | { type: 'create_room'; playerName: string; avatar: string; roomName?: string; botCount: number; maxPlayers: number; isTeacher?: boolean; gameType?: EducationalGameType; googleEmail?: string; googleUid?: string }
  | { type: 'join_room'; roomCode: string; playerName: string; avatar: string; googleEmail?: string; googleUid?: string }
  | { type: 'reconnect_session'; roomCode: string; playerId: string; playerName?: string; avatar?: string; googleEmail?: string; googleUid?: string }
  | { type: 'leave_room' }
  | { type: 'set_bot_count'; botCount: number }
  | { type: 'start_game' }
  | { type: 'toggle_pause'; isPaused?: boolean }
  | { type: 'advance_phase' }
  | { type: 'select_cards'; selectedCardIds: string[] }
  | { type: 'lock_in'; locked: boolean }
  | { type: 'send_chat'; text: string; isChemical?: boolean }
  | { type: 'restart_hand' }
  | { type: 'return_to_lobby' }
  | { type: 'update_escape_config'; questions?: EscapeRoomQuestion[]; totalSeconds?: number }
  | { type: 'update_escape_progress'; questionIndex: number; totalQuestions: number; wrongAttempts: number; isVictory: boolean; isGameOver: boolean; grade: number; score: number }
  | { type: 'update_latinos_state'; state: LatinosMatchState; playerTeams?: Record<string, 'A' | 'B'> }
  | { type: 'switch_latinos_team'; playerId: string; team: 'A' | 'B' }
  | { type: 'submit_latinos_guess'; guess: string; playerName: string; team: 'A' | 'B' }
  | { type: 'update_impostor_state'; state: ImpostorMatchState; playerTeams?: Record<string, 'A' | 'B'> }
  | { type: 'submit_impostor_vote'; vote: ImpostorVoteRecord };

export type WSServerMessage =
  | { type: 'room_state'; state: RoomState; playerId: string }
  | { type: 'error'; message: string }
  | { type: 'chat_message'; message: ChatMessage };
