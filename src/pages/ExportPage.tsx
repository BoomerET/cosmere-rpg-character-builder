import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { AppLayout } from "../components/AppLayout";
import { FlashMessage } from "../components/FlashMessage";
import { useCharacters } from "../features/characters/useCharacters";
import { toFantasyGroundsXml } from "../features/characters/character.export.xml";

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

  const safeCharacter = character;
  const xml = toFantasyGroundsXml(safeCharacter);

  function handleDownload() {
    downloadTextFile(
      `${safeCharacter.meta.name || "character"}.xml`,
      xml,
      "application/xml",
    );
    setLocalSuccess(`Downloaded XML for "${safeCharacter.meta.name}".`);
  }

  return (
    <AppLayout>
      <main className="page-shell">
        <section className="page-header">
          <h1>Export {safeCharacter.meta.name}</h1>
          <p>Download Fantasy Grounds XML for import.</p>
        </section>

        <FlashMessage
          kind="success"
          message={localSuccess || state?.successMessage || ""}
        />
        <FlashMessage kind="error" message={state?.errorMessage || ""} />

        <section className="sheet-card">
          <div className="inline-actions" style={{ marginBottom: "18px" }}>
            <button className="button" onClick={handleDownload}>
              Download XML
            </button>

            <button
              className="button button-secondary"
              onClick={() => navigate(`/character/${safeCharacter.id}`)}
            >
              Edit Character
            </button>
          </div>

          <pre className="code-block">{xml}</pre>
        </section>
      </main>
    </AppLayout>
  );
}