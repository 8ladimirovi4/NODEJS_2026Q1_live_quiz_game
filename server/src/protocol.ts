import WebSocket from 'ws';
import type { WSMessage } from './types.js';

export function send<T>(ws: WebSocket, type: string, data: T): void {
  if (ws.readyState === WebSocket.OPEN) {
    const message: WSMessage = { type, data, id: 0 };
    ws.send(JSON.stringify(message));
  }
}
