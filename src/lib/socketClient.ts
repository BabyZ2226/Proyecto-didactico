import { WSClientMessage, WSServerMessage, EducationalGameType } from '../types';

type MessageHandler = (msg: WSServerMessage) => void;

const SESSION_KEY = 'po_active_session';

class SocketClient {
  private socket: WebSocket | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private pendingQueue: WSClientMessage[] = [];
  private isConnecting = false;
  private reconnectTimer: any = null;
  public currentRoomCode: string | null = null;
  public currentPlayerId: string | null = null;
  public currentPlayerName: string | null = null;
  public currentAvatar: string | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.currentRoomCode = parsed.roomCode || null;
        this.currentPlayerId = parsed.playerId || null;
        this.currentPlayerName = parsed.playerName || null;
        this.currentAvatar = parsed.avatar || null;
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }

  public saveSession(roomCode: string, playerId: string, playerName?: string, avatar?: string) {
    this.currentRoomCode = roomCode;
    this.currentPlayerId = playerId;
    if (playerName) this.currentPlayerName = playerName;
    if (avatar) this.currentAvatar = avatar;

    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          roomCode,
          playerId,
          playerName: this.currentPlayerName,
          avatar: this.currentAvatar,
        })
      );
    } catch {
      // Ignore
    }
  }

  public clearSession() {
    this.currentRoomCode = null;
    this.currentPlayerId = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        const check = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnecting = false;

          // If we had an active room session, re-attach immediately
          if (this.currentRoomCode && this.currentPlayerId) {
            this.send({
              type: 'reconnect_session',
              roomCode: this.currentRoomCode,
              playerId: this.currentPlayerId,
              playerName: this.currentPlayerName || undefined,
              avatar: this.currentAvatar || undefined,
            });
          }

          // Flush pending messages
          while (this.pendingQueue.length > 0) {
            const msg = this.pendingQueue.shift();
            if (msg) this.send(msg);
          }
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const parsed: WSServerMessage = JSON.parse(event.data);
            if (parsed.type === 'room_state') {
              if (parsed.state?.code && parsed.playerId) {
                this.saveSession(parsed.state.code, parsed.playerId);
              }
            }
            this.listeners.forEach((listener) => listener(parsed));
          } catch (err) {
            console.error('Failed to parse WS server message:', err);
          }
        };

        this.socket.onclose = () => {
          this.isConnecting = false;
          this.socket = null;
          // Auto-reconnect quickly on mobile
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            if (this.listeners.size > 0 || this.currentRoomCode) {
              this.connect();
            }
          }, 1500);
        };

        this.socket.onerror = (err) => {
          this.isConnecting = false;
          console.warn('WebSocket connection error:', err);
          resolve();
        };
      } catch (e) {
        this.isConnecting = false;
        console.error('WebSocket init error:', e);
        resolve();
      }
    });
  }

  public subscribe(handler: MessageHandler): () => void {
    this.listeners.add(handler);
    this.connect();
    return () => {
      this.listeners.delete(handler);
    };
  }

  public send(msg: WSClientMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      this.pendingQueue.push(msg);
      this.connect();
    }
  }

  public createRoom(
    playerName: string,
    avatar: string,
    botCount: number,
    maxPlayers: number,
    roomName?: string,
    isTeacher = true,
    gameType: EducationalGameType = 'poker_quimico',
    googleEmail?: string,
    googleUid?: string
  ) {
    this.currentPlayerName = playerName;
    this.currentAvatar = avatar;
    this.currentPlayerId = null; // Clear stale session for new room creation
    this.send({
      type: 'create_room',
      playerName,
      avatar,
      botCount,
      maxPlayers,
      roomName,
      isTeacher,
      gameType,
      googleEmail,
      googleUid,
    });
  }

  public joinRoom(
    roomCode: string,
    playerName: string,
    avatar: string,
    googleEmail?: string,
    googleUid?: string
  ) {
    this.currentPlayerName = playerName;
    this.currentAvatar = avatar;
    this.currentRoomCode = roomCode;
    this.currentPlayerId = null; // Clear stale session for new room join
    this.send({
      type: 'join_room',
      roomCode,
      playerName,
      avatar,
      googleEmail,
      googleUid,
    });
  }

  public leaveRoom() {
    this.clearSession();
    this.send({ type: 'leave_room' });
  }

  public setBotCount(botCount: number) {
    this.send({ type: 'set_bot_count', botCount });
  }

  public startGame() {
    this.send({ type: 'start_game' });
  }

  public togglePause(isPaused?: boolean) {
    this.send({ type: 'toggle_pause', isPaused });
  }

  public advancePhase() {
    this.send({ type: 'advance_phase' });
  }

  public selectCards(selectedCardIds: string[]) {
    this.send({ type: 'select_cards', selectedCardIds });
  }

  public lockIn(locked: boolean) {
    this.send({ type: 'lock_in', locked });
  }

  public sendChat(text: string, isChemical = false) {
    this.send({ type: 'send_chat', text, isChemical });
  }

  public restartHand() {
    this.send({ type: 'restart_hand' });
  }

  public returnToLobby() {
    this.send({ type: 'return_to_lobby' });
  }

  public updateEscapeConfig(questions?: import('../types').EscapeRoomQuestion[], totalSeconds?: number) {
    this.send({ type: 'update_escape_config', questions, totalSeconds });
  }

  public updateLatinosState(state: import('../types').LatinosMatchState, playerTeams?: Record<string, 'A' | 'B'>) {
    this.send({ type: 'update_latinos_state', state, playerTeams });
  }

  public switchLatinosTeam(playerId: string, team: 'A' | 'B') {
    this.send({ type: 'switch_latinos_team', playerId, team });
  }

  public submitLatinosGuess(guess: string, playerName: string, team: 'A' | 'B') {
    this.send({ type: 'submit_latinos_guess', guess, playerName, team });
  }

  public updateImpostorState(state: import('../types').ImpostorMatchState, playerTeams?: Record<string, 'A' | 'B'>) {
    this.send({ type: 'update_impostor_state', state, playerTeams });
  }

  public submitImpostorVote(vote: import('../types').ImpostorVoteRecord) {
    this.send({ type: 'submit_impostor_vote', vote });
  }
}

export const socketClient = new SocketClient();


