import { useState } from "react";
import { useDismissable } from "../hooks/useDismissable";
import { formatClock } from "../lib/format";
import type { TimerMode } from "../types";
import { DurationChips } from "./DurationChips";
import { ProgressRing } from "./ProgressRing";
import { ChevronDownIcon, CheckIcon, ListIcon, PauseIcon, PlayIcon, ResetIcon } from "./icons";

interface TimerPanelProps {
  mode: TimerMode;
  minutes: number;
  presets: Array<number | null>;
  remaining: number;
  progress: number;
  isRunning: boolean;
  hasStarted: boolean;
  intent: string;
  onIntentChange: (value: string) => void;
  onMinutesChange: (minutes: number) => void;
  onModeChange: (mode: TimerMode) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus Time",
  break: "Break Time",
};

export function TimerPanel({
  mode,
  minutes,
  presets,
  remaining,
  progress,
  isRunning,
  hasStarted,
  intent,
  onIntentChange,
  onMinutesChange,
  onModeChange,
  onStart,
  onPause,
  onReset,
}: TimerPanelProps) {
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const modeMenuRef = useDismissable<HTMLDivElement>(isModeMenuOpen, () =>
    setIsModeMenuOpen(false),
  );

  const startLabel = isRunning
    ? "Pause"
    : hasStarted
      ? "Resume"
      : mode === "focus"
        ? "Start Focus"
        : "Start Break";

  return (
    <div className="timer">
      <ProgressRing progress={progress} label={`${MODE_LABELS[mode]} progress`}>
        <p className="timer__time" aria-live="off">
          {formatClock(remaining)}
        </p>
        <div className="timer__mode-wrapper" ref={modeMenuRef}>
          <button
            type="button"
            className="timer__mode"
            aria-haspopup="true"
            aria-expanded={isModeMenuOpen}
            onClick={() => setIsModeMenuOpen((open) => !open)}
          >
            {MODE_LABELS[mode]}
            <ChevronDownIcon />
          </button>

          {isModeMenuOpen ? (
            <div className="menu__panel menu__panel--center" role="menu">
              {(Object.keys(MODE_LABELS) as TimerMode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="menu__item"
                  role="menuitemradio"
                  aria-checked={mode === value}
                  onClick={() => {
                    onModeChange(value);
                    setIsModeMenuOpen(false);
                  }}
                >
                  {mode === value ? <CheckIcon /> : <span aria-hidden="true" />}
                  {MODE_LABELS[value]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </ProgressRing>

      <div className="field field--with-icon">
        <label className="sr-only" htmlFor="focus-intent">
          {mode === "focus" ? "What are you working on?" : "What will you do on this break?"}
        </label>
        <ListIcon className="field__icon" />
        <input
          id="focus-intent"
          className="field__input"
          placeholder={
            mode === "focus" ? "What are you working on?" : "Stretch, water, step outside…"
          }
          value={intent}
          onChange={(event) => onIntentChange(event.target.value)}
        />
      </div>

      <div className="timer__controls">
        <button
          type="button"
          className="button button--lg button--primary"
          onClick={isRunning ? onPause : onStart}
        >
          {isRunning ? (
            <PauseIcon className="button__icon" />
          ) : (
            <PlayIcon className="button__icon" />
          )}
          {startLabel}
        </button>

        {hasStarted ? (
          <button
            type="button"
            className="button button--lg button--ghost"
            onClick={onReset}
            aria-label="Reset timer"
          >
            <ResetIcon className="button__icon" />
          </button>
        ) : null}
      </div>

      <DurationChips presets={presets} minutes={minutes} onChange={onMinutesChange} />
    </div>
  );
}
