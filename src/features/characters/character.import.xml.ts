import { DEFAULT_SKILLS, type CharacterInput } from "./character.schema";
import { uuid } from "../../utils/uuid";

function textAt(parent: Element | null, selector: string): string {
  const node = parent?.querySelector(selector);
  return node?.textContent?.trim() ?? "";
}

function directChild(parent: Element | null, tagName: string): Element | null {
  if (!parent) return null;

  return (
    Array.from(parent.children).find(
      (child) => child.tagName.toLowerCase() === tagName.toLowerCase(),
    ) ?? null
  );
}

function directChildText(parent: Element | null, tagName: string): string {
  return directChild(parent, tagName)?.textContent?.trim() ?? "";
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

function directChildNumber(
  parent: Element | null,
  tagName: string,
  fallback = 0,
): number {
  const raw = directChildText(parent, tagName);
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

function isValidWeaponSkill(
  value: string,
): value is CharacterInput["weapons"][number]["skill"] {
  return [
    "Agility",
    "Athletics",
    "Crafting",
    "Deception",
    "Deduction",
    "Discipline",
    "Heavy Weaponry",
    "Insight",
    "Intimidation",
    "Leadership",
    "Light Weaponry",
    "Lore",
    "Medicine",
    "Perception",
    "Persuasion",
    "Stealth",
    "Survival",
    "Thievery",
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

  const importedSkills: CharacterInput["skills"] = Array.from(
    character.querySelectorAll(":scope > skilllist > *"),
  ).map((node) => {
    const statText = textAt(node, "stat");

    return {
      name: textAt(node, "name") || "Unnamed Skill",
      stat: isValidStat(statText) ? statText : "awareness",
      rank: numberAt(node, "rank", 0),
      bonus: numberAt(node, "bonus", 0),
    };
  });

  const importedWeapons: CharacterInput["weapons"] = Array.from(
    character.querySelectorAll(":scope > weaponlist > *"),
  ).map((node) => {
    const weaponSkillText = textAt(node, "weaponskill");

    return {
      name: textAt(node, "name") || "Unnamed Weapon",
      skill: isValidWeaponSkill(weaponSkillText)
        ? weaponSkillText
        : "Athletics",
      damageDice: textAt(node, "damagelist > * > dice") || "d1",
      damageType: textAt(node, "damagelist > * > type") || "impact",
      traits: textAt(node, "traits"),
      expertTraits: textAt(node, "experttraits"),
      handling: numberAt(node, "handling", 0),
      carried: numberAt(node, "carried", 2),
      ammo: numberAt(node, "ammo", 0),
      maxAmmo: numberAt(node, "maxammo", 0),
      type: numberAt(node, "type", 0),
      range: directChildText(node, "range") || "Melee",
      subtype: textAt(node, "subtype") || "",
    };
  });

  const importedEquipment = Array.from(
    character.querySelectorAll(":scope > inventorylist > *"),
  ).map((node) => ({
    name: textAt(node, "name") || "Unnamed Item",
    count: numberAt(node, "count", 1),
    carried: numberAt(node, "carried", 2),
    weight: numberAt(node, "weight", 0),
    charges: numberAt(node, "charges", 0),
    notes: textAt(node, "notes"),
    type: textAt(node, "type") || "Equipment",
    uses: numberAt(node, "uses", 0),
    subtype: textAt(node, "subtype") || "",
  }));

  const importedExpertise: CharacterInput["expertise"] = Array.from(
    character.querySelectorAll(":scope > expertise > *"),
  ).map((node) => ({
    name: textAt(node, "name") || "Unnamed Expertise",
    text: textAt(node, "text"),
  }));

  const importedTalents: CharacterInput["talents"] = Array.from(
    character.querySelectorAll(":scope > talent > *"),
  ).map((node) => ({
    name: textAt(node, "name") || "Unnamed Talent",
    activation: textAt(node, "activation"),
    prerequisites: textAt(node, "prerequisites"),
    source: textAt(node, "source"),
    specialty: textAt(node, "specialty"),
    text: textAt(node, "text"),
  }));

  const carryText = textAt(character, ":scope > encumbrance > carry");
  const liftingCapacity = carryText
    ? numberAt(character, ":scope > encumbrance > carry", 50)
    : undefined;

  return {
    id: uuid(),

    meta: {
      name: directChildText(character, "name") || "Unnamed Character",
      playerName: "",
      ancestry:
        textAt(character, ":scope > ancestry > name") || "Human (Roshar)",
      path: directChildText(character, "path") || "Windrunner",
      level: directChildNumber(character, "level", 1),
      tier: directChildNumber(character, "tier", 1),
      gender: directChildText(character, "gender") || "",
      age: directChildNumber(character, "age", 0),
      height: directChildText(character, "height") || "",
      weight: directChildText(character, "weight") || "",
      size: directChildText(character, "size") || "",
    },

    attributes: {
      awareness: numberAt(
        character,
        ":scope > attributes > awareness > score",
        0,
      ),
      intellect: numberAt(
        character,
        ":scope > attributes > intellect > score",
        0,
      ),
      presence: numberAt(
        character,
        ":scope > attributes > presence > score",
        0,
      ),
      speed: numberAt(character, ":scope > attributes > speed > score", 0),
      strength: numberAt(
        character,
        ":scope > attributes > strength > score",
        0,
      ),
      willpower: numberAt(
        character,
        ":scope > attributes > willpower > score",
        0,
      ),
    },

    health: {
      current: Math.max(
        0,
        numberAt(character, ":scope > hp > total", 10) -
          numberAt(character, ":scope > hp > wounds", 0),
      ),
      total: numberAt(character, ":scope > hp > total", 10),
      bonus: numberAt(character, ":scope > hp > bonus", 0),
      wounds: numberAt(character, ":scope > hp > wounds", 0),
    },

    focus: {
      current: numberAt(character, ":scope > focus > current", 0),
      total: numberAt(character, ":scope > focus > total", 2),
      bonus: numberAt(character, ":scope > focus > bonus", 0),
    },

    investiture: {
      current: numberAt(character, ":scope > investiture > current", 0),
      total: numberAt(character, ":scope > investiture > total", 0),
    },

    deflect: directChildNumber(character, "deflect", 0),
    movement: directChildNumber(character, "movement", 20),
    movementBonus: directChildNumber(character, "movementbonus", 0),
    recoveryDie: directChildText(character, "recdie") || "d4",
    sensesRange: "",
    liftingCapacity,

    expertise: importedExpertise,
    talents: importedTalents,

    equipment: importedEquipment,

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
              range: "Melee",
              subtype: "",
            },
          ],

    conditionsText: "",

    skills:
      importedSkills.length > 0
        ? importedSkills
        : DEFAULT_SKILLS.map((skill) => ({ ...skill })),

    notes: "",
    version: "1.0.0",
  };
}
