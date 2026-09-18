import { useMemo, useState } from "react";
import { useDismissable } from "../hooks/useDismissable";
import {
  dayKey,
  formatLedgerDayLabel,
  formatLedgerDuration,
  startOfWeek,
  toTimestamp,
} from "../lib/format";
import type { FocusSessionLog } from "../types";
import { MoreIcon, TrashIcon } from "./icons";

interface StatsPanelProps {
  sessions: FocusSessionLog[];
  onDeleteSession: (id: string) => void;
}

interface DayGroup {
  key: string;
  label: string;
  minutes: number;
  sessions: FocusSessionLog[];
}

function groupByDay(sessions: FocusSessionLog[], now: Date): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const session of sessions) {
    const key = dayKey(session.endedAt);
    const existing = groups.get(key);
    if (existing) {
      existing.minutes += session.focusedMinutes;
      existing.sessions.push(session);
    } else {
      groups.set(key, {
        key,
        label: formatLedgerDayLabel(session.endedAt, now),
        minutes: session.focusedMinutes,
        sessions: [session],
      });
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.key.localeCompare(a.key, undefined, { numeric: true }))
    .map((group) => ({
      ...group,
      sessions: [...group.sessions].sort(
        (a, b) => toTimestamp(a.endedAt) - toTimestamp(b.endedAt),
      ),
    }));
}

function LedgerEntry({
  session,
  onDelete,
}: {
  session: FocusSessionLog;
  onDelete: (id: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useDismissable<HTMLDivElement>(isMenuOpen, () => setIsMenuOpen(false));

  const confirmDelete = () => {
    setIsMenuOpen(false);
    const ok = window.confirm(
      `Delete the focus session “${session.title}”? This does not delete the task.`,
    );
    if (ok) onDelete(session.id);
  };

  return (
    <li className="ledger-entry">
      <div className="ledger-entry__row">
        <p className="ledger-entry__title">{session.title}</p>
        <div className="ledger-entry__meta">
          {session.rating !== undefined ? (
            <p className="ledger-entry__rating">{session.rating}/5</p>
          ) : (
            <p className="ledger-entry__rating ledger-entry__rating--empty">—</p>
          )}
          <div className="menu" ref={menuRef}>
            <button
              type="button"
              className="icon-button"
              aria-label={`More actions for ${session.title}`}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MoreIcon />
            </button>
            {isMenuOpen ? (
              <div className="menu__panel" role="menu">
                <button
                  type="button"
                  className="menu__item menu__item--danger"
                  role="menuitem"
                  onClick={confirmDelete}
                >
                  <TrashIcon />
                  Delete session
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="ledger-entry__duration">{formatLedgerDuration(session.focusedMinutes)}</p>
      {session.note ? <p className="ledger-entry__note">“{session.note}”</p> : null}
    </li>
  );
}

export function StatsPanel({ sessions, onDeleteSession }: StatsPanelProps) {
  const now = useMemo(() => new Date(), []);
  const weekStart = startOfWeek(now).getTime();
  const thisWeek = sessions.filter((session) => toTimestamp(session.endedAt) >= weekStart);
  const weekMinutes = thisWeek.reduce((sum, session) => sum + session.focusedMinutes, 0);
  const rated = thisWeek.filter((session) => session.rating !== undefined);
  const averageRating =
    rated.length === 0
      ? null
      : rated.reduce((sum, session) => sum + (session.rating ?? 0), 0) / rated.length;

  const daysElapsed = Math.max(
    1,
    Math.round((now.getTime() - weekStart) / (24 * 60 * 60 * 1000)) + 1,
  );
  const perDay = Math.round(weekMinutes / daysElapsed);
  const days = groupByDay(sessions, now);

  return (
    <div className="ledger">
      <section className="ledger-summary" aria-label="This week">
        <div>
          <p className="ledger-summary__value">{formatLedgerDuration(weekMinutes)}</p>
          <p className="ledger-summary__label">this week</p>
        </div>
        <div>
          <p className="ledger-summary__value">{thisWeek.length}</p>
          <p className="ledger-summary__label">
            {thisWeek.length === 1 ? "session" : "sessions"}
          </p>
        </div>
        <div>
          <p className="ledger-summary__value">
            {averageRating === null ? "—" : averageRating.toFixed(1)}
          </p>
          <p className="ledger-summary__label">avg rating</p>
        </div>
        <div>
          <p className="ledger-summary__value">{formatLedgerDuration(perDay)}</p>
          <p className="ledger-summary__label">per day</p>
        </div>
      </section>

      <section className="ledger-history" aria-labelledby="ledger-heading">
        <h3 className="ledger-history__title" id="ledger-heading">
          Focus history
        </h3>

        {days.length === 0 ? (
          <p className="ledger-empty">
            Finished sessions land here, grouped by day. End a focus block to start the ledger.
          </p>
        ) : (
          days.map((day) => (
            <div className="ledger-day" key={day.key}>
              <div className="ledger-day__header">
                <h4 className="ledger-day__date">{day.label}</h4>
                <p className="ledger-day__total">
                  {formatLedgerDuration(day.minutes)}
                  <span className="ledger-day__count">
                    {" "}
                    · {day.sessions.length}{" "}
                    {day.sessions.length === 1 ? "session" : "sessions"}
                  </span>
                </p>
              </div>

              <ul className="ledger-list">
                {day.sessions.map((session) => (
                  <LedgerEntry key={session.id} session={session} onDelete={onDeleteSession} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
