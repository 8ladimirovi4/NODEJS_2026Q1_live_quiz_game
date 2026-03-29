import type { WebSocket as Ws } from 'ws';
import type { Game, Player } from '../types.js';
import { GameStatus } from '../types.js';
import { gamesByCode, gamesById, userBySocket, usersByName } from '../state.js';
import { send } from '../protocol.js';
import { getUserByIndex } from '../utils/getUserByIndex.js';
import { collectAllRecipients } from '../utils/collectAllRecipients.js';

function clearQuestionTimer(game: Game): void {
  if (game.questionTimer !== undefined) {
    clearTimeout(game.questionTimer);
    game.questionTimer = undefined;
  }
}

function publicPlayersPayload(players: Player[]) {
  return players.map(({ name, index, score }) => ({ name, index, score }));
}

export function cleanupFinishedGame(game: Game): void {
  clearQuestionTimer(game);
  gamesByCode.delete(game.code);
  gamesById.delete(game.id);
}

export function handleDisconnect(ws: Ws): void {
  const userId = userBySocket.get(ws);
  userBySocket.delete(ws);

  if (userId) {
    const user = [...usersByName.values()].find((u) => u.index === userId);
    if (user?.ws === ws) {
      user.ws = undefined;
    }
  }

  if (!userId) {
    return;
  }

  const hostGames = [...gamesById.values()].filter(
    (g) => g.status !== GameStatus.Finished && g.hostId === userId,
  );
  if (hostGames.length > 0) {
    for (const game of hostGames) {
      for (const p of game.players) {
        if (p.ws) {
          send(p.ws, 'error', { message: 'Host disconnected' });
        }
      }
      cleanupFinishedGame(game);
    }
    return;
  }

  for (const game of gamesById.values()) {
    if (game.status === GameStatus.Finished) {
      continue;
    }

    const playerIdx = game.players.findIndex((p) => p.index === userId);
    if (playerIdx === -1) {
      continue;
    }

    game.players.splice(playerIdx, 1);

    const host = getUserByIndex(game.hostId);
    if (!host) {
      break;
    }

    const playerList = publicPlayersPayload(game.players);
    for (const socket of collectAllRecipients(host, game.players)) {
      send(socket, 'update_players', playerList);
    }
    break;
  }
}
