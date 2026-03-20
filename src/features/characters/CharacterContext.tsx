import { useCallback, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SKILLS, type CharacterInput } from "./character.schema";
import { characterStorage } from "./character.storage";
import { uuid } from "../../utils/uuid";
import { CharacterContext } from "./character.context";

function makeBlankCharacter(): CharacterInput {
  return {
    id: uuid(),
    meta: {
      name: "",
      playerName: "",
      ancestry: "Human (Roshar)",
      path: "Windrunner",
      level: 1,
      tier: 1,
      gender: "",
      age: "",
      height: "",
      weight: "",
      size: "",
    },
    attributes: {
      awareness: 0,
      intellect: 0,
      presence: 0,
      speed: 0,
      strength: 0,
      willpower: 0,
    },
    health: {
      current: 10,
      total: 10,
      bonus: 0,
      wounds: 0,
    },
    focus: {
      current: 0,
      total: 2,
      bonus: 0,
    },
    investiture: {
      current: 0,
      total: 0,
    },
    deflect: 0,
    movement: 20,
    movementBonus: 0,
    recoveryDie: "1d4",
    sensesRange: "5 ft",
    liftingCapacity: 100,
    expertise: [],
    talents: [],
    weapons: [
      {
        name: "Unarmed Attack",
        skill: "Athletics",
        damageDice: "d1",
        damageType: "impact",
        traits: "Unique",
        expertTraits: "Momentum, Offhand",
        handling: 0,
        carried: 2,
        ammo: 0,
        maxAmmo: 0,
        type: 0,
        range: "Melee",
        subtype: "",
      },
    ],
    armor: [],
    equipment: [],
    conditionsText: "",
    skills: DEFAULT_SKILLS.map((skill) => ({ ...skill })),
    notes: "",
    version: "1.0.0",
  };
}

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<CharacterInput[]>(() =>
    characterStorage.list(),
  );

  const refreshCharacters = useCallback(() => {
    setCharacters(characterStorage.list());
  }, []);

  const createBlankCharacter = useCallback(() => {
    return makeBlankCharacter();
  }, []);

  const saveCharacter = useCallback((character: CharacterInput) => {
    characterStorage.save(character);
    setCharacters(characterStorage.list());
  }, []);

  const getCharacter = useCallback((id: string) => {
    return characterStorage.get(id);
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    characterStorage.remove(id);
    setCharacters(characterStorage.list());
  }, []);

  const value = useMemo(
    () => ({
      characters,
      refreshCharacters,
      createBlankCharacter,
      saveCharacter,
      getCharacter,
      deleteCharacter,
    }),
    [
      characters,
      refreshCharacters,
      createBlankCharacter,
      saveCharacter,
      getCharacter,
      deleteCharacter,
    ],
  );

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}
