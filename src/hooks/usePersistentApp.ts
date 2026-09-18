import { useCallback, useMemo, useRef, useState } from "react";
import type { NewTaskDraft } from "../components/AddTaskForm";
import type {
  AppState,
  FocusSessionLog,
  PanelTab,
  SectionId,
  Task,
  Thought,
  TimerMode,
} from "../types";
import { createId } from "../lib/id";
import { loadState, saveState, snapshotFromCountdown } from "../lib/storage";
import type { CountdownSnapshot } from "./useCountdown";

function nowIso(): string {
  return new Date().toISOString();
}

export function usePersistentApp() {
  const [state, setState] = useState<AppState>(() => loadState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
    saveState(next);
  }, []);

  const update = useCallback(
    (patch: (current: AppState) => AppState) => {
      commit(patch(stateRef.current));
    },
    [commit],
  );

  const createTask = useCallback(
    (draft: NewTaskDraft) => {
      const stamp = nowIso();
      const task: Task = {
        id: createId(),
        title: draft.title,
        dueTime: draft.time || undefined,
        priority: draft.priority,
        estimateMinutes: draft.estimateMinutes,
        section: draft.section,
        done: false,
        createdAt: stamp,
        updatedAt: stamp,
      };
      update((current) => ({ ...current, tasks: [...current.tasks, task] }));
    },
    [update],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const stamp = nowIso();
      update((current) => ({
        ...current,
        tasks: current.tasks.map((task) => {
          if (task.id !== id) return task;
          const done = !task.done;
          return {
            ...task,
            done,
            updatedAt: stamp,
            completedAt: done ? stamp : undefined,
          };
        }),
      }));
    },
    [update],
  );

  const renameTask = useCallback(
    (id: string, title: string) => {
      const stamp = nowIso();
      update((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id ? { ...task, title, updatedAt: stamp } : task,
        ),
      }));
    },
    [update],
  );

  const moveTask = useCallback(
    (id: string, section: SectionId) => {
      const stamp = nowIso();
      update((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id ? { ...task, section, updatedAt: stamp } : task,
        ),
      }));
    },
    [update],
  );

  const deleteTask = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        tasks: current.tasks.filter((task) => task.id !== id),
      }));
    },
    [update],
  );

  const deleteFocusSession = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        focusSessions: current.focusSessions.filter((session) => session.id !== id),
        pendingReflection:
          current.pendingReflection?.id === id ? null : current.pendingReflection,
      }));
    },
    [update],
  );

  const setScratchpad = useCallback(
    (scratchpad: Thought[]) => {
      update((current) => ({ ...current, scratchpad }));
    },
    [update],
  );

  const setTab = useCallback(
    (activeTab: PanelTab) => {
      update((current) => ({
        ...current,
        preferences: { ...current.preferences, activeTab },
      }));
    },
    [update],
  );

  const setDefaultMinutes = useCallback(
    (kind: TimerMode, minutes: number) => {
      update((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          defaultFocusMinutes:
            kind === "focus" ? minutes : current.preferences.defaultFocusMinutes,
          defaultBreakMinutes:
            kind === "break" ? minutes : current.preferences.defaultBreakMinutes,
        },
      }));
    },
    [update],
  );

  const persistActive = useCallback(
    (kind: TimerMode, snapshot: CountdownSnapshot, extras: {
      sessionId: string;
      intent: string;
      plannedMinutes: number;
    }) => {
      update((current) => {
        const previous =
          kind === "focus" ? current.activeFocusSession : current.activeBreakSession;
        const active = snapshotFromCountdown({
          id: extras.sessionId,
          kind,
          tasks: current.tasks,
          intent: extras.intent,
          plannedMinutes: extras.plannedMinutes,
          remainingSeconds: snapshot.remainingSeconds,
          isRunning: snapshot.isRunning,
          deadlineMs: snapshot.deadlineMs,
          previous,
        });

        if (kind === "focus") {
          return {
            ...current,
            activeFocusSession: snapshot.isRunning || snapshot.remainingSeconds < extras.plannedMinutes * 60
              ? active
              : null,
            activeBreakSession: snapshot.isRunning ? null : current.activeBreakSession,
          };
        }
        return {
          ...current,
          activeBreakSession: snapshot.isRunning || snapshot.remainingSeconds < extras.plannedMinutes * 60
            ? active
            : null,
          activeFocusSession: snapshot.isRunning ? null : current.activeFocusSession,
        };
      });
    },
    [update],
  );

  const clearActive = useCallback(
    (kind: TimerMode) => {
      update((current) =>
        kind === "focus"
          ? { ...current, activeFocusSession: null }
          : { ...current, activeBreakSession: null },
      );
    },
    [update],
  );

  const completeSession = useCallback(
    (input: {
      kind: TimerMode;
      sessionId: string;
      elapsedMinutes: number;
      plannedMinutes: number;
      intent: string;
      endedEarly: boolean;
    }) => {
      const endedAt = nowIso();
      update((current) => {
        const active =
          input.kind === "focus" ? current.activeFocusSession : current.activeBreakSession;
        const { taskId, taskTitleSnapshot } = (() => {
          const title = input.intent.trim() || active?.taskTitleSnapshot || "Untitled session";
          if (active && active.id === input.sessionId) {
            return { taskId: active.taskId, taskTitleSnapshot: active.taskTitleSnapshot };
          }
          const match = current.tasks.find((task) => task.title.toLowerCase() === title.toLowerCase());
          return { taskId: match?.id ?? null, taskTitleSnapshot: match?.title ?? title };
        })();

        const focusedMinutes =
          input.elapsedMinutes <= 0 ? 0 : Math.max(1, Math.round(input.elapsedMinutes));

        const record: FocusSessionLog = {
          id: input.sessionId,
          title: taskTitleSnapshot,
          taskId,
          taskTitleSnapshot,
          focusedMinutes,
          plannedMinutes: input.plannedMinutes,
          startedAt: active?.startedAt ?? endedAt,
          endedAt,
          endedEarly: input.endedEarly,
          scratchpad: current.scratchpad.filter((item) => item.sessionId === input.sessionId),
        };

        if (input.kind === "focus") {
          return {
            ...current,
            focusSessions: [...current.focusSessions.filter((item) => item.id !== record.id), record],
            activeFocusSession: null,
            pendingReflection: {
              id: record.id,
              title: record.title,
              focusedMinutes: record.focusedMinutes,
              plannedMinutes: record.plannedMinutes,
            },
          };
        }

        return {
          ...current,
          breakSessions: [...current.breakSessions.filter((item) => item.id !== record.id), record],
          activeBreakSession: null,
        };
      });
    },
    [update],
  );

  const saveReflection = useCallback(
    (id: string, rating: number, note: string) => {
      update((current) => ({
        ...current,
        focusSessions: current.focusSessions.map((session) =>
          session.id === id
            ? { ...session, rating, note: note || undefined }
            : session,
        ),
        pendingReflection: null,
      }));
    },
    [update],
  );

  const skipReflection = useCallback(() => {
    update((current) => ({ ...current, pendingReflection: null }));
  }, [update]);

  return useMemo(
    () => ({
      state,
      createTask,
      toggleTask,
      renameTask,
      moveTask,
      deleteTask,
      deleteFocusSession,
      setScratchpad,
      setTab,
      setDefaultMinutes,
      persistActive,
      clearActive,
      completeSession,
      saveReflection,
      skipReflection,
    }),
    [
      state,
      createTask,
      toggleTask,
      renameTask,
      moveTask,
      deleteTask,
      deleteFocusSession,
      setScratchpad,
      setTab,
      setDefaultMinutes,
      persistActive,
      clearActive,
      completeSession,
      saveReflection,
      skipReflection,
    ],
  );
}

export type PersistentApp = ReturnType<typeof usePersistentApp>;
