/**
 * AdminStudents — View & manage students, wired to real API via React Query.
 * Add students via the auth endpoint; edit profile data inline.
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Users, Loader2, XCircle, CheckCircle } from "lucide-react";
import { getStudents, updateStudent, deleteStudent, registerStudent } from "../../api";
import { useToast } from "../../context/ToastContext";

// ── Modal ─────────────────────────────────────────────────────────────────────
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

const field = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all";
const BRANCHES = ["CS", "IT", "EXTC", "Mechanical", "Civil", "Chemical", "Electrical"];

// ── Add Student Form ──────────────────────────────────────────────────────────
function AddStudentForm({ onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", prn:"", branch:"CS", year:3 });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Full Name *</label>
          <input required className={field} placeholder="Student name" value={form.name} onChange={set("name")} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Email *</label>
          <input required type="email" className={field} placeholder="student@college.edu" value={form.email} onChange={set("email")} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Password *</label>
          <input required type="password" className={field} placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">PRN</label>
          <input className={field} placeholder="PRN2021001" value={form.prn} onChange={set("prn")} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Year</label>
          <select className={field} value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}>
            {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Branch</label>
          <select className={field} value={form.branch} onChange={set("branch")}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Add Student
        </button>
      </div>
    </form>
  );
}

// ── Edit Student Form ─────────────────────────────────────────────────────────
function EditStudentForm({ student, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    name:      student.name ?? "",
    branch:    student.branch ?? "",
    year:      student.year ?? 1,
    cgpa:      student.cgpa ?? 0,
    prn:       student.prn ?? "",
    resumeUrl: student.resumeUrl ?? "",
    status:    student.status ?? "Unplaced",
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Full Name</label>
          <input className={field} value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Branch</label>
          <select className={field} value={form.branch} onChange={set("branch")}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Year</label>
          <select className={field} value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}>
            {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">CGPA</label>
          <input type="number" step="0.1" min="0" max="10" className={field} value={form.cgpa}
            onChange={(e) => setForm((p) => ({ ...p, cgpa: parseFloat(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Placement Status</label>
          <select className={field} value={form.status} onChange={set("status")}>
            <option>Unplaced</option>
            <option>Placed</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">PRN</label>
          <input className={field} value={form.prn} onChange={set("prn")} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-white/50 mb-1">Resume URL</label>
          <input type="url" className={field} placeholder="https://drive.google.com/..." value={form.resumeUrl} onChange={set("resumeUrl")} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminStudents() {
  const toast = useToast();
  const qc    = useQueryClient();

  const [search, setSearch]   = useState("");
  const [branchF, setBranchF] = useState("all");
  const [modal, setModal]     = useState(null); // null | "add" | student-object

  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn:  () => getStudents(),
  });

  const students = (data?.data ?? []).filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.prn?.toLowerCase().includes(q);
    const matchBranch = branchF === "all" || s.branch === branchF;
    return matchSearch && matchBranch;
  });

  const addMut = useMutation({
    mutationFn: registerStudent,
    onSuccess: () => { qc.invalidateQueries(["students"]); toast("Student added!", "success"); setModal(null); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to add student", "error"),
  });

  const editMut = useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => { qc.invalidateQueries(["students"]); toast("Student updated!", "success"); setModal(null); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to update", "error"),
  });

  const delMut = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => { qc.invalidateQueries(["students"]); toast("Student removed", "success"); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to delete", "error"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-sm text-white/40 mt-0.5">{students.length} student{students.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, PRN…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" />
        </div>
        <select value={branchF} onChange={(e) => setBranchF(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
          <option value="all">All Branches</option>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : isError ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-400 text-sm"><XCircle className="h-5 w-5" /> Failed to load students</div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <Users className="h-10 w-10 mb-3" /><p className="text-sm">No students found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs uppercase tracking-widest text-white/30">
                <th className="px-5 py-4 font-medium">Student</th>
                <th className="px-5 py-4 font-medium">Branch / Year</th>
                <th className="px-5 py-4 font-medium">CGPA</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{s.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.email} {s.prn && `• ${s.prn}`}</p>
                  </td>
                  <td className="px-5 py-4 text-white/60">{s.branch || "—"} {s.year ? `· Y${s.year}` : ""}</td>
                  <td className="px-5 py-4 text-white/60">{s.cgpa ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={s.status === "Placed" ? "badge badge-green" : "badge badge-yellow"}>
                      {s.status ?? "Unplaced"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModal(s)} className="text-white/40 hover:text-indigo-400 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if (window.confirm(`Delete ${s.name}?`)) delMut.mutate(s.id); }}
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

      {/* Add Modal */}
      <Modal isOpen={modal === "add"} onClose={() => setModal(null)} title="Add New Student">
        <AddStudentForm onSubmit={(d) => addMut.mutate(d)} onCancel={() => setModal(null)} isSubmitting={addMut.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal && modal !== "add"} onClose={() => setModal(null)} title="Edit Student">
        {modal && modal !== "add" && (
          <EditStudentForm student={modal}
            onSubmit={(d) => editMut.mutate({ id: modal.id, data: d })}
            onCancel={() => setModal(null)}
            isSubmitting={editMut.isPending} />
        )}
      </Modal>
    </div>
  );
}
