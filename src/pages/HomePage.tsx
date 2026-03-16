import { useLocation, useNavigate } from "react-router";
import { AppLayout } from "../components/AppLayout";
import { FlashMessage } from "../components/FlashMessage";
import { useCharacters } from "../features/characters/CharacterContext";

type PageState = {
  successMessage?: string;
  errorMessage?: string;
};

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { characters, deleteCharacter } = useCharacters();

  const state = (location.state as PageState | null) ?? null;

  function handleDeleteCharacter(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete "${name || "this character"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleteCharacter(id);

    navigate("/", {
      replace: true,
      state: { successMessage: `Deleted "${name || "character"}".` },
    });
  }

  return (
    <AppLayout>
      <main className="page-shell">
        <section className="page-header">
          <h1>Cosmere RPG Character Builder</h1>
          <p>
            Create, manage, import, and export characters for Fantasy Grounds.
          </p>
        </section>

        <FlashMessage kind="success" message={state?.successMessage || ""} />
        <FlashMessage kind="error" message={state?.errorMessage || ""} />

        <div style={{ marginBottom: "18px" }}>
          <button className="button" onClick={() => navigate("/new")}>
            Create New Character
          </button>
        </div>

        {characters.length === 0 ? (
          <section className="sheet-card">
            <p className="muted">
              No characters yet. Create a new one or import an existing Fantasy
              Grounds XML file.
            </p>
          </section>
        ) : (
          <section className="table-card">
            <table className="character-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Player</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {characters.map((c) => {
                  const characterName = c.meta.name || "Unnamed Character";

                  return (
                    <tr key={c.id}>
                      <td>{characterName}</td>
                      <td>{c.meta.playerName || "—"}</td>
                      <td>
                        <div className="inline-actions">
                          <button
                            className="button button-secondary"
                            onClick={() => navigate(`/character/${c.id}`)}
                          >
                            Edit
                          </button>

                          <button
                            className="button button-secondary"
                            onClick={() => navigate(`/export/${c.id}`)}
                          >
                            Export
                          </button>

                          <button
                            className="button button-danger"
                            onClick={() =>
                              handleDeleteCharacter(c.id, characterName)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </AppLayout>
  );
}
