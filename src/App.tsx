import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ElementCard, GamePhase, GamePlayer, RoomState, GameMode, AppView, EducationalGameType, LatinoGamePack, EscapeRoomPack, ImpostorGamePack, UserAccount } from './types';
import { generateDeck } from './data/deck';
import { createBotPlayer } from './data/bots';
import { PokerTable } from './components/PokerTable';
import { EducationalEscapeRoom } from './components/EducationalEscapeRoom';
import { CienLatinosGame } from './components/CienLatinosGame';
import { ElImpostorGame } from './components/ElImpostorGame';
import { GeoGlobe3DGame } from './components/GeoGlobe3DGame';
import { LobbyView } from './components/LobbyView';
import { ShowdownResults } from './components/ShowdownResults';
import { JoinCreateModal } from './components/JoinCreateModal';
import { QRCodeModal } from './components/QRCodeModal';
import { RulesModal } from './components/RulesModal';
import { DeckSandbox } from './components/DeckSandbox';
import { ProfileModal } from './components/ProfileModal';
import { BalatroHomeMenu } from './components/BalatroHomeMenu';
import { MatchStartTransition } from './components/MatchStartTransition';
import { LandingPage } from './components/LandingPage';
import { AccountModal } from './components/AccountModal';
import { socketClient } from './lib/socketClient';
import { evaluateCards, getBestAIHand, explainTiebreaker } from './lib/evaluator';
import { saveMatchRecord } from './lib/matchHistory';
import { Bot } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  // User Account State
  const [userAccount, setUserAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('aulaplay_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // User Role State: 'teacher' | 'student' | null
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(() => {
    const saved = localStorage.getItem('po_user_role');
    return saved === 'teacher' || saved === 'student' ? saved : null;
  });

  const handleSelectRole = useCallback((role: 'teacher' | 'student') => {
    setUserRole(role);
    localStorage.setItem('po_user_role', role);
  }, []);

  const handleAccountCreated = useCallback((newAcc: UserAccount) => {
    setUserAccount(newAcc);
    setUserRole(newAcc.role);
    setAppView('home');
  }, []);

  const handleLogoutAccount = useCallback(() => {
    localStorage.removeItem('aulaplay_account');
    setUserAccount(null);
    setAppView('landing');
  }, []);

  // Selected Educational Game Type State
  const [selectedGameType, setSelectedGameType] = useState<EducationalGameType>('poker_quimico');
  const [initialLatinosPack, setInitialLatinosPack] = useState<LatinoGamePack | undefined>(undefined);
  const [initialEscapePack, setInitialEscapePack] = useState<EscapeRoomPack | undefined>(undefined);
  const [initialImpostorPack, setInitialImpostorPack] = useState<ImpostorGamePack | undefined>(undefined);

  // Top-level Section: 'landing' vs 'home' vs 'game' vs 'deck_lab'
  const [appView, setAppView] = useState<AppView>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room') || params.get('game') || params.get('autostart')) {
      return 'home';
    }
    const hasAccount = localStorage.getItem('aulaplay_account');
    return hasAccount ? 'home' : 'landing';
  });

  // Game Mode inside 'game'
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [soloBotCount, setSoloBotCount] = useState<number>(3); // Default 3 bots in solo (total 4 players)
  const [startingChips, setStartingChips] = useState<number>(1000); // Customizable initial money per player

  // Solo Mode State
  const [soloDeck, setSoloDeck] = useState<ElementCard[]>([]);
  const [soloCommunity, setSoloCommunity] = useState<ElementCard[]>([]);
  const [soloPlayers, setSoloPlayers] = useState<GamePlayer[]>([]);
  const [soloPhase, setSoloPhase] = useState<GamePhase>('preflop');
  const [soloSelectedCardIds, setSoloSelectedCardIds] = useState<string[]>([]);
  const [soloPot, setSoloPot] = useState<number>(0);
  const [soloCurrentBet, setSoloCurrentBet] = useState<number>(0);
  const [soloTurnIndex, setSoloTurnIndex] = useState<number>(0);
  const [soloActionCount, setSoloActionCount] = useState<number>(0);
  const [soloDealerIndex, setSoloDealerIndex] = useState<number>(0);
  // Multiplayer State
  const [multiplayerRoom, setMultiplayerRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isJoinCreateOpen, setIsJoinCreateOpen] = useState(false);
  const [presetRoomName, setPresetRoomName] = useState('');
  const [joinModalMode, setJoinModalMode] = useState<'create' | 'join'>('create');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomErrorMessage, setRoomErrorMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Match Start Epic Chemical Transition State
  const [isMatchStarting, setIsMatchStarting] = useState(false);
  const [matchStartModeText, setMatchStartModeText] = useState('SOLITARIO - 3 BOTS');
  const [matchStartBotCount, setMatchStartBotCount] = useState<number | undefined>(3);
  const [pendingStartAction, setPendingStartAction] = useState<(() => void) | null>(null);

  const triggerMatchTransition = useCallback((modeText: string, botCount: number | undefined, startAction: () => void) => {
    setMatchStartModeText(modeText);
    setMatchStartBotCount(botCount);
    startAction();
    setPendingStartAction(null);
    setIsMatchStarting(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setIsMatchStarting(false);
    if (pendingStartAction) {
      pendingStartAction();
      setPendingStartAction(null);
    }
  }, [pendingStartAction]);

  // Check URL params for room invite code or quick autostart (e.g. ?room=191440&game=escape_room or ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const gameParam = params.get('game');
    const autostartParam = params.get('autostart');

    if (gameParam === 'escape_room') {
      setSelectedGameType('escape_room');
    } else if (gameParam === 'cien_latinos') {
      setSelectedGameType('cien_latinos');
    } else if (gameParam === 'el_impostor') {
      setSelectedGameType('el_impostor');
    } else if (gameParam === 'geografia_3d') {
      setSelectedGameType('geografia_3d');
    } else if (gameParam === 'poker_quimico') {
      setSelectedGameType('poker_quimico');
    }
    if (roomParam) {
      const code = roomParam.trim().toUpperCase();
      const savedName = localStorage.getItem('po_player_name') || 'Estudiante';
      const savedAvatar = localStorage.getItem('po_player_avatar') || '🧑‍🎓';
      handleJoinRoom(code, savedName, savedAvatar);
      if (gameParam === 'escape_room') {
        setSelectedGameType('escape_room');
      } else if (gameParam === 'cien_latinos') {
        setSelectedGameType('cien_latinos');
      } else if (gameParam === 'el_impostor') {
        setSelectedGameType('el_impostor');
      } else if (gameParam === 'geografia_3d') {
        setSelectedGameType('geografia_3d');
      } else if (gameParam === 'poker_quimico') {
        setSelectedGameType('poker_quimico');
      }
      return;
    }
    if (autostartParam === '1') {
      if (!userRole) {
        handleSelectRole('student');
      }
      if (gameParam === 'escape_room') {
        setSelectedGameType('escape_room');
        setGameMode('solo');
        setAppView('game');
      } else if (gameParam === 'cien_latinos') {
        setSelectedGameType('cien_latinos');
        setGameMode('solo');
        setAppView('game');
      } else if (gameParam === 'el_impostor') {
        setSelectedGameType('el_impostor');
        setGameMode('solo');
        setAppView('game');
      } else if (gameParam === 'geografia_3d') {
        setSelectedGameType('geografia_3d');
        setGameMode('solo');
        setAppView('game');
      } else {
        setSelectedGameType('poker_quimico');
        handleStartSoloGame(3);
      }
    }
  }, []);

  // WebSocket Subscription
  useEffect(() => {
    const unsubscribe = socketClient.subscribe((msg) => {
      if (msg.type === 'room_state') {
        setMultiplayerRoom(msg.state);
        if (msg.state.gameType) {
          setSelectedGameType(msg.state.gameType);
        }
        if (msg.playerId) {
          setMyPlayerId(msg.playerId);
        }
        setIsJoiningRoom(false);
        setRoomErrorMessage(null);
        setGameMode('multiplayer');
        setAppView('game');
        setIsJoinCreateOpen(false);
      } else if (msg.type === 'error') {
        setIsJoiningRoom(false);
        setRoomErrorMessage(msg.message);
        setIsJoinCreateOpen(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [
    appView,
    isJoinCreateOpen,
    isAccountModalOpen,
    isRulesOpen,
    isSettingsOpen,
    multiplayerRoom?.code,
    multiplayerRoom?.phase,
  ]);

  // Start a fresh new Solo Game with explicitly selected bot count
  const handleStartSoloGame = useCallback((
    botCount: number = soloBotCount,
    gameTypeOverride?: EducationalGameType,
    packOverride?: LatinoGamePack,
    escapePackOverride?: EscapeRoomPack,
    impostorPackOverride?: ImpostorGamePack
  ) => {
    const targetGame = gameTypeOverride || selectedGameType;
    if (gameTypeOverride) {
      setSelectedGameType(gameTypeOverride);
    }
    if (packOverride) {
      setInitialLatinosPack(packOverride);
    }
    if (escapePackOverride) {
      setInitialEscapePack(escapePackOverride);
    }
    if (impostorPackOverride) {
      setInitialImpostorPack(impostorPackOverride);
    }

    if (targetGame === 'escape_room' || targetGame === 'cien_latinos' || targetGame === 'el_impostor' || targetGame === 'geografia_3d') {
      setMultiplayerRoom(null);
      setGameMode('solo');
      setAppView('game');
      return;
    }

    const isTeacher = userRole === 'teacher';
    const newDeck = generateDeck();
    const bots: GamePlayer[] = [];
    const totalBotCount = botCount;

    let initialHeroCardIds: string[] = [];
    const humanPlayerName = localStorage.getItem('po_player_name') || (isTeacher ? 'Profesor (Prueba)' : 'Tú (Químico)');
    const humanAvatar = localStorage.getItem('po_player_avatar') || (isTeacher ? '👨‍🏫' : '👨‍🔬');

    const humanHero: GamePlayer = {
      id: 'hero-player',
      name: humanPlayerName,
      avatar: humanAvatar,
      isBot: false,
      isHost: true,
      isReady: true,
      hand: [newDeck.pop()!, newDeck.pop()!],
      selectedCardIds: [],
      score: 0,
      statusText: 'Pensando...',
      chips: startingChips,
      currentBet: 0,
      hasFolded: false,
    };
    humanHero.selectedCardIds = humanHero.hand.map((c) => c.id);
    initialHeroCardIds = humanHero.selectedCardIds;
    bots.push(humanHero);

    for (let i = 0; i < totalBotCount; i++) {
      const botTemplate = createBotPlayer(i);
      const bot: GamePlayer = {
        ...botTemplate,
        hand: [newDeck.pop()!, newDeck.pop()!],
        selectedCardIds: [],
        score: 0,
        chips: startingChips,
        currentBet: 0,
        hasFolded: false,
      };
      bot.selectedCardIds = bot.hand.map((c) => c.id);
      bots.push(bot);
    }

    const all = bots;
    setSoloBotCount(botCount);
    setSoloDeck(newDeck);
    setSoloCommunity([]);
    setSoloPhase('preflop');
    setSoloSelectedCardIds(initialHeroCardIds);
    setSoloPot(0);
    setSoloCurrentBet(0);
    setSoloDealerIndex(0);
    setSoloTurnIndex(1 % all.length); // Next after dealer
    setSoloActionCount(0);
    setSoloPlayers(all);
    setGameMode('solo');
    setAppView('game');
  }, [soloBotCount, startingChips, selectedGameType, userRole]);

  const handleStartSoloWithTransition = useCallback((
    botCount: number = soloBotCount,
    gameTypeOverride?: EducationalGameType,
    packOverride?: LatinoGamePack,
    escapePackOverride?: EscapeRoomPack,
    impostorPackOverride?: ImpostorGamePack
  ) => {
    const targetGame = gameTypeOverride || selectedGameType;
    if (gameTypeOverride) {
      setSelectedGameType(gameTypeOverride);
    }
    if (targetGame === 'escape_room' || targetGame === 'cien_latinos' || targetGame === 'el_impostor' || targetGame === 'geografia_3d') {
      handleStartSoloGame(botCount, targetGame, packOverride, escapePackOverride, impostorPackOverride);
      return;
    }
    triggerMatchTransition(
      `PARTIDA SOLITARIO (${botCount} ${botCount === 1 ? 'BOT' : 'BOTS'})`,
      botCount,
      () => {
        handleStartSoloGame(botCount, 'poker_quimico');
      }
    );
  }, [soloBotCount, selectedGameType, triggerMatchTransition, handleStartSoloGame]);

  // Advance to Next Hand in Solo Game (or restart)
  const startNewSoloHand = useCallback((isNewGame = false) => {
    if (isNewGame) {
      handleStartSoloWithTransition(soloBotCount);
      return;
    }

    setSoloPlayers((prevPlayers) => {
      const newDeck = generateDeck();
      const isTeacher = userRole === 'teacher';

      // Next hand logic: maintain existing chips, eliminate bankrupt players
      const existingHero = prevPlayers.find((p) => !p.isBot);
      if (!existingHero || (existingHero.chips || 0) <= 0) {
        setTimeout(() => setSoloPhase('game_over'), 0);
        return prevPlayers; // Hero eliminated
      }

      const activeBots = prevPlayers.filter((p) => p.isBot && (p.chips || 0) > 0);
      if (activeBots.length === 0) {
        setTimeout(() => setSoloPhase('game_over'), 0);
        return prevPlayers; // Hero won the entire game
      }

      const survivors = [existingHero, ...activeBots];
      const nextPlayers = survivors.map((p) => {
        const hand = [newDeck.pop()!, newDeck.pop()!];
        return {
          ...p,
          hand,
          selectedCardIds: hand.map((c) => c.id),
          currentBet: 0,
          hasFolded: false,
          evaluation: null,
          statusText: p.isBot ? 'Esperando...' : 'Pensando...',
        };
      });

      // Rotate dealer to next player
      const nextDealer = (soloDealerIndex + 1) % nextPlayers.length;
      const initialTurn = (nextDealer + 1) % nextPlayers.length;
      
      setSoloDeck(newDeck);
      setSoloCommunity([]);
      setSoloPhase('preflop');
      setSoloSelectedCardIds(nextPlayers[0]?.selectedCardIds || []);
      setSoloPot(0);
      setSoloCurrentBet(0);
      setSoloDealerIndex(nextDealer);
      setSoloTurnIndex(initialTurn);
      setSoloActionCount(0);
      return nextPlayers;
    });
  }, [handleStartSoloGame, soloBotCount, soloDealerIndex, userRole, startingChips]);

  // Exit match to menu and ensure match state is completely wiped
  const handleExitGameToHome = useCallback(() => {
    setSoloPlayers([]);
    setSoloCommunity([]);
    setSoloDeck([]);
    setSoloPot(0);
    setSoloCurrentBet(0);
    setSoloPhase('preflop');
    if (gameMode === 'multiplayer') {
      socketClient.leaveRoom();
      setMultiplayerRoom(null);
      setGameMode('solo');
    }
    setAppView('home');
  }, [gameMode]);

  // Bot Turn Effect
  useEffect(() => {
    if (gameMode !== 'solo' || soloPhase === 'showdown' || soloPhase === 'game_over') return;
    
    const currentPlayer = soloPlayers[soloTurnIndex];
    if (!currentPlayer || !currentPlayer.isBot || currentPlayer.hasFolded) return;

    const botTimer = setTimeout(() => {
      const toPay = soloCurrentBet - (currentPlayer.currentBet || 0);
      const botChips = currentPlayer.chips || 0;
      
      let action: 'fold' | 'call' | 'raise' | 'check' = 'check';
      let raiseAmt = 0;
      
      const random = Math.random();

      if (toPay > 0) {
        // There is an active bet that the bot must match
        if (toPay > botChips) {
          // Can only fold or all-in
          action = random < 0.4 ? 'fold' : 'call';
        } else if (random < 0.15 && toPay > 150) {
          action = 'fold';
        } else if (random < 0.25 && botChips > toPay + 50) {
          // Bot re-raises
          action = 'raise';
          const possibleRaises = [50, 100, 150, 200, 250, 300];
          const chosen = possibleRaises[Math.floor(Math.random() * possibleRaises.length)];
          raiseAmt = Math.min(chosen, Math.min(botChips - toPay, 300));
          if (raiseAmt <= 0) {
            action = 'call';
            raiseAmt = 0;
          }
        } else {
          action = 'call'; // Equalize bet
        }
      } else {
        // No current bet on table (bot can Check or Initiate a Bet)
        if (random < 0.35 && botChips > 50) {
          action = 'raise'; // Bot initiates betting
          const possibleBets = [50, 75, 100, 150, 200, 250, 300];
          const chosen = possibleBets[Math.floor(Math.random() * possibleBets.length)];
          raiseAmt = Math.min(chosen, Math.min(botChips, 300));
          
          // Occasional All-In bluff or value bet
          if (Math.random() < 0.05) {
            raiseAmt = botChips;
          }
        } else {
          action = 'check';
        }
      }
      
      handleSoloBet(action, raiseAmt, soloTurnIndex);
    }, 750);
    
    return () => clearTimeout(botTimer);
  }, [soloTurnIndex, soloPlayers, soloPhase, soloCurrentBet, gameMode]);

  // Solo Phase Progression
  const handleSoloBet = (action: 'fold' | 'check' | 'call' | 'raise', amount: number = 0, actorIndex: number = 0) => {
    if (soloPhase === 'showdown') {
      startNewSoloHand(false);
      return;
    }

    setSoloPlayers((prev) => {
      const nextPlayers = [...prev];
      const player = nextPlayers[actorIndex];
      if (!player || player.hasFolded) return prev;

      let newHighestBet = soloCurrentBet;
      let newActionCount = soloActionCount + 1;

      if (action === 'raise' && amount > 0) {
        // Bet cap: 300 unless All-In
        const cappedAmount = amount > 300 && amount !== (player.chips || 0) ? 300 : amount;
        newHighestBet = soloCurrentBet + cappedAmount;
        setSoloCurrentBet(newHighestBet);
        newActionCount = 1; // Reset action count since bet was raised
        player.statusText = cappedAmount >= (player.chips || 0) ? '¡ALL IN!' : `Sube a ${newHighestBet}`;
      } else if (action === 'fold') {
        player.hasFolded = true;
        player.statusText = 'Se retira';
      } else if (action === 'call') {
        player.statusText = soloCurrentBet > 0 ? `Iguala ${soloCurrentBet}` : 'Pasa';
      } else if (action === 'check') {
        player.statusText = 'Pasa';
      }

      // Calculate chip contribution (all players match the highest bet)
      const toPay = newHighestBet - (player.currentBet || 0);
      let paidThisAction = 0;
      if (action !== 'fold' && toPay > 0) {
        paidThisAction = Math.min(player.chips || 0, toPay);
        player.chips = (player.chips || 0) - paidThisAction;
        player.currentBet = (player.currentBet || 0) + paidThisAction;
        setSoloPot((prevPot) => prevPot + paidThisAction);
      }

      setSoloActionCount(newActionCount);

      const activePlayers = nextPlayers.filter((p) => !p.hasFolded);

      // If everyone folded except one, that survivor wins immediately
      if (activePlayers.length === 1) {
        const soleWinner = activePlayers[0];
        soleWinner.chips = (soleWinner.chips || 0) + soloPot + paidThisAction;
        soleWinner.statusText = '🏆 ¡Gana por retirada de oponentes!';
        setTimeout(() => setSoloPhase('showdown'), 600);
        return nextPlayers;
      }

      // Check if betting round completed
      const isRoundOver = newActionCount >= activePlayers.length;

      if (isRoundOver) {
        setTimeout(() => advanceSoloPhase(), 600);
      } else {
        let nextIndex = (actorIndex + 1) % nextPlayers.length;
        while (nextPlayers[nextIndex].hasFolded) {
          nextIndex = (nextIndex + 1) % nextPlayers.length;
        }
        setSoloTurnIndex(nextIndex);
      }

      return nextPlayers;
    });
  };

  const advanceSoloPhase = () => {
    // Reset bets for new phase
    setSoloPlayers((prev) => prev.map(p => ({ ...p, currentBet: 0 })));
    setSoloCurrentBet(0);
    setSoloActionCount(0);
    // Find first active player for next phase
    setSoloPlayers((prev) => {
      let firstActive = (soloDealerIndex + 1) % prev.length;
      let checks = 0;
      while (checks < prev.length && prev[firstActive].hasFolded) {
        firstActive = (firstActive + 1) % prev.length;
        checks++;
      }
      setSoloTurnIndex(firstActive);
      return prev;
    });

    const newDeck = [...soloDeck];
    const newCommunity = [...soloCommunity];

    switch (soloPhase) {
      case 'preflop':
        newCommunity.push(newDeck.pop()!, newDeck.pop()!, newDeck.pop()!);
        setSoloPhase('flop');
        break;
      case 'flop':
        newCommunity.push(newDeck.pop()!);
        setSoloPhase('turn');
        break;
      case 'turn':
        newCommunity.push(newDeck.pop()!);
        setSoloPhase('river');
        break;
      case 'river': {
        // Evaluate all players & bots at showdown
        const updatedPlayers = soloPlayers.map((p) => {
          if (p.hasFolded) {
            return p;
          }
          const available = [...p.hand, ...newCommunity];
          if (p.isBot) {
            const best = getBestAIHand(p.hand, newCommunity);
            return {
              ...p,
              selectedCardIds: best.cards.map((c) => c.id),
              evaluation: best,
              statusText: best.isValid ? `¡${best.name}! (${best.formula})` : 'Inestable',
            };
          } else {
            // Human player
            const selectedCards = soloSelectedCardIds
              .map((id) => available.find((c) => c.id === id)!)
              .filter(Boolean);

            const evalRes =
              selectedCards.length > 0
                ? evaluateCards(selectedCards)
                : getBestAIHand(p.hand, newCommunity);

            return {
              ...p,
              selectedCardIds:
                selectedCards.length > 0 ? soloSelectedCardIds : evalRes.cards.map((c) => c.id),
              evaluation: evalRes,
              statusText: evalRes.isValid ? `¡${evalRes.name}! (${evalRes.formula})` : 'Inestable',
            };
          }
        });

        // Award score to the winner among non-folded players
        const activeContenders = updatedPlayers.filter((p) => !p.hasFolded);
        const ranked = [...activeContenders].sort((a, b) => {
          const rankA = a.evaluation?.rank ?? 0;
          const rankB = b.evaluation?.rank ?? 0;
          if (rankB !== rankA) return rankB - rankA;
          return (b.evaluation?.tiebreaker ?? 0) - (a.evaluation?.tiebreaker ?? 0);
        });

        if (ranked.length > 0 && ranked[0].evaluation?.isValid) {
          ranked[0].score += 100;
          ranked[0].chips = (ranked[0].chips || 0) + soloPot;
          
          if (ranked.length > 1 && ranked[1].evaluation?.isValid && ranked[0].evaluation.rank === ranked[1].evaluation.rank) {
            const tieExplain = explainTiebreaker(ranked[0].evaluation, ranked[1].evaluation);
            if (tieExplain) {
              ranked[0].statusText = `🏆 ¡Gana el desempate! ${tieExplain}`;
            }
          }
        } else if (ranked.length > 0 && !ranked[0].evaluation?.isValid) {
            // Give pot back to hero for fun if nobody wins or keep it simple
            const heroIdx = updatedPlayers.findIndex(p => !p.isBot);
            if(heroIdx !== -1) updatedPlayers[heroIdx].chips = (updatedPlayers[heroIdx].chips || 0) + soloPot;
        }

        const heroPlayer = updatedPlayers.find((p) => !p.isBot) || updatedPlayers[0];
        const isWinner = ranked.length > 0 && ranked[0].id === heroPlayer.id && ranked[0].evaluation?.isValid;
        const compoundName = heroPlayer.evaluation?.name || 'Compuesto no formado';
        const formula = heroPlayer.evaluation?.formula || '';
        const isValidCompound = Boolean(heroPlayer.evaluation?.isValid);

        // Academic grade calculation on standard 0-100 scale:
        let pokerGrade = 60;
        if (isValidCompound) {
          pokerGrade = isWinner ? 95 : 85;
          if ((heroPlayer.evaluation?.rank || 0) >= 3) {
            pokerGrade = Math.min(100, pokerGrade + 5);
          }
        } else {
          pokerGrade = 55;
        }

        saveMatchRecord({
          gameType: 'poker_quimico',
          gameTitle: 'Póker Químico: Síntesis de Compuestos',
          role: userRole || 'student',
          playerName: heroPlayer.name,
          playerAvatar: heroPlayer.avatar,
          grade: pokerGrade,
          score: heroPlayer.chips || soloPot,
          isVictory: Boolean(isWinner),
          statusText: isWinner
            ? `🏆 ¡Victoria en Showdown!`
            : isValidCompound
            ? `🧪 Síntesis Válida (${compoundName})`
            : `⚠️ Enlace Inestable`,
          detailsText: isValidCompound
            ? `Molécula sintetizada: ${compoundName} ${formula ? `(${formula})` : ''} · Bote: ${soloPot} fichas.`
            : 'No se logró sintetizar un compuesto químicamente estable en esta mano.',
          roomCode: 'SOLO-MESA',
          studentResults: updatedPlayers.map((p) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            grade: p.evaluation?.isValid ? (ranked[0]?.id === p.id ? 95 : 85) : 55,
            score: p.chips || 0,
            escapedOrWon: ranked.length > 0 && ranked[0]?.id === p.id,
            details: p.evaluation?.isValid
              ? `${p.evaluation.name} (${p.evaluation.formula})`
              : 'Compuesto inestable',
          })),
        });

        setSoloPlayers(updatedPlayers);
        setSoloPhase('showdown');
        break;
      }
      case 'showdown':
        startNewSoloHand(false);
        return;
    }

    setSoloDeck(newDeck);
    setSoloCommunity(newCommunity);
  };

  // Card Selection & Evaluation
  const currentHero = useMemo(() => {
    if (userRole === 'teacher' && gameMode !== 'solo') return null;
    if (gameMode === 'solo') {
      return soloPlayers.find((p) => !p.isBot && !p.isSpectator) || null;
    } else {
      return (
        multiplayerRoom?.players.find((p) => p.id === myPlayerId && !p.isSpectator && p.role !== 'teacher') ||
        null
      );
    }
  }, [userRole, gameMode, soloPlayers, multiplayerRoom, myPlayerId]);

  const currentCommunity = gameMode === 'solo' ? soloCommunity : multiplayerRoom?.communityCards || [];
  const currentPhase = gameMode === 'solo' ? soloPhase : multiplayerRoom?.phase || 'lobby';
  const currentPlayers = gameMode === 'solo' ? soloPlayers : multiplayerRoom?.players || [];
  const currentSelectedCardIds =
    gameMode === 'solo' ? soloSelectedCardIds : currentHero?.selectedCardIds || [];

  const toggleCardSelection = (cardId: string) => {
    if (gameMode === 'solo') {
      if (soloSelectedCardIds.includes(cardId)) {
        setSoloSelectedCardIds((prev) => prev.filter((id) => id !== cardId));
      } else {
        if (soloSelectedCardIds.length < 5) {
          setSoloSelectedCardIds((prev) => [...prev, cardId]);
        }
      }
    } else {
      const currentIds = currentHero?.selectedCardIds || [];
      let nextIds: string[];
      if (currentIds.includes(cardId)) {
        nextIds = currentIds.filter((id) => id !== cardId);
      } else {
        if (currentIds.length < 5) {
          nextIds = [...currentIds, cardId];
        } else {
          nextIds = currentIds;
        }
      }
      socketClient.selectCards(nextIds);
    }
  };

  const autoOptimizeHero = () => {
    if (!currentHero) return;
    const best = getBestAIHand(currentHero.hand, currentCommunity);
    const bestIds = best.cards.map((c) => c.id);

    if (gameMode === 'solo') {
      setSoloSelectedCardIds(bestIds);
    } else {
      socketClient.selectCards(bestIds);
    }
  };

  const currentEvaluation = useMemo(() => {
    if (!currentHero) return evaluateCards([]);
    const available = [...currentHero.hand, ...currentCommunity];
    const selected = currentSelectedCardIds
      .map((id) => available.find((c) => c.id === id)!)
      .filter(Boolean);
    return evaluateCards(selected);
  }, [currentHero, currentCommunity, currentSelectedCardIds]);

  // Handlers for Multiplayer
  const handleCreateRoom = (
    playerName: string,
    avatar: string,
    botCount: number,
    maxPlayers: number,
    roomName?: string,
    gameType: EducationalGameType = selectedGameType,
    googleEmail?: string,
    googleUid?: string
  ) => {
    setIsJoiningRoom(true);
    setRoomErrorMessage(null);
    socketClient.createRoom(
      playerName,
      avatar,
      botCount,
      maxPlayers,
      roomName,
      userRole === 'teacher',
      gameType,
      googleEmail,
      googleUid
    );
  };

  const handleJoinRoom = (
    roomCode: string,
    playerName: string,
    avatar: string,
    googleEmail?: string,
    googleUid?: string
  ) => {
    setIsJoiningRoom(true);
    setRoomErrorMessage(null);
    socketClient.joinRoom(roomCode, playerName, avatar, googleEmail, googleUid);
  };

  const handleLeaveMultiplayer = () => {
    socketClient.leaveRoom();
    setMultiplayerRoom(null);
    setGameMode('solo');
  };

  const handleReturnToRoomLobby = useCallback(() => {
    if (gameMode === 'multiplayer' && multiplayerRoom) {
      socketClient.returnToLobby();
    } else {
      handleStartSoloGame(soloBotCount);
    }
  }, [gameMode, multiplayerRoom, handleStartSoloGame, soloBotCount]);

  return (
    <div className="min-h-screen h-auto w-full bg-[#090a0f] text-zinc-100 font-sans flex flex-col selection:bg-zinc-700 relative">
      {/* Main Content Body */}
      <main className="flex-1 flex flex-col relative min-h-screen h-auto w-full">
        {isJoinCreateOpen ? (
          <JoinCreateModal
            initialCode=""
            initialRoomName={presetRoomName}
            defaultMode={joinModalMode}
            userRole={userRole}
            currentGameType={selectedGameType}
            isLoading={isJoiningRoom}
            errorMessage={roomErrorMessage}
            onClearError={() => setRoomErrorMessage(null)}
            onClose={() => {
              setIsJoinCreateOpen(false);
              setRoomErrorMessage(null);
              setIsJoiningRoom(false);
            }}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        ) : isAccountModalOpen ? (
          <AccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            onAccountCreated={handleAccountCreated}
            initialRole={userRole || undefined}
          />
        ) : isRulesOpen ? (
          <RulesModal
            onClose={() => setIsRulesOpen(false)}
          />
        ) : isSettingsOpen ? (
          <ProfileModal onClose={() => setIsSettingsOpen(false)} />
        ) : appView === 'game' && currentPhase === 'showdown' ? (
          <ShowdownResults
            players={currentPlayers}
            currentUserId={gameMode === 'solo' ? 'hero-player' : myPlayerId}
            isHost={gameMode === 'solo' || multiplayerRoom?.hostId === myPlayerId}
            pot={gameMode === 'solo' ? soloPot : (multiplayerRoom?.pot || 0)}
            roomCode={multiplayerRoom?.code}
            onNextHand={() => {
              if (gameMode === 'solo') {
                advanceSoloPhase();
              } else {
                socketClient.restartHand();
              }
            }}
            onReturnToLobby={handleReturnToRoomLobby}
            onGoHome={handleExitGameToHome}
          />
        ) : appView === 'landing' ? (
          <LandingPage
            currentAccount={userAccount}
            onOpenCreateAccount={() => setIsAccountModalOpen(true)}
            onEnterGames={() => setAppView('home')}
            onLogoutAccount={handleLogoutAccount}
          />
        ) : appView === 'home' ? (
          <BalatroHomeMenu
            userRole={userRole}
            onSelectRole={handleSelectRole}
            playerName={userAccount?.username || localStorage.getItem('po_player_name') || 'Marie Curie'}
            playerAvatar={userAccount?.avatar || localStorage.getItem('po_player_avatar') || '👨‍🔬'}
            onUpdatePlayerInfo={(name, avatar) => {
              localStorage.setItem('po_player_name', name);
              localStorage.setItem('po_player_avatar', avatar);
            }}
            soloBotCount={soloBotCount}
            onSelectBotCount={(count) => setSoloBotCount(count)}
            startingChips={startingChips}
            onSelectStartingChips={(chips) => setStartingChips(chips)}
            onSelectGameType={(gt, roomTitle) => {
              setSelectedGameType(gt);
              if (roomTitle) setPresetRoomName(roomTitle);
            }}
            onStartSolo={(count, gt, pack, escapePack, impostorPack) => handleStartSoloWithTransition(count, gt, pack, escapePack, impostorPack)}
            onOpenMultiplayer={(mode) => {
              if (mode) setJoinModalMode(mode);
              setIsJoinCreateOpen(true);
            }}
            onOpenDeckLab={() => setAppView('deck_lab')}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onGoLanding={() => setAppView('landing')}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        ) : appView === 'deck_lab' ? (
          <DeckSandbox
            onBackToGame={() => {
              if (soloPlayers.length === 0) {
                handleStartSoloWithTransition(soloBotCount, 'poker_quimico');
              } else {
                setAppView('game');
              }
            }}
            onBackToHome={handleExitGameToHome}
          />
        ) : (multiplayerRoom?.gameType || selectedGameType) === 'geografia_3d' ? (
          <GeoGlobe3DGame
            players={currentPlayers}
            currentUserId={gameMode === 'solo' ? 'hero-player' : myPlayerId}
            isTeacherSpectator={userRole === 'teacher' && gameMode !== 'solo'}
            isSoloPractice={gameMode === 'solo' && !multiplayerRoom}
            room={multiplayerRoom}
            onGoHome={handleExitGameToHome}
          />
        ) : (multiplayerRoom?.gameType || selectedGameType) === 'el_impostor' ? (
          <ElImpostorGame
            players={currentPlayers}
            currentUserId={gameMode === 'solo' ? 'hero-player' : myPlayerId}
            isTeacherSpectator={userRole === 'teacher' && gameMode !== 'solo'}
            isSoloPractice={gameMode === 'solo' && !multiplayerRoom}
            room={multiplayerRoom}
            initialPack={initialImpostorPack}
            onGoHome={handleExitGameToHome}
          />
        ) : (multiplayerRoom?.gameType || selectedGameType) === 'cien_latinos' ? (
          <CienLatinosGame
            players={currentPlayers}
            currentUserId={gameMode === 'solo' ? 'hero-player' : myPlayerId}
            isTeacherSpectator={userRole === 'teacher' && gameMode !== 'solo'}
            isSoloPractice={gameMode === 'solo' && !multiplayerRoom}
            room={multiplayerRoom}
            initialPack={initialLatinosPack}
            onGoHome={handleExitGameToHome}
          />
        ) : (multiplayerRoom?.gameType || selectedGameType) === 'escape_room' ? (
          <EducationalEscapeRoom
            players={currentPlayers}
            currentUserId={gameMode === 'solo' ? 'hero-player' : myPlayerId}
            isTeacherSpectator={userRole === 'teacher' && gameMode !== 'solo'}
            isSoloPractice={gameMode === 'solo' && !multiplayerRoom}
            room={multiplayerRoom}
            initialPack={initialEscapePack}
            onGoHome={handleExitGameToHome}
          />
        ) : gameMode === 'multiplayer' && multiplayerRoom && multiplayerRoom.phase === 'lobby' ? (
          <LobbyView
            room={multiplayerRoom}
            currentUserId={myPlayerId}
            startingChips={startingChips}
            onSelectStartingChips={(chips) => setStartingChips(chips)}
            onStartGame={() => {
              triggerMatchTransition('PARTIDA MULTIJUGADOR ONLINE', undefined, () => {
                socketClient.startGame();
              });
            }}
            onSetBotCount={(count) => socketClient.setBotCount(count)}
            onLeaveRoom={handleLeaveMultiplayer}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        ) : (
          /* Active Poker Table (Póker Químico del Octeto) */
          <PokerTable
            phase={currentPhase}
            communityCards={currentCommunity}
            players={currentPlayers}
            currentUserId={gameMode === 'solo' ? 'hero-player' : myPlayerId}
            selectedCardIds={currentSelectedCardIds}
            evaluation={currentEvaluation}
            onToggleCard={toggleCardSelection}
            onAutoOptimize={autoOptimizeHero}
            onAdvancePhase={() => {
              if (gameMode === 'solo') advanceSoloPhase();
              else socketClient.advancePhase();
            }}
            onLockIn={() => {
              if (gameMode === 'multiplayer') socketClient.lockIn(true);
            }}
            isHost={gameMode === 'solo' || multiplayerRoom?.hostId === myPlayerId}
            pot={gameMode === 'solo' ? soloPot : 0}
            dealerIndex={gameMode === 'solo' ? soloDealerIndex : 0}
            turnIndex={gameMode === 'solo' ? soloTurnIndex : 0}
            currentBet={gameMode === 'solo' ? soloCurrentBet : 0}
            onFold={() => {
              const heroIdx = soloPlayers.findIndex((p) => !p.isBot);
              handleSoloBet('fold', 0, heroIdx !== -1 ? heroIdx : 0);
            }}
            onCallCheck={() => {
              if (currentPhase === 'showdown') {
                advanceSoloPhase();
                return;
              }
              const heroIdx = soloPlayers.findIndex((p) => !p.isBot);
              const heroPlayer = soloPlayers[heroIdx !== -1 ? heroIdx : 0];
              const toPay = soloCurrentBet - (heroPlayer?.currentBet || 0);
              handleSoloBet(toPay > 0 ? 'call' : 'check', 0, heroIdx !== -1 ? heroIdx : 0);
            }}
            onRaise={(amount) => {
              const heroIdx = soloPlayers.findIndex((p) => !p.isBot);
              handleSoloBet('raise', amount, heroIdx !== -1 ? heroIdx : 0);
            }}
            onReturnToLobby={gameMode === 'multiplayer' ? handleReturnToRoomLobby : undefined}
            onGoHome={handleExitGameToHome}
            userRole={gameMode === 'solo' ? 'student' : userRole}
            room={multiplayerRoom}
          />
        )}
      </main>

      {/* Game Over Modal (Solo Mode) */}
      {appView === 'game' && currentPhase === 'game_over' && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center max-w-md w-full shadow-2xl mx-4"
          >
            {(currentHero?.chips || 0) > 0 ? (
              <>
                <div className="mx-auto w-16 h-16 bg-emerald-950/50 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                  <span className="text-3xl">🏆</span>
                </div>
                <h2 className="text-3xl font-black text-emerald-400 mb-2 tracking-tighter">¡VICTORIA TOTAL!</h2>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed">Has dejado a todos los bots en bancarrota. Eres el rey indiscutible de la química.</p>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                  <span className="text-3xl">💥</span>
                </div>
                <h2 className="text-3xl font-black text-red-500 mb-2 tracking-tighter">BANCARROTA</h2>
                <p className="text-zinc-400 mb-8 text-sm leading-relaxed">Te has quedado sin fichas. Tus reacciones químicas no fueron suficientes.</p>
              </>
            )}
            
            <button
              onClick={() => handleStartSoloWithTransition(soloBotCount)}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors w-full flex items-center justify-center gap-2 mb-3 shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <Bot size={18} />
              Jugar de Nuevo ({soloBotCount} {soloBotCount === 1 ? 'Bot' : 'Bots'})
            </button>
            <button
              onClick={handleExitGameToHome}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors w-full border border-zinc-700 cursor-pointer"
            >
              Volver al Menú Principal
            </button>
          </motion.div>
        </div>
      )}

      {/* Epic Match Start Chemical Reaction Transition Overlay */}
      <AnimatePresence>
        {isMatchStarting && (
          <MatchStartTransition
            isActive={isMatchStarting}
            modeText={matchStartModeText}
            botCount={matchStartBotCount}
            onComplete={handleTransitionComplete}
          />
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      {isQrModalOpen && multiplayerRoom && (
        <QRCodeModal roomCode={multiplayerRoom.code} onClose={() => setIsQrModalOpen(false)} />
      )}
    </div>
  );
}
