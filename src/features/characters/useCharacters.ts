import { useContext } from "react";
import { CharacterContext } from "./character.context";

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error("useCharacters must be used inside CharacterProvider");
  }
  return ctx;
}
