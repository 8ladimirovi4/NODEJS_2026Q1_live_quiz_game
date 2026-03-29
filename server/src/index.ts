import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { PORT, HOST } from './config.js';
import { dispatchMessage } from './messageRouter.js';
import { handleDisconnect } from './handlers/disconnect.js';

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    dispatchMessage(ws, data);
  });
  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

console.log(`WebSocket server listening on ws://${HOST}:${PORT}`);
