import { characterSchema, type CharacterInput } from "./character.schema";

const STORAGE_KEY = "cosmere-pc-builder.characters";

function normalizeCharacter(raw: unknown): CharacterInput | null {
  const result = characterSchema.safeParse(raw);
  if (!result.success) {
    console.error("Invalid stored character skipped:", result.error.flatten());
    return null;
  }
  return result.data;
}

function readAll(): CharacterInput[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeCharacter)
      .filter((c): c is CharacterInput => c !== null);
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
    const normalized = characterSchema.parse(character);

    const all = readAll();
    const index = all.findIndex((c) => c.id === normalized.id);

    if (index >= 0) {
      all[index] = normalized;
    } else {
      all.push(normalized);
    }

    writeAll(all);
  },

  remove(id: string) {
    writeAll(readAll().filter((c) => c.id !== id));
  },
};
