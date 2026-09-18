import { useId, useState } from "react";
import { SECTIONS } from "../data/dashboard";
import { formatDurationInput, maskDurationInput, parseDurationInput } from "../lib/format";
import type { Priority, SectionId } from "../types";

export interface NewTaskDraft {
  title: string;
  section: SectionId;
  priority: Priority;
  time: string;
  estimateMinutes?: number;
}

interface AddTaskFormProps {
  section: SectionId;
  /** Prefills the duration field when reopening the form for an existing task. */
  estimateMinutes?: number;
  onSubmit: (draft: NewTaskDraft) => void;
  onCancel: () => void;
}

export function AddTaskForm({
  section,
  estimateMinutes: initialEstimate,
  onSubmit,
  onCancel,
}: AddTaskFormProps) {
  const fieldId = useId();
  const [title, setTitle] = useState("");
  const [targetSection, setTargetSection] = useState<SectionId>(section);
  const [priority, setPriority] = useState<Priority>(section === "later" ? "low" : "medium");
  const [time, setTime] = useState("");
  const [estimate, setEstimate] = useState(
    initialEstimate === undefined ? "" : formatDurationInput(initialEstimate),
  );
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a name so you know what to come back to.");
      return;
    }

    const duration = parseDurationInput(estimate);
    if (duration.error) {
      setError(duration.error);
      return;
    }

    onSubmit({
      title: title.trim(),
      section: targetSection,
      priority,
      time,
      estimateMinutes: duration.minutes,
    });
  };

  return (
    <form className="add-task" onSubmit={handleSubmit} aria-label="Add a task">
      <p className="add-task__title">New task</p>

      <div className="field add-task__field--wide">
        <label className="field__label" htmlFor={`${fieldId}-title`}>
          What needs doing?
        </label>
        <input
          id={`${fieldId}-title`}
          className="field__input"
          placeholder="Finish problem set 4"
          value={title}
          autoFocus
          onChange={(event) => {
            setTitle(event.target.value);
            setError("");
          }}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${fieldId}-section`}>
          List
        </label>
        <select
          id={`${fieldId}-section`}
          className="field__select"
          value={targetSection}
          onChange={(event) => setTargetSection(event.target.value as SectionId)}
        >
          {SECTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${fieldId}-priority`}>
          Priority
        </label>
        <select
          id={`${fieldId}-priority`}
          className="field__select"
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority)}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${fieldId}-time`}>
          Due time (optional)
        </label>
        <input
          id={`${fieldId}-time`}
          className="field__input"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor={`${fieldId}-estimate`}>
          Estimated time (optional)
        </label>
        <input
          id={`${fieldId}-estimate`}
          className="field__input add-task__estimate-input"
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="00:00"
          aria-describedby={`${fieldId}-estimate-hint`}
          value={estimate}
          onChange={(event) => {
            setEstimate(maskDurationInput(event.target.value));
            setError("");
          }}
          onBlur={() => {
            // "130" reads as 1h30m, so settle the field on that once typing stops.
            const parsed = parseDurationInput(estimate);
            if (parsed.minutes !== undefined) setEstimate(formatDurationInput(parsed.minutes));
          }}
        />
        <p className="field__hint" id={`${fieldId}-estimate-hint`}>
          HH:MM, so 01:30 is 1 hour 30 minutes
        </p>
      </div>

      {error ? (
        <p className="add-task__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="add-task__actions">
        <button type="button" className="button button--sm button--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--sm button--primary">
          Add task
        </button>
      </div>
    </form>
  );
}
