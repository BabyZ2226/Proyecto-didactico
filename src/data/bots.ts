import { BotProfile, GamePlayer } from '../types';

export const BOT_PROFILES: BotProfile[] = [
  {
    id: 'bot_mendeleev',
    name: 'Dmitri Mendeléyev',
    avatar: '🧪',
    title: 'Padre de la Tabla Periódica',
    accentColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
  },
  {
    id: 'bot_curie',
    name: 'Marie Curie',
    avatar: '⚛️',
    title: 'Pionera de la Reactividad',
    accentColor: 'border-cyan-500 text-cyan-400 bg-cyan-950/40',
  },
  {
    id: 'bot_pauling',
    name: 'Linus Pauling',
    avatar: '📐',
    title: 'Maestro de la Electronegatividad',
    accentColor: 'border-amber-500 text-amber-400 bg-amber-950/40',
  },
  {
    id: 'bot_lewis',
    name: 'Gilbert N. Lewis',
    avatar: '🔵',
    title: 'Arquitecto del Octeto',
    accentColor: 'border-indigo-500 text-indigo-400 bg-indigo-950/40',
  },
  {
    id: 'bot_boyle',
    name: 'Robert Boyle',
    avatar: '💨',
    title: 'Pionero de los Gases',
    accentColor: 'border-purple-500 text-purple-400 bg-purple-950/40',
  },
  {
    id: 'bot_avogadro',
    name: 'Amedeo Avogadro',
    avatar: '🔢',
    title: 'Estratega Molecular',
    accentColor: 'border-rose-500 text-rose-400 bg-rose-950/40',
  },
];

export function createBotPlayer(index: number): GamePlayer {
  const profile = BOT_PROFILES[index % BOT_PROFILES.length];
  return {
    id: `bot-${profile.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: `${profile.name} (Bot)`,
    avatar: profile.avatar,
    isBot: true,
    isHost: false,
    isReady: true,
    hand: [],
    selectedCardIds: [],
    score: 0,
    statusText: 'Calculando orbitales...',
  };
}
