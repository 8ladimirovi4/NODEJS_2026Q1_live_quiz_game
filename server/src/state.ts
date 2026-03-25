import type { Game, User } from './types.js';

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
//     playersAnswer
// }
export const gamesById = new Map<string, Game>();

// {
//     gameCode: gameId
// }
export const gamesByCode = new Map<string, string>();
