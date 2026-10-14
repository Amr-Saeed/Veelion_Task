import type { Task } from "@/types/api";

type TaskItemProps = {
  task: Task;
  busy: boolean;
  onToggle: (task: Task) => void;
};

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}

export function TaskItem({ task, busy, onToggle }: TaskItemProps) {
  return (
    <li className="card task-item">
      <div className="task-item-header">
        <p className="task-title">{task.title}</p>
        <span className="badge">{task.completed ? "Completed" : "Pending"}</span>
      </div>

      <small className="muted">
        Updated: {formatUpdatedAt(task.updatedAt)}
      </small>

      <div>
        <button
          type="button"
          className="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
        >
          {busy ? "Saving..." : task.completed ? "Mark as Pending" : "Mark as Completed"}
        </button>
      </div>
    </li>
  );
}
