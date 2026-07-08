/**
 * StudentEvents — View upcoming events from the real API.
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar, Clock, FileText, Search,
  Loader2, XCircle, ChevronRight,
} from "lucide-react";
import { getEvents } from "../../api";

const TYPE_STYLE = {
  PPT:       "badge badge-blue",
  Interview: "badge badge-yellow",
  Test:      "badge badge-yellow",
  Workshop:  "badge badge-blue",
  Other:     "badge badge-gray",
};

const TYPE_ICON_COLOR = {
  PPT:       "bg-blue-500/15 text-blue-400",
  Interview: "bg-amber-500/15 text-amber-400",
  Test:      "bg-amber-500/15 text-amber-400",
  Workshop:  "bg-indigo-500/15 text-indigo-400",
  Other:     "bg-white/10 text-white/40",
};

const TYPES = ["PPT", "Interview", "Test", "Workshop", "Other"];

export function StudentEvents() {
  const [search, setSearch] = useState("");
  const [typeF, setTypeF]   = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn:  () => getEvents(),
  });

  const now = new Date();

  const events = (data?.data ?? [])
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.title?.toLowerCase().includes(q);
      const matchType   = typeF === "all" || e.type === typeF;
      return matchSearch && matchType;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcoming = events.filter((e) => new Date(e.date) > now);
  const past     = events.filter((e) => new Date(e.date) <= now);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const daysUntil = (d) => {
    const diff = Math.ceil((new Date(d) - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0)  return null;
    return `In ${diff} days`;
  };

  function EventCard({ event, isPast }) {
    const until = daysUntil(event.date);
    return (
      <div className={`card hover:border-white/20 transition-all duration-200 ${isPast ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${TYPE_ICON_COLOR[event.type] ?? "bg-white/10 text-white/40"}`}>
            <Calendar className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-white text-sm">{event.title}</h2>
              <span className={TYPE_STYLE[event.type] ?? "badge badge-gray"}>{event.type}</span>
              {!isPast && until && (
                <span className="badge badge-green text-[10px]">{until}</span>
              )}
              {isPast && (
                <span className="badge badge-gray text-[10px]">Past</span>
              )}
            </div>

            {event.description && (
              <p className="text-xs text-white/40 mt-1 line-clamp-2">{event.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(event.date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-sm text-white/40 mt-0.5">Placement activities and workshops</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm
              text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
        </div>
        <select
          value={typeF}
          onChange={(e) => setTypeF(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/70
            focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        >
          <option value="all">All Types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
        </div>
      )}
      {isError && (
        <div className="card border-red-500/30 bg-red-500/10 flex items-center gap-2 text-red-400 text-sm">
          <XCircle className="h-4 w-4" /> Failed to load events
        </div>
      )}
      {!isLoading && events.length === 0 && (
        <div className="card flex flex-col items-center py-14 text-white/30">
          <Calendar className="h-12 w-12 mb-3" />
          <p className="text-sm">No events found</p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">
            Upcoming — {upcoming.length}
          </h2>
          {upcoming.map((e) => <EventCard key={e._id} event={e} isPast={false} />)}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-1">
            Past — {past.length}
          </h2>
          {past.map((e) => <EventCard key={e._id} event={e} isPast={true} />)}
        </div>
      )}
    </div>
  );
}
