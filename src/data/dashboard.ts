import type { DayFocus, Quote, SectionMeta, Task } from "../types";

export const USER = {
  firstName: "Kaden",
  initials: "KW",
  tagline: "A focused mind does more.",
};

export const SECTIONS: SectionMeta[] = [
  {
    id: "today",
    title: "Today",
    description: "Tasks to make today. You got this.",
    emptyTitle: "Today is clear",
    emptyText: "Nothing due today. Add a task or pull one forward from Upcoming.",
  },
  {
    id: "upcoming",
    title: "Upcoming",
    description: "Tasks due soon but not today.",
    emptyTitle: "Nothing on deck",
    emptyText: "The next few days are open. Plan something while you have room.",
  },
  {
    id: "later",
    title: "Later",
    description: "Longer term goals and ideas.",
    emptyTitle: "No long-term ideas yet",
    emptyText: "Park the things you want to get to eventually so they stop taking up headspace.",
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-seminar",
    title: "Seminar discussion hw",
    due: "Due today at 10:00 PM",
    priority: "high",
    section: "today",
    done: false,
  },
  {
    id: "task-chapter",
    title: "Read chapter 6",
    due: "Due today at 5:00 PM",
    priority: "medium",
    section: "today",
    done: false,
  },
  {
    id: "task-cs",
    title: "CS hw",
    due: "Due tomorrow at 10:00 AM",
    priority: "high",
    section: "upcoming",
    done: false,
  },
  {
    id: "task-lab",
    title: "Lab report",
    due: "Due Wed, Apr 23 at 11:59 PM",
    priority: "medium",
    section: "upcoming",
    done: false,
  },
  {
    id: "task-resume",
    title: "Update resume",
    priority: "low",
    section: "later",
    done: false,
  },
  {
    id: "task-summer",
    title: "Plan summer schedule",
    priority: "low",
    section: "later",
    done: false,
  },
  {
    id: "task-options",
    title: "Learn options basics",
    priority: "low",
    section: "later",
    done: false,
  },
];

export const FOCUS_QUOTE: Quote = {
  text: "Discipline is choosing between what you want now and what you want most.",
  author: "Abraham Lincoln",
};

export const BREAK_QUOTE: Quote = {
  text: "Almost everything will work again if you unplug it for a few minutes, including you.",
  author: "Anne Lamott",
};

/** Presets in minutes. `null` opens the custom duration input. */
export const FOCUS_PRESETS: Array<number | null> = [25, 50, 90, null];
export const BREAK_PRESETS: Array<number | null> = [5, 10, 15, null];

/** Focus minutes already logged before the app was opened. */
export const SEEDED_FOCUS_MINUTES = 75;
export const SEEDED_SESSIONS = 3;
export const DAY_STREAK = 5;

export const WEEK_FOCUS: DayFocus[] = [
  { day: "Mon", minutes: 75 },
  { day: "Tue", minutes: 50 },
  { day: "Wed", minutes: 95 },
  { day: "Thu", minutes: 40 },
  { day: "Fri", minutes: 110 },
  { day: "Sat", minutes: 25 },
  { day: "Sun", minutes: 65 },
];
