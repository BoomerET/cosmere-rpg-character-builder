import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  characterSchema,
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

  const form = useForm<CharacterInput>({
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

  const skills = form.watch("skills");

  const strength = form.watch("attributes.strength");
  const speed = form.watch("attributes.speed");
  const intellect = form.watch("attributes.intellect");
  const willpower = form.watch("attributes.willpower");
  const awareness = form.watch("attributes.awareness");
  const presence = form.watch("attributes.presence");

  const physicalDefense = 10 + strength + speed;
  const cognitiveDefense = 10 + intellect + willpower;
  const spiritualDefense = 10 + awareness + presence;

  const healthMax = 10 + strength;

  const movementRate = speed >= 3 ? 30 : speed >= 1 ? 25 : 20;

  function onInvalid(errors: unknown) {
    console.error("Form validation failed:", errors);
    setSubmitError("Please fix the validation errors before saving.");
  }

  function numericRegister(path: Parameters<typeof form.register>[0]) {
    return form.register(path, {
      setValueAs: (value) => (value === "" ? undefined : Number(value)),
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
            {JSON.stringify(form.formState.errors, null, 2)}
          </pre>
        </section>
      ) : null}

      <form
        className="sheet-card"
        onSubmit={form.handleSubmit((values) => {
          setSubmitError("");
          onSubmit(values);
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

                  <label className="field field-small">
                    <span>Tier</span>
                    <input
                      type="number"
                      min="1"
                      {...numericRegister("meta.tier")}
                    />
                  </label>
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
              </div>

              <div className="form-grid" style={{ marginTop: "16px" }}>
                <label className="field field-small">
                  <span>Deflect</span>
                  <input type="number" {...numericRegister("deflect")} />
                </label>

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

                <label className="field field-small">
                  <span>Movement Bonus</span>
                  <input type="number" {...numericRegister("movementBonus")} />
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
              </div>

              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <div className="skill-row" key={`${skill.name}-${index}`}>
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-stat">{skill.stat.toUpperCase()}</div>

                    <div className="field field-small skill-cell">
                      <input
                        type="number"
                        min="0"
                        {...numericRegister(`skills.${index}.rank` as never)}
                      />
                    </div>

                    <div className="field field-small skill-cell">
                      <input
                        type="number"
                        min="0"
                        {...numericRegister(`skills.${index}.bonus` as never)}
                      />
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
                      <input {...form.register(`weapons.${index}.name`)} />
                    </label>

                    <label className="field">
                      <span>Skill</span>
                      <input {...form.register(`weapons.${index}.skill`)} />
                    </label>

                    <label className="field field-small">
                      <span>Damage Dice</span>
                      <input
                        {...form.register(`weapons.${index}.damageDice`)}
                      />
                    </label>

                    <label className="field">
                      <span>Damage Type</span>
                      <input
                        {...form.register(`weapons.${index}.damageType`)}
                      />
                    </label>

                    <label className="field">
                      <span>Traits</span>
                      <input {...form.register(`weapons.${index}.traits`)} />
                    </label>

                    <label className="field">
                      <span>Expert Traits</span>
                      <input
                        {...form.register(`weapons.${index}.expertTraits`)}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Handling</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `weapons.${index}.handling` as never,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Carried</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `weapons.${index}.carried` as never,
                        )}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Ammo</span>
                      <input
                        type="number"
                        {...numericRegister(`weapons.${index}.ammo` as never)}
                      />
                    </label>

                    <label className="field field-small">
                      <span>Max Ammo</span>
                      <input
                        type="number"
                        {...numericRegister(
                          `weapons.${index}.maxAmmo` as never,
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
                      <input {...form.register(`expertise.${index}.name`)} />
                    </label>

                    <label className="field">
                      <span>Description</span>
                      <textarea
                        rows={6}
                        {...form.register(`expertise.${index}.text`)}
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
                      <input {...form.register(`talents.${index}.name`)} />
                    </label>

                    <label className="field field-small">
                      <span>Activation</span>
                      <input
                        {...form.register(`talents.${index}.activation`)}
                      />
                    </label>

                    <label className="field">
                      <span>Prerequisites</span>
                      <input
                        {...form.register(`talents.${index}.prerequisites`)}
                      />
                    </label>

                    <label className="field">
                      <span>Source</span>
                      <input {...form.register(`talents.${index}.source`)} />
                    </label>

                    <label className="field">
                      <span>Specialty</span>
                      <input {...form.register(`talents.${index}.specialty`)} />
                    </label>

                    <label className="field">
                      <span>Description</span>
                      <textarea
                        rows={6}
                        {...form.register(`talents.${index}.text`)}
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
