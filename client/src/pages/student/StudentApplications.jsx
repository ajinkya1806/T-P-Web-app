/**
 * StudentApplications — Track own application statuses.
 * Wired to real API via React Query.
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText, Briefcase, Clock, CheckCircle, XCircle,
  Star, Search, Loader2, IndianRupee, Calendar,
} from "lucide-react";
import { getMyApplications } from "../../api";

const STATUS_CONFIG = {
  Applied:     { badge: "badge-blue",   icon: Clock,         label: "Applied"     },
  Shortlisted: { badge: "badge-yellow", icon: Star,          label: "Shortlisted" },
  Hired:       { badge: "badge-green",  icon: CheckCircle,   label: "Hired 🎉"    },
  Rejected:    { badge: "badge-red",    icon: XCircle,       label: "Rejected"    },
};

const TIMELINE_STEPS = ["Applied", "Shortlisted", "Hired"];

function Timeline({ status }) {
  const activeIdx = TIMELINE_STEPS.indexOf(status === "Rejected" ? "Applied" : status);
  const isRejected = status === "Rejected";

  return (
    <div className="flex items-center gap-0 mt-3">
      {TIMELINE_STEPS.map((step, i) => {
        const done  = !isRejected && i <= activeIdx;
        const isCur = !isRejected && i === activeIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${done
                  ? isCur
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-500/40"
                    : "bg-emerald-600/80 text-white"
                  : "bg-white/10 text-white/30"
                }`}>
                {i + 1}
              </div>
              <p className={`text-[9px] mt-1 font-medium ${done ? "text-white/50" : "text-white/20"}`}>{step}</p>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-px flex-1 mb-4 transition-colors ${i < activeIdx && !isRejected ? "bg-emerald-600/50" : "bg-white/10"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function StudentApplications() {
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myApplications"],
    queryFn:  getMyApplications,
  });

  const apps = (data?.data ?? []).filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || a.job?.title?.toLowerCase().includes(q)
      || a.job?.companyName?.toLowerCase().includes(q);
    const matchStatus = statusF === "all" || a.status === statusF;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = (data?.data ?? []).reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        <p className="text-sm text-white/40 mt-0.5">Track the status of your job applications</p>
      </div>

      {/* Summary badges */}
      {!isLoading && data?.data?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_CONFIG).map(([s, conf]) => (
            <button
              key={s}
              onClick={() => setStatusF(statusF === s ? "all" : s)}
              className={`badge ${conf.badge} ${statusF === s ? "ring-2 ring-white/20" : ""} cursor-pointer transition-all`}
            >
              {counts[s] ?? 0} {conf.label}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job or company…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm
              text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
        </div>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70
            focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        >
          <option value="all">All Status</option>
          {Object.keys(STATUS_CONFIG).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
        </div>
      )}
      {isError && (
        <div className="card border-red-500/30 bg-red-500/10 flex items-center gap-2 text-red-400 text-sm">
          <XCircle className="h-4 w-4" /> Failed to load applications
        </div>
      )}
      {!isLoading && apps.length === 0 && (
        <div className="card flex flex-col items-center py-14 text-white/30">
          <FileText className="h-12 w-12 mb-3" />
          <p className="text-sm">
            {data?.data?.length === 0 ? "You haven't applied to any jobs yet" : "No applications match your filter"}
          </p>
        </div>
      )}

      {/* Application cards */}
      <div className="space-y-4">
        {apps.map((app) => {
          const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.Applied;
          const Icon = cfg.icon;
          const isHired = app.status === "Hired";

          return (
            <div
              key={app.id}
              className={`card hover:border-white/20 transition-all duration-200
                ${isHired ? "border-emerald-500/25 bg-emerald-500/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Job info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-white text-sm">{app.job?.title ?? "Job"}</h2>
                    <span className={`badge ${cfg.badge} flex items-center gap-1`}>
                      <Icon className="h-3 w-3" /> {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400 mt-0.5">{app.job?.companyName}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/40">
                    {app.job?.packageLPA && (
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" /> {app.job.packageLPA} LPA
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Applied:{" "}
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  {/* Progress timeline */}
                  {app.status !== "Rejected" && (
                    <Timeline status={app.status} />
                  )}
                  {app.status === "Rejected" && (
                    <p className="mt-2 text-xs text-red-400/70">
                      This application was not taken forward.
                    </p>
                  )}
                </div>

                {/* Side icon */}
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
                  ${isHired ? "bg-emerald-500/15" : "bg-white/5"}`}>
                  <Briefcase className={`h-5 w-5 ${isHired ? "text-emerald-400" : "text-white/30"}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
