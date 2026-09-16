interface ProgressRingProps {
  /** 0 to 1. */
  progress: number;
  label: string;
  children: React.ReactNode;
}

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ progress, label, children }: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div className="timer__dial">
      <svg
        className="timer__ring"
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${label}: ${Math.round(clamped * 100)}% complete`}
      >
        <circle className="timer__ring-track" cx="50" cy="50" r={RADIUS} />
        <circle
          className="timer__ring-progress"
          cx="50"
          cy="50"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
        />
      </svg>
      <div className="timer__readout">{children}</div>
    </div>
  );
}
