import { createContext } from "react";
import type { CharacterInput } from "./character.schema";

export type CharacterContextValue = {
  characters: CharacterInput[];
  refreshCharacters: () => void;
  createBlankCharacter: () => CharacterInput;
  saveCharacter: (character: CharacterInput) => void;
  getCharacter: (id: string) => CharacterInput | undefined;
  deleteCharacter: (id: string) => void;
};

export const CharacterContext = createContext<CharacterContextValue | undefined>(
  undefined,
);
