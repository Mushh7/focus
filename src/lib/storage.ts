import { INITIAL_TASKS } from "../data/dashboard";
import type {
  ActiveTimerSession,
  AppState,
  FocusSessionLog,
  PanelTab,
  Preferences,
  Priority,
  SectionId,
  SessionReflection,
  Task,
  Thought,
  TimerMode,
  TimerStatus,
} from "../types";
import { createId } from "./id";

export const STORAGE_KEY = "focus-dashboard:state";
export const SCHEMA_VERSION = 1;

const DEFAULT_PREFERENCES: Preferences = {
  defaultFocusMinutes: 25,
  defaultBreakMinutes: 5,
  activeTab: "focus",
};

export function emptyState(): AppState {
  const now = new Date().toISOString();
  return {
    version: SCHEMA_VERSION,
    tasks: INITIAL_TASKS.map((task) => ({
      ...task,
      createdAt: task.createdAt ?? now,
      updatedAt: task.updatedAt ?? now,
    })),
    focusSessions: [],
    activeFocusSession: null,
    breakSessions: [],
    activeBreakSession: null,
    scratchpad: [],
    preferences: { ...DEFAULT_PREFERENCES },
    pendingReflection: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asIso(value: unknown, fallback?: string): string {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return value;
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString();
  return fallback ?? new Date().toISOString();
}

const SECTIONS: SectionId[] = ["today", "upcoming", "later"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];
const TABS: PanelTab[] = ["focus", "break", "stats"];

function parseTask(value: unknown): Task | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const title = asString(value.title);
  if (!id || !title) return null;
  const section = SECTIONS.includes(value.section as SectionId)
    ? (value.section as SectionId)
    : "today";
  const priority = PRIORITIES.includes(value.priority as Priority)
    ? (value.priority as Priority)
    : "medium";
  const createdAt = asIso(value.createdAt);
  return {
    id,
    title,
    due: typeof value.due === "string" ? value.due : undefined,
    dueTime: typeof value.dueTime === "string" && value.dueTime ? value.dueTime : undefined,
    priority,
    estimateMinutes: asNumber(value.estimateMinutes),
    section,
    done: asBoolean(value.done),
    createdAt,
    updatedAt: asIso(value.updatedAt, createdAt),
    completedAt: typeof value.completedAt === "string" ? value.completedAt : undefined,
  };
}

function parseThought(value: unknown): Thought | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const text = asString(value.text);
  if (!id || !text) return null;
  return {
    id,
    text,
    createdAt: asIso(value.createdAt),
    sessionId: typeof value.sessionId === "string" ? value.sessionId : undefined,
  };
}

function parseFocusSession(value: unknown): FocusSessionLog | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const snapshot = asString(value.taskTitleSnapshot) || asString(value.title);
  if (!id || !snapshot) return null;
  const focused =
    asNumber(value.focusedMinutes) ?? asNumber(value.actualMinutes) ?? 0;
  const planned = asNumber(value.plannedMinutes) ?? focused;
  const endedAt = asIso(value.endedAt);
  return {
    id,
    title: snapshot,
    taskId: typeof value.taskId === "string" ? value.taskId : null,
    taskTitleSnapshot: snapshot,
    focusedMinutes: focused,
    plannedMinutes: planned,
    startedAt: asIso(value.startedAt, endedAt),
    endedAt,
    endedEarly: asBoolean(value.endedEarly),
    rating: asNumber(value.rating),
    note: typeof value.note === "string" && value.note ? value.note : undefined,
    scratchpad: Array.isArray(value.scratchpad)
      ? value.scratchpad.map(parseThought).filter((item): item is Thought => item !== null)
      : [],
  };
}

function parseActive(value: unknown): ActiveTimerSession | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  if (!id) return null;
  const kind: TimerMode = value.kind === "break" ? "break" : "focus";
  const status: TimerStatus = value.status === "paused" ? "paused" : "running";
  const planned = asNumber(value.plannedDurationMinutes) ?? 25;
  const remaining = asNumber(value.remainingMilliseconds) ?? planned * 60_000;
  return {
    id,
    kind,
    taskId: typeof value.taskId === "string" ? value.taskId : null,
    taskTitleSnapshot: asString(value.taskTitleSnapshot) || asString(value.intent) || "Untitled session",
    plannedDurationMinutes: planned,
    startedAt: asIso(value.startedAt),
    endsAt: typeof value.endsAt === "string" ? value.endsAt : null,
    pausedAt: typeof value.pausedAt === "string" ? value.pausedAt : null,
    totalPausedMilliseconds: asNumber(value.totalPausedMilliseconds) ?? 0,
    remainingMilliseconds: Math.max(0, remaining),
    status,
    intent: asString(value.intent),
  };
}

function parseReflection(value: unknown): SessionReflection | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  if (!id) return null;
  return {
    id,
    title: asString(value.title) || "Untitled session",
    focusedMinutes: asNumber(value.focusedMinutes) ?? 0,
    plannedMinutes: asNumber(value.plannedMinutes) ?? 25,
  };
}

function parsePreferences(value: unknown): Preferences {
  if (!isRecord(value)) return { ...DEFAULT_PREFERENCES };
  const tab = TABS.includes(value.activeTab as PanelTab)
    ? (value.activeTab as PanelTab)
    : "focus";
  return {
    defaultFocusMinutes: asNumber(value.defaultFocusMinutes) ?? 25,
    defaultBreakMinutes: asNumber(value.defaultBreakMinutes) ?? 5,
    activeTab: tab,
  };
}

