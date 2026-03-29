import { usersByName } from "../state";
import type { User } from "../types";

export function getUserByIndex(index: string | undefined): User | undefined {
    if (!index) {
      return undefined;
    }
    return [...usersByName.values()].find((u) => u.index === index);
  }