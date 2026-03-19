import { useContext } from "react";
import { CharacterContext } from "./CharacterContext";

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error("useCharacters must be used inside CharacterProvider");
  }
  return ctx;
}
