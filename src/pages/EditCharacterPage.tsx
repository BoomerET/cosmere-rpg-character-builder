import { useLocation, useNavigate, useParams } from "react-router";
import { AppLayout } from "../components/AppLayout";
import { CharacterForm } from "../components/CharacterForm";
import { CharacterSummaryCard } from "../components/CharacterSummaryCard";
import { FlashMessage } from "../components/FlashMessage";
import { useCharacters } from "../features/characters/CharacterContext";
import type { CharacterInput } from "../features/characters/character.schema";

type PageState = {
  successMessage?: string;
  errorMessage?: string;
};

export function EditCharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getCharacter, saveCharacter } = useCharacters();

  const state = (location.state as PageState | null) ?? null;
  const character = id ? getCharacter(id) : undefined;

  if (!character) {
    return (
      <AppLayout>
        <main className="page-shell">
          <FlashMessage
            kind="error"
            message="That character could not be loaded."
          />
          <section className="sheet-card">
            <h1>Character not found</h1>
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

  function onSubmit(values: CharacterInput) {
    saveCharacter(values);

    navigate(`/character/${values.id}`, {
      replace: true,
      state: { successMessage: `Saved "${values.meta.name}" successfully.` },
    });
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
