import type { Task } from "@/types/api";
import { TaskItem } from "@/components/tasks/TaskItem";

type TaskListProps = {
  tasks: Task[];
  updatingTaskId: string;
  onToggle: (task: Task) => void;
};

export function TaskList({ tasks, updatingTaskId, onToggle }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="card feedback">
        <p className="empty-icon" aria-hidden="true">◌</p>
        <p className="empty-title">No tasks match this filter</p>
        <p className="muted">Try another view to see more of your workload.</p>
      </section>
    );
  }

  return (
    <section aria-label="Task list" className="task-list-section">
      <div className="section-heading">
        <span>Tasks</span>
        <span className="muted">{tasks.length} {tasks.length === 1 ? "item" : "items"}</span>
      </div>
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} busy={updatingTaskId === task.id} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  );
}
