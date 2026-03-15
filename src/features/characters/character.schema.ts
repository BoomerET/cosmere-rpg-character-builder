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

export const characterSchema = z.object({
  id: z.string().min(1),
  meta: z.object({
    name: z.string().min(1, "Character name is required"),
    playerName: z.string().optional(),
    concept: z.string().optional(),
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
  skills: z.array(skillSchema),
  notes: z.string().optional(),
  version: z.literal("1.0.0"),
});

export type CharacterInput = z.infer<typeof characterSchema>;

export const DEFAULT_SKILLS: CharacterInput["skills"] = [
  { name: "Perception", stat: "awareness", rank: 0, bonus: 0 },
  { name: "Persuasion", stat: "presence", rank: 0, bonus: 0 },
  { name: "Light Weaponry", stat: "speed", rank: 0, bonus: 0 },
  { name: "Deduction", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Agility", stat: "speed", rank: 0, bonus: 0 },
  { name: "Crafting", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Thievery", stat: "speed", rank: 0, bonus: 0 },
  { name: "Leadership", stat: "presence", rank: 0, bonus: 0 },
  { name: "Discipline", stat: "willpower", rank: 0, bonus: 0 },
  { name: "Athletics", stat: "strength", rank: 0, bonus: 0 },
  { name: "Lore", stat: "intellect", rank: 0, bonus: 0 },
  { name: "Insight", stat: "awareness", rank: 0, bonus: 0 },
  { name: "Heavy Weaponry", stat: "strength", rank: 0, bonus: 0 },
  { name: "Intimidation", stat: "willpower", rank: 0, bonus: 0 },
  { name: "Deception", stat: "presence", rank: 0, bonus: 0 },
  { name: "Stealth", stat: "speed", rank: 0, bonus: 0 },
  { name: "Survival", stat: "awareness", rank: 0, bonus: 0 },
  { name: "Medicine", stat: "intellect", rank: 0, bonus: 0 },
];

