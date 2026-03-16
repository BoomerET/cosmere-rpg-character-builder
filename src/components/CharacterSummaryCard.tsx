import type { CharacterInput } from "../features/characters/character.schema";

type CharacterSummaryCardProps = {
  character: CharacterInput;
};

export function CharacterSummaryCard({ character }: CharacterSummaryCardProps) {
  const physicalDefense =
    10 + character.attributes.strength + character.attributes.speed;
  const cognitiveDefense =
    10 + character.attributes.intellect + character.attributes.willpower;
  const spiritualDefense =
    10 + character.attributes.awareness + character.attributes.presence;

  return (
    <section className="summary-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-eyebrow">Character Summary</p>
          <h2 className="summary-title">
            {character.meta.name || "Unnamed Character"}
          </h2>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Ancestry</span>
          <span className="summary-value">
            {character.meta.ancestry || "—"}
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Path</span>
          <span className="summary-value">{character.meta.path || "—"}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Level</span>
          <span className="summary-value">{character.meta.level ?? "—"}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Tier</span>
          <span className="summary-value">{character.meta.tier ?? "—"}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Player</span>
          <span className="summary-value">
            {character.meta.playerName || "—"}
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Concept</span>
          <span className="summary-value">{character.meta.concept || "—"}</span>
        </div>
      </div>

      <div className="summary-stats">
        <div className="summary-stat">
          <span className="summary-stat-label">Strength</span>
          <strong>{character.attributes.strength}</strong>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-label">Speed</span>
          <strong>{character.attributes.speed}</strong>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-label">Intellect</span>
          <strong>{character.attributes.intellect}</strong>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-label">Willpower</span>
          <strong>{character.attributes.willpower}</strong>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-label">Awareness</span>
          <strong>{character.attributes.awareness}</strong>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-label">Presence</span>
          <strong>{character.attributes.presence}</strong>
        </div>
      </div>

      <div className="summary-defense-row">
        <div className="summary-defense">
          <span className="summary-stat-label">Physical Defense</span>
          <strong>{physicalDefense}</strong>
        </div>

        <div className="summary-defense">
          <span className="summary-stat-label">Cognitive Defense</span>
          <strong>{cognitiveDefense}</strong>
        </div>

        <div className="summary-defense">
          <span className="summary-stat-label">Spiritual Defense</span>
          <strong>{spiritualDefense}</strong>
        </div>
      </div>
    </section>
  );
}
