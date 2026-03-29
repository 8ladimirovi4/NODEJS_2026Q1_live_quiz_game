import { send } from '../protocol.js';
import type { Game, Question } from '../types.js';
import { GameStatus } from '../types.js';
import {
  buildFinalScoreboard,
  buildPlayerResultsAfterQuestion,
} from './scoring.js';
import { cleanupFinishedGame } from '../handlers/disconnect.js';
import { collectAllRecipients } from '../utils/collectAllRecipients.js';
import { getUserByIndex } from '../utils/getUserByIndex.js';

//prepare new round
const initRoundState = (g: Game) => {
  g.playerAnswers.clear();
  for (const p of g.players) {
    p.hasAnswered = false;
    p.answerTime = 0;
    p.answeredCorrectly = false;
  }
};

const setCurrentQuestion = (g: Game) => {
  g.currentQuestion = g.currentQuestion + 1;
  const q = g.questions[g.currentQuestion];

  return broadcastQuestion(g, q);
};

//send question
const broadcastQuestion = (g: Game, q: Question | undefined) => {
  if (!q) {
    console.error('Question missing for index', g.currentQuestion);
    return;
  }
  const host = getUserByIndex(g.hostId);
  if (!host) {
    console.error('Host error');
    return;
  }
  const players = g.players;

  for (const socket of collectAllRecipients(host, players)) {
    send(socket, 'question', {
      questionNumber: g.currentQuestion + 1,
      totalQuestions: g.questions.length,
      text: q.text,
      options: q.options,
      timeLimitSec: q.timeLimitSec,
    });
  }
  scheduleQuestionTimer(g, q);
};

//check question time limit
const scheduleQuestionTimer = (g: Game, q: Question) => {
  g.questionStartTime = Date.now();
  g.questionTimer = setTimeout(() => {
    finalizeCurrentQuestion(g);
  }, q.timeLimitSec * 1000);
};

export const beginQuestionRound = (game: Game, questionIndex: number): void => {
  if (questionIndex < 0 || questionIndex > game.questions.length - 1) {
    console.error('Question index bounds error');
    return;
  }

  if (game.questionTimer !== undefined) {
    clearTimeout(game.questionTimer);
    game.questionTimer = undefined;
  }
  initRoundState(game);
  setCurrentQuestion(game);
};
//send question result, begin new round or end the game
export const finalizeCurrentQuestion = (g: Game) => {
  if (g.questionTimer !== undefined) {
    clearTimeout(g.questionTimer);
    g.questionTimer = undefined;
  }

  const qIndex = g.currentQuestion;
  const q = g.questions[qIndex];
  const host = getUserByIndex(g.hostId);

  if (!host) {
    console.error('Host error');
    return;
  }

  if (!q) {
    console.error('Question missing at finalize', qIndex);
    return;
  }

  const playerResults = buildPlayerResultsAfterQuestion(g, q);

  for (const socket of collectAllRecipients(host, g.players)) {
    send(socket, 'question_result', {
      questionIndex: qIndex,
      correctIndex: q.correctIndex,
      playerResults,
    });
  }

  const hasNextQuestion = qIndex < g.questions.length - 1;
  if (hasNextQuestion) {
    beginQuestionRound(g, qIndex);
  } else {
    g.status = GameStatus.Finished;
    const scoreboard = buildFinalScoreboard(g.players);
    for (const socket of collectAllRecipients(host, g.players)) {
      send(socket, 'game_finished', {
        scoreboard,
      });
    }
    cleanupFinishedGame(g);
  }
};