export function migrateState(raw: unknown): AppState {
  const base = emptyState();
  if (!isRecord(raw)) return base;

  const version = asNumber(raw.version) ?? 0;
  const incoming = raw as Record<string, unknown>;

  // v0/unversioned and v1 share this shape; later versions add cases here.
  void version;

  const tasks = Array.isArray(incoming.tasks)
    ? incoming.tasks.map(parseTask).filter((item): item is Task => item !== null)
    : base.tasks;

  return {
    version: SCHEMA_VERSION,
    tasks,
    focusSessions: Array.isArray(incoming.focusSessions)
      ? incoming.focusSessions
          .map(parseFocusSession)
          .filter((item): item is FocusSessionLog => item !== null)
      : [],
    activeFocusSession: parseActive(incoming.activeFocusSession),
    breakSessions: Array.isArray(incoming.breakSessions)
      ? incoming.breakSessions
          .map(parseFocusSession)
          .filter((item): item is FocusSessionLog => item !== null)
      : [],
    activeBreakSession: parseActive(incoming.activeBreakSession),
    scratchpad: Array.isArray(incoming.scratchpad)
      ? incoming.scratchpad.map(parseThought).filter((item): item is Thought => item !== null)
      : [],
    preferences: parsePreferences(incoming.preferences),
    pendingReflection: parseReflection(incoming.pendingReflection),
  };
}

function finalizeOverdue(active: ActiveTimerSession, scratchpad: Thought[]): FocusSessionLog {
  const plannedMs = active.plannedDurationMinutes * 60_000;
  const focusedMinutes = Math.max(1, Math.round(plannedMs / 60_000));
  const endedAt = active.endsAt ?? new Date().toISOString();
  return {
    id: active.id,
    title: active.taskTitleSnapshot,
    taskId: active.taskId,
    taskTitleSnapshot: active.taskTitleSnapshot,
    focusedMinutes,
    plannedMinutes: active.plannedDurationMinutes,
    startedAt: active.startedAt,
    endedAt,
    endedEarly: false,
    scratchpad: scratchpad.filter((item) => item.sessionId === active.id),
  };
}

/** Recalculate running timers from timestamps. Completes sessions whose end already passed. */
export function rehydrateTimers(state: AppState, now = Date.now()): AppState {
  const next: AppState = { ...state };

  const settle = (active: ActiveTimerSession | null, kind: TimerMode) => {
    if (!active) return null;
    if (active.status === "paused") return active;

    const deadline = active.endsAt ? Date.parse(active.endsAt) : now + active.remainingMilliseconds;
    const remaining = deadline - now;
    if (remaining > 0) {
      return {
        ...active,
        remainingMilliseconds: remaining,
        endsAt: new Date(deadline).toISOString(),
        status: "running" as const,
        pausedAt: null,
      };
    }

    const completed = finalizeOverdue(active, next.scratchpad);
    if (kind === "focus") {
      next.focusSessions = [...next.focusSessions, completed];
      if (!next.pendingReflection) {
        next.pendingReflection = {
          id: completed.id,
          title: completed.title,
          focusedMinutes: completed.focusedMinutes,
          plannedMinutes: completed.plannedMinutes,
        };
      }
    } else {
      next.breakSessions = [...next.breakSessions, completed];
    }
    return null;
  };

  next.activeFocusSession = settle(next.activeFocusSession, "focus");
  next.activeBreakSession = settle(next.activeBreakSession, "break");

  if (next.activeFocusSession && next.activeBreakSession) {
    if (next.activeBreakSession.status === "running" && next.activeFocusSession.status !== "running") {
      next.activeFocusSession = null;
    } else {
      next.activeBreakSession = null;
    }
  }

  return next;
}

export function loadState(): AppState {
  if (typeof localStorage === "undefined") return emptyState();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = emptyState();
    saveState(initial);
    return initial;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return rehydrateTimers(migrateState(parsed));
  } catch {
    // Leave the corrupt payload in place; only a later valid save replaces it.
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: SCHEMA_VERSION }));
  } catch {
    // Quota or private-mode failures should not crash the UI.
  }
}

export function matchTask(
  tasks: Task[],
  intent: string,
): { taskId: string | null; taskTitleSnapshot: string } {
  const title = intent.trim() || "Untitled session";
  const match = tasks.find((task) => task.title.toLowerCase() === title.toLowerCase());
  return {
    taskId: match?.id ?? null,
    taskTitleSnapshot: match?.title ?? title,
  };
}

export function snapshotFromCountdown(input: {
  id: string;
  kind: TimerMode;
  tasks: Task[];
  intent: string;
  plannedMinutes: number;
  remainingSeconds: number;
  isRunning: boolean;
  deadlineMs: number | null;
  previous: ActiveTimerSession | null;
}): ActiveTimerSession {
  const match = matchTask(input.tasks, input.intent);
  const now = new Date();
  const remainingMilliseconds = Math.max(0, Math.round(input.remainingSeconds * 1000));
  return {
    id: input.id,
    kind: input.kind,
    taskId: match.taskId,
    taskTitleSnapshot: match.taskTitleSnapshot,
    plannedDurationMinutes: input.plannedMinutes,
    startedAt: input.previous?.startedAt ?? now.toISOString(),
    endsAt: input.isRunning && input.deadlineMs ? new Date(input.deadlineMs).toISOString() : null,
    pausedAt: input.isRunning ? null : now.toISOString(),
    totalPausedMilliseconds: input.previous?.totalPausedMilliseconds ?? 0,
    remainingMilliseconds,
    status: input.isRunning ? "running" : "paused",
    intent: input.intent,
  };
}

export { createId };
