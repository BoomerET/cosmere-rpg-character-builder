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
              <input {...form.register("meta.name")} placeholder="Kaladin Stormblessed" />
            </label>

            <label className="field">
              <span>Player Name</span>
              <input {...form.register("meta.playerName")} placeholder="David" />
            </label>

            <label className="field">
              <span>Concept</span>
              <input
                {...form.register("meta.concept")}
                placeholder="Protector, surgeon's son, bridgeman"
              />
            </label>

            <label className="field">
              <span>Ancestry</span>
              <input {...form.register("meta.ancestry")} placeholder="Human (Roshar)" />
            </label>

            <label className="field">
              <span>Path</span>
              <input {...form.register("meta.path")} placeholder="Windrunner" />
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
            <label className="field">
              <span>Awareness</span>
              <input
                type="number"
                {...form.register("attributes.awareness", { valueAsNumber: true })}
              />
            </label>

            <label className="field">
              <span>Intellect</span>
              <input
                type="number"
                {...form.register("attributes.intellect", { valueAsNumber: true })}
              />
            </label>

            <label className="field">
              <span>Presence</span>
              <input
                type="number"
                {...form.register("attributes.presence", { valueAsNumber: true })}
              />
            </label>

            <label className="field">
              <span>Speed</span>
              <input
                type="number"
                {...form.register("attributes.speed", { valueAsNumber: true })}
              />
            </label>

            <label className="field">
              <span>Strength</span>
              <input
                type="number"
                {...form.register("attributes.strength", { valueAsNumber: true })}
              />
            </label>

            <label className="field">
              <span>Willpower</span>
              <input
                type="number"
                {...form.register("attributes.willpower", { valueAsNumber: true })}
              />
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
          <h2>Notes</h2>
          <label className="field">
            <span>Character Notes</span>
            <textarea
              rows={6}
              {...form.register("notes")}
              placeholder="Background, oaths, gear notes, connections..."
            />
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

