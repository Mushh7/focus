import { DAY_STREAK, WEEK_FOCUS } from "../data/dashboard";
import { shortWeekday } from "../lib/format";

interface StatsPanelProps {
  sessions: number;
  minutesFocused: number;
  tasksDone: number;
  tasksTotal: number;
}

export function StatsPanel({
  sessions,
  minutesFocused,
  tasksDone,
  tasksTotal,
}: StatsPanelProps) {
  const today = shortWeekday(new Date());
  const peak = Math.max(...WEEK_FOCUS.map((entry) => entry.minutes));
  const weekTotal = WEEK_FOCUS.reduce((sum, entry) => sum + entry.minutes, 0);

  const tiles = [
    { value: String(sessions), label: "Focus sessions today" },
    { value: `${minutesFocused} min`, label: "Time focused today" },
    { value: `${tasksDone}/${tasksTotal}`, label: "Tasks checked off" },
    { value: `${DAY_STREAK} days`, label: "Current streak" },
  ];

  return (
    <div className="stats">
      <div className="stats__grid">
        {tiles.map((tile) => (
          <div className="stat-tile" key={tile.label}>
            <p className="stat-tile__value">{tile.value}</p>
            <p className="stat-tile__label">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="chart">
        <div className="chart__header">
          <h3 className="chart__title">This week</h3>
          <p className="chart__meta">{weekTotal} min total</p>
        </div>
        <ul className="chart__bars">
          {WEEK_FOCUS.map((entry) => (
            <li
              className={`chart__column${entry.day === today ? " chart__column--today" : ""}`}
              key={entry.day}
            >
              <span
                className="chart__bar"
                style={{ "--bar-height": `${Math.round((entry.minutes / peak) * 100)}%` } as React.CSSProperties}
                title={`${entry.day}: ${entry.minutes} min`}
              />
              <span className="chart__day">{entry.day}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
