// src/features/characters/character.storage.ts
import type { CharacterInput } from "./character.schema";

const STORAGE_KEY = "cosmere-pc-builder.characters";

function readAll(): CharacterInput[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CharacterInput[];
  } catch {
    return [];
  }
}

function writeAll(characters: CharacterInput[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters, null, 2));
}

export const characterStorage = {
  list(): CharacterInput[] {
    return readAll();
  },

  get(id: string): CharacterInput | undefined {
    return readAll().find((c) => c.id === id);
  },

  save(character: CharacterInput) {
    const all = readAll();
    const index = all.findIndex((c) => c.id === character.id);
    if (index >= 0) {
      all[index] = character;
    } else {
      all.push(character);
    }
    writeAll(all);
  },

  remove(id: string) {
    writeAll(readAll().filter((c) => c.id !== id));
  },
};
