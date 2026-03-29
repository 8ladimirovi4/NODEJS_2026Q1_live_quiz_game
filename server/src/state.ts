import type { Game, User } from './types.js';
import type WebSocket from 'ws';

export const userBySocket = new Map<WebSocket, string>();

export const usersByName = new Map<string, User>();

export const gamesById = new Map<string, Game>();

export const gamesByCode = new Map<string, string>();
