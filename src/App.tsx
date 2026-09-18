import { useMemo, useState } from "react";
import { AddTaskForm, type NewTaskDraft } from "./components/AddTaskForm";
import { AsideBar, Greeting } from "./components/DashboardHeader";
import { FocusCard } from "./components/FocusCard";
import { Modal } from "./components/Modal";
import { TaskSection } from "./components/TaskSection";
import { INITIAL_TASKS, SECTIONS } from "./data/dashboard";
import { buildDueLabel } from "./lib/format";
import type { SectionId, Task } from "./types";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [composingSection, setComposingSection] = useState<SectionId | null>(null);
  const now = useMemo(() => new Date(), []);

  const tasksBySection = useMemo(() => {
    const grouped = new Map<SectionId, Task[]>(SECTIONS.map((section) => [section.id, []]));
    for (const task of tasks) grouped.get(task.section)?.push(task);
    return grouped;
  }, [tasks]);

  const toggleTask = (id: string) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );

  const renameTask = (id: string, title: string) =>
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, title } : task)));

  const moveTask = (id: string, section: SectionId) =>
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, section } : task)));

  const deleteTask = (id: string) =>
    setTasks((current) => current.filter((task) => task.id !== id));

  const createTask = (draft: NewTaskDraft) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: draft.title,
      due: buildDueLabel(draft.section, draft.time),
      priority: draft.priority,
      estimateMinutes: draft.estimateMinutes,
      section: draft.section,
      done: false,
    };
    setTasks((current) => [...current, task]);
    setComposingSection(null);
  };

  const [focusSessionActive, setFocusSessionActive] = useState(false);

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
          <FocusCard onFocusSessionChange={setFocusSessionActive} />
        </aside>
      </div>

      {composingSection ? (
        <Modal label="New task" onClose={() => setComposingSection(null)}>
          <AddTaskForm
            section={composingSection}
            onSubmit={createTask}
            onCancel={() => setComposingSection(null)}
          />
        </Modal>
      ) : null}
    </div>
  );
}
