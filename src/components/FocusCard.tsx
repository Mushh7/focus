import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BREAK_QUOTE, FOCUS_QUOTE } from "../data/dashboard";
import type { PersistentApp } from "../hooks/usePersistentApp";
import { useCountdown } from "../hooks/useCountdown";
import { createId } from "../lib/id";
import type { PanelTab, Thought, TimerMode } from "../types";
import { Modal } from "./Modal";
import { QuoteCard } from "./QuoteCard";
import { SegmentedTabs } from "./SegmentedTabs";
import { SessionReflection } from "./SessionReflection";
import { StatsPanel } from "./StatsPanel";
import { TimerPanel } from "./TimerPanel";

interface FocusCardProps {
  store: PersistentApp;
  onFocusSessionChange?: (active: boolean) => void;
}

export function FocusCard({ store, onFocusSessionChange }: FocusCardProps) {
  const { state } = store;
  const [mode, setMode] = useState<TimerMode>(
    state.preferences.activeTab === "break" ? "break" : "focus",
  );
  const tab = state.preferences.activeTab;
  const active = mode === "focus" ? state.activeFocusSession : state.activeBreakSession;
  const minutes =
    active?.plannedDurationMinutes ??
    (mode === "focus" ? state.preferences.defaultFocusMinutes : state.preferences.defaultBreakMinutes);

  const [intent, setIntent] = useState(active?.intent ?? "");
  const sessionIdRef = useRef<string | null>(active?.id ?? null);

  const restore = useMemo(() => {
    if (!active || active.kind !== mode) return null;
    return {
      remainingSeconds: Math.max(0, Math.round(active.remainingMilliseconds / 1000)),
      isRunning: active.status === "running",
      deadlineMs: active.endsAt ? Date.parse(active.endsAt) : null,
    };
  }, [active, mode]);

  const handleComplete = useCallback(
    (elapsedMinutes: number) => {
      const sessionId = sessionIdRef.current ?? createId();
      sessionIdRef.current = null;
      if (mode === "focus") {
        store.completeSession({
          kind: "focus",
          sessionId,
          elapsedMinutes,
          plannedMinutes: minutes,
          intent,
          endedEarly: elapsedMinutes + 0.05 < minutes,
        });
      } else {
        store.completeSession({
          kind: "break",
          sessionId,
          elapsedMinutes,
          plannedMinutes: minutes,
          intent,
          endedEarly: elapsedMinutes + 0.05 < minutes,
        });
      }
    },
    [intent, minutes, mode, store],
  );

  const handlePersist = useCallback(
    (snapshot: { remainingSeconds: number; isRunning: boolean; deadlineMs: number | null }) => {
      const idle = !snapshot.isRunning && snapshot.remainingSeconds >= minutes * 60;
      if (idle) {
        sessionIdRef.current = null;
        store.clearActive(mode);
        return;
      }
      if (!sessionIdRef.current) sessionIdRef.current = createId();
      store.persistActive(mode, snapshot, {
        sessionId: sessionIdRef.current,
        intent,
        plannedMinutes: minutes,
      });
    },
    [intent, minutes, mode, store],
  );

  const countdown = useCountdown({
    minutes,
    restoreKey: active?.id ?? null,
    restore,
    onComplete: handleComplete,
    onPersist: handlePersist,
  });

  const isFocusSessionActive = countdown.isRunning && mode === "focus";

  useEffect(() => {
    onFocusSessionChange?.(isFocusSessionActive);
  }, [isFocusSessionActive, onFocusSessionChange]);

  const addThought = useCallback(
    (text: string) => {
      const thought: Thought = {
        id: createId(),
        text,
        createdAt: new Date().toISOString(),
        sessionId: sessionIdRef.current ?? active?.id,
      };
      store.setScratchpad([...state.scratchpad, thought]);
    },
    [active?.id, state.scratchpad, store],
  );

  const deleteThought = useCallback(
    (id: string) => {
      store.setScratchpad(state.scratchpad.filter((thought) => thought.id !== id));
    },
    [state.scratchpad, store],
  );

  const switchMode = (next: TimerMode) => {
    if (next === mode) return;
    sessionIdRef.current = null;
    store.clearActive(mode);
    setMode(next);
    store.setTab(next);
    setIntent("");
  };

  const handleTabChange = (next: PanelTab) => {
    store.setTab(next);
    if (next !== "stats") switchMode(next);
  };

  const closeReflection = () => {
    store.skipReflection();
    countdown.reset();
  };

  const saveReflection = (rating: number, note: string) => {
    if (state.pendingReflection) {
      store.saveReflection(state.pendingReflection.id, rating, note);
    }
    countdown.reset();
  };

  const handleMinutesChange = (value: number) => {
    if (!active) store.setDefaultMinutes(mode, value);
  };

  const panelMode: TimerMode = tab === "stats" ? mode : tab;

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
          <StatsPanel sessions={state.focusSessions} onDeleteSession={store.deleteFocusSession} />
        ) : (
          <TimerPanel
            mode={panelMode}
            minutes={minutes}
            remaining={countdown.remaining}
            progress={countdown.progress}
            isRunning={countdown.isRunning}
            isFocusSessionActive={isFocusSessionActive}
            hasStarted={countdown.hasStarted}
            intent={intent}
            thoughts={state.scratchpad}
            onIntentChange={setIntent}
            onAddThought={addThought}
            onDeleteThought={deleteThought}
            onMinutesChange={handleMinutesChange}
            onModeChange={switchMode}
            onStart={countdown.start}
            onPause={countdown.pause}
            onReset={countdown.reset}
            onEndSession={mode === "focus" ? countdown.stop : undefined}
          />
        )}
      </div>

      <QuoteCard quote={mode === "focus" ? FOCUS_QUOTE : BREAK_QUOTE} />

      {state.pendingReflection ? (
        <Modal label="Focus session complete" onClose={closeReflection}>
          <SessionReflection
            session={state.pendingReflection}
            onSave={saveReflection}
            onSkip={closeReflection}
          />
        </Modal>
      ) : null}
    </section>
  );
}
