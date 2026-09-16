import type { SectionId } from "../types";

export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** "22:00" -> "10:00 PM" */
export function formatTimeOfDay(value: string): string {
  const [rawHours, rawMinutes] = value.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";

  const suffix = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function buildDueLabel(section: SectionId, time: string): string | undefined {
  if (!time) return undefined;
  const clock = formatTimeOfDay(time);
  if (!clock) return undefined;

  if (section === "today") return `Due today at ${clock}`;
  if (section === "upcoming") return `Due tomorrow at ${clock}`;
  return `Someday at ${clock}`;
}

export function shortWeekday(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
