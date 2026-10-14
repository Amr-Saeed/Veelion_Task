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
        <div className="hero-rule" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <section className="home-grid">
        <Link href="/tasks" className="card home-card">
          <span className="home-card-icon home-card-icon-teal" aria-hidden="true">✓</span>
          <h2>Task Dashboard</h2>
          <p className="muted">Update task progress and filter your current workload.</p>
          <span className="card-link">Open dashboard <span aria-hidden="true">→</span></span>
        </Link>

        <Link href="/activity" className="card home-card">
          <span className="home-card-icon home-card-icon-amber" aria-hidden="true">↗</span>
          <h2>Activity Feed</h2>
          <p className="muted">Search the actions recorded by the application.</p>
          <span className="card-link">View activity <span aria-hidden="true">→</span></span>
        </Link>

        <Link href="/reports" className="card home-card">
          <span className="home-card-icon home-card-icon-purple" aria-hidden="true">▥</span>
          <h2>Reports</h2>
          <p className="muted">See task totals, status breakdowns, and recent activity.</p>
          <span className="card-link">View reports <span aria-hidden="true">→</span></span>
        </Link>
      </section>
    </main>
  );
}
