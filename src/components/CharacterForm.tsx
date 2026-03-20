import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  characterSchema,
  type CharacterFormValues,
  type CharacterInput,
} from "../features/characters/character.schema";
import { FlashMessage } from "./FlashMessage";
import {
  WEAPON_OPTIONS,
  WEAPON_TEMPLATES,
} from "../features/characters/weapon.data";
import {
  EQUIPMENT_OPTIONS,
  EQUIPMENT_TEMPLATES,
} from "../features/characters/equipment.data";

type CharacterFormProps = {
  title: string;
  subtitle: string;
  defaultValues: CharacterInput;
  submitLabel: string;
  onSubmit: (values: CharacterInput) => void;
  onCancel: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  topContent?: ReactNode;
};

type FormTab =
  | "overview"
  | "attributes"
  | "skills"
  | "weapons"
  | "equipment"
  | "expertise"
  | "talents"
  | "profile"
  | "details";

type SkillSortMode = "alpha" | "total";

function getTierFromLevel(level: number): number {
  if (level >= 21) return 5;
  if (level >= 16) return 4;
  if (level >= 11) return 3;
  if (level >= 6) return 2;
  return 1;
}

function getHealthMax(strength: number): number {
  return 10 + strength;
}

function getMovementRate(speed: number): number {
  if (speed >= 3) return 30;
  if (speed >= 1) return 25;
  return 20;
}

function getStatAbbreviation(stat: string): string {
  switch (stat) {
    case "strength":
      return "STR";
    case "speed":
      return "SPD";
    case "intellect":
      return "INT";
    case "willpower":
      return "WIL";
    case "awareness":
      return "AWR";
    case "presence":
      return "PRE";
    default:
      return stat.toUpperCase();
  }
}

function getSensesRange(awareness: number): string {
  if (awareness >= 3) return "20 ft";
  if (awareness >= 1) return "10 ft";
  return "5 ft";
}

function getLiftingCapacity(strength: number): number {
  if (strength >= 3) return 500;
  if (strength >= 1) return 200;
  return 100;
}

function getFocusMax(willpower: number): number {
  return willpower + 2;
}

function getRecoveryDie(willpower: number): string {
  if (willpower >= 3) return "1d8";
  if (willpower >= 1) return "1d6";
  return "1d4";
}

function getWeaponHandling(traits: string, expertTraits = ""): number {
  const combined = `${traits} ${expertTraits}`.toLowerCase();
  return combined.includes("two-handed") || combined.includes("two handed")
    ? 1
    : 0;
}

const ANCESTRY_OPTIONS = ["Human (Roshar)", "Singer"] as const;

const PATH_OPTIONS = [
  "Agent",
  "Dustbringer",
  "Edgedancer",
  "Elsecaller",
  "Envoy",
  "Hunter",
  "Leader",
  "Lightweaver",
  "Scholar",
  "Skybreaker",
  "Stoneward",
  "Truthwatcher",
  "Warrior",
  "Willshaper",
  "Windrunner",
] as const;

