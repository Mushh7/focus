import { useCallback, useState } from "react";
import {
  BREAK_QUOTE,
  FOCUS_QUOTE,
  SEEDED_FOCUS_MINUTES,
  SEEDED_SESSIONS,
} from "../data/dashboard";
import { useCountdown } from "../hooks/useCountdown";
import type { PanelTab, Thought, TimerMode } from "../types";
import { QuoteCard } from "./QuoteCard";
import { SegmentedTabs } from "./SegmentedTabs";
import { StatsPanel } from "./StatsPanel";
import { TimerPanel } from "./TimerPanel";

interface FocusCardProps {
  tasksDone: number;
  tasksTotal: number;
}

export function FocusCard({ tasksDone, tasksTotal }: FocusCardProps) {
  const [tab, setTab] = useState<PanelTab>("focus");
  const [mode, setMode] = useState<TimerMode>("focus");
  const [minutes, setMinutes] = useState(25);
  const [intent, setIntent] = useState("");
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [sessions, setSessions] = useState(SEEDED_SESSIONS);
  const [minutesFocused, setMinutesFocused] = useState(SEEDED_FOCUS_MINUTES);

  const handleComplete = useCallback(
    (elapsedMinutes: number) => {
      if (mode !== "focus") return;
      setSessions((count) => count + 1);
      setMinutesFocused((total) => total + Math.round(elapsedMinutes));
    },
    [mode],
  );

  const countdown = useCountdown({ minutes, onComplete: handleComplete });

  const addThought = useCallback((text: string) => {
    setThoughts((current) => [
      ...current,
      { id: `thought-${Date.now()}-${current.length}`, text },
    ]);
  }, []);

  const deleteThought = useCallback((id: string) => {
    setThoughts((current) => current.filter((thought) => thought.id !== id));
  }, []);

  const switchMode = (next: TimerMode) => {
    if (next === mode) return;
    setMode(next);
    setTab(next);
    setMinutes(next === "focus" ? 25 : 5);
  };

  const handleTabChange = (next: PanelTab) => {
    setTab(next);
    if (next !== "stats") switchMode(next);
  };

  const activeTimerTab = tab === "stats" ? mode : tab;

  return (
    <section className="card app__aside-card focus-card" aria-label="Focus timer">
      <SegmentedTabs active={tab} onChange={handleTabChange} />

      <div
        className="focus-card__body"
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "stats" ? (
          <StatsPanel
            sessions={sessions}
            minutesFocused={minutesFocused}
            tasksDone={tasksDone}
            tasksTotal={tasksTotal}
          />
        ) : (
          <TimerPanel
            mode={activeTimerTab}
            minutes={minutes}
            remaining={countdown.remaining}
            progress={countdown.progress}
            isRunning={countdown.isRunning}
            hasStarted={countdown.hasStarted}
            intent={intent}
            thoughts={thoughts}
            onIntentChange={setIntent}
            onAddThought={addThought}
            onDeleteThought={deleteThought}
            onMinutesChange={setMinutes}
            onModeChange={switchMode}
            onStart={countdown.start}
            onPause={countdown.pause}
            onReset={countdown.reset}
          />
        )}
      </div>

      <QuoteCard quote={mode === "focus" ? FOCUS_QUOTE : BREAK_QUOTE} />
    </section>
  );
}
