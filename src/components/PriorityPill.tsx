import type { Priority } from "../types";

const LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span className={`pill pill--${priority}`}>
      <span className="sr-only">Priority: </span>
      {LABELS[priority]}
    </span>
  );
}
