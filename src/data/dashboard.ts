import type { FocusSessionLog, Quote, SectionMeta, Task } from "../types";

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

function atTime(daysAgo: number, hour: number, minute: number): number {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

/** Seeded ledger so the History tab isn't empty on first load. */
export const SEEDED_FOCUS_LOG: FocusSessionLog[] = [
  {
    id: "seed-cs",
    title: "CS Problem Set",
    focusedMinutes: 52,
    endedAt: atTime(0, 11, 5),
    rating: 4,
    note: "Got through most of question 4.",
  },
  {
    id: "seed-research",
    title: "Research Paper",
    focusedMinutes: 34,
    endedAt: atTime(0, 14, 10),
    rating: 5,
    note: "Very focused, phone was away.",
  },
  {
    id: "seed-resume",
    title: "Resume",
    focusedMinutes: 20,
    endedAt: atTime(0, 16, 40),
    rating: 3,
    note: "Kept getting distracted.",
  },
  {
    id: "seed-prob",
    title: "Probability homework",
    focusedMinutes: 78,
    endedAt: atTime(1, 10, 30),
    rating: 4,
  },
  {
    id: "seed-intern",
    title: "Internship applications",
    focusedMinutes: 54,
    endedAt: atTime(1, 16, 20),
    rating: 3,
    note: "Spent too much time browsing companies.",
  },
];
