import type { Game, User } from './types.js';
import type WebSocket from 'ws';


export const userBySocket = new Map<WebSocket, string>();
//{
// ws : index
//}
export const usersByName = new Map<string, User>();
// {
//     name
//     password
//     index
//     ws - current ws connection
// }

export const gamesById = new Map<string, Game>();
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

export const gamesByCode = new Map<string, string>();
// {
//     gameCode: gameId
// }