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
    userBySocket.set(ws, userInfo.index);
    send(ws, 'reg', {
      name,
      index: userInfo.index,
      error: false,
      errorText: '',
    });
    return;
  }

  const id = crypto.randomUUID();
  const newUser = {
    name,
    password,
    index: id,
    ws,
  };
  usersByName.set(name, newUser);

  userBySocket.set(ws, id);

  send(ws, 'reg', {
    name,
    index: id,
    error: false,
    errorText: '',
  });
}
