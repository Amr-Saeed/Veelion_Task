"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ActivityLog, ErrorResponse } from "@/types/api";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load activity.";
}

async function fetchActivity(): Promise<ActivityLog[]> {
  const response = await fetch("/api/activity", { cache: "no-store" });

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

  return (await response.json()) as ActivityLog[];
}

function formatActivityTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}

function getActivityPresentation(action?: string): {
  icon: string;
  tone: string;
  label: string;
} {
  const normalizedAction = action?.toLowerCase() || "";

  if (normalizedAction.includes("complete") || normalizedAction.includes("done")) {
    return { icon: "✓", tone: "activity-tone-success", label: "Completed" };
  }

  if (normalizedAction.includes("delete") || normalizedAction.includes("remove")) {
    return { icon: "−", tone: "activity-tone-danger", label: "Removed" };
  }

  if (normalizedAction.includes("update") || normalizedAction.includes("edit")) {
    return { icon: "✎", tone: "activity-tone-purple", label: "Updated" };
  }

  return { icon: "+", tone: "activity-tone-primary", label: "Activity" };
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setActivity(await fetchActivity());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const visibleActivity = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return activity;
    }

    return activity.filter((item) =>
      [item.action, item.info].some((value) =>
        value?.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [activity, query]);

  return (
    <main className="stack">
      <nav className="page-nav" aria-label="Page navigation">
        <Link href="/" className="back-button">
          <span aria-hidden="true">←</span>
          Back to overview
        </Link>
      </nav>

      <header className="card page-header">
        <p className="eyebrow">History</p>
        <h1>Activity Feed</h1>
        <p className="muted">Review the latest actions recorded by the application.</p>
        <div className="activity-summary" aria-label="Activity summary">
          <div>
            <strong>{activity.length}</strong>
            <span>Total records</span>
          </div>
          <div>
            <strong>{visibleActivity.length}</strong>
            <span>Currently shown</span>
          </div>
          <div className="activity-summary-accent" aria-hidden="true" />
        </div>
      </header>

      <section className="card activity-toolbar" aria-label="Activity controls">
        <div className="activity-search-label">
          <label className="input-label" htmlFor="activity-search">
            Search activity
          </label>
          {query ? (
            <button type="button" className="clear-search" onClick={() => setQuery("")}>
              Clear
            </button>
          ) : null}
        </div>
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            id="activity-search"
            className="input"
            placeholder="Search by action or details"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="muted activity-count">
          Showing {visibleActivity.length} of {activity.length} records
        </p>
      </section>

      {loading ? (
        <section className="card feedback" role="status">
          Loading activity...
        </section>
      ) : null}

      {error ? (
        <section className="card feedback feedback-error" role="alert">
          <p>{error}</p>
          <button type="button" className="button" onClick={() => void loadActivity()}>
            Retry
          </button>
        </section>
      ) : null}

      {!loading && !error && visibleActivity.length === 0 ? (
        <section className="card feedback">
          {activity.length === 0
            ? "No activity has been recorded yet."
            : "No activity matches your search."}
        </section>
      ) : null}

      {!loading && !error && visibleActivity.length > 0 ? (
        <section className="card activity-list" aria-label="Activity records">
          <ul>
            {visibleActivity.map((item) => (
              <li key={item.id} className="activity-entry">
                {(() => {
                  const presentation = getActivityPresentation(item.action);

                  return (
                    <span className={`activity-icon ${presentation.tone}`} title={presentation.label}>
                      {presentation.icon}
                    </span>
                  );
                })()}
                <div>
                  <strong>{item.action || "Untitled action"}</strong>
                  <p>{item.info || "No additional details."}</p>
                </div>
                <time dateTime={item.when}>{formatActivityTime(item.when)}</time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
