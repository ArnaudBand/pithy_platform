"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminAssessmentResult {
  assessmentId: string;
  userId: string;
  userEmail: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string | null;
  completedAt: string | null;
  questionsAnswered: number;
  personalityType: string | null;
  enrolledCourses: string[];
}

type SortField = "userEmail" | "status" | "questionsAnswered" | "completedAt" | "personalityType";

const TOTAL_QUESTIONS = 60; // total questions in the assessment

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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
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

export default function AssessmentResultsPage() {
  const [rows, setRows] = useState<AdminAssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS">("ALL");
  const [filterPersonality, setFilterPersonality] = useState("ALL");

  // Sort
  const [sortField, setSortField] = useState<SortField>("completedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Expanded row (shows courses)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/assessments");
      if (!res.ok) throw new Error("Failed to load assessment results");
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
        <h1 className="text-2xl font-bold text-slate-800">Assessment Results</h1>
        <p className="text-sm text-slate-500 mt-1">
          View who took the personality assessment, how many questions they answered, their result, and which courses they are enrolled in.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Assessments</p>
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
          <p className="text-3xl font-bold text-indigo-600">{allTypes.length}</p>
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
                onClick={() =>
                  setFilterPersonality((prev) => (prev === t ? "ALL" : t))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterPersonality === t
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {t}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  filterPersonality === t ? "bg-indigo-500 text-white" : "bg-indigo-200 text-indigo-800"
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
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
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
                <th className="px-4 py-3 w-6" />
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
                  className="px-4 py-3 font-medium cursor-pointer select-none w-32 text-center"
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
                <th className="px-4 py-3 font-medium w-32">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-10">
                    No assessments match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const isExpanded = expandedId === r.assessmentId;
                const pct = Math.round((r.questionsAnswered / TOTAL_QUESTIONS) * 100);
                return (
                  <>
                    <tr
                      key={r.assessmentId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Expand toggle */}
                      <td className="px-4 py-3">
                        {r.enrolledCourses.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : r.assessmentId)
                            }
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown size={15} />
                            ) : (
                              <ChevronRight size={15} />
                            )}
                          </button>
                        )}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <User size={13} className="text-slate-500" />
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
                                r.status === "COMPLETED"
                                  ? "bg-green-500"
                                  : "bg-amber-400"
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

                      {/* Courses */}
                      <td className="px-4 py-3">
                        {r.enrolledCourses.length === 0 ? (
                          <span className="text-slate-400 text-xs">No courses</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                            <BookOpen size={12} />
                            {r.enrolledCourses.length} course
                            {r.enrolledCourses.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded: course list */}
                    {isExpanded && r.enrolledCourses.length > 0 && (
                      <tr key={`${r.assessmentId}-expanded`} className="bg-slate-50">
                        <td colSpan={7} className="px-8 pb-4 pt-2">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                            Enrolled Courses
                          </p>
                          <ul className="space-y-1">
                            {r.enrolledCourses.map((c, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm text-slate-700"
                              >
                                <BookOpen size={13} className="text-green-500 flex-shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
