import type { Quote, SectionMeta, Task } from "../types";

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

const SEEDED_AT = "2026-09-18T16:00:00.000Z";

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-seminar",
    title: "Seminar discussion hw",
    dueTime: "22:00",
    priority: "high",
    section: "today",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "task-chapter",
    title: "Read chapter 6",
    dueTime: "17:00",
    priority: "medium",
    section: "today",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "task-cs",
    title: "CS hw",
    dueTime: "10:00",
    priority: "high",
    section: "upcoming",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "task-lab",
    title: "Lab report",
    due: "Due Wed, Apr 23 at 11:59 PM",
    priority: "medium",
    section: "upcoming",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "task-resume",
    title: "Update resume",
    priority: "low",
    section: "later",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "task-summer",
    title: "Plan summer schedule",
    priority: "low",
    section: "later",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "task-options",
    title: "Learn options basics",
    priority: "low",
    section: "later",
    done: false,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
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
