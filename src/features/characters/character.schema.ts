import { z } from "zod";

export const attributeNameSchema = z.enum([
  "awareness",
  "intellect",
  "presence",
  "speed",
  "strength",
  "willpower",
]);

export const skillStatSchema = attributeNameSchema;

export const skillSchema = z.object({
  name: z.string().min(1),
  stat: skillStatSchema,
  rank: z.number().int().min(0).max(10),
  bonus: z.number().int().min(0).max(20).default(0),
});

export const resourceSchema = z.object({
  current: z.number().int().min(0).max(999).default(0),
  total: z.number().int().min(0).max(999).default(0),
  bonus: z.number().int().min(0).max(99).default(0),
});

export const skillNameSchema = z.enum([
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
]);

export const weaponSchema = z.object({
  name: z.string().min(1).default("New Weapon"),
  skill: skillNameSchema.default("Athletics"),
  damageDice: z.string().min(1).default("d1"),
  damageType: z.string().min(1).default("impact"),
  traits: z.string().default(""),
  expertTraits: z.string().default(""),
  handling: z.number().int().min(0).max(99).default(0),
  carried: z.number().int().min(0).max(2).default(2),
  ammo: z.number().int().min(0).max(999).default(0),
  maxAmmo: z.number().int().min(0).max(999).default(0),
  type: z.number().int().min(0).max(99).default(0),
});

export const expertiseSchema = z.object({
  name: z.string().min(1),
  text: z.string().default(""),
});

export const talentSchema = z.object({
  name: z.string().min(1),
  activation: z.string().default(""),
  prerequisites: z.string().default(""),
  source: z.string().default(""),
  specialty: z.string().default(""),
  text: z.string().default(""),
});

export const characterSchema = z.object({
  id: z.string().min(1),
  meta: z.object({
    name: z.string().min(1, "Character name is required"),
    playerName: z.string().default(""),
    ancestry: z.string().min(1).default("Human (Roshar)"),
    path: z.string().min(1).default("Windrunner"),
    level: z.number().int().min(1).default(1),
    tier: z.number().int().min(1).default(1),
  }),
  attributes: z.object({
    awareness: z.number().int().min(0).max(20),
    intellect: z.number().int().min(0).max(20),
    presence: z.number().int().min(0).max(20),
    speed: z.number().int().min(0).max(20),
    strength: z.number().int().min(0).max(20),
    willpower: z.number().int().min(0).max(20),
  }),
  health: z.object({
    current: z.number().int().min(0).max(999).default(0),
    total: z.number().int().min(0).max(999).default(10),
    bonus: z.number().int().min(0).max(99).default(0),
    wounds: z.number().int().min(0).max(999).default(0),
  }),
  focus: resourceSchema,
  investiture: z.object({
    current: z.number().int().min(0).max(999).default(0),
    total: z.number().int().min(0).max(999).default(0),
  }),
  deflect: z.number().int().min(0).max(99).default(0),
  movement: z.number().int().min(0).max(999).default(20),
  movementBonus: z.number().int().min(0).max(99).default(0),
  recoveryDie: z.string().min(1).default("d4"),
  sensesRange: z.string().default(""),
  liftingCapacity: z.number().int().min(0).max(99999).optional(),
  expertise: z.array(expertiseSchema).default([]),
  talents: z.array(talentSchema).default([]),
  weapons: z.array(weaponSchema).default([]),
  conditionsText: z.string().default(""),
  skills: z.array(skillSchema),
  notes: z.string().default(""),
  version: z.literal("1.0.0"),
});

export type CharacterInput = z.infer<typeof characterSchema>;

export const DEFAULT_SKILLS: CharacterInput["skills"] = [
  { name: "Agility", stat: "speed", rank: 0, bonus: 0 },
  { name: "Athletics", stat: "strength", rank: 0, bonus: 0 },
  { name: "Crafting", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Deception", stat: "presence", rank: 0, bonus: 0 },
  { name: "Deduction", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Discipline", stat: "willpower", rank: 0, bonus: 0 },
  { name: "Heavy Weaponry", stat: "strength", rank: 0, bonus: 0 },
  { name: "Insight", stat: "awareness", rank: 0, bonus: 0 },
  { name: "Intimidation", stat: "willpower", rank: 0, bonus: 0 },
  { name: "Leadership", stat: "presence", rank: 0, bonus: 0 },
  { name: "Light Weaponry", stat: "speed", rank: 0, bonus: 0 },
  { name: "Lore", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Medicine", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Perception", stat: "awareness", rank: 0, bonus: 0 },
  { name: "Persuasion", stat: "presence", rank: 0, bonus: 0 },
  { name: "Stealth", stat: "speed", rank: 0, bonus: 0 },
  { name: "Survival", stat: "awareness", rank: 0, bonus: 0 },
  { name: "Thievery", stat: "speed", rank: 0, bonus: 0 },
];

export type CharacterFormValues = z.input<typeof characterSchema>;
export type CharacterInput = z.output<typeof characterSchema>;
