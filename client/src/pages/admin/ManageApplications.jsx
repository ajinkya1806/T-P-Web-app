/**
 * ManageApplications — Admin view of ALL applications grouped by job.
 * Admins can Shortlist / Reject / Hire applicants in one place.
 * Wired to real API via React Query.
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Briefcase, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Star, Loader2,
  Search, Link2, FileText,
} from "lucide-react";
import { getJobs, getApplicationsForJob, updateApplicationStatus } from "../../api";
import { useToast } from "../../context/ToastContext";

const STATUS_OPTIONS = ["Applied", "Shortlisted", "Hired", "Rejected"];

const STATUS_STYLE = {
  Applied:     "badge badge-blue",
  Shortlisted: "badge badge-yellow",
  Hired:       "badge badge-green",
  Rejected:    "badge badge-red",
};

// ── Status Dropdown ───────────────────────────────────────────────────────────
function StatusDropdown({ appId, current, onUpdate, isUpdating }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isUpdating}
        className={`${STATUS_STYLE[current] ?? "badge badge-gray"} flex items-center gap-1 cursor-pointer`}
      >
        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        {current}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-7 z-20 bg-[#1a1d27] border border-white/10 rounded-xl shadow-xl w-36 overflow-hidden">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { onUpdate(appId, s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors
                ${s === current
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Job Applicants Panel ──────────────────────────────────────────────────────
function JobApplicantsPanel({ job }) {
  const toast = useToast();
  const qc    = useQueryClient();
  const [open, setOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobApplications", job._id],
    queryFn:  () => getApplicationsForJob(job._id),
    enabled:  open,
  });

  const apps = data?.data?.applications ?? [];
  const counts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateApplicationStatus(id, status),
    onMutate: ({ id }) => setUpdatingId(id),
    onSettled: () => setUpdatingId(null),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries(["jobApplications", job._id]);
      qc.invalidateQueries(["adminStats"]);
      toast(`Status updated to "${status}"`, "success");
    },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to update", "error"),
  });

  return (
    <div className="card !p-0">
      {/* Job header — click to expand */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left ${open ? "rounded-t-[15px]" : "rounded-[15px]"}`}
      >
        <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
          <Briefcase className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{job.title}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {job.companyName} · ₹{job.packageLPA} LPA
          </p>
        </div>
        {/* Counts row */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(counts).map(([s, n]) => (
            <span key={s} className={`${STATUS_STYLE[s] ?? "badge badge-gray"} text-[10px]`}>
              {n} {s}
            </span>
          ))}
          {!open && (
            <span className="badge badge-gray text-[10px]">
              {apps.length || "?"} applicant{apps.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-white/40 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-white/5 rounded-b-[15px] overflow-visible">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 px-5 py-4 text-red-400 text-sm">
              <XCircle className="h-4 w-4" /> Failed to load applicants
            </div>
          ) : apps.length === 0 ? (
            <div className="px-5 py-6 text-sm text-white/30 text-center">
              No applications yet
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/3">
                <tr className="text-xs uppercase tracking-widest text-white/30">
                  <th className="px-5 py-3 text-left font-medium">Student</th>
                  <th className="px-5 py-3 text-left font-medium">Branch / CGPA</th>
                  <th className="px-5 py-3 text-left font-medium">Applied</th>
                  <th className="px-5 py-3 text-left font-medium">Resume</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apps.map((app, i) => (
                  <tr key={app.id} className={`hover:bg-white/2 transition-colors ${i === apps.length - 1 ? "rounded-b-[15px]" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-white text-sm">{app.student?.name}</p>
                      <p className="text-white/40 text-xs">{app.student?.email}</p>
                      {app.student?.prn && (
                        <p className="text-white/30 text-xs">{app.student.prn}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-white/50 text-xs">
                      {app.student?.branch || "—"} · CGPA {app.student?.cgpa ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {app.student?.resumeUrl ? (
                        <a
                          href={app.student.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Link2 className="h-3 w-3" /> View
                        </a>
                      ) : (
                        <span className="text-xs text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusDropdown
                        appId={app.id}
                        current={app.status}
                        onUpdate={(id, status) => statusMut.mutate({ id, status })}
                        isUpdating={updatingId === app.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ManageApplications() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn:  () => getJobs(),
  });

  const jobs = (data?.data ?? []).filter((j) => {
    const q = search.toLowerCase();
    return !q || j.title?.toLowerCase().includes(q) || j.companyName?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Review and manage applicants by job posting
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by job title or company…"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm
            text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        />
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
        </div>
      )}
      {isError && (
        <div className="card border-red-500/30 bg-red-500/10 flex items-center gap-2 text-red-400 text-sm">
          <XCircle className="h-4 w-4" /> Failed to load job postings
        </div>
      )}
      {!isLoading && jobs.length === 0 && (
        <div className="card flex flex-col items-center py-14 text-white/30">
          <FileText className="h-12 w-12 mb-3" />
          <p className="text-sm">No job postings found</p>
        </div>
      )}

      {/* Job expandable panels */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <JobApplicantsPanel key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
