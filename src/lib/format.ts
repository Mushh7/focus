import type { SectionId } from "../types";

const MAX_ESTIMATE_HOURS = 23;

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

/** 90 -> "1h 30m", 120 -> "2h", 45 -> "45m". */
export function formatEstimate(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

/** Ledger copy: "52 min", "1h 18m". */
export function formatLedgerDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return formatEstimate(minutes);
}

export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatLedgerDayLabel(timestamp: number, now = new Date()): string {
  const date = new Date(timestamp);
  const stamp = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const that = new Date(date);
  that.setHours(0, 0, 0, 0);
  if (that.getTime() === today.getTime()) return `Today · ${stamp}`;
  return stamp;
}

/** Monday 00:00 local of the week containing `now`. */
export function startOfWeek(now = new Date()): Date {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  const weekday = date.getDay();
  date.setDate(date.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return date;
}

/** 90 -> "01:30". The inverse of the composer's HH:MM duration field. */
export function formatDurationInput(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Keeps a duration field readable while it is being typed: digits only, with
 * the colon inserted once the hours are complete. "130" -> "01:3".
 */
export function maskDurationInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export interface ParsedDuration {
  minutes?: number;
  error?: string;
}

/** Reads "01:30" as 90 minutes. A duration, so hours are not wrapped at 24. */
export function parseDurationInput(value: string): ParsedDuration {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return {};

  const padded = digits.padStart(4, "0");
  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2));

  if (minutes > 59) return { error: "Minutes can be at most 59 — 01:30 means 1 hour 30 minutes." };
  if (hours > MAX_ESTIMATE_HOURS) return { error: `Hours can be at most ${MAX_ESTIMATE_HOURS}.` };

  const total = hours * 60 + minutes;
  return { minutes: total > 0 ? total : undefined };
}

export function shortWeekday(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
