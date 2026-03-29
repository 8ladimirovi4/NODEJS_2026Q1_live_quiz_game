import type { WebSocket } from "ws";
import type { Player, User } from '../types.js';

export const collectAllRecipients = (
  host: User,
  players: Player[],
): Set<WebSocket> => {
    const recipients = new Set<WebSocket>();
    if (host?.ws) {
      recipients.add(host.ws);
    }
    for (const p of players) {
      if (p.ws) {
        recipients.add(p.ws);
      }
    }
    return recipients
}