/**
 * StudentJobs — Browse active jobs and apply with eligibility awareness.
 * Wired to real API via React Query.
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Briefcase, IndianRupee, Calendar, GraduationCap, CheckCircle, Loader2, XCircle, Send } from "lucide-react";
import { getJobs, applyToJob, getMyApplications } from "../../api";
import { useToast } from "../../context/ToastContext";

export function StudentJobs() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: jobsData, isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn:  () => getJobs({ status: "Active" }),
  });

  // Fetch existing applications to know what's already applied
  const { data: appsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn:  getMyApplications,
  });

  const jobs = (jobsData?.data ?? []).filter((j) => {
    const q = search.toLowerCase();
    return !q || j.title?.toLowerCase().includes(q) || j.companyName?.toLowerCase().includes(q);
  });

  const appliedJobIds = new Set(
    (appsData?.data ?? []).map((a) => a.job?.id).filter(Boolean)
  );

  const applyMut = useMutation({
    mutationFn: (jobId) => applyToJob(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries(["myApplications"]);
      toast("Application submitted successfully!", "success");
    },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to apply", "error"),
  });

  const statusBadge = (jobId) => {
    const app = (appsData?.data ?? []).find((a) => a.job?.id === jobId);
    if (!app) return null;
    const colors = { Applied:"badge-blue", Shortlisted:"badge-green", Hired:"badge-green", Rejected:"badge-red" };
    return <span className={`badge ${colors[app.status] ?? "badge-gray"}`}>{app.status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Job Board</h1>
        <p className="text-sm text-white/40 mt-0.5">Active job openings for eligible students</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or company…"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" />
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>
      )}
      {isError && (
        <div className="card border-red-500/30 bg-red-500/10 flex items-center gap-2 text-red-400 text-sm">
          <XCircle className="h-4 w-4" /> Failed to load jobs
        </div>
      )}
      {!isLoading && jobs.length === 0 && (
        <div className="card flex flex-col items-center py-16 text-white/30">
          <Briefcase className="h-12 w-12 mb-3" />
          <p>No active job postings right now</p>
        </div>
      )}

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const applied = appliedJobIds.has(job._id);
          const isPending = applyMut.isPending && applyMut.variables === job._id;

          return (
            <div key={job._id} className="card hover:border-white/20 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                {/* Left: details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-white">{job.title}</h2>
                    {statusBadge(job._id)}
                  </div>
                  <p className="text-sm text-indigo-400 mt-0.5">{job.companyName}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" /> {job.packageLPA} LPA
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </span>
                    {job.eligibility?.minCgpa > 0 && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" /> Min CGPA: {job.eligibility.minCgpa}
                      </span>
                    )}
                  </div>

                  {/* Eligible branches */}
                  {job.eligibility?.branches?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.eligibility.branches.map((b) => (
                        <span key={b} className="badge badge-blue">{b}</span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {job.description && (
                    <p className="text-sm text-white/40 mt-3 line-clamp-2">{job.description}</p>
                  )}
                </div>

                {/* Apply button */}
                <div className="shrink-0">
                  {applied ? (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" /> Applied
                    </div>
                  ) : (
                    <button
                      disabled={isPending}
                      onClick={() => applyMut.mutate(job._id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                        disabled:opacity-60 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
