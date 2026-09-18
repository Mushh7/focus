import { useCallback, useEffect, useState } from "react";
import { BREAK_QUOTE, FOCUS_QUOTE, SEEDED_FOCUS_LOG } from "../data/dashboard";
import { useCountdown } from "../hooks/useCountdown";
import type {
  FocusSessionLog,
  PanelTab,
  SessionReflection as SessionSummary,
  Thought,
  TimerMode,
} from "../types";
import { Modal } from "./Modal";
import { QuoteCard } from "./QuoteCard";
import { SegmentedTabs } from "./SegmentedTabs";
import { SessionReflection } from "./SessionReflection";
import { StatsPanel } from "./StatsPanel";
import { TimerPanel } from "./TimerPanel";

interface FocusCardProps {
  onFocusSessionChange?: (active: boolean) => void;
}

export function FocusCard({ onFocusSessionChange }: FocusCardProps) {
  const [tab, setTab] = useState<PanelTab>("focus");
  const [mode, setMode] = useState<TimerMode>("focus");
  const [minutes, setMinutes] = useState(25);
  const [intent, setIntent] = useState("");
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [log, setLog] = useState<FocusSessionLog[]>(SEEDED_FOCUS_LOG);
  const [reflection, setReflection] = useState<SessionSummary | null>(null);

  const handleComplete = useCallback(
    (elapsedMinutes: number) => {
      if (mode !== "focus") return;
      const focusedMinutes =
        elapsedMinutes <= 0 ? 0 : Math.max(1, Math.round(elapsedMinutes));
      const id = `session-${Date.now()}`;
      const title = intent.trim() || "Untitled session";
      setLog((current) => [
        ...current,
        { id, title, focusedMinutes, endedAt: Date.now() },
      ]);
      setReflection({
        id,
        title,
        focusedMinutes,
        plannedMinutes: minutes,
      });
    },
    [mode, intent, minutes],
  );

  const countdown = useCountdown({ minutes, onComplete: handleComplete });
  const isFocusSessionActive = countdown.isRunning && mode === "focus";

  useEffect(() => {
    onFocusSessionChange?.(isFocusSessionActive);
  }, [isFocusSessionActive, onFocusSessionChange]);

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

  const closeReflection = () => {
    setReflection(null);
    countdown.reset();
  };

  const saveReflection = (rating: number, note: string) => {
    if (reflection) {
      setLog((current) =>
        current.map((session) =>
          session.id === reflection.id
            ? { ...session, rating, note: note || undefined }
            : session,
        ),
      );
    }
    closeReflection();
  };

  const activeTimerTab = tab === "stats" ? mode : tab;

  return (
    <section
      className={
        isFocusSessionActive
          ? "card app__aside-card focus-card focus-card--session"
          : "card app__aside-card focus-card"
      }
      aria-label="Focus timer"
    >
      <SegmentedTabs active={tab} onChange={handleTabChange} />

      <div
        className="focus-card__body"
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "stats" ? (
          <StatsPanel sessions={log} />
        ) : (
          <TimerPanel
            mode={activeTimerTab}
            minutes={minutes}
            remaining={countdown.remaining}
            progress={countdown.progress}
            isRunning={countdown.isRunning}
            isFocusSessionActive={isFocusSessionActive}
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
            onEndSession={countdown.stop}
          />
        )}
      </div>

      <QuoteCard quote={mode === "focus" ? FOCUS_QUOTE : BREAK_QUOTE} />

      {reflection ? (
        <Modal label="Focus session complete" onClose={closeReflection}>
          <SessionReflection
            session={reflection}
            onSave={saveReflection}
            onSkip={closeReflection}
          />
        </Modal>
      ) : null}
    </section>
  );
}
