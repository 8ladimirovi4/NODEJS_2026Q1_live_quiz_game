import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { PORT, HOST } from './config.js';
import { dispatchMessage } from './messageRouter.js';

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    dispatchMessage(ws, data);
  });
});

console.log(`WebSocket server listening on ws://${HOST}:${PORT}`);
