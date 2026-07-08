/**
 * AdminHome — Dashboard with real stats from /api/admin/stats
 * Uses React Query for fetching and caching.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, Briefcase, TrendingUp, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getAdminStats } from "../../api";

function StatCard({ title, value, icon: Icon, color, sub, to }) {
  const card = (
    <div className={`card flex items-start gap-4 hover:border-white/20 transition-all duration-200 group`}>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value ?? "—"}</p>
        {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export function AdminHome() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
    refetchInterval: 30000,
  });

  const stats = data?.data;

  const cards = [
    {
      title: "Total Students",
      value: isLoading ? "…" : stats?.totalStudents ?? 0,
      icon: Users,
      color: "bg-indigo-600",
      sub: `${stats?.placedStudents ?? 0} placed`,
      to: "/admin/students",
    },
    {
      title: "Placement Rate",
      value: isLoading ? "…" : stats?.totalStudents
        ? `${Math.round((stats.placedStudents / stats.totalStudents) * 100)}%`
        : "N/A",
      icon: TrendingUp,
      color: "bg-emerald-600",
      sub: `${stats?.unplacedStudents ?? 0} unplaced`,
    },
    {
      title: "Active Jobs",
      value: isLoading ? "…" : stats?.activeJobs ?? 0,
      icon: Briefcase,
      color: "bg-amber-600",
      sub: "open postings",
      to: "/admin/jobs",
    },
    {
      title: "Total Applications",
      value: isLoading ? "…" : stats?.totalApplications ?? 0,
      icon: CheckCircle,
      color: "bg-blue-600",
      sub: "all time",
      to: "/admin/applications",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Real-time placement overview</p>
      </div>

      {/* Error state */}
      {isError && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          Failed to load statistics. Is the Flask server running?
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placed vs Unplaced */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Placement Breakdown</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Placed", value: stats?.placedStudents ?? 0, color: "bg-emerald-500" },
                { label: "Unplaced", value: stats?.unplacedStudents ?? 0, color: "bg-amber-500" },
              ].map(({ label, value, color }) => {
                const total = (stats?.totalStudents || 1);
                const pct = Math.round((value / total) * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{label}</span>
                      <span className="text-white font-medium">{value} <span className="text-white/40">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Manage Students", to: "/admin/students", icon: Users },
              { label: "Post a Job", to: "/admin/jobs", icon: Briefcase },
              { label: "Schedule Event", to: "/admin/events", icon: Calendar },
              { label: "Review Applications", to: "/admin/applications", icon: CheckCircle },
            ].map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10
                  text-sm text-white/70 hover:text-white transition-all duration-150"
              >
                <Icon className="h-4 w-4 text-indigo-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
