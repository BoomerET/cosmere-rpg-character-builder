// src/features/characters/character.export.ts
import type { CharacterInput } from "./character.schema";

export function toAppExport(character: CharacterInput) {
  return {
    exportType: "cosmere-pc",
    schemaVersion: "1.0.0" as const,
    createdAt: new Date().toISOString(),
    character,
  };
}

// Placeholder adapter until you know the exact FG import structure
export function toFantasyGroundsExport(character: CharacterInput) {
  return {
    ruleset: "cosmere-rpg",
    importType: "character",
    payload: {
      name: character.meta.name,
      attributes: character.attributes,
      skills: character.skills,
      talents: character.talents,
      equipment: character.equipment,
      notes: character.notes ?? "",
    },
  };
}

