import type { CharacterInput } from "./character.schema";

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

function idNode(index: number) {
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

export function toFantasyGroundsXml(character: CharacterInput): string {
  const attrsBlock = [
    ["awareness", character.attributes.awareness],
    ["intellect", character.attributes.intellect],
    ["presence", character.attributes.presence],
    ["speed", character.attributes.speed],
    ["strength", character.attributes.strength],
    ["willpower", character.attributes.willpower],
  ]
    .map(([name, score]) =>
      tag(
        name,
        [
          tag("bonus", "0", { type: "number" }),
          tag("score", n(score), { type: "number" }),
        ].join(""),
      ),
    )
    .join("");

  const weaponListBlock = character.weapons
    .map((weapon, i) => {
      const nodeName =
        i === 0 && weapon.name === "Unarmed Attack"
          ? "unarmedattack"
          : idNode(i + 1);

      return (
        `<${nodeName}>` +
        tag("ammo", n(weapon.ammo), { type: "number" }) +
        tag("carried", n(weapon.carried), { type: "number" }) +
        `<damagelist>` +
        `<id-00001>` +
        tag("dice", escapeXml(weapon.damageDice), { type: "dice" }) +
        tag("type", escapeXml(weapon.damageType), { type: "string" }) +
        tag("weaponskill", escapeXml(weapon.skill), { type: "string" }) +
        `</id-00001>` +
        `</damagelist>` +
        tag("experttraits", escapeXml(weapon.expertTraits), {
          type: "string",
        }) +
        tag("handling", n(weapon.handling), { type: "number" }) +
        tag("maxammo", n(weapon.maxAmmo), { type: "number" }) +
        tag("name", escapeXml(weapon.name), { type: "string" }) +
        `<shortcut type="windowreference">${tag("class", "")}${tag("recordname", "")}</shortcut>` +
        tag("traits", escapeXml(weapon.traits), { type: "string" }) +
        tag("type", n(weapon.type), { type: "number" }) +
        tag("weaponskill", escapeXml(weapon.skill), { type: "string" }) +
        `</${nodeName}>`
      );
    })
    .join("");

  const topLevelStats = [
    tag("awareness", n(character.attributes.awareness), { type: "number" }),
    tag("intellect", n(character.attributes.intellect), { type: "number" }),
    tag("presence", n(character.attributes.presence), { type: "number" }),
    tag("speed", n(character.attributes.speed), { type: "number" }),
    tag("strength", n(character.attributes.strength), { type: "number" }),
    tag("willpower", n(character.attributes.willpower), { type: "number" }),
  ].join("");

  const coinsBlock = COIN_NAMES.map((coinName, i) =>
    tag(
      idNode(i),
      [
        tag("amount", "0", { type: "number" }),
        tag("name", coinName, { type: "string" }),
      ].join(""),
    ),
  ).join("");

  const skillListBlock = character.skills
    .map((skill, i) =>
      tag(
        idNode(i),
        [
          tag("bonus", n(skill.bonus), { type: "number" }),
          tag("name", escapeXml(skill.name), { type: "string" }),
          tag("rank", n(skill.rank), { type: "number" }),
          tag("stat", escapeXml(skill.stat), { type: "string" }),
          tag("total", n(skill.rank + skill.bonus), { type: "number" }),
        ].join(""),
      ),
    )
    .join("");

  const pathNodeName = character.meta.path.replace(/[^\w.-]/g, "_");
  const wounds = Math.max(0, character.health.total - character.health.current);

  const physicalDefense =
    10 + character.attributes.strength + character.attributes.speed;
  const cognitiveDefense =
    10 + character.attributes.intellect + character.attributes.willpower;
  const spiritualDefense =
    10 + character.attributes.awareness + character.attributes.presence;

  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<root version="5.1" dataversion="20260124" release="8.1|CoreRPG:7">` +
    `<character>` +
    `<ancestry>` +
    tag("name", escapeXml(character.meta.ancestry), { type: "string" }) +
    `<shortcut type="windowreference">${tag("class", "")}${tag("recordname", "")}</shortcut>` +
    tag("text", "", { type: "formattedtext" }) +
    `</ancestry>` +
    tag("attributes", attrsBlock) +
    topLevelStats +
    tag("coins", coinsBlock) +
    `<defenses>` +
    tag(
      "cognitivedefense",
      tag("bonus", "0", { type: "number" }) +
        tag("score", n(cognitiveDefense), { type: "number" }),
    ) +
    tag(
      "physicaldefense",
      tag("bonus", "0", { type: "number" }) +
        tag("score", n(physicalDefense), { type: "number" }),
    ) +
    tag(
      "spiritualdefense",
      tag("bonus", "0", { type: "number" }) +
        tag("score", n(spiritualDefense), { type: "number" }),
    ) +
    `</defenses>` +
    tag("deflect", n(character.deflect), { type: "number" }) +
    emptyTag("effectlist") +
    `<encumbrance>` +
    tag("carry", n(character.liftingCapacity), { type: "number" }) +
    tag("load", "0", { type: "number" }) +
    tag("max", n(character.liftingCapacity * 2), { type: "number" }) +
    `</encumbrance>` +
    emptyTag("expertise") +
    `<focus>` +
    tag("bonus", n(character.focus.bonus), { type: "number" }) +
    tag("current", n(character.focus.current), { type: "number" }) +
    tag("total", n(character.focus.total), { type: "number" }) +
    `</focus>` +
    emptyTag("goals") +
    `<hp>` +
    tag("bonus", n(character.health.bonus), { type: "number" }) +
    tag("total", n(character.health.total), { type: "number" }) +
    tag("wounds", n(wounds), { type: "number" }) +
    `</hp>` +
    emptyTag("inventorylist") +
    `<investiture>` +
    tag("current", n(character.investiture.current), { type: "number" }) +
    tag("total", n(character.investiture.total), { type: "number" }) +
    `</investiture>` +
    tag("level", n(character.meta.level), { type: "number" }) +
    tag("movement", n(character.movement), { type: "number" }) +
    tag("movementbonus", n(character.movementBonus), { type: "number" }) +
    tag("name", escapeXml(character.meta.name), { type: "string" }) +
    tag("path", escapeXml(character.meta.path), { type: "string" }) +
    `<paths><${pathNodeName}>` +
    tag("name", escapeXml(character.meta.path), { type: "string" }) +
    `<shortcut type="windowreference">${tag("class", "")}${tag("recordname", "")}</shortcut>` +
    tag("text", "", { type: "formattedtext" }) +
    `</${pathNodeName}></paths>` +
    tag("recdie", escapeXml(character.recoveryDie), { type: "dice" }) +
    tag("skilllist", skillListBlock) +
    emptyTag("talent") +
    tag("tier", n(character.meta.tier), { type: "number" }) +
    tag(
      "totalskillranks",
      n(character.skills.reduce((sum, s) => sum + s.rank, 0)),
      { type: "number" },
    ) +
    tag("totaltalents", "0", { type: "number" }) +
    `<weaponlist>` +
    weaponListBlock +
    `</weaponlist>` +
    `</character>` +
    `</root>`
  );
}
