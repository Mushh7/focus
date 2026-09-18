import { useId, useState } from "react";
import type { SessionReflection as SessionSummary } from "../types";

const RATINGS = [
  { value: 1, hint: "Very unfocused" },
  { value: 2, hint: "Scattered" },
  { value: 3, hint: "Okay" },
  { value: 4, hint: "Focused" },
  { value: 5, hint: "Deep focus" },
] as const;

interface SessionReflectionProps {
  session: SessionSummary;
  onSave: (rating: number, note: string) => void;
  onSkip: () => void;
}

export function SessionReflection({ session, onSave, onSkip }: SessionReflectionProps) {
  const fieldId = useId();
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === null) {
      setError("Pick a number so you have a record of how it felt.");
      return;
    }
    onSave(rating, note.trim());
  };

  return (
    <form className="reflection" onSubmit={handleSubmit}>
      <p className="reflection__eyebrow">Focus session complete</p>
      <h2 className="reflection__title" id={`${fieldId}-title`}>
        {session.title}
      </h2>

      <dl className="reflection__meta">
        <div>
          <dt>Focused for</dt>
          <dd>{session.focusedMinutes} min</dd>
        </div>
        <div>
          <dt>Planned</dt>
          <dd>{session.plannedMinutes} min</dd>
        </div>
      </dl>

      <fieldset className="reflection__rating">
        <legend className="field__label">How did it go?</legend>
        <div className="rating" role="radiogroup" aria-label="Session rating from 1 to 5">
          {RATINGS.map((item) => {
            const selected = rating === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={selected ? "rating__option rating__option--selected" : "rating__option"}
                role="radio"
                aria-checked={selected}
                aria-label={`${item.value}, ${item.hint}`}
                onClick={() => {
                  setRating(item.value);
                  setError("");
                }}
              >
                {item.value}
              </button>
            );
          })}
        </div>
        <div className="rating__hints">
          <span>1 = Very unfocused</span>
          <span>3 = Okay</span>
          <span>5 = Deep focus</span>
        </div>
      </fieldset>

      <div className="field">
        <label className="field__label" htmlFor={`${fieldId}-note`}>
          Quick note (optional)
        </label>
        <textarea
          id={`${fieldId}-note`}
          className="field__input field__textarea"
          placeholder="What helped or distracted you?"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {error ? (
        <p className="reflection__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="reflection__actions">
        <button type="button" className="button button--sm button--ghost" onClick={onSkip}>
          Skip
        </button>
        <button type="submit" className="button button--sm button--primary">
          Save
        </button>
      </div>
    </form>
  );
}
