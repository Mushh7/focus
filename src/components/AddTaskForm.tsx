import { useId, useState } from "react";
import { SECTIONS } from "../data/dashboard";
import type { Priority, SectionId } from "../types";

const MAX_HOURS = 23;

export interface NewTaskDraft {
  title: string;
  section: SectionId;
  priority: Priority;
  time: string;
  estimateMinutes?: number;
}

interface AddTaskFormProps {
  section: SectionId;
  onSubmit: (draft: NewTaskDraft) => void;
  onCancel: () => void;
}

export function AddTaskForm({ section, onSubmit, onCancel }: AddTaskFormProps) {
  const fieldId = useId();
  const [title, setTitle] = useState("");
  const [targetSection, setTargetSection] = useState<SectionId>(section);
  const [priority, setPriority] = useState<Priority>(section === "later" ? "low" : "medium");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState("");
  const [estimateMinutes, setEstimateMinutes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a name so you know what to come back to.");
      return;
    }

    const parsedHours = hours === "" ? 0 : Number(hours);
    const parsedMinutes = estimateMinutes === "" ? 0 : Number(estimateMinutes);
    if (parsedHours > MAX_HOURS) {
      setError(`Hours can be at most ${MAX_HOURS}.`);
      return;
    }
    if (parsedMinutes > 59) {
      setError("Minutes can be at most 59.");
      return;
    }

    const estimate = parsedHours * 60 + parsedMinutes;
    onSubmit({
      title: title.trim(),
      section: targetSection,
      priority,
      time,
      estimateMinutes: estimate > 0 ? estimate : undefined,
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

      <fieldset className="add-task__estimate">
        <legend className="add-task__estimate-legend">Estimated time (optional)</legend>
        <div className="add-task__estimate-fields">
          <div className="field add-task__estimate-field">
            <label className="field__label" htmlFor={`${fieldId}-hours`}>
              Hours
            </label>
            <input
              id={`${fieldId}-hours`}
              className="field__input add-task__estimate-input"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="0"
              value={hours}
              onChange={(event) => {
                setHours(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
            />
          </div>

          <div className="field add-task__estimate-field">
            <label className="field__label" htmlFor={`${fieldId}-minutes`}>
              Minutes
            </label>
            <input
              id={`${fieldId}-minutes`}
              className="field__input add-task__estimate-input"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="0"
              value={estimateMinutes}
              onChange={(event) => {
                setEstimateMinutes(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
            />
          </div>
        </div>
      </fieldset>

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
