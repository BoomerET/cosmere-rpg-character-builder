// src/features/characters/equipment.data.ts

export type EquipmentTemplate = {
  count: number;
  carried: number;
  weight: number;
  charges: number;
  notes: string;
  type: string;
  uses: number;
};

export const EQUIPMENT_TEMPLATES: Record<string, EquipmentTemplate> = {
  "Backpack": {
    count: 1,
    carried: 2,
    weight: 2,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
  },
  "Bedroll": {
    count: 1,
    carried: 2,
    weight: 3,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
  },
  "Rations": {
    count: 1,
    carried: 2,
    weight: 1,
    charges: 0,
    notes: "",
    type: "Consumable",
    uses: 1,
  },
  "Waterskin": {
    count: 1,
    carried: 2,
    weight: 1,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
  },
  "Torch": {
    count: 1,
    carried: 2,
    weight: 1,
    charges: 0,
    notes: "",
    type: "Consumable",
    uses: 1,
  },
  "Lantern": {
    count: 1,
    carried: 2,
    weight: 2,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
  },
  "Rope": {
    count: 1,
    carried: 2,
    weight: 5,
    charges: 0,
    notes: "",
    type: "Equipment",
    uses: 0,
  },
  "Healing Poultice": {
    count: 1,
    carried: 2,
    weight: 0,
    charges: 0,
    notes: "",
    type: "Consumable",
    uses: 1,
  },
};

export const EQUIPMENT_OPTIONS = Object.keys(EQUIPMENT_TEMPLATES);
