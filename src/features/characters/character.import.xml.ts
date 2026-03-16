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

  const importedWeapons = Array.from(
    character.querySelectorAll("weaponlist > *"),
  ).map((node) => ({
    name: textAt(node, "name") || "Unnamed Weapon",
    skill: textAt(node, "weaponskill") || "Athletics",
    damageDice: textAt(node, "damagelist > * > dice") || "d1",
    damageType: textAt(node, "damagelist > * > type") || "impact",
    traits: textAt(node, "traits"),
    expertTraits: textAt(node, "experttraits"),
    handling: numberAt(node, "handling", 0),
    carried: numberAt(node, "carried", 2),
    ammo: numberAt(node, "ammo", 0),
    maxAmmo: numberAt(node, "maxammo", 0),
    type: numberAt(node, "type", 0),
  }));

  const importedExpertise = Array.from(
    character.querySelectorAll("expertise > *"),
  ).map((node) => ({
    name: textAt(node, "name") || "Unnamed Expertise",
    text: textAt(node, "text"),
  }));

  const importedTalents = Array.from(
    character.querySelectorAll("talent > *"),
  ).map((node) => ({
    name: textAt(node, "name") || "Unnamed Talent",
    activation: textAt(node, "activation"),
    prerequisites: textAt(node, "prerequisites"),
    source: textAt(node, "source"),
    specialty: textAt(node, "specialty"),
    text: textAt(node, "text"),
  }));

  return {
    id: uuid(),
    meta: {
      name: textAt(character, "name"),
      playerName: "",
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
    liftingCapacity: textAt(character, "encumbrance > carry")
      ? numberAt(character, "encumbrance > carry", 50)
      : undefined,
    expertise: importedExpertise,
    weapons:
      importedWeapons.length > 0
        ? importedWeapons
        : [
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
    talents: importedTalents,
    conditionsText: "",
    skills:
      importedSkills.length > 0
        ? importedSkills
        : DEFAULT_SKILLS.map((s) => ({ ...s })),
    notes: "",
    version: "1.0.0",
  };
}
