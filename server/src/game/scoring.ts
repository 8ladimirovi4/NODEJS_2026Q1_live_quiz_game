import type { Game, Player, Question } from '../types.js';

export const BASE_POINTS = 1000;

export function computeTimeRemainingSec(
  questionStartTimeMs: number,
  answerTimestampMs: number,
  timeLimitSec: number,
): number {
  const endMs = questionStartTimeMs + timeLimitSec * 1000;
  const remainingSec = (endMs - answerTimestampMs) / 1000;
  return Math.max(0, Math.min(timeLimitSec, remainingSec));
}

export function computePointsForCorrectAnswer(
  timeRemainingSec: number,
  timeLimitSec: number,
): number {
  if (timeLimitSec <= 0) {
    return 0;
  }
  const raw = BASE_POINTS * (timeRemainingSec / timeLimitSec);
  return Math.min(BASE_POINTS, Math.floor(raw));
}

export interface QuestionResultRow {
  name: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
}

export function buildPlayerResultsAfterQuestion(
  game: Game,
  question: Question,
): QuestionResultRow[] {
  const qStart = game.questionStartTime;
  const rows: QuestionResultRow[] = [];

  for (const p of game.players) {
    const answered = p.hasAnswered ?? false;
    const correct = p.answeredCorrectly ?? false;
    let pointsEarned = 0;

    if (
      answered &&
      correct &&
      qStart !== undefined &&
      p.answerTime !== undefined &&
      p.answerTime >= 0
    ) {
      const answerAtMs = qStart + p.answerTime;
      const remainingSec = computeTimeRemainingSec(
        qStart,
        answerAtMs,
        question.timeLimitSec,
      );
      pointsEarned = computePointsForCorrectAnswer(
        remainingSec,
        question.timeLimitSec,
      );
    }

    p.score += pointsEarned;
    rows.push({
      name: p.name,
      answered,
      correct,
      pointsEarned,
      totalScore: p.score,
    });
  }

  return rows;
}

export interface ScoreboardRow {
  name: string;
  score: number;
  rank: number;
}

export function buildFinalScoreboard(players: Player[]): ScoreboardRow[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });
  return sorted.map((p, i) => ({
    name: p.name,
    score: p.score,
    rank: i + 1,
  }));
}
