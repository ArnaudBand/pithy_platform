"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  ChevronDown,
  ChevronUp,
  User,
  Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminScenarioResult {
  scenarioAssessmentId: string;
  userId: string;
  userEmail: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string | null;
  completedAt: string | null;
  questionsAnswered: number;
  personalityType: string | null;
}

type SortField = "userEmail" | "status" | "questionsAnswered" | "completedAt" | "personalityType";

const TOTAL_QUESTIONS = 20; // total scenario questions

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  if (status === "COMPLETED")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 size={11} /> Completed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock size={11} /> In Progress
    </span>
  );
}

function personalityBadge(code: string | null) {
  if (!code) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
      <Brain size={11} /> {code}
    </span>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScenarioAssessmentResultsPage() {
  const [rows, setRows] = useState<AdminScenarioResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS">("ALL");
  const [filterPersonality, setFilterPersonality] = useState("ALL");

  // Sort
  const [sortField, setSortField] = useState<SortField>("completedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/scenario-assessments");
      if (!res.ok) throw new Error("Failed to load scenario assessment results");
      const data = await res.json();
      // Backend returns a Spring Page object; extract the content array
      setRows(Array.isArray(data) ? data : (data.content ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const allTypes = Array.from(
    new Set(rows.map((r) => r.personalityType).filter(Boolean))
  ).sort() as string[];

  const filtered = rows
    .filter((r) =>
      search === "" ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (r.personalityType?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )
    .filter((r) => filterStatus === "ALL" || r.status === filterStatus)
    .filter((r) => filterPersonality === "ALL" || r.personalityType === filterPersonality)
    .sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      switch (sortField) {
        case "userEmail": av = a.userEmail; bv = b.userEmail; break;
        case "status": av = a.status; bv = b.status; break;
        case "questionsAnswered": av = a.questionsAnswered; bv = b.questionsAnswered; break;
        case "completedAt": av = a.completedAt ?? ""; bv = b.completedAt ?? ""; break;
        case "personalityType": av = a.personalityType ?? ""; bv = b.personalityType ?? ""; break;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const stats = {
    total: rows.length,
    completed: rows.filter((r) => r.status === "COMPLETED").length,
    inProgress: rows.filter((r) => r.status === "IN_PROGRESS").length,
    typeCounts: allTypes.reduce<Record<string, number>>((acc, t) => {
      acc[t] = rows.filter((r) => r.personalityType === t).length;
      return acc;
    }, {}),
  };

  // ── Sort toggle ───────────────────────────────────────────────────────────

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === "asc"
        ? <ChevronUp size={13} className="inline ml-0.5" />
        : <ChevronDown size={13} className="inline ml-0.5" />
      : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={20} className="text-violet-600" />
          <h1 className="text-2xl font-bold text-slate-800">Scenario Assessment Results</h1>
        </div>
        <p className="text-sm text-slate-500">
          View who completed the paid scenario personality assessment, their progress, and their result.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Scenario Assessments</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-amber-500">{stats.inProgress}</p>
          <p className="text-xs text-slate-500 mt-1">In Progress</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-violet-600">{allTypes.length}</p>
          <p className="text-xs text-slate-500 mt-1">Unique Types</p>
        </div>
      </div>

      {/* Personality type breakdown */}
      {allTypes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Brain size={15} /> Personality Type Distribution
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilterPersonality((prev) => (prev === t ? "ALL" : t))}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterPersonality === t
                    ? "bg-violet-600 text-white"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                {t}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  filterPersonality === t ? "bg-violet-500 text-white" : "bg-violet-200 text-violet-800"
                }`}>
                  {stats.typeCounts[t]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or type…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
        <span className="text-sm text-slate-500 self-center ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort("userEmail")}
                >
                  User <SortIcon field="userEmail" />
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none w-28"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon field="status" />
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none w-36 text-center"
                  onClick={() => toggleSort("questionsAnswered")}
                >
                  Progress <SortIcon field="questionsAnswered" />
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none w-28"
                  onClick={() => toggleSort("personalityType")}
                >
                  Result <SortIcon field="personalityType" />
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none w-40"
                  onClick={() => toggleSort("completedAt")}
                >
                  Completed At <SortIcon field="completedAt" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-10">
                    No scenario assessments match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const pct = Math.round((r.questionsAnswered / TOTAL_QUESTIONS) * 100);
                return (
                  <tr key={r.scenarioAssessmentId} className="hover:bg-slate-50 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-violet-500" />
                        </div>
                        <div>
                          <p className="text-slate-800 font-medium text-xs truncate max-w-[180px]">
                            {r.userEmail}
                          </p>
                          <p className="text-slate-400 text-[10px]">
                            Started: {fmt(r.startedAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>

                    {/* Progress bar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[60px]">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              r.status === "COMPLETED" ? "bg-violet-500" : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 whitespace-nowrap">
                          {r.questionsAnswered}/{TOTAL_QUESTIONS}
                        </span>
                      </div>
                    </td>

                    {/* Personality type */}
                    <td className="px-4 py-3">{personalityBadge(r.personalityType)}</td>

                    {/* Completed at */}
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {fmt(r.completedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
