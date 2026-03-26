import type { Game, User } from './types.js';
import type WebSocket from 'ws';

export const userBySocket = new Map<WebSocket, string>();
// {
//     name
//     password
//     index
//     ws - current ws connection
// }
export const usersByName = new Map<string, User>();

// {
//     id
//     code
//     hostId
//     questions
//     players
//     currentQuestion
//     status
//     questionStartTime
//     questionTimer
//     playerAnswers
// }
export const gamesById = new Map<string, Game>();

// {
//     gameCode: gameId
// }
export const gamesByCode = new Map<string, string>();
