// src/features/characters/equipment.data.ts

export type EquipmentTemplate = {
  count: number;
  carried: number;
  weight: number;
  charges: number;
  notes: string;
  type: string;
  uses: number;
  subtype: string;
};

export const EQUIPMENT_TEMPLATES: Record<string, EquipmentTemplate> = {
  "Backpack": {
    count: 1,
    carried: 2,
    weight: 5,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
    subtype: "",
  },
  "Alcohol (1 serving)": {
    count: 1,
    carried: 2,
    weight: 0.2,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
    subtype: "",
  },
  "Alcohol (bottle)": {
    count: 1,
    carried: 2,
    weight: 2,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 1,
    subtype: "",
  },
  "Waterskin": {
    count: 1,
    carried: 2,
    weight: 1,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
    subtype: "",
  },
  "Alerter": {
    count: 1,
    carried: 2,
    weight: 1,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 1,
    subtype: "Invested",
  },
  "Lantern (oil)": {
    count: 1,
    carried: 2,
    weight: 2,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
    subtype: "",
  },
  
  "Lantern (sphere)": {
    count: 1,
    carried: 2,
    weight: 2,
    charges: 0,
    notes: "This lantern uses a magical sphere that emits light when activated. It does not require oil and can be used indefinitely without refilling.",
    type: "Equipment",
    uses: 0,
    subtype: "",
  },
  "Rope (50 feet)": {
    count: 1,
    carried: 2,
    weight: 12,
    charges: 0,
    notes: "Rope can be used for climbing, tying objects, or creating makeshift traps. It is strong and durable, capable of supporting significant weight.",
    type: "Equipment",
    uses: 0,
    subtype: "",
  },
  "Anesthetic (5 doses)": {
    count: 1,
    carried: 2,
    weight: 1.5,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 5,
    subtype: "Consumable",
  },
};

export const EQUIPMENT_OPTIONS = Object.keys(EQUIPMENT_TEMPLATES);
