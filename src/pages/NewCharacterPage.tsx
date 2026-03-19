import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { AppLayout } from "../components/AppLayout";
import { CharacterForm } from "../components/CharacterForm";
import { useCharacters } from "../features/characters/useCharacters";
import type { CharacterInput } from "../features/characters/character.schema";

type PageState = {
  successMessage?: string;
  errorMessage?: string;
};

export function NewCharacterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createBlankCharacter, saveCharacter } = useCharacters();

  const state = (location.state as PageState | null) ?? null;

  const defaultValues = useMemo<CharacterInput>(
    () => createBlankCharacter(),
    [createBlankCharacter],
  );

  function onSubmit(values: CharacterInput) {
    saveCharacter(values);
    navigate(`/export/${values.id}`, {
      state: { successMessage: `Saved "${values.meta.name}" successfully.` },
    });
  }

  return (
    <AppLayout>
      <CharacterForm
        title="Create Character"
        subtitle="Build a Cosmere RPG character for Fantasy Grounds XML export."
        defaultValues={defaultValues}
        submitLabel="Save Character"
        onSubmit={onSubmit}
        onCancel={() => navigate("/")}
        successMessage={state?.successMessage}
        errorMessage={state?.errorMessage}
      />
    </AppLayout>
  );
}
