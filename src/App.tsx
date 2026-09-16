import { useMemo, useState } from "react";
import type { NewTaskDraft } from "./components/AddTaskForm";
import { AsideBar, Greeting } from "./components/DashboardHeader";
import { FocusCard } from "./components/FocusCard";
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
      section: draft.section,
      done: false,
    };
    setTasks((current) => [...current, task]);
    setComposingSection(null);
  };

  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <div className="app">
      <div className="app__grid">
        <main className="card app__tasks">
          <Greeting now={now} />

          <div className="section-stack">
            {SECTIONS.map((section) => (
              <TaskSection
                key={section.id}
                meta={section}
                tasks={tasksBySection.get(section.id) ?? []}
                isComposing={composingSection === section.id}
                onStartComposing={setComposingSection}
                onCancelComposing={() => setComposingSection(null)}
                onCreate={createTask}
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
          <FocusCard tasksDone={doneCount} tasksTotal={tasks.length} />
        </aside>
      </div>
    </div>
  );
}
