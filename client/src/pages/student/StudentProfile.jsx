/**
 * StudentProfile — View and edit own profile, wired to real API.
 */
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, GraduationCap, Star, Link2, Save, Loader2, Plus, X, CheckCircle } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../api";
import { useToast } from "../../context/ToastContext";

const BRANCHES = ["CS", "IT", "EXTC", "Mechanical", "Civil", "Chemical", "Electrical"];
const field = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all disabled:opacity-40";

export function StudentProfile() {
  const toast = useToast();
  const qc    = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myProfile"],
    queryFn:  getMyProfile,
  });

  const profile = data?.data;

  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState("");

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        name:      profile.name ?? "",
        prn:       profile.prn ?? "",
        branch:    profile.branch ?? "",
        year:      profile.year ?? 1,
        cgpa:      profile.cgpa ?? 0,
        skills:    profile.skills ?? [],
        resumeUrl: profile.resumeUrl ?? "",
      });
    }
  }, [profile]);

  const updateMut = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => { qc.invalidateQueries(["myProfile"]); toast("Profile saved!", "success"); },
    onError: (e) => toast(e?.response?.data?.error ?? "Failed to save", "error"),
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate({ ...form, cgpa: parseFloat(form.cgpa), year: Number(form.year) });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    </div>
  );

  if (isError || !form) return (
    <div className="card border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
      <X className="h-4 w-4" /> Failed to load profile. Is the Flask server running?
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
          <User className="h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
          <p className="text-sm text-white/40">{profile?.email}</p>
        </div>
        <span className={`ml-auto badge ${profile?.status === "Placed" ? "badge-green" : "badge-yellow"}`}>
          {profile?.status ?? "Unplaced"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Personal */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Personal Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 flex items-center gap-1">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input className={field} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </label>
              <input className={field} value={profile?.email} disabled />
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Academic Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">PRN</label>
              <input className={field} placeholder="PRN2021001" value={form.prn}
                onChange={(e) => setForm((p) => ({ ...p, prn: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Year</label>
              <select className={field} value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}>
                {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> Branch
              </label>
              <select className={field} value={form.branch}
                onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}>
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 flex items-center gap-1">
                <Star className="h-3 w-3" /> CGPA
              </label>
              <input type="number" step="0.01" min="0" max="10" className={field} value={form.cgpa}
                onChange={(e) => setForm((p) => ({ ...p, cgpa: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Skills</h2>
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter…"
              className={`${field} flex-1`} />
            <button type="button" onClick={addSkill}
              className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span key={skill}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-xs text-indigo-300">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}
                    className="text-indigo-400/50 hover:text-indigo-300 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Resume</h2>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 flex items-center gap-1">
              <Link2 className="h-3 w-3" /> Resume URL (Google Drive, Dropbox, etc.)
            </label>
            <input type="url" className={field} placeholder="https://drive.google.com/file/…"
              value={form.resumeUrl}
              onChange={(e) => setForm((p) => ({ ...p, resumeUrl: e.target.value }))} />
          </div>
          {form.resumeUrl && (
            <a href={form.resumeUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <Link2 className="h-3 w-3" /> View current resume
            </a>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" disabled={updateMut.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500
              disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20">
            {updateMut.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              : <><Save className="h-4 w-4" /> Save Profile</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
