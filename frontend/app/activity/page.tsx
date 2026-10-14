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
        <Link href="/" className="button">
          Back
        </Link>
      </nav>

      <header className="card page-header">
        <p className="eyebrow">History</p>
        <h1>Activity Feed</h1>
        <p className="muted">Review the latest actions recorded by the application.</p>
      </header>

      <section className="card activity-toolbar" aria-label="Activity controls">
        <label className="input-label" htmlFor="activity-search">
          Search activity
        </label>
        <input
          id="activity-search"
          className="input"
          placeholder="Search by action or details"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
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
