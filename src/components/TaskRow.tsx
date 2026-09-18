import { useId, useState } from "react";
import { SECTIONS } from "../data/dashboard";
import { formatEstimate } from "../lib/format";
import { useDismissable } from "../hooks/useDismissable";
import type { SectionId, Task } from "../types";
import { PriorityPill } from "./PriorityPill";
import { ArrowRightIcon, CheckIcon, MoreIcon, PencilIcon, TrashIcon } from "./icons";

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onMove: (id: string, section: SectionId) => void;
  onDelete: (id: string) => void;
}

export function TaskRow({ task, onToggle, onRename, onMove, onDelete }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useDismissable<HTMLDivElement>(isMenuOpen, () => setIsMenuOpen(false));
  const checkboxId = useId();

  const saveRename = () => {
    const next = draft.trim();
    if (next) onRename(task.id, next);
    else setDraft(task.title);
    setIsEditing(false);
  };

  const startEditing = () => {
    setDraft(task.title);
    setIsEditing(true);
  };

  return (
    <li className={`task-row${task.done ? " task-row--done" : ""}`}>
      <input
        id={checkboxId}
        className="checkbox"
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />

      {isEditing ? (
        <form
          className="task-row__edit"
          onSubmit={(event) => {
            event.preventDefault();
            saveRename();
          }}
        >
          <label className="sr-only" htmlFor={`${checkboxId}-title`}>
            Task title
          </label>
          <input
            id={`${checkboxId}-title`}
            className="field__input"
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsEditing(false);
            }}
          />
          <button type="submit" className="icon-button icon-button--active" aria-label="Save title">
            <CheckIcon />
          </button>
        </form>
      ) : (
        <>
          <label className="task-row__body" htmlFor={checkboxId}>
            <span className="task-row__title">{task.title}</span>
            {task.due || task.estimateMinutes ? (
              <span className="task-row__meta">
                {task.due ? <span className="task-row__due">{task.due}</span> : null}
                {task.due && task.estimateMinutes ? (
                  <span className="task-row__meta-separator" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                {task.estimateMinutes ? (
                  <span className="task-row__estimate">
                    <span className="sr-only">Estimated time </span>
                    {formatEstimate(task.estimateMinutes)}
                  </span>
                ) : null}
              </span>
            ) : null}
          </label>

          <div className="task-row__actions">
            <PriorityPill priority={task.priority} />

            <button
              type="button"
              className="icon-button"
              onClick={startEditing}
              aria-label={`Rename ${task.title}`}
            >
              <PencilIcon />
            </button>

            <div className="menu" ref={menuRef}>
              <button
                type="button"
                className="icon-button"
                aria-label={`More actions for ${task.title}`}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <MoreIcon />
              </button>

              {isMenuOpen ? (
                <div className="menu__panel" role="menu">
                  <p className="menu__label">Move to</p>
                  {SECTIONS.filter((section) => section.id !== task.section).map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className="menu__item"
                      role="menuitem"
                      onClick={() => {
                        onMove(task.id, section.id);
                        setIsMenuOpen(false);
                      }}
                    >
                      <ArrowRightIcon />
                      {section.title}
                    </button>
                  ))}
                  <hr className="menu__separator" />
                  <button
                    type="button"
                    className="menu__item menu__item--danger"
                    role="menuitem"
                    onClick={() => {
                      onDelete(task.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <TrashIcon />
                    Delete task
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </li>
  );
}
