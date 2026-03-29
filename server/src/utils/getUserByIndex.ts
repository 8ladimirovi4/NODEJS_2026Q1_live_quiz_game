import { usersByName } from '../state.js';
import type { User } from '../types.js';

export function getUserByIndex(index: string | undefined): User | undefined {
    if (!index) {
      return undefined;
    }
    return [...usersByName.values()].find((u) => u.index === index);
  }