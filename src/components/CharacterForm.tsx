import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
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
  const form = useForm<CharacterInput>({
    resolver: zodResolver(characterSchema),
    defaultValues,
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
      <FlashMessage kind="error" message={errorMessage} />

      <form className="sheet-card" onSubmit={form.handleSubmit(onSubmit)}>
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
              <span>Concept</span>
              <input {...form.register("meta.concept")} />
            </label>

            <label className="field">
              <span>Ancestry</span>
              <input {...form.register("meta.ancestry")} />
            </label>

            <label className="field">
              <span>Path</span>
              <input {...form.register("meta.path")} />
            </label>

            <label className="field field-small">
              <span>Level</span>
              <input
                type="number"
                min="1"
                {...form.register("meta.level", { valueAsNumber: true })}
              />
            </label>

            <label className="field field-small">
              <span>Tier</span>
              <input
                type="number"
                min="1"
                {...form.register("meta.tier", { valueAsNumber: true })}
              />
            </label>
          </div>
        </section>

        <section className="sheet-section">
          <h2>Attributes</h2>
          <div className="attributes-grid">
            <label className="attribute-tile">
              <span className="attribute-label" title="Strength">STR</span>
              <input
                className="attribute-input"
                type="number"
                {...form.register("attributes.strength", { valueAsNumber: true })}
              />
            </label>

            <label className="attribute-tile">
              <span className="attribute-label" title="Speed">SPD</span>
              <input
                className="attribute-input"
                type="number"
                {...form.register("attributes.speed", { valueAsNumber: true })}
              />
            </label>

            <label className="attribute-tile">
              <span className="attribute-label" title="Intellect">INT</span>
              <input
                className="attribute-input"
                type="number"
                {...form.register("attributes.intellect", { valueAsNumber: true })}
              />
            </label>

            <label className="attribute-tile">
              <span className="attribute-label" title="Willpower">WIL</span>
              <input
                className="attribute-input"
                type="number"
                {...form.register("attributes.willpower", { valueAsNumber: true })}
              />
            </label>

            <label className="attribute-tile">
              <span className="attribute-label" title="Awareness">AWR</span>
              <input
                className="attribute-input"
                type="number"
                {...form.register("attributes.awareness", { valueAsNumber: true })}
              />
            </label>

            <label className="attribute-tile">
              <span className="attribute-label" title="Presence">PRE</span>
              <input
                className="attribute-input"
                type="number"
                {...form.register("attributes.presence", { valueAsNumber: true })}
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
                  <strong className="defense-value">{physicalDefense}</strong>
                  <span className="defense-formula">10 + STR + SPD</span>
                </div>

                <div className="defense-display">
                  <span className="defense-label">Cognitive</span>
                  <strong className="defense-value">{cognitiveDefense}</strong>
                  <span className="defense-formula">10 + INT + WIL</span>
                </div>

                <div className="defense-display">
                  <span className="defense-label">Spiritual</span>
                  <strong className="defense-value">{spiritualDefense}</strong>
                  <span className="defense-formula">10 + AWR + PRE</span>
                </div>
              </div>
            </div>

            <div className="mini-card">
              <h3>Health</h3>
              <div className="mini-grid two-up">
                <label className="field">
                  <span>Max</span>
                  <input
                    type="number"
                    {...form.register("health.total", { valueAsNumber: true })}
                  />
                </label>
                <label className="field">
                  <span>Current</span>
                  <input
                    type="number"
                    {...form.register("health.current", { valueAsNumber: true })}
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
                    {...form.register("focus.total", { valueAsNumber: true })}
                  />
                </label>
                <label className="field">
                  <span>Current</span>
                  <input
                    type="number"
                    {...form.register("focus.current", { valueAsNumber: true })}
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
                    {...form.register("investiture.total", { valueAsNumber: true })}
                  />
                </label>
                <label className="field">
                  <span>Current</span>
                  <input
                    type="number"
                    {...form.register("investiture.current", { valueAsNumber: true })}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "16px" }}>
            <label className="field field-small">
              <span>Deflect</span>
              <input
                type="number"
                {...form.register("deflect", { valueAsNumber: true })}
              />
            </label>

            <label className="field field-small">
              <span>Movement</span>
              <input
                type="number"
                {...form.register("movement", { valueAsNumber: true })}
              />
            </label>

            <label className="field field-small">
              <span>Movement Bonus</span>
              <input
                type="number"
                {...form.register("movementBonus", { valueAsNumber: true })}
              />
            </label>

            <label className="field field-small">
              <span>Recovery Die</span>
              <input {...form.register("recoveryDie")} />
            </label>

            <label className="field">
              <span>Senses Range</span>
              <input {...form.register("sensesRange")} />
            </label>

            <label className="field">
              <span>Lifting Capacity</span>
              <input {...form.register("liftingCapacity")} />
            </label>
          </div>
        </section>

        <section className="sheet-section">
          <h2>Skills</h2>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div className="skill-row" key={`${skill.name}-${index}`}>
                <div className="field">
                  <span>Skill</span>
                  <input {...form.register(`skills.${index}.name`)} readOnly />
                </div>

                <div className="field">
                  <span>Stat</span>
                  <input {...form.register(`skills.${index}.stat`)} readOnly />
                </div>

                <div className="field field-small">
                  <span>Rank</span>
                  <input
                    type="number"
                    min="0"
                    {...form.register(`skills.${index}.rank`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="field field-small">
                  <span>Bonus</span>
                  <input
                    type="number"
                    min="0"
                    {...form.register(`skills.${index}.bonus`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sheet-section">
          <h2>Sheet Details</h2>
          <div className="form-grid">
            <label className="field">
              <span>Expertises</span>
              <textarea rows={4} {...form.register("expertisesText")} />
            </label>

            <label className="field">
              <span>Weapons</span>
              <textarea rows={4} {...form.register("weaponsText")} />
            </label>

            <label className="field">
              <span>Talents</span>
              <textarea rows={4} {...form.register("talentsText")} />
            </label>

            <label className="field">
              <span>Conditions & Injuries</span>
              <textarea rows={4} {...form.register("conditionsText")} />
            </label>
          </div>
        </section>

        <section className="sheet-section">
          <h2>Notes</h2>
          <label className="field">
            <span>Character Notes</span>
            <textarea rows={6} {...form.register("notes")} />
          </label>
        </section>

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

