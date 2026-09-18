import { useState } from "react";
import { useDismissable } from "../hooks/useDismissable";
import { formatClock } from "../lib/format";
import type { Thought, TimerMode } from "../types";
import { ProgressRing } from "./ProgressRing";
import { Scratchpad } from "./Scratchpad";
import { ChevronDownIcon, CheckIcon, ListIcon, PauseIcon, PlayIcon, ResetIcon } from "./icons";

interface TimerPanelProps {
  mode: TimerMode;
  minutes: number;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isFocusSessionActive: boolean;
  hasStarted: boolean;
  intent: string;
  thoughts: Thought[];
  onIntentChange: (value: string) => void;
  onAddThought: (text: string) => void;
  onDeleteThought: (id: string) => void;
  onMinutesChange: (minutes: number) => void;
  onModeChange: (mode: TimerMode) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onEndSession?: () => void;
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus Time",
  break: "Break Time",
};

const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

function parseMinutes(value: string): number | null {
  if (!/^\d{1,3}$/.test(value.trim())) return null;
  const parsed = Number(value);
  if (parsed < MIN_MINUTES || parsed > MAX_MINUTES) return null;
  return parsed;
}

export function TimerPanel({
  mode,
  minutes,
  remaining,
  progress,
  isRunning,
  isFocusSessionActive,
  hasStarted,
  intent,
  thoughts,
  onIntentChange,
  onAddThought,
  onDeleteThought,
  onMinutesChange,
  onModeChange,
  onStart,
  onPause,
  onReset,
  onEndSession,
}: TimerPanelProps) {
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const modeMenuRef = useDismissable<HTMLDivElement>(isModeMenuOpen, () =>
    setIsModeMenuOpen(false),
  );

  const isEditing = draft !== null;
  const isDraftValid = draft !== null && parseMinutes(draft) !== null;

  const openEditor = () => {
    setIsModeMenuOpen(false);
    setDraft(String(minutes));
  };

  const commitDraft = () => {
    if (draft === null) return false;
    const parsed = parseMinutes(draft);
    if (parsed === null) return false;
    if (parsed !== minutes) onMinutesChange(parsed);
    setDraft(null);
    return true;
  };

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
        <div className="timer__time-slot">
          {isEditing ? (
            <>
              <label className="sr-only" htmlFor="timer-minutes">
                {MODE_LABELS[mode]} length in minutes, between {MIN_MINUTES} and {MAX_MINUTES}
              </label>
              <input
                id="timer-minutes"
                className="timer__time-input"
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={draft}
                autoFocus
                aria-invalid={!isDraftValid}
                aria-describedby="timer-minutes-hint"
                onFocus={(event) => event.target.select()}
                onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  if (!commitDraft()) setDraft(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitDraft();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setDraft(null);
                  }
                }}
              />
            </>
          ) : isRunning ? (
            <p className="timer__time timer__time--static">{formatClock(remaining)}</p>
          ) : (
            <button
              type="button"
              className="timer__time"
              onClick={openEditor}
              aria-label={`${MODE_LABELS[mode]} is ${minutes} minutes. Edit the length.`}
            >
              {formatClock(remaining)}
            </button>
          )}
        </div>

        {isEditing ? (
          <p className="timer__hint" id="timer-minutes-hint" role="status">
            {isDraftValid
              ? "Enter to save, Esc to cancel"
              : `Enter ${MIN_MINUTES}–${MAX_MINUTES} minutes`}
          </p>
        ) : (
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
        )}
      </ProgressRing>

      {isFocusSessionActive ? (
        <p className="timer__status" role="status" aria-live="polite">
          <span className="timer__status-dot" aria-hidden="true" />
          FOCUS MODE ACTIVE
        </p>
      ) : null}

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

      {isFocusSessionActive && onEndSession ? (
        <button type="button" className="button button--ghost timer__end" onClick={onEndSession}>
          End Session
        </button>
      ) : null}

      <Scratchpad thoughts={thoughts} onAdd={onAddThought} onDelete={onDeleteThought} />
    </div>
  );
}