export function CharacterForm({
  title,
  subtitle,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  onSecondaryAction,
  secondaryActionLabel,
  successMessage = "",
  errorMessage = "",
  topContent,
}: CharacterFormProps) {
  const [activeTab, setActiveTab] = useState<FormTab>("overview");
  const [submitError, setSubmitError] = useState("");
  const [skillSortMode, setSkillSortMode] = useState<SkillSortMode>("alpha");

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues,
  });

  const {
    fields: weaponFields,
    append: appendWeapon,
    remove: removeWeapon,
  } = useFieldArray({
    control: form.control,
    name: "weapons",
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control: form.control,
    name: "equipment",
  });

  const {
    fields: expertiseFields,
    append: appendExpertise,
    remove: removeExpertise,
  } = useFieldArray({
    control: form.control,
    name: "expertise",
  });

  const {
    fields: talentFields,
    append: appendTalent,
    remove: removeTalent,
  } = useFieldArray({
    control: form.control,
    name: "talents",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const skills =
    useWatch({
      control: form.control,
      name: "skills",
    }) ?? [];

  const level =
    useWatch({
      control: form.control,
      name: "meta.level",
    }) ?? 1;

  const strength =
    useWatch({
      control: form.control,
      name: "attributes.strength",
    }) ?? 0;

  const speed =
    useWatch({
      control: form.control,
      name: "attributes.speed",
    }) ?? 0;

  const intellect =
    useWatch({
      control: form.control,
      name: "attributes.intellect",
    }) ?? 0;

  const willpower =
    useWatch({
      control: form.control,
      name: "attributes.willpower",
    }) ?? 0;

  const awareness =
    useWatch({
      control: form.control,
      name: "attributes.awareness",
    }) ?? 0;

  const presence =
    useWatch({
      control: form.control,
      name: "attributes.presence",
    }) ?? 0;

  const tier = getTierFromLevel(level);
  const healthMax = getHealthMax(strength);
  const movementRate = getMovementRate(speed);
  const sensesRange = getSensesRange(awareness);
  const liftingCapacity = getLiftingCapacity(strength);

  const focusMax = getFocusMax(willpower);
  const recoveryDie = getRecoveryDie(willpower);

  const physicalDefense = 10 + strength + speed;
  const cognitiveDefense = 10 + intellect + willpower;
  const spiritualDefense = 10 + awareness + presence;

  function getAttributeValue(
    stat: CharacterFormValues["skills"][number]["stat"],
  ) {
    switch (stat) {
      case "awareness":
        return awareness;
      case "intellect":
        return intellect;
      case "presence":
        return presence;
      case "speed":
        return speed;
      case "strength":
        return strength;
      case "willpower":
        return willpower;
      default:
        return 0;
    }
  }

  const displayedSkills = [...skills]
    .map((skill, index) => ({
      skill,
      index,
      total:
        getAttributeValue(skill.stat) + (skill.rank ?? 0) + (skill.bonus ?? 0),
    }))
    .sort((a, b) => {
      if (skillSortMode === "total") {
        return b.total - a.total || a.skill.name.localeCompare(b.skill.name);
      }

      return a.skill.name.localeCompare(b.skill.name, undefined, {
        sensitivity: "base",
      });
    });

  function onInvalid(errors: unknown) {
    console.error("Form validation failed:", errors);
    setSubmitError("Please fix the validation errors before saving.");
  }

  function numericRegister(path: Path<CharacterFormValues>) {
    return form.register(path, {
      setValueAs: (value) => (value === "" ? undefined : Number(value)),
    });
  }

  function applyEquipmentTemplate(index: number, itemName: string) {
    const template = EQUIPMENT_TEMPLATES[itemName];
    if (!template) return;

    form.setValue(`equipment.${index}.count`, template.count, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`equipment.${index}.carried`, template.carried, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`equipment.${index}.weight`, template.weight, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`equipment.${index}.charges`, template.charges, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`equipment.${index}.notes`, template.notes, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`equipment.${index}.type`, template.type, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`equipment.${index}.uses`, template.uses, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function applyWeaponTemplate(index: number, weaponName: string) {
    const template = WEAPON_TEMPLATES[weaponName];
    if (!template) return;

    form.setValue(`weapons.${index}.skill`, template.skill, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.damageDice`, template.damageDice, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.damageType`, template.damageType, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.traits`, template.traits, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.expertTraits`, template.expertTraits, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.carried`, template.carried, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.ammo`, template.ammo, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.maxAmmo`, template.maxAmmo, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.type`, template.type, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.range`, template.range, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`weapons.${index}.subtype`, template.subtype, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <main className="page-shell">
      {topContent}

      <section className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>

      <FlashMessage kind="success" message={successMessage} />
      <FlashMessage kind="error" message={errorMessage || submitError} />

      {Object.keys(form.formState.errors).length > 0 ? (
        <section
          className="notice notice-error"
          style={{ marginBottom: "18px" }}
        >
          <p style={{ marginBottom: "8px" }}>
            There are validation errors in the form.
          </p>
          <pre className="code-block">
            {JSON.stringify(
              form.formState.errors,
              (key, value) => (key === "ref" ? undefined : value),
              2,
            )}
          </pre>
        </section>
      ) : null}

      <form
        className="sheet-card"
        onSubmit={form.handleSubmit((values) => {
          setSubmitError("");

          const normalized: CharacterFormValues = {
            ...values,
            meta: {
              ...values.meta,
              name: values.meta.name ?? "",
              playerName: values.meta.playerName ?? "",
              ancestry: values.meta.ancestry ?? "Human (Roshar)",
              path: values.meta.path ?? "Windrunner",
              level: values.meta.level ?? 1,
              tier: getTierFromLevel(values.meta.level ?? 1),
              gender: values.meta.gender ?? "",
              age: values.meta.age ?? 0,
              height: values.meta.height ?? "",
              weight: values.meta.weight ?? "",
              size: values.meta.size ?? "",
            },
            attributes: {
              ...values.attributes,
              awareness: values.attributes.awareness ?? 0,
              intellect: values.attributes.intellect ?? 0,
              presence: values.attributes.presence ?? 0,
              speed: values.attributes.speed ?? 0,
              strength: values.attributes.strength ?? 0,
              willpower: values.attributes.willpower ?? 0,
            },
            health: {
              ...values.health,
              current: values.health.current ?? 0,
              total: getHealthMax(values.attributes.strength ?? 0),
              bonus: values.health.bonus ?? 0,
              wounds: values.health.wounds ?? 0,
            },
            focus: {
              ...values.focus,
              current: values.focus.current ?? 0,
              total: getFocusMax(values.attributes.willpower ?? 0),
              bonus: values.focus.bonus ?? 0,
            },
            investiture: {
              ...values.investiture,
              current: values.investiture.current ?? 0,
              total: values.investiture.total ?? 0,
            },
            deflect: values.deflect ?? 0,
            movement: getMovementRate(values.attributes.speed ?? 0),
            movementBonus: values.movementBonus ?? 0,
            recoveryDie: getRecoveryDie(values.attributes.willpower ?? 0),
            sensesRange: getSensesRange(values.attributes.awareness ?? ""),
            liftingCapacity: getLiftingCapacity(
              values.attributes.strength ?? 0,
            ),
            expertise: values.expertise ?? [],
            talents: values.talents ?? [],
            equipment: values.equipment ?? [],
            weapons: (values.weapons ?? []).map((weapon) => ({
              ...weapon,
              handling: getWeaponHandling(
                weapon.traits ?? "",
                weapon.expertTraits ?? "",
              ),
            })),
            conditionsText: values.conditionsText ?? "",
            skills: values.skills ?? [],
            notes: values.notes ?? "",
            version: values.version ?? "1.0.0",
          };

          const parsed: CharacterInput = characterSchema.parse(normalized);
          onSubmit(parsed);
        }, onInvalid)}
      >
        <div className="tab-bar">
          <button
            type="button"
            className={`tab-button${activeTab === "overview" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`tab-button${activeTab === "attributes" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("attributes")}
          >
            Attributes
          </button>

          <button
            type="button"
            className={`tab-button${activeTab === "skills" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            Skills
          </button>

          <button
            type="button"
            className={`tab-button${activeTab === "weapons" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("weapons")}
          >
            Weapons
          </button>
          <button
            type="button"
            className={`tab-button${activeTab === "equipment" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("equipment")}
          >
            Equipment
          </button>
          <button
            type="button"
            className={`tab-button${activeTab === "expertise" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("expertise")}
          >
            Expertise
          </button>

          <button
            type="button"
            className={`tab-button${activeTab === "talents" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("talents")}
          >
            Talents
          </button>
          <button
            type="button"
            className={`tab-button${activeTab === "profile" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            type="button"
            className={`tab-button${activeTab === "details" ? " tab-button-active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
        </div>

        {activeTab === "overview" && (
          <section className="sheet-section">
            <h2>Core Details</h2>

            <div className="form-grid">
              <label className="field">
                <span>Name</span>
                <input {...form.register("meta.name")} />
              </label>

              <label className="field">
                <span>Player Name</span>
                <input {...form.register("meta.playerName")} />
              </label>

              <label className="field">
                <span>Ancestry</span>
                <select {...form.register("meta.ancestry")}>
                  {ANCESTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Path</span>
                <select {...form.register("meta.path")}>
                  {PATH_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginTop: "16px" }}>
              <div className="mini-card">
                <h3>Advancement</h3>
                <div className="mini-grid two-up">
                  <label className="field field-small">
                    <span>Level</span>
                    <input
                      type="number"
                      min="1"
                      {...numericRegister("meta.level")}
                    />
                  </label>

                  <div className="defense-display">
                    <span className="defense-label">Tier</span>
                    <strong className="defense-value">{tier}</strong>
                    <span className="defense-formula">
                      {tier === 1 && "Levels 1–5"}
                      {tier === 2 && "Levels 6–10"}
                      {tier === 3 && "Levels 11–15"}
                      {tier === 4 && "Levels 16–20"}
                      {tier === 5 && "Levels 21+"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="sheet-section">
            <h2>Profile</h2>

            <div className="form-grid">
              <label className="field">
                <span>Gender</span>
                <input {...form.register("meta.gender")} />
              </label>

              <label className="field field-small">
                <span>Age</span>
                <input {...form.register("meta.gender")} />
              </label>

              <label className="field">
                <span>Height</span>
                <input {...form.register("meta.height")} />
              </label>

              <label className="field">
                <span>Weight</span>
                <input {...form.register("meta.weight")} />
              </label>

              <label className="field">
                <span>Size</span>
                <input {...form.register("meta.size")} />
              </label>
            </div>
          </section>
        )}

        {activeTab === "attributes" && (
          <>
            <section className="sheet-section">
              <h2>Attributes</h2>

              <div className="attributes-grid">
                <label className="attribute-tile">
                  <span className="attribute-label" title="Strength">
                    STR
                  </span>
                  <input
                    className="attribute-input"
                    type="number"
                    {...numericRegister("attributes.strength")}
                  />
                </label>

                <label className="attribute-tile">
                  <span className="attribute-label" title="Speed">
                    SPD
                  </span>
                  <input
                    className="attribute-input"
                    type="number"
                    {...numericRegister("attributes.speed")}
                  />
                </label>

                <label className="attribute-tile">
                  <span className="attribute-label" title="Intellect">
                    INT
                  </span>
                  <input
                    className="attribute-input"
                    type="number"
                    {...numericRegister("attributes.intellect")}
                  />
                </label>

                <label className="attribute-tile">
                  <span className="attribute-label" title="Willpower">
                    WIL
                  </span>
                  <input
                    className="attribute-input"
                    type="number"
                    {...numericRegister("attributes.willpower")}
                  />
                </label>

                <label className="attribute-tile">
                  <span className="attribute-label" title="Awareness">
                    AWR
                  </span>
                  <input
                    className="attribute-input"
                    type="number"
                    {...numericRegister("attributes.awareness")}
                  />
                </label>

                <label className="attribute-tile">
                  <span className="attribute-label" title="Presence">
                    PRE
                  </span>
                  <input
                    className="attribute-input"
                    type="number"
                    {...numericRegister("attributes.presence")}
                  />
                </label>
              </div>
            </section>

            <section className="sheet-section">
              <h2>Defenses & Resources</h2>

              <div className="resource-grid">
                <div className="mini-card">
                  <h3>Defenses</h3>
                  <div className="mini-grid three-up">
                    <div className="defense-display">
                      <span className="defense-label">Physical</span>
                      <strong className="defense-value">
                        {physicalDefense}
                      </strong>
                      <span className="defense-formula">10 + STR + SPD</span>
                    </div>

                    <div className="defense-display">
                      <span className="defense-label">Cognitive</span>
                      <strong className="defense-value">
                        {cognitiveDefense}
                      </strong>
                      <span className="defense-formula">10 + INT + WIL</span>
                    </div>

                    <div className="defense-display">
                      <span className="defense-label">Spiritual</span>
                      <strong className="defense-value">
                        {spiritualDefense}
                      </strong>
                      <span className="defense-formula">10 + AWR + PRE</span>
                    </div>
                  </div>
                </div>

                <div className="mini-card">
                  <h3>Health</h3>
                  <div className="mini-grid two-up">
                    <div className="defense-display">
                      <span className="defense-label">Max</span>
                      <strong className="defense-value">{healthMax}</strong>
                      <span className="defense-formula">10 + STR</span>
                    </div>

                    <label className="field">
                      <span>Current</span>
                      <input
                        type="number"
                        {...numericRegister("health.current")}
                      />
                    </label>
                  </div>
                </div>

                <div className="mini-card">
                  <h3>Focus</h3>
                  <div className="mini-grid two-up">
                    <div className="defense-display">
                      <span className="defense-label">Max</span>
                      <strong className="defense-value">{focusMax}</strong>
                      <span className="defense-formula">WIL + 2</span>
                    </div>

                    <label className="field">
                      <span>Current</span>
                      <input
                        type="number"
                        {...numericRegister("focus.current")}
                      />
                    </label>
                  </div>
                </div>

                <div className="mini-card">
                  <h3>Investiture</h3>
                  <div className="mini-grid two-up">
                    <label className="field">
                      <span>Max</span>
                      <input
                        type="number"
                        {...numericRegister("investiture.total")}
                      />
                    </label>

                    <label className="field">
                      <span>Current</span>
                      <input
                        type="number"
                        {...numericRegister("investiture.current")}
                      />
                    </label>
                  </div>
                </div>

                <div className="mini-card">
                  <h3>Movement</h3>
                  <div className="mini-grid two-up">
                    <div className="defense-display">
                      <span className="defense-label">Rate</span>
                      <strong className="defense-value">{movementRate}</strong>
                      <span className="defense-formula">
                        {speed >= 3
                          ? "SPD 3+"
                          : speed >= 1
                            ? "SPD 1–2"
                            : "Base 20 ft"}
                      </span>
                    </div>

                    <label className="field field-small">
                      <span>Bonus</span>
                      <input
                        type="number"
                        {...numericRegister("movementBonus")}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: "16px" }}>
                <label className="field field-small">
                  <span>Deflect</span>
                  <input type="number" {...numericRegister("deflect")} />
                </label>

                <div className="defense-display">
                  <span className="defense-label">Recovery Die</span>
                  <strong className="defense-value">{recoveryDie}</strong>
                  <span className="defense-formula">
                    {willpower >= 3
                      ? "WIL 3–4"
                      : willpower >= 1
                        ? "WIL 1–2"
                        : "WIL 0"}
                  </span>
                </div>

                <div className="defense-display">
                  <span className="defense-label">Senses Range</span>
                  <strong className="defense-value">{sensesRange}</strong>
                  <span className="defense-formula">
                    {awareness >= 3
                      ? "AWR 3"
                      : awareness >= 1
                        ? "AWR 1–2"
                        : "AWR 0"}
                  </span>
                </div>

                <div className="defense-display">
                  <span className="defense-label">Lifting Capacity</span>
                  <strong className="defense-value">
                    {liftingCapacity} lbs
                  </strong>
                  <span className="defense-formula">
                    {strength >= 3
                      ? "STR 3"
                      : strength >= 1
                        ? "STR 1–2"
                        : "STR 0"}
                  </span>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "skills" && (
          <section className="sheet-section">
            <h2>Skills</h2>

            <div className="stack-actions" style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className={`button ${skillSortMode === "alpha" ? "" : "button-secondary"}`}
                onClick={() => setSkillSortMode("alpha")}
              >
                Sort A–Z
              </button>

              <button
                type="button"
                className={`button ${skillSortMode === "total" ? "" : "button-secondary"}`}
                onClick={() => setSkillSortMode("total")}
              >
                Sort by Total
              </button>
            </div>

            <div className="skills-table">
              <div className="skill-table-header">
                <div>Skill</div>
                <div>Stat</div>
                <div>Rank</div>
                <div>Bonus</div>
                <div>Total</div>
              </div>

              <div className="skills-grid">
                {displayedSkills.map(({ skill, index, total }) => (
                  <div className="skill-row" key={`${skill.name}-${index}`}>
                    <div className="skill-name">{skill.name}</div>

                    <div className={`skill-stat stat-${skill.stat}`}>
                      {getStatAbbreviation(skill.stat)}
                    </div>

                    <div className="field field-small skill-cell">
                      <input
                        type="number"
                        min="0"
                        {...numericRegister(`skills.${index}.rank` as const)}
                      />
                    </div>

                    <div className="field field-small skill-cell">
                      <input
                        type="number"
                        min="0"
                        {...numericRegister(`skills.${index}.bonus` as const)}
                      />
                    </div>

                    <div className="skill-total">{total}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "weapons" && (
          <section className="sheet-section">
            <h2>Weapons</h2>

            <div className="stack-actions" style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  appendWeapon({
                    name: "Longsword",
                    ...WEAPON_TEMPLATES["Longsword"],
                    handling: 0,
                  })
                }
              >
                Add Weapon
              </button>
            </div>

            <div className="weapons-grid">
              {weaponFields.map((weapon, index) => (
                <div className="weapon-card" key={weapon.id}>
                  <div className="weapon-card-header">
                    <h3>Weapon {index + 1}</h3>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => removeWeapon(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span>Name</span>
                      <select
                        {...form.register(`weapons.${index}.name` as const)}
                        onChange={(e) => {
                          const weaponName = e.target.value;
                          form.setValue(
                            `weapons.${index}.name` as const,
                            weaponName,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          );
                          applyWeaponTemplate(index, weaponName);
                        }}
                      >
                        {WEAPON_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Subtype</span>
                      <input {...form.register(`weapons.${index}.subtype`)} />
                    </label>
                    <label className="field">
                      <span>Skill</span>
                      <input
                        {...form.register(`weapons.${index}.skill` as const)}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Damage Dice</span>
                      <input
                        {...form.register(
                          `weapons.${index}.damageDice` as const,
                        )}
                      />
                    </label>

                    <label className="field">
                      <span>Damage Type</span>
                      <input
                        {...form.register(
                          `weapons.${index}.damageType` as const,
                        )}
                      />
                    </label>
                    <label className="field">
                      <span>Range</span>
                      <input {...form.register(`weapons.${index}.range`)} />
                    </label>
                    <label className="field">
                      <span>Traits</span>
                      <input
                        {...form.register(`weapons.${index}.traits` as const)}
                      />
                    </label>

                    <label className="field">
                      <span>Expert Traits</span>
                      <input
                        {...form.register(
                          `weapons.${index}.expertTraits` as const,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Status</span>
                      <select
                        {...form.register(`weapons.${index}.carried` as const, {
                          setValueAs: (v) => Number(v),
                        })}
                      >
                        <option value={0}>Not Carried</option>
                        <option value={1}>Equipped</option>
                        <option value={2}>Carried</option>
                      </select>
                    </label>

                    <label className="field field-small">
                      <span>Ammo</span>
                      <input
                        type="number"
                        {...numericRegister(`weapons.${index}.ammo` as const)}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Max Ammo</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `weapons.${index}.maxAmmo` as const,
                        )}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "equipment" && (
          <section className="sheet-section">
            <h2>Equipment</h2>

            <div className="stack-actions" style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  appendEquipment({
                    name: "Backpack",
                    ...EQUIPMENT_TEMPLATES["Backpack"],
                  })
                }
              >
                Add Equipment
              </button>
            </div>

            <div className="weapons-grid">
              {equipmentFields.map((item, index) => (
                <div className="weapon-card" key={item.id}>
                  <div className="weapon-card-header">
                    <h3>Item {index + 1}</h3>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => removeEquipment(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span>Name</span>
                      <select
                        {...form.register(`equipment.${index}.name` as const)}
                        onChange={(e) => {
                          const itemName = e.target.value;
                          form.setValue(
                            `equipment.${index}.name` as const,
                            itemName,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          );
                          applyEquipmentTemplate(index, itemName);
                        }}
                      >
                        {EQUIPMENT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field field-small">
                      <span>Count</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `equipment.${index}.count` as const,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Status</span>
                      <select
                        {...form.register(
                          `equipment.${index}.carried` as const,
                          {
                            setValueAs: (v) => Number(v),
                          },
                        )}
                      >
                        <option value={0}>Not Carried</option>
                        <option value={1}>Equipped</option>
                        <option value={2}>Carried</option>
                      </select>
                    </label>

                    <label className="field field-small">
                      <span>Weight</span>
                      <input
                        type="number"
                        step="0.1"
                        {...numericRegister(
                          `equipment.${index}.weight` as const,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Charges</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `equipment.${index}.charges` as const,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Uses</span>
                      <input
                        type="number"
                        {...numericRegister(`equipment.${index}.uses` as const)}
                      />
                    </label>

                    <label className="field">
                      <span>Type</span>
                      <input
                        {...form.register(`equipment.${index}.type` as const)}
                      />
                    </label>

                    <label className="field">
                      <span>Notes</span>
                      <input
                        {...form.register(`equipment.${index}.notes` as const)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "expertise" && (
          <section className="sheet-section">
            <h2>Expertise</h2>

            <div className="stack-actions" style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  appendExpertise({
                    name: "New Expertise",
                    text: "",
                  })
                }
              >
                Add Expertise
              </button>
            </div>

            <div className="weapons-grid">
              {expertiseFields.map((item, index) => (
                <div className="weapon-card" key={item.id}>
                  <div className="weapon-card-header">
                    <h3>Expertise {index + 1}</h3>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => removeExpertise(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span>Name</span>
                      <input
                        {...form.register(`expertise.${index}.name` as const)}
                      />
                    </label>

                    <label className="field">
                      <span>Description</span>
                      <textarea
                        rows={6}
                        {...form.register(`expertise.${index}.text` as const)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "talents" && (
          <section className="sheet-section">
            <h2>Talents</h2>

            <div className="stack-actions" style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  appendTalent({
                    name: "New Talent",
                    activation: "",
                    prerequisites: "",
                    source: "",
                    specialty: "",
                    text: "",
                  })
                }
              >
                Add Talent
              </button>
            </div>

            <div className="weapons-grid">
              {talentFields.map((item, index) => (
                <div className="weapon-card" key={item.id}>
                  <div className="weapon-card-header">
                    <h3>Talent {index + 1}</h3>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => removeTalent(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span>Name</span>
                      <input
                        {...form.register(`talents.${index}.name` as const)}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Activation</span>
                      <input
                        {...form.register(
                          `talents.${index}.activation` as const,
                        )}
                      />
                    </label>

                    <label className="field">
                      <span>Prerequisites</span>
                      <input
                        {...form.register(
                          `talents.${index}.prerequisites` as const,
                        )}
                      />
                    </label>

                    <label className="field">
                      <span>Source</span>
                      <input
                        {...form.register(`talents.${index}.source` as const)}
                      />
                    </label>

                    <label className="field">
                      <span>Specialty</span>
                      <input
                        {...form.register(
                          `talents.${index}.specialty` as const,
                        )}
                      />
                    </label>

                    <label className="field">
                      <span>Description</span>
                      <textarea
                        rows={6}
                        {...form.register(`talents.${index}.text` as const)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "details" && (
          <section className="sheet-section">
            <h2>Details</h2>

            <div className="form-grid">
              <label className="field">
                <span>Conditions & Injuries</span>
                <textarea rows={4} {...form.register("conditionsText")} />
              </label>

              <label className="field">
                <span>Notes</span>
                <textarea rows={4} {...form.register("notes")} />
              </label>
            </div>
          </section>
        )}

        <div className="action-row">
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          {onSecondaryAction && secondaryActionLabel ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </button>
          ) : null}

          <button type="submit" className="button">
            {submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
