"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ErrorResponse, TasksSummary } from "@/types/api";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load the report.";
}

async function fetchSummary(): Promise<TasksSummary> {
  const response = await fetch("/api/reports/tasks-summary", { cache: "no-store" });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;

    try {
      const body = (await response.json()) as ErrorResponse;
      message = body.error?.message || message;
    } catch {
      // Use the HTTP status when the server does not return JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as TasksSummary;
}

const statusCards: Array<{
  key: keyof TasksSummary["byStatus"];
  label: string;
  tone: string;
}> = [
  { key: "todo", label: "To do", tone: "report-card-blue" },
  { key: "in-progress", label: "In progress", tone: "report-card-amber" },
  { key: "done", label: "Done", tone: "report-card-green" },
];

export default function ReportsPage() {
  const [summary, setSummary] = useState<TasksSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setSummary(await fetchSummary());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <main className="stack">
      <nav className="page-nav" aria-label="Page navigation">
        <Link href="/" className="back-button">
          <span aria-hidden="true">←</span>
          Back to overview
        </Link>
      </nav>

      <header className="card page-header">
        <p className="eyebrow">Insights</p>
        <h1>Task Reports</h1>
        <p className="muted">A quick overview of task progress and recent activity.</p>
      </header>

      {loading ? (
        <section className="card feedback" role="status">
          Loading report...
        </section>
      ) : null}

      {error ? (
        <section className="card feedback feedback-error" role="alert">
          <p>{error}</p>
          <button type="button" className="button" onClick={() => void loadSummary()}>
            Retry
          </button>
        </section>
      ) : null}

      {!loading && !error && summary ? (
        <>
          <section className="report-highlight card">
            <div>
              <p className="eyebrow">Total tasks</p>
              <strong>{summary.total}</strong>
            </div>
            <div className="report-highlight-icon" aria-hidden="true">
              ✓
            </div>
          </section>

          <section className="report-grid" aria-label="Task report metrics">
            {statusCards.map((status) => (
              <article key={status.key} className={`card report-card ${status.tone}`}>
                <p className="muted">{status.label}</p>
                <strong>{summary.byStatus[status.key]}</strong>
              </article>
            ))}
            <article className="card report-card report-card-purple">
              <p className="muted">Recent activity</p>
              <strong>{summary.recentActivityCount}</strong>
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}
