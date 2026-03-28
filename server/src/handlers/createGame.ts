import type WebSocket from 'ws';
import type { CreateGameData, Question } from '../types.js';
import { userBySocket } from '../state.js';
import { send } from '../protocol.js';
import { codeGenerator } from '../utils/codeGenerator.js';
import { gamesByCode, gamesById } from '../state.js';

function isValidQuestion(q: Question): boolean {
  const { text, options, correctIndex, timeLimitSec } = q;

  if (typeof text !== 'string' || text.trim() === '') {
    return false;
  }
  if (!Array.isArray(options) || options.length !== 4) {
    return false;
  }
  if (!options.every((opt) => typeof opt === 'string' && opt.trim() !== '')) {
    return false;
  }
  if (
    typeof correctIndex !== 'number' ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > 3
  ) {
    return false;
  }
  if (
    typeof timeLimitSec !== 'number' ||
    !Number.isFinite(timeLimitSec) ||
    timeLimitSec <= 0 ||
    !Number.isInteger(timeLimitSec)
  ) {
    return false;
  }
  return true;
}

export function handleCreateGame(ws: WebSocket, data: CreateGameData): void {
  const hostId = userBySocket.get(ws);

  if (!hostId) {
    send(ws, 'error', { message: 'Register before creating a game' });
    return;
  }

  if (!data.questions?.length) {
    send(ws, 'error', { message: 'No questions' });
    return;
  }

  for (const q of data.questions) {
    if (!isValidQuestion(q)) {
      send(ws, 'error', {
        message: `Question not valid: ${typeof q?.text === 'string' ? q.text : ''}`,
      });
      return;
    }
  }

  const createUniqueGameCode = (): string => {
    const code = codeGenerator();
    if (gamesByCode.has(code)) {
      return createUniqueGameCode();
    }
    return code;
  };

  const code = createUniqueGameCode();

  const id = crypto.randomUUID();

  gamesByCode.set(code, id);

  gamesById.set(id, {
    id,
    code,
    hostId,
    questions: data.questions,
    players: [],
    currentQuestion: -1,
    status: 'waiting',
    questionStartTime: undefined,
    questionTimer: undefined,
    playerAnswers: new Map(),
  });

  send(ws, 'game_created', {
    gameId: id,
    code,
  });
}
