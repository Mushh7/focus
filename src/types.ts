export type Priority = "high" | "medium" | "low";

export type SectionId = "today" | "upcoming" | "later";

export type TimerMode = "focus" | "break";

export type PanelTab = TimerMode | "stats";

export type TimerStatus = "running" | "paused";

export interface Task {
  id: string;
  title: string;
  /** @deprecated Display fallback for older saves. Prefer dueTime + section. */
  due?: string;
  /** Clock time "HH:MM" (24h). Duration estimates are separate. */
  dueTime?: string;
  priority: Priority;
  /** Estimate in whole minutes. 01:30 -> 90. */
  estimateMinutes?: number;
  section: SectionId;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SessionReflection {
  id: string;
  title: string;
  focusedMinutes: number;
  plannedMinutes: number;
}

export interface Thought {
  id: string;
  text: string;
  createdAt: string;
  sessionId?: string;
}

export interface FocusSessionLog {
  id: string;
  title: string;
  taskId: string | null;
  taskTitleSnapshot: string;
  focusedMinutes: number;
  plannedMinutes: number;
  startedAt: string;
  endedAt: string;
  endedEarly: boolean;
  rating?: number;
  note?: string;
  scratchpad: Thought[];
}

export interface ActiveTimerSession {
  id: string;
  kind: TimerMode;
  taskId: string | null;
  taskTitleSnapshot: string;
  plannedDurationMinutes: number;
  startedAt: string;
  endsAt: string | null;
  pausedAt: string | null;
  totalPausedMilliseconds: number;
  remainingMilliseconds: number;
  status: TimerStatus;
  intent: string;
}

export interface Preferences {
  defaultFocusMinutes: number;
  defaultBreakMinutes: number;
  activeTab: PanelTab;
}

export interface AppState {
  version: number;
  tasks: Task[];
  focusSessions: FocusSessionLog[];
  activeFocusSession: ActiveTimerSession | null;
  breakSessions: FocusSessionLog[];
  activeBreakSession: ActiveTimerSession | null;
  scratchpad: Thought[];
  preferences: Preferences;
  pendingReflection: SessionReflection | null;
}

export interface SectionMeta {
  id: SectionId;
  title: string;
  description: string;
  emptyTitle: string;
  emptyText: string;
}

export interface Quote {
  text: string;
  author: string;
}
