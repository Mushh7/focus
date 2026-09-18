export type Priority = "high" | "medium" | "low";

export type SectionId = "today" | "upcoming" | "later";

export type TimerMode = "focus" | "break";

export type PanelTab = TimerMode | "stats";

export interface Task {
  id: string;
  title: string;
  /** Human readable due line, e.g. "Due today at 10:00 PM". Empty for someday tasks. */
  due?: string;
  priority: Priority;
  /** Optional estimate in whole minutes. Absent when not given. */
  estimateMinutes?: number;
  section: SectionId;
  done: boolean;
}

export interface SessionReflection {
  id: string;
  title: string;
  focusedMinutes: number;
  plannedMinutes: number;
}

export interface FocusSessionLog {
  id: string;
  title: string;
  focusedMinutes: number;
  endedAt: number;
  rating?: number;
  note?: string;
}

export interface SectionMeta {
  id: SectionId;
  title: string;
  description: string;
  emptyTitle: string;
  emptyText: string;
}

export interface Thought {
  id: string;
  text: string;
}

export interface Quote {
  text: string;
  author: string;
}
