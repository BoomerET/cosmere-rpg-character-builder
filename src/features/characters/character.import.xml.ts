import { DEFAULT_SKILLS, type CharacterInput } from "./character.schema";
import { uuid } from "../../utils/uuid";

function textAt(parent: Element | null, selector: string): string {
  const node = parent?.querySelector(selector);
  return node?.textContent?.trim() ?? "";
}

function numberAt(
  parent: Element | null,
  selector: string,
  fallback = 0,
): number {
  const raw = textAt(parent, selector);
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function isValidStat(
  value: string,
): value is CharacterInput["skills"][number]["stat"] {
  return [
    "awareness",
    "intellect",
    "presence",
    "speed",
    "strength",
    "willpower",
  ].includes(value);
}

export function fromFantasyGroundsXml(xmlText: string): CharacterInput {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid XML file");
  }

  const character = doc.querySelector("root > character");
  if (!character) {
    throw new Error("Could not find character node in XML");
  }

  const importedSkills = Array.from(
    character.querySelectorAll("skilllist > *"),
  ).map((node) => {
    const statText = textAt(node, "stat");
    return {
      name: textAt(node, "name"),
      stat: isValidStat(statText) ? statText : "awareness",
      rank: numberAt(node, "rank", 0),
      bonus: numberAt(node, "bonus", 0),
    };
  });

  return {
    id: uuid(),
    meta: {
      name: textAt(character, "name"),
      playerName: "",
      concept: "",
      ancestry: textAt(character, "ancestry > name") || "Human (Roshar)",
      path: textAt(character, "path") || "Windrunner",
      level: numberAt(character, "level", 1),
      tier: numberAt(character, "tier", 1),
    },
    attributes: {
      awareness: numberAt(character, "attributes > awareness > score", 0),
      intellect: numberAt(character, "attributes > intellect > score", 0),
      presence: numberAt(character, "attributes > presence > score", 0),
      speed: numberAt(character, "attributes > speed > score", 0),
      strength: numberAt(character, "attributes > strength > score", 0),
      willpower: numberAt(character, "attributes > willpower > score", 0),
    },
    defenses: {
      physical: {
        bonus: numberAt(character, "defenses > physicaldefense > bonus", 0),
        score: numberAt(character, "defenses > physicaldefense > score", 10),
      },
      cognitive: {
        bonus: numberAt(character, "defenses > cognitivedefense > bonus", 0),
        score: numberAt(character, "defenses > cognitivedefense > score", 10),
      },
      spiritual: {
        bonus: numberAt(character, "defenses > spiritualdefense > bonus", 0),
        score: numberAt(character, "defenses > spiritualdefense > score", 10),
      },
    },
    health: {
      current: Math.max(
        0,
        numberAt(character, "hp > total", 10) -
          numberAt(character, "hp > wounds", 0),
      ),
      total: numberAt(character, "hp > total", 10),
      bonus: numberAt(character, "hp > bonus", 0),
      wounds: numberAt(character, "hp > wounds", 0),
    },
    focus: {
      current: numberAt(character, "focus > current", 0),
      total: numberAt(character, "focus > total", 2),
      bonus: numberAt(character, "focus > bonus", 0),
    },
    investiture: {
      current: numberAt(character, "investiture > current", 0),
      total: numberAt(character, "investiture > total", 0),
    },
    deflect: numberAt(character, "deflect", 0),
    movement: numberAt(character, "movement", 20),
    movementBonus: numberAt(character, "movementbonus", 0),
    recoveryDie: textAt(character, "recdie") || "d4",
    sensesRange: "",
    liftingCapacity: numberAt(character, "encumbrance > carry", 50),
    expertisesText: "",
    weaponsText: "",
    talentsText: "",
    conditionsText: "",
    skills:
      importedSkills.length > 0
        ? importedSkills
        : DEFAULT_SKILLS.map((s) => ({ ...s })),
    notes: "",
    version: "1.0.0",
  };
}
