import type WebSocket from 'ws';
import { send } from '../protocol.js';
import crypto from 'node:crypto';
import type { RegData } from '../types.js';
import { usersByName, userBySocket } from '../state.js';

export function handleReg(ws: WebSocket, data: RegData): void {
  const { name, password } = data;

  if (!name || !password) {
    send(ws, 'reg', {
      error: true,
      errorText: 'Empty name or password',
    });
    return;
  }

  if (usersByName.has(name)) {
    const userInfo = usersByName.get(name)!;

    if (userInfo.password !== password) {
      send(ws, 'reg', {
        error: true,
        errorText: 'Wrong password',
      });
      return;
    }

    usersByName.set(name, { ...userInfo, ws });
    send(ws, 'reg', {
      name,
      index: userInfo.index,
      error: false,
    });
    return;
  }

  const id = crypto.randomUUID();
  usersByName.set(name, {
    name,
    password,
    index: id,
    ws,
  });

  userBySocket.set(ws, id);

  send(ws, 'reg', {
    name,
    index: id,
    error: false,
  });
}
