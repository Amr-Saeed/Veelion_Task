import Link from "next/link";
import { TaskDashboard } from "@/components/tasks/TaskDashboard";

export default function TasksPage() {
  return (
    <main className="stack">
      <nav className="page-nav" aria-label="Page navigation">
        <Link href="/" className="back-button">
          <span aria-hidden="true">←</span>
          Back to overview
        </Link>
      </nav>
      <TaskDashboard />
    </main>
  );
}
