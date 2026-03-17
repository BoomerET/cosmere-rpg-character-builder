import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  characterSchema,
  type CharacterFormValues,
  type CharacterInput,
} from "../features/characters/character.schema";
import { FlashMessage } from "./FlashMessage";

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
  | "expertise"
  | "talents"
  | "details";

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

  const skills = form.watch("skills") ?? [];

  const level = form.watch("meta.level") ?? 1;
  const strength = form.watch("attributes.strength") ?? 0;
  const speed = form.watch("attributes.speed") ?? 0;
  const intellect = form.watch("attributes.intellect") ?? 0;
  const willpower = form.watch("attributes.willpower") ?? 0;
  const awareness = form.watch("attributes.awareness") ?? 0;
  const presence = form.watch("attributes.presence") ?? 0;

  const tier = getTierFromLevel(level);
  const healthMax = getHealthMax(strength);
  const movementRate = getMovementRate(speed);

  const physicalDefense = 10 + strength + speed;
  const cognitiveDefense = 10 + intellect + willpower;
  const spiritualDefense = 10 + awareness + presence;

  const STAT_ABBREVIATIONS: Record<string, string> = {
    strength: "STR",
    speed: "SPD",
    intellect: "INT",
    willpower: "WIL",
    awareness: "AWR",
    presence: "PRE",
  };

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

  function onInvalid(errors: unknown) {
    console.error("Form validation failed:", errors);
    setSubmitError("Please fix the validation errors before saving.");
  }

  function numericRegister(path: Path<CharacterFormValues>) {
    return form.register(path, {
      setValueAs: (value) => (value === "" ? undefined : Number(value)),
    });
  }

  //function getStatAbbreviation(stat: string): string {
  //  switch (stat) {
  //    case "strength":
  //      return "STR";
  //    case "speed":
  //      return "SPD";
  //    case "intellect":
  //      return "INT";
  //    case "willpower":
  //      return "WIL";
  //    case "awareness":
  //      return "AWR";
  //    case "presence":
  //      return "PRE";
  //    default:
  //      return stat.toUpperCase();
  //  }
  //}

  function getStatAbbreviation(stat: string): string {
    return STAT_ABBREVIATIONS[stat] ?? stat.toUpperCase();
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
            {JSON.stringify(form.formState.errors, null, 2)}
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
              level: values.meta.level ?? 1,
              tier: getTierFromLevel(values.meta.level ?? 1),
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
              total: values.focus.total ?? 0,
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
            recoveryDie: values.recoveryDie ?? "d4",
            sensesRange: values.sensesRange ?? "",
            conditionsText: values.conditionsText ?? "",
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
                <input {...form.register("meta.ancestry")} />
              </label>

              <label className="field">
                <span>Path</span>
                <input {...form.register("meta.path")} />
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
                    <label className="field">
                      <span>Max</span>
                      <input
                        type="number"
                        {...numericRegister("focus.total")}
                      />
                    </label>

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

                <label className="field field-small">
                  <span>Recovery Die</span>
                  <input {...form.register("recoveryDie")} />
                </label>

                <label className="field">
                  <span>Senses Range</span>
                  <input {...form.register("sensesRange")} />
                </label>

                <label className="field field-small">
                  <span>Lifting Capacity</span>
                  <input
                    type="number"
                    placeholder="optional"
                    {...numericRegister("liftingCapacity")}
                  />
                </label>
              </div>
            </section>
          </>
        )}

        {activeTab === "skills" && (
          <section className="sheet-section">
            <h2>Skills</h2>

            <div className="skills-table">
              <div className="skill-table-header">
                <div>Skill</div>
                <div>Stat</div>
                <div>Rank</div>
                <div>Bonus</div>
                <div>Total</div>
              </div>

              <div className="skills-grid">
                {[...skills]
                  .map((skill, index) => ({ skill, index })) // preserve original index
                  .sort((a, b) => a.skill.name.localeCompare(b.skill.name))
                  .map(({ skill, index }) => (
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

                      <div className="skill-total">
                        {getAttributeValue(skill.stat) +
                          (skill.rank ?? 0) +
                          (skill.bonus ?? 0)}
                      </div>
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
                    name: "New Weapon",
                    skill: "Athletics",
                    damageDice: "d1",
                    damageType: "impact",
                    traits: "",
                    expertTraits: "",
                    handling: 0,
                    carried: 2,
                    ammo: 0,
                    maxAmmo: 0,
                    type: 0,
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
                      <input
                        {...form.register(`weapons.${index}.name` as const)}
                      />
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
                      <span>Handling</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `weapons.${index}.handling` as const,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Carried</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `weapons.${index}.carried` as const,
                        )}
                      />
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
