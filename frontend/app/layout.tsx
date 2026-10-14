import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeeLion Frontend Assessment",
  description: "Task dashboard and activity feed modules",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="brand" aria-label="VeeLion home">
              <span className="brand-mark">V</span>
              <span>VeeLion</span>
            </Link>
            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/tasks">Tasks</Link>
              <Link href="/activity">Activity</Link>
              <Link href="/reports">Reports</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
