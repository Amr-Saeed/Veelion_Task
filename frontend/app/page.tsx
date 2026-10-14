import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <header className="page-header page-header-home">
        <p className="eyebrow">VeeLion workspace</p>
        <h1>Frontend Assessment</h1>
        <p className="muted">
          Manage tasks, review activity, and monitor progress from one place.
        </p>
      </header>

      <section className="home-grid">
        <Link href="/tasks" className="card home-card">
          <h2 style={{ marginTop: 0 }}>Task Dashboard</h2>
          <p className="muted">Update task progress and filter your current workload.</p>
        </Link>

        <Link href="/activity" className="card home-card">
          <h2 style={{ marginTop: 0 }}>Activity Feed</h2>
          <p className="muted">Search the actions recorded by the application.</p>
        </Link>

        <Link href="/reports" className="card home-card">
          <h2 style={{ marginTop: 0 }}>Reports</h2>
          <p className="muted">See task totals, status breakdowns, and recent activity.</p>
        </Link>
      </section>
    </main>
  );
}
