export type ArmorTemplate = {
  type: string;
  deflect: number;
  traits: string;
  expertTraits: string;
  weight: number;
};

export const ARMOR_TEMPLATES: Record<string, ArmorTemplate> = {
  "No Armor": {
    type: "Armor",
    deflect: 0,
    traits: "",
    expertTraits: "",
    weight: 0,
  },
  "Leather": {
    type: "Armor",
    deflect: 1,
    traits: "",
    expertTraits: "Presentable",
    weight: 10,
  },
  "Chain": {
    type: "Armor",
    deflect: 2,
    traits: "Cumbersome [3]",
    expertTraits: "Unique: loses Cumbersome trait",
    weight: 10,
  },
  "Full Plate": {
    type: "Armor",
    deflect: 4,
    traits: "Cumbersome [5]",
    expertTraits: "",
    weight: 55,
  },
  "Half Plate": {
    type: "Armor",
    deflect: 3,
    traits: "Cumbersome [4]",
    expertTraits: "Unique: Cumbersome [3] instead of Cumbersome [4]",
    weight: 40,
  },
  "Breastplate": {
    type: "Armor",
    deflect: 2,
    traits: "Cumbersome [3]",
    expertTraits: "Presentable",
    weight: 30,
  },
  "Shardplate": {
    type: "Armor",
    deflect: 5,
    traits: "Dangerous, Unique",
    expertTraits: "Unique: loses Dangerous Trait",
    weight: 1400,
  },
  "Shardplate (Radiant)": {
    type: "Armor",
    deflect: 5,
    traits: "Dangerous, Unique",
    expertTraits: "Unique: loses Dangerous Trait",
    weight: 0,
  },
};

export const ARMOR_OPTIONS = Object.keys(ARMOR_TEMPLATES);