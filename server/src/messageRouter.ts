import type WebSocket from 'ws';
import type { WSMessage } from './types.js';
import { handleAnswer } from './handlers/answer.js';
import { handleCreateGame } from './handlers/createGame.js';
import { handleJoinGame } from './handlers/joinGame.js';
import { handleReg } from './handlers/reg.js';
import { handleStartGame } from './handlers/startGame.js';

export function dispatchMessage(ws: WebSocket, raw: WebSocket.RawData): void {
  let parsed: WSMessage;
  try {
    parsed = JSON.parse(raw.toString()) as WSMessage;
  } catch {
    return;
  }

  let { type, data } = parsed;

  if (data == null) {
    return;
  }

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data) as typeof parsed.data;
    } catch {
      return;
    }
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    return;
  }

  switch (type) {
    case 'reg':
      handleReg(ws, data);
      break;
    case 'create_game':
      handleCreateGame(ws, data);
      break;
    case 'join_game':
      handleJoinGame(ws, data);
      break;
    case 'start_game':
      handleStartGame(ws, data);
      break;
    case 'answer':
      handleAnswer(ws, data);
      break;
    default:
      break;
  }
}
