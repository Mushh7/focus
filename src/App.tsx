import { useMemo, useState } from "react";
import { AddTaskForm } from "./components/AddTaskForm";
import { AsideBar, Greeting } from "./components/DashboardHeader";
import { FocusCard } from "./components/FocusCard";
import { Modal } from "./components/Modal";
import { TaskSection } from "./components/TaskSection";
import { SECTIONS } from "./data/dashboard";
import { usePersistentApp } from "./hooks/usePersistentApp";
import { buildDueLabel } from "./lib/format";
import type { SectionId, Task } from "./types";

function visibleDue(task: Task): string | undefined {
  if (task.dueTime) return buildDueLabel(task.section, task.dueTime);
  return task.due;
}

export default function App() {
  const store = usePersistentApp();
  const { state, createTask, toggleTask, renameTask, moveTask, deleteTask } = store;
  const [composingSection, setComposingSection] = useState<SectionId | null>(null);
  const now = useMemo(() => new Date(), []);
  const [focusSessionActive, setFocusSessionActive] = useState(false);

  const tasksBySection = useMemo(() => {
    const grouped = new Map<SectionId, Task[]>(SECTIONS.map((section) => [section.id, []]));
    for (const task of state.tasks) {
      grouped.get(task.section)?.push({ ...task, due: visibleDue(task) });
    }
    return grouped;
  }, [state.tasks]);

  return (
    <div className={focusSessionActive ? "app app--focus-active" : "app"}>
      <div className="app__grid">
        <main className="card app__tasks">
          <Greeting now={now} />

          <div className="section-stack">
            {SECTIONS.map((section) => (
              <TaskSection
                key={section.id}
                meta={section}
                tasks={tasksBySection.get(section.id) ?? []}
                onStartComposing={setComposingSection}
                onToggle={toggleTask}
                onRename={renameTask}
                onMove={moveTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </main>

        <aside className="app__aside">
          <AsideBar />
          <FocusCard store={store} onFocusSessionChange={setFocusSessionActive} />
        </aside>
      </div>

      {composingSection ? (
        <Modal label="New task" onClose={() => setComposingSection(null)}>
          <AddTaskForm
            section={composingSection}
            onSubmit={(draft) => {
              createTask(draft);
              setComposingSection(null);
            }}
            onCancel={() => setComposingSection(null)}
          />
        </Modal>
      ) : null}
    </div>
  );
}
