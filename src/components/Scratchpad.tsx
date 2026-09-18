import { useState } from "react";
import type { Thought } from "../types";
import { CloseIcon } from "./icons";

interface ScratchpadProps {
  thoughts: Thought[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Somewhere to park a distracting thought mid-session. Only the draft lives
 * here; the saved list is owned by the panel so it survives tab switches.
 */
export function Scratchpad({ thoughts, onAdd, onDelete }: ScratchpadProps) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };

  return (
    <section className="scratchpad" aria-labelledby="scratchpad-heading">
      <div className="scratchpad__header">
        <h3 className="scratchpad__title" id="scratchpad-heading">
          Scratchpad
        </h3>
        {thoughts.length > 0 ? (
          <span className="scratchpad__count">
            {thoughts.length}
            <span className="sr-only"> saved thoughts</span>
          </span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="scratchpad-input">
          Capture a thought for later, then press Enter to save it
        </label>
        <input
          id="scratchpad-input"
          className="field__input scratchpad__input"
          placeholder="Capture a thought for later…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </form>

      {thoughts.length === 0 ? (
        <p className="scratchpad__empty">
          Nothing parked yet. Anything you type here waits until the session ends.
        </p>
      ) : (
        <ul className="scratchpad__list">
          {thoughts.map((thought) => (
            <li className="scratchpad__item" key={thought.id}>
              <span className="scratchpad__text">{thought.text}</span>
              <button
                type="button"
                className="icon-button scratchpad__delete"
                aria-label={`Delete thought: ${thought.text}`}
                onClick={() => onDelete(thought.id)}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
