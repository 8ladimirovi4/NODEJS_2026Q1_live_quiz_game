import type WebSocket from 'ws';
import { gamesById, userBySocket } from '../state.js';
import { send } from '../protocol.js';
import type { AnswerData, Game } from '../types.js';
import { finalizeCurrentQuestion } from '../game/round.js';

export function handleAnswer(ws: WebSocket, data: AnswerData): void {
  const userId = userBySocket.get(ws);
  const game = gamesById.get(data.gameId);
  if (!game) {
    send(ws, 'error', {
      message: 'Game error',
    });
    return;
  }

  const isValidData = (
    g: Game | undefined,
    uid: string | undefined,
  ): boolean => {
    if (!uid) {
      send(ws, 'error', {
        message: 'User error',
      });
      return false;
    }

    if (!g) {
      send(ws, 'error', {
        message: 'Game error',
      });
      return false;
    }

    if (data.questionIndex !== g.currentQuestion) {
      return false;
    }
    if (
      !Number.isInteger(data.answerIndex) ||
      data.answerIndex < 0 ||
      data.answerIndex > 3
    ) {
      return false;
    }
    if (uid === g.hostId) {
      return false;
    }
    return true;
  };

  if (!isValidData(game, userId)) {
    send(ws, 'error', {
      message: 'Data error',
    });
    return;
  }

  //time limit over
  const playerAnsweredTimestamp = Date.now();
  const question = game.questions[game.currentQuestion];
  const qStartTime = game.questionStartTime;
  if (!question || !qStartTime) {
    console.error('Something gose wrong');
    return;
  }
  if (playerAnsweredTimestamp > qStartTime + question.timeLimitSec * 1000) {
    send(ws, 'error', {
      message: 'Time is over',
    });
    return;
  }

  for (const p of game.players) {
    if (p.index === userId) {
      p.hasAnswered = true;
      p.answerTime = playerAnsweredTimestamp - qStartTime;
      p.answeredCorrectly = data.answerIndex === question.correctIndex;
      game.playerAnswers.set(userId, {
        answerIndex: data.answerIndex,
        timestamp: playerAnsweredTimestamp,
      });
    }
  }

  send(ws, 'answer_accepted', { questionIndex: game.currentQuestion });

  const isAllanswered = game.players.every((p) => p.hasAnswered);

  if (isAllanswered) {
    finalizeCurrentQuestion(game);
  }
}
