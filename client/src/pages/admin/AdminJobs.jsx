/**
 * AdminJobs — Full CRUD for job postings, wired to real API via React Query.
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Briefcase, Loader2, XCircle, ChevronDown } from "lucide-react";
import { getJobs, createJob, updateJob, deleteJob } from "../../api";
import { useToast } from "../../context/ToastContext";

// ── Inline Modal ──────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1d27] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Job Form ──────────────────────────────────────────────────────────────────
const BRANCHES = ["CS", "IT", "EXTC", "Mechanical", "Civil", "Chemical", "Electrical"];

function JobForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    companyName: initial?.companyName ?? "",
    title:       initial?.title ?? "",
    description: initial?.description ?? "",
    packageLPA:  initial?.packageLPA ?? "",
    minCgpa:     initial?.eligibility?.minCgpa ?? "",
    branches:    initial?.eligibility?.branches ?? [],
    deadline:    initial?.deadline ? initial.deadline.split("T")[0] : "",
    status:      initial?.status ?? "Active",
  });

  const toggleBranch = (b) =>
    setForm((p) => ({
      ...p,
      branches: p.branches.includes(b) ? p.branches.filter((x) => x !== b) : [...p.branches, b],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      companyName: form.companyName,
      title:       form.title,
      description: form.description,
      packageLPA:  parseFloat(form.packageLPA),
      eligibility: { minCgpa: parseFloat(form.minCgpa || 0), branches: form.branches },
      deadline:    new Date(form.deadline).toISOString(),
      status:      form.status,
    });
  };

  const field = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Company Name *</label>
          <input required className={field} placeholder="e.g. Google" value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Job Title *</label>
          <input required className={field} placeholder="e.g. Software Engineer" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Package (LPA) *</label>
          <input required type="number" step="0.1" min="0" className={field} placeholder="e.g. 12" value={form.packageLPA}
            onChange={(e) => setForm({ ...form, packageLPA: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Min CGPA</label>
          <input type="number" step="0.1" min="0" max="10" className={field} placeholder="e.g. 7.0" value={form.minCgpa}
            onChange={(e) => setForm({ ...form, minCgpa: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Application Deadline *</label>
          <input required type="date" className={field} value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Status</label>
          <select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Eligible Branches (leave empty for all)</label>
          <div className="flex flex-wrap gap-1.5">
            {BRANCHES.map((b) => (
              <button key={b} type="button"
                onClick={() => toggleBranch(b)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  form.branches.includes(b)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                }`}
              >{b}</button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Description</label>
          <textarea rows={3} className={field} placeholder="Role description..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Save Changes" : "Post Job"}
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminJobs() {
  const toast = useToast();
  const qc    = useQueryClient();

  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [modalOpen, setModal]   = useState(false);
  const [editing, setEditing]   = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn:  () => getJobs(),
  });

  const jobs = (data?.data ?? []).filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.companyName?.toLowerCase().includes(q);
    const matchStatus = statusF === "all" || j.status === statusF;
    return matchSearch && matchStatus;
  });

  const createMut = useMutation({
    mutationFn: createJob,
    onSuccess: () => { qc.invalidateQueries(["jobs"]); toast("Job posted!", "success"); setModal(false); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to post job", "error"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => { qc.invalidateQueries(["jobs"]); toast("Job updated!", "success"); setModal(false); setEditing(null); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to update job", "error"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => { qc.invalidateQueries(["jobs"]); toast("Job deleted", "success"); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to delete job", "error"),
  });

  const handleSubmit = (formData) => {
    if (editing) updateMut.mutate({ id: editing._id, data: formData });
    else         createMut.mutate(formData);
  };

  const handleDelete = (job) => {
    if (!window.confirm(`Delete "${job.title}" at ${job.companyName}?`)) return;
    deleteMut.mutate(job._id);
  };

  const statusBadge = (s) => ({
    Active: "badge badge-green",
    Closed: "badge badge-red",
  }[s] ?? "badge badge-gray");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Postings</h1>
          <p className="text-sm text-white/40 mt-0.5">{jobs.length} posting{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" /> Post New Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" />
        </div>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : isError ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-400 text-sm">
            <XCircle className="h-5 w-5" /> Failed to load jobs
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <Briefcase className="h-10 w-10 mb-3" />
            <p className="text-sm">No jobs found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs uppercase tracking-widest text-white/30">
                <th className="px-5 py-4 font-medium">Job</th>
                <th className="px-5 py-4 font-medium">Package</th>
                <th className="px-5 py-4 font-medium">Deadline</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{job.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{job.companyName}</p>
                  </td>
                  <td className="px-5 py-4 text-white/60">₹{job.packageLPA} LPA</td>
                  <td className="px-5 py-4 text-white/60">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusBadge(job.status)}>{job.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setEditing(job); setModal(true); }}
                        className="text-white/40 hover:text-indigo-400 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(job)}
                        className="text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModal(false); setEditing(null); }}
        title={editing ? "Edit Job" : "Post New Job"}>
        <JobForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setModal(false); setEditing(null); }}
          isSubmitting={createMut.isPending || updateMut.isPending}
        />
      </Modal>
    </div>
  );
}
