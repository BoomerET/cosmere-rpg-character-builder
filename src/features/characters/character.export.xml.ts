import type { CharacterInput } from "./character.schema";
import { getTierFromLevel } from "./character.utils";

const COIN_NAMES = [
  "EBR",
  "ABR",
  "SBR",
  "EMK",
  "RBR",
  "SSBR",
  "ZBR",
  "AMK",
  "SMK",
  "GBR",
  "HBR",
  "TBR",
  "ECH",
  "RMK",
  "SSMK",
  "ZMK",
  "ACH",
  "GMK",
  "HMK",
  "SCH",
  "TMK",
  "BR",
  "RCH",
  "SSCH",
  "ZCH",
  "GCH",
  "HCH",
  "MK",
  "TCH",
  "CH",
];

function idNode(index: number): string {
  return `id-${String(index + 1).padStart(5, "0")}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function n(value: number | string): string {
  return String(value);
}

function tag(
  name: string,
  content = "",
  attrs?: Record<string, string>,
): string {
  const attrText = attrs
    ? " " +
      Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeXml(v)}"`)
        .join(" ")
    : "";

  return `<${name}${attrText}>${content}</${name}>`;
}

function emptyTag(name: string, attrs?: Record<string, string>): string {
  const attrText = attrs
    ? " " +
      Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeXml(v)}"`)
        .join(" ")
    : "";

  return `<${name}${attrText} />`;
}

function textTag(
  name: string,
  value: string,
  attrs?: Record<string, string>,
): string {
  return tag(name, escapeXml(value), attrs);
}

function numberTag(
  name: string,
  value: number,
  attrs?: Record<string, string>,
): string {
  return tag(name, n(value), attrs);
}

