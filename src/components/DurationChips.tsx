import { useId, useState } from "react";

interface DurationChipsProps {
  presets: Array<number | null>;
  minutes: number;
  onChange: (minutes: number) => void;
}

export function DurationChips({ presets, minutes, onChange }: DurationChipsProps) {
  const fieldId = useId();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState(String(minutes));
  const isCustomActive = !presets.includes(minutes);

  const applyCustom = () => {
    const next = Number(customValue);
    if (Number.isFinite(next) && next >= 1 && next <= 180) {
      onChange(Math.round(next));
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="chips-stack">
      <div className="chips" role="group" aria-label="Session length">
        {presets.map((preset) =>
          preset === null ? (
            <button
              key="custom"
              type="button"
              className="chip"
              aria-pressed={isCustomActive}
              aria-expanded={isCustomOpen}
              onClick={() => setIsCustomOpen((open) => !open)}
            >
              Custom
            </button>
          ) : (
            <button
              key={preset}
              type="button"
              className="chip"
              aria-pressed={minutes === preset}
              onClick={() => {
                setIsCustomOpen(false);
                onChange(preset);
              }}
            >
              {preset} min
            </button>
          ),
        )}
      </div>

      {isCustomOpen ? (
        <div className="chips__custom">
          <div className="field">
            <label className="field__label" htmlFor={`${fieldId}-custom`}>
              Custom length (1–180 min)
            </label>
            <input
              id={`${fieldId}-custom`}
              className="field__input"
              type="number"
              min={1}
              max={180}
              value={customValue}
              autoFocus
              onChange={(event) => setCustomValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyCustom();
                }
              }}
            />
          </div>
          <button type="button" className="button button--sm button--subtle" onClick={applyCustom}>
            Set
          </button>
        </div>
      ) : null}
    </div>
  );
}
