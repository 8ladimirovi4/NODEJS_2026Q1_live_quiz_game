import type WebSocket from 'ws';
import { gamesById, userBySocket } from '../state.js';
import { send } from '../protocol.js';
import { GameStatus, type StartGameData } from '../types.js';
import { beginQuestionRound } from '../game/round.js';

export function handleStartGame(ws: WebSocket, data: StartGameData): void {
  const userId = userBySocket.get(ws);
  if (!userId) {
    send(ws, 'error', {
      message: 'User error',
    });
    return;
  }

  const gameId = typeof data?.gameId === 'string' ? data.gameId.trim() : '';
  if (!gameId) {
    send(ws, 'error', {
      message: 'Game error',
    });
    return;
  }

  const game = gamesById.get(gameId);
  if (!game) {
    send(ws, 'error', {
      message: 'Game error',
    });
    return;
  }

  if (userId !== game.hostId) {
    send(ws, 'error', {
      message: 'Host not match the game',
    });
    return;
  }

  if (game.status !== GameStatus.Waiting) {
    send(ws, 'error', {
      message: 'Wrong game status',
    });
    return;
  }

  if (!game.questions.length) {
    send(ws, 'error', {
      message: 'Questions error',
    });
    return;
  }

  game.status = GameStatus.InProgress;
  beginQuestionRound(game, 0);
}
