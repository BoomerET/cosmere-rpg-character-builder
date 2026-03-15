import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { AppLayout } from "../components/AppLayout";
import { FlashMessage } from "../components/FlashMessage";
import { useCharacters } from "../features/characters/CharacterContext";
import { toFantasyGroundsXml } from "../features/characters/character.export.xml";
import { CharacterSummaryCard } from "../components/CharacterSummaryCard";

type PageState = {
  successMessage?: string;
  errorMessage?: string;
};

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function ExportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCharacter } = useCharacters();
  const [localSuccess, setLocalSuccess] = useState("");

  const state = (location.state as PageState | null) ?? null;
  const character = id ? getCharacter(id) : undefined;

  if (!character) {
    return (
      <AppLayout>
        <main className="page-shell">
          <FlashMessage kind="error" message="Character not found." />
          <section className="sheet-card">
            <div className="action-row">
              <button className="button" onClick={() => navigate("/")}>
                Back Home
              </button>
            </div>
          </section>
        </main>
      </AppLayout>
    );
  }

  const xml = toFantasyGroundsXml(character);

  function handleDownload() {
    downloadTextFile(
      `${character.meta.name || "character"}.xml`,
      xml,
      "application/xml"
    );
    setLocalSuccess(`Downloaded XML for "${character.meta.name}".`);
  }
  return (
    <AppLayout>
      <CharacterForm
        title="Edit Character"
        subtitle="Update your Cosmere RPG character and export it to Fantasy Grounds XML."
        defaultValues={character}
        submitLabel="Save Changes"
        onSubmit={onSubmit}
        onCancel={() => navigate("/")}
        onSecondaryAction={() => navigate(`/export/${character.id}`)}
        secondaryActionLabel="View Export"
        successMessage={state?.successMessage}
        errorMessage={state?.errorMessage}
        topContent={<CharacterSummaryCard character={character} />}
      />
    </AppLayout>
  );
}

