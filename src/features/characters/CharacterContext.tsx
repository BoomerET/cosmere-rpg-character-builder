import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SKILLS, type CharacterInput } from "./character.schema";
import { characterStorage } from "./character.storage";
import { uuid } from "../../utils/uuid";

type CharacterContextValue = {
  characters: CharacterInput[];
  refreshCharacters: () => void;
  createBlankCharacter: () => CharacterInput;
  saveCharacter: (character: CharacterInput) => void;
  getCharacter: (id: string) => CharacterInput | undefined;
  deleteCharacter: (id: string) => void;
};

const CharacterContext = createContext<CharacterContextValue | undefined>(
  undefined,
);

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
      age: 0,
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
    recoveryDie: "d4",
    sensesRange: "",
    liftingCapacity: undefined,
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
      },
    ],
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

  function refreshCharacters() {
    setCharacters(characterStorage.list());
  }

  function createBlankCharacter() {
    return makeBlankCharacter();
  }

  function saveCharacter(character: CharacterInput) {
    characterStorage.save(character);
    refreshCharacters();
  }

  function getCharacter(id: string) {
    return characterStorage.get(id);
  }

  function deleteCharacter(id: string) {
    characterStorage.remove(id);
    refreshCharacters();
  }

  const value = useMemo(
    () => ({
      characters,
      refreshCharacters,
      createBlankCharacter,
      saveCharacter,
      getCharacter,
      deleteCharacter,
    }),
    [characters],
  );

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error("useCharacters must be used inside CharacterProvider");
  }
  return ctx;
}
