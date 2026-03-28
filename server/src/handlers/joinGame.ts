import type WebSocket from 'ws';
import type { JoinGameData, Player, User } from '../types.js';
import { send } from '../protocol.js';
import { gamesByCode, gamesById, userBySocket, usersByName } from '../state.js';

function getUserByIndex(index: string | undefined): User | undefined {
  if (!index) {
    return undefined;
  }
  return [...usersByName.values()].find((u) => u.index === index);
}

function publicPlayersPayload(players: Player[]) {
  return players.map(({ name, index, score }) => ({ name, index, score }));
}

export function handleJoinGame(ws: WebSocket, data: JoinGameData): void {
  const userId = userBySocket.get(ws);
  const user = getUserByIndex(userId);

  if (!userId || !user) {
    send(ws, 'error', {
      message: 'User error',
    });
    return;
  }

  const code = data?.code;
  const normalizedCode =
    typeof code === 'string' ? code.trim().toUpperCase() : '';

  //is correct game code
  if (
    typeof code !== 'string' ||
    normalizedCode.length !== 6 ||
    !gamesByCode.has(normalizedCode)
  ) {
    send(ws, 'error', {
      message: 'Invalid code',
    });
    return;
  }

  const gameId = gamesByCode.get(normalizedCode);
  const game = gamesById.get(gameId ?? '');

  if (!game || !gameId) {
    send(ws, 'error', {
      message: 'Game error',
    });
    return;
  }

  //is correct game status
  if (game?.status !== 'waiting') {
    send(ws, 'error', {
      message: 'Wrong game status',
    });
    return;
  }

  // //is player not host
  if (userId === game?.hostId) {
    send(ws, 'error', {
      message: `Host can't be a player`,
    });
    return;
  }

  //is player in the game
  const existing = game.players.find((p) => p.index === userId);
  if (existing) {
    send(ws, 'error', {
      message: 'Already in this game',
    });
    return;
  }

  const host = getUserByIndex(game.hostId);

  game.players.push({
    name: user.name,
    index: user.index,
    ws: user.ws,
    score: 0,
  });

  send(ws, 'game_joined', {
    gameId,
  });

  const playerList = publicPlayersPayload(game.players);
  const playerJoinedData = {
    playerName: user.name,
    playerCount: game.players.length,
  };

  const recipients = new Set<WebSocket>();
  if (host?.ws) {
    recipients.add(host.ws);
  }
  for (const p of game.players) {
    if (p.ws) {
      recipients.add(p.ws);
    }
  }

  for (const socket of recipients) {
    send(socket, 'player_joined', playerJoinedData);
    send(socket, 'update_players', playerList);
  }
}
