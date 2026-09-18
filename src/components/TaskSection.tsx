import type { SectionId, SectionMeta, Task } from "../types";
import { EmptyState } from "./EmptyState";
import { TaskRow } from "./TaskRow";
import { PlusIcon } from "./icons";

interface TaskSectionProps {
  meta: SectionMeta;
  tasks: Task[];
  onStartComposing: (section: SectionId) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onMove: (id: string, section: SectionId) => void;
  onDelete: (id: string) => void;
}

export function TaskSection({
  meta,
  tasks,
  onStartComposing,
  onToggle,
  onRename,
  onMove,
  onDelete,
}: TaskSectionProps) {
  const openCount = tasks.filter((task) => !task.done).length;
  const headingId = `section-${meta.id}`;

  return (
    <section className={`task-section task-section--${meta.id}`} aria-labelledby={headingId}>
      <div className="task-section__header">
        <div>
          <div className="task-section__heading">
            <h2 className="text-title" id={headingId}>
              {meta.title}
            </h2>
            <span className="badge">
              {openCount}
              <span className="sr-only"> open tasks</span>
            </span>
          </div>
          <p className="task-section__description">{meta.description}</p>
        </div>

        {meta.id === "today" ? (
          <button
            type="button"
            className="button button--primary"
            onClick={() => onStartComposing(meta.id)}
          >
            <PlusIcon className="button__icon" />
            Add Task
          </button>
        ) : null}
      </div>

      {tasks.length > 0 ? (
        <ul className="task-section__list">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onRename={onRename}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}

      {tasks.length === 0 ? (
        <EmptyState
          title={meta.emptyTitle}
          text={meta.emptyText}
          actionLabel={`Add a task to ${meta.title}`}
          onAction={() => onStartComposing(meta.id)}
        />
      ) : null}
    </section>
  );
}
