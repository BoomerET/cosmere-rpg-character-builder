import { useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { fromFantasyGroundsXml } from "../features/characters/character.import.xml";
import { useCharacters } from "../features/characters/CharacterContext";

export function AppHeader() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { saveCharacter } = useCharacters();

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const imported = fromFantasyGroundsXml(text);
      saveCharacter(imported);

      navigate(`/character/${imported.id}`, {
        state: {
          successMessage: `Imported "${imported.meta.name || "character"}" successfully.`,
        },
      });
    } catch (error) {
      console.error(error);
      navigate("/", {
        state: {
          errorMessage:
            error instanceof Error
              ? error.message
              : "Failed to import Fantasy Grounds XML.",
        },
      });
    }
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          className="app-brand"
          type="button"
          onClick={() => navigate("/")}
        >
          <span className="app-brand-title">Cosmere RPG Builder</span>
          <span className="app-brand-subtitle">Fantasy Grounds XML tools</span>
        </button>

        <nav className="app-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `app-nav-link${isActive ? " app-nav-link-active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/new"
            className={({ isActive }) =>
              `app-nav-link${isActive ? " app-nav-link-active" : ""}`
            }
          >
            New Character
          </NavLink>

          <button
            type="button"
            className="app-nav-link app-nav-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Import XML
          </button>
        </nav>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,application/xml,text/xml"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await handleImportFile(file);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </header>
  );
}