function formatXml(xml: string): string {
  const PADDING = "  ";
  const reg = /(>)(<)(\/*)/g;
  let formatted = "";
  let pad = 0;

  xml = xml.replace(reg, "$1\n$2$3");

  xml.split("\n").forEach((node) => {
    let indent = 0;

    if (node.match(/^<\/\w/)) {
      pad -= 1;
    }

    for (let i = 0; i < pad; i++) {
      indent += 1;
    }

    formatted += PADDING.repeat(indent) + node + "\n";

    if (/^<[^!?/][^>]*[^/]>$/.test(node)) {
      pad += 1;
    }
  });

  return formatted.trim();
}

function formattedText(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const withBreaks = escapeXml(paragraph).replace(/\n/g, "<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("");
}

function safeXmlNodeName(value: string, fallback = "node"): string {
  const cleaned = value.replace(/[^\w.-]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `${fallback}_${cleaned}`;
}

type InventoryExportItem = {
  name: string;
  count: number;
  carried: number;
  weight: number;
  charges: number;
  notes: string;
  type: string;
  uses: number;
  subtype?: string;
};

function inventoryItemToXml(item: InventoryExportItem, index: number): string {
  return tag(
    idNode(index),
    numberTag("carried", item.carried, { type: "number" }) +
      numberTag("charges", item.charges, { type: "number" }) +
      numberTag("count", item.count, { type: "number" }) +
      textTag("name", item.name, { type: "string" }) +
      textTag("notes", item.notes, { type: "string" }) +
      textTag("type", item.type, { type: "string" }) +
      (item.subtype ? textTag("subtype", item.subtype, { type: "string" }) : "") +
      numberTag("uses", item.uses, { type: "number" }) +
      numberTag("weight", item.weight, { type: "number" }),
  );
}

export function toFantasyGroundsXml(character: CharacterInput): string {
  const physicalDefense =
    10 + character.attributes.strength + character.attributes.speed;
  const cognitiveDefense =
    10 + character.attributes.intellect + character.attributes.willpower;
  const spiritualDefense =
    10 + character.attributes.awareness + character.attributes.presence;

  const carry = character.liftingCapacity ?? 50;
  const senses = character.sensesRange ?? 0;
  const pathNodeName = safeXmlNodeName(character.meta.path, "path");

  const healthTotal = 10 + character.attributes.strength;

  const movementBase =
    character.attributes.speed >= 3
      ? 30
      : character.attributes.speed >= 1
        ? 25
        : 20;

  const movementTotal = movementBase + character.movementBonus;
  const wounds = Math.max(0, healthTotal - character.health.current);
  const tier = getTierFromLevel(character.meta.level);

  const attributeEntries: Array<[string, number]> = [
    ["awareness", character.attributes.awareness],
    ["intellect", character.attributes.intellect],
    ["presence", character.attributes.presence],
    ["speed", character.attributes.speed],
    ["strength", character.attributes.strength],
    ["willpower", character.attributes.willpower],
  ];

  const attrsBlock = attributeEntries
    .map(([name, score]) =>
      tag(
        name,
        numberTag("bonus", 0, { type: "number" }) +
          numberTag("score", score, { type: "number" }),
      ),
    )
    .join("");

  const topLevelStats = [
    numberTag("awareness", character.attributes.awareness, { type: "number" }),
    numberTag("intellect", character.attributes.intellect, { type: "number" }),
    numberTag("presence", character.attributes.presence, { type: "number" }),
    numberTag("speed", character.attributes.speed, { type: "number" }),
    numberTag("strength", character.attributes.strength, { type: "number" }),
    numberTag("willpower", character.attributes.willpower, {
      type: "number",
    }),
  ].join("");

  const coinsBlock = COIN_NAMES.map((coinName, i) =>
    tag(
      idNode(i),
      numberTag("amount", 0, { type: "number" }) +
        textTag("name", coinName, { type: "string" }),
    ),
  ).join("");

  const skillListBlock = character.skills
    .map((skill, i) =>
      tag(
        idNode(i),
        numberTag("bonus", skill.bonus, { type: "number" }) +
          textTag("name", skill.name, { type: "string" }) +
          numberTag("rank", skill.rank, { type: "number" }) +
          textTag("stat", skill.stat, { type: "string" }) +
          numberTag("total", skill.rank + skill.bonus, { type: "number" }),
      ),
    )
    .join("");

  const expertiseBlock = character.expertise
    .map((item, i) =>
      tag(
        idNode(i),
        textTag("name", item.name, { type: "string" }) +
          tag("text", formattedText(item.text), { type: "formattedtext" }),
      ),
    )
    .join("");

  const talentBlock = character.talents
    .map((item, i) =>
      tag(
        idNode(i),
        textTag("activation", item.activation, { type: "string" }) +
          textTag("name", item.name, { type: "string" }) +
          textTag("prerequisites", item.prerequisites, { type: "string" }) +
          textTag("source", item.source, { type: "string" }) +
          textTag("specialty", item.specialty, { type: "string" }) +
          tag("text", formattedText(item.text), { type: "formattedtext" }),
      ),
    )
    .join("");

  const equipmentInventoryItems: InventoryExportItem[] = character.equipment.map(
    (item) => ({
      name: item.name,
      count: item.count,
      carried: item.carried,
      weight: item.weight,
      charges: item.charges,
      notes: item.notes,
      type: item.type,
      uses: item.uses,
      subtype: item.subtype ?? "",
    }),
  );

  const weaponInventoryItems: InventoryExportItem[] = character.weapons.map(
    (weapon) => ({
      name: weapon.name,
      count: 1,
      carried: weapon.carried,
      weight: 0,
      charges: 0,
      notes: "",
      type: "Weapon",
      uses: 0,
      subtype: weapon.subtype ?? "",
    }),
  );

  const inventoryItems: InventoryExportItem[] = [
    ...equipmentInventoryItems,
    ...weaponInventoryItems,
  ];

  const inventoryListBlock = inventoryItems
    .map((item, i) => inventoryItemToXml(item, i))
    .join("");

  const weaponListBlock = character.weapons
    .map((weapon, i) => {
      const nodeName =
        weapon.name === "Unarmed Attack" ? "unarmedattack" : idNode(i);

      return (
        `<${nodeName}>` +
        numberTag("ammo", weapon.ammo, { type: "number" }) +
        numberTag("carried", weapon.carried, { type: "number" }) +
        `<damagelist>` +
        `<id-00001>` +
        textTag("dice", weapon.damageDice, { type: "dice" }) +
        textTag("type", weapon.damageType, { type: "string" }) +
        textTag("weaponskill", weapon.skill, { type: "string" }) +
        `</id-00001>` +
        `</damagelist>` +
        (weapon.expertTraits
          ? textTag("experttraits", weapon.expertTraits, { type: "string" })
          : "") +
        numberTag("handling", weapon.handling, { type: "number" }) +
        numberTag("maxammo", weapon.maxAmmo, { type: "number" }) +
        textTag("name", weapon.name, { type: "string" }) +
        textTag("range", weapon.range ?? "Melee", { type: "string" }) +
        (weapon.subtype
          ? textTag("subtype", weapon.subtype, { type: "string" })
          : "") +
        `<shortcut type="windowreference">` +
        tag("class", "") +
        tag("recordname", "") +
        `</shortcut>` +
        (weapon.traits
          ? textTag("traits", weapon.traits, { type: "string" })
          : "") +
        numberTag("type", weapon.type, { type: "number" }) +
        textTag("weaponskill", weapon.skill, { type: "string" }) +
        `</${nodeName}>`
      );
    })
    .join("");

  const rawXML =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<root version="5.1" dataversion="20260124" release="8.1|CoreRPG:7">` +
    `<character>` +
    `<ancestry>` +
    textTag("name", character.meta.ancestry, { type: "string" }) +
    `<shortcut type="windowreference">` +
    tag("class", "") +
    tag("recordname", "") +
    `</shortcut>` +
    tag("text", "", { type: "formattedtext" }) +
    `</ancestry>` +
    tag("name", character.meta.name, { type: "string" }) +
    tag("attributes", attrsBlock) +
    topLevelStats +
    tag("coins", coinsBlock) +
    `<defenses>` +
    tag(
      "cognitivedefense",
      numberTag("bonus", 0, { type: "number" }) +
        numberTag("score", cognitiveDefense, { type: "number" }),
    ) +
    tag(
      "physicaldefense",
      numberTag("bonus", 0, { type: "number" }) +
        numberTag("score", physicalDefense, { type: "number" }),
    ) +
    tag(
      "spiritualdefense",
      numberTag("bonus", 0, { type: "number" }) +
        numberTag("score", spiritualDefense, { type: "number" }),
    ) +
    `</defenses>` +
    textTag("senses", String(senses), { type: "string" }) +
    numberTag("deflect", character.deflect, { type: "number" }) +
    emptyTag("effectlist") +
    `<encumbrance>` +
    numberTag("carry", carry, { type: "number" }) +
    numberTag("load", 0, { type: "number" }) +
    numberTag("max", carry * 2, { type: "number" }) +
    `</encumbrance>` +
    tag("expertise", expertiseBlock) +
    `<focus>` +
    numberTag("bonus", character.focus.bonus, { type: "number" }) +
    numberTag("current", character.focus.current, { type: "number" }) +
    numberTag("total", character.focus.total, { type: "number" }) +
    `</focus>` +
    emptyTag("goals") +
    `<hp>` +
    numberTag("bonus", character.health.bonus, { type: "number" }) +
    numberTag("total", healthTotal, { type: "number" }) +
    numberTag("wounds", wounds, { type: "number" }) +
    `</hp>` +
    tag("inventorylist", inventoryListBlock) +
    `<investiture>` +
    numberTag("current", character.investiture.current, { type: "number" }) +
    numberTag("total", character.investiture.total, { type: "number" }) +
    `</investiture>` +
    numberTag("level", character.meta.level, { type: "number" }) +
    numberTag("movement", movementTotal, { type: "number" }) +
    numberTag("movementbonus", character.movementBonus, { type: "number" }) +
    textTag("name", character.meta.name, { type: "string" }) +
    textTag("path", character.meta.path, { type: "string" }) +
    textTag("gender", character.meta.gender, { type: "string" }) +
    textTag("age", character.meta.age, { type: "string" }) +
    textTag("height", character.meta.height, { type: "string" }) +
    textTag("weight", character.meta.weight, { type: "string" }) +
    textTag("size", character.meta.size, { type: "string" }) +
    `<paths>` +
    `<${pathNodeName}>` +
    textTag("name", character.meta.path, { type: "string" }) +
    `<shortcut type="windowreference">` +
    tag("class", "") +
    tag("recordname", "") +
    `</shortcut>` +
    tag("text", "", { type: "formattedtext" }) +
    `</${pathNodeName}>` +
    `</paths>` +
    textTag("recdie", character.recoveryDie, { type: "dice" }) +
    tag("skilllist", skillListBlock) +
    tag("talent", talentBlock) +
    numberTag("tier", tier, { type: "number" }) +
    numberTag(
      "totalskillranks",
      character.skills.reduce((sum, skill) => sum + skill.rank, 0),
      { type: "number" },
    ) +
    numberTag("totaltalents", character.talents.length, { type: "number" }) +
    `<weaponlist>` +
    weaponListBlock +
    `</weaponlist>` +
    `</character>` +
    `</root>`;

  return formatXml(rawXML);
}
