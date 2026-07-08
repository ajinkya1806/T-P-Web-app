/**
 * AdminEvents — Full CRUD for events, wired to real API via React Query.
 * Event types: PPT | Interview | Test | Workshop | Other
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Edit, Trash2, Calendar,
  Loader2, XCircle,
} from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../api";
import { useToast } from "../../context/ToastContext";

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1d27] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
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

const TYPES = ["PPT", "Interview", "Test", "Workshop", "Other"];
const field = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all";

// ── Event Form ────────────────────────────────────────────────────────────────
function EventForm({ initial, onSubmit, onCancel, isSubmitting }) {
  // Extract local date/time from ISO string for the inputs
  const initDate = initial?.date ? initial.date.slice(0, 10) : "";
  const initTime = initial?.date ? initial.date.slice(11, 16) : "10:00";

  const [form, setForm] = useState({
    title:       initial?.title ?? "",
    type:        initial?.type  ?? "PPT",
    date:        initDate,
    time:        initTime,
    description: initial?.description ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isoDate = form.date && form.time
      ? new Date(`${form.date}T${form.time}:00`).toISOString()
      : null;
    if (!isoDate) return;
    onSubmit({ title: form.title, type: form.type, date: isoDate, description: form.description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-white/50 mb-1">Event Title *</label>
        <input required className={field} placeholder="e.g. TCS Pre-Placement Talk" value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1">Event Type *</label>
        <select required className={field} value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Date *</label>
          <input required type="date" className={field} value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Time *</label>
          <input required type="time" className={field} value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1">Description</label>
        <textarea rows={3} className={field} placeholder="Brief description of the event…" value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}

// ── Type badge colours ────────────────────────────────────────────────────────
const TYPE_BADGE = {
  PPT:       "badge badge-blue",
  Interview: "badge badge-yellow",
  Test:      "badge badge-yellow",
  Workshop:  "badge badge-blue",
  Other:     "badge badge-gray",
};

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminEvents() {
  const toast = useToast();
  const qc    = useQueryClient();

  const [search, setSearch]   = useState("");
  const [typeF, setTypeF]     = useState("all");
  const [modal, setModal]     = useState(null); // null | "add" | event-object

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn:  () => getEvents(),
  });

  const events = (data?.data ?? []).filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.title?.toLowerCase().includes(q);
    const matchType   = typeF === "all" || e.type === typeF;
    return matchSearch && matchType;
  });

  // Sort upcoming first
  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  const createMut = useMutation({
    mutationFn: createEvent,
    onSuccess: () => { qc.invalidateQueries(["events"]); toast("Event created!", "success"); setModal(null); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to create event", "error"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => { qc.invalidateQueries(["events"]); toast("Event updated!", "success"); setModal(null); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to update event", "error"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => { qc.invalidateQueries(["events"]); toast("Event deleted", "success"); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to delete event", "error"),
  });

  const handleSubmit = (formData) => {
    if (modal && modal !== "add") updateMut.mutate({ id: modal._id, data: formData });
    else createMut.mutate(formData);
  };

  const isUpcoming = (date) => new Date(date) > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-sm text-white/40 mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60" />
        </div>
        <select value={typeF} onChange={(e) => setTypeF(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/60">
          <option value="all">All Types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : isError ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-400 text-sm">
            <XCircle className="h-5 w-5" /> Failed to load events
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <Calendar className="h-10 w-10 mb-3" />
            <p className="text-sm">No events found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs uppercase tracking-widest text-white/30">
                <th className="px-5 py-4 font-medium">Event</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Date &amp; Time</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((ev) => (
                <tr key={ev._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{ev.title}</p>
                    {ev.description && (
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{ev.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={TYPE_BADGE[ev.type] ?? "badge badge-gray"}>{ev.type}</span>
                  </td>
                  <td className="px-5 py-4 text-white/60 text-xs">
                    {ev.date
                      ? new Date(ev.date).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={isUpcoming(ev.date) ? "badge badge-green" : "badge badge-gray"}>
                      {isUpcoming(ev.date) ? "Upcoming" : "Past"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModal(ev)}
                        className="text-white/40 hover:text-indigo-400 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Delete "${ev.title}"?`)) deleteMut.mutate(ev._id); }}
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
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal && modal !== "add" ? "Edit Event" : "Create New Event"}
      >
        <EventForm
          initial={modal !== "add" ? modal : null}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          isSubmitting={createMut.isPending || updateMut.isPending}
        />
      </Modal>
    </div>
  );
}
