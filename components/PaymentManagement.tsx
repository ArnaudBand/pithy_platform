"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  CreditCard, CheckCircle2, XCircle, Clock,
  Search, X, RefreshCw, TrendingUp, BookOpen, Brain,
  ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle,
  Calendar, Hash, Zap,
} from "lucide-react";
import {
  getAdminCoursePayments,
  getAdminScenarioPayments,
  getAdminPaymentSummary,
  AdminCoursePaymentDTO,
  AdminScenarioPaymentDTO,
  AdminPaymentSummaryDTO,
  PaymentStatus,
} from "@/lib/actions/payment.actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const fmtDateTime = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
};

const fmtMoney = (amount: number, currency = "UGX") => {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
    .format(amount) + " " + currency;
};

const statusMeta: Record<PaymentStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  SUCCESSFUL: { label: "Successful", bg: "bg-green-100",  text: "text-green-700",  icon: <CheckCircle2 size={11} /> },
  PENDING:    { label: "Pending",    bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={11} /> },
  FAILED:     { label: "Failed",     bg: "bg-red-100",    text: "text-red-600",    icon: <XCircle size={11} /> },
  CANCELLED:  { label: "Cancelled",  bg: "bg-gray-100",   text: "text-gray-500",   icon: <XCircle size={11} /> },
};

type CourseSort = "userEmail" | "courseTitle" | "amount" | "status" | "createdAt" | "completedAt";
type SortDir = "asc" | "desc";

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, icon, color,
}: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) => (
  <div className={`rounded-xl border p-4 flex items-start gap-3 ${color}`}>
    <div className="mt-0.5 opacity-80">{icon}</div>
    <div>
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

export default function PaymentManagement() {
  const [coursePayments, setCoursePayments]   = useState<AdminCoursePaymentDTO[]>([]);
  const [scenarioPayments, setScenarioPayments] = useState<AdminScenarioPaymentDTO[]>([]);
  const [summary, setSummary]                 = useState<AdminPaymentSummaryDTO | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [, startTransition]                   = useTransition();

  // Tab
  const [tab, setTab] = useState<"course" | "scenario">("course");

  // Course filters
  const [courseSearch, setCourseSearch]           = useState("");
  const [statusFilter, setStatusFilter]           = useState<PaymentStatus | "ALL">("ALL");
  const [courseSort, setCourseSort]               = useState<CourseSort>("createdAt");
  const [courseSortDir, setCourseSortDir]         = useState<SortDir>("desc");

  // Scenario filters
  const [scenarioSearch, setScenarioSearch] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    startTransition(async () => {
      const [cp, sp, sm] = await Promise.all([
        getAdminCoursePayments(),
        getAdminScenarioPayments(),
        getAdminPaymentSummary(),
      ]);
      if (!cp.success) toast.error(cp.message);
      else setCoursePayments(cp.payments);
      if (!sp.success) toast.error(sp.message);
      else setScenarioPayments(sp.payments);
      if (!sm.success) toast.error(sm.message);
      else setSummary(sm.summary);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Course sort ───────────────────────────────────────────────────────────
  const toggleCourseSort = (field: CourseSort) => {
    if (courseSort === field) setCourseSortDir(d => d === "asc" ? "desc" : "asc");
    else { setCourseSort(field); setCourseSortDir("asc"); }
  };

  const CourseSortIcon = ({ field }: { field: CourseSort }) => {
    if (courseSort !== field) return <ChevronsUpDown size={12} className="text-gray-400 ml-1" />;
    return courseSortDir === "asc"
      ? <ChevronUp size={12} className="text-green-600 ml-1" />
      : <ChevronDown size={12} className="text-green-600 ml-1" />;
  };

  // ── Filtered course payments ───────────────────────────────────────────────
  const filteredCourse = useMemo(() => {
    let list = [...coursePayments];
    const q = courseSearch.toLowerCase();
    if (q) list = list.filter(p =>
      p.userEmail.toLowerCase().includes(q) ||
      p.courseTitle.toLowerCase().includes(q) ||
      p.transactionReference.toLowerCase().includes(q) ||
      (p.flutterwaveTransactionId ?? "").toLowerCase().includes(q)
    );
    if (statusFilter !== "ALL") list = list.filter(p => p.status === statusFilter);
    list.sort((a, b) => {
      const av = a[courseSort] ?? "";
      const bv = b[courseSort] ?? "";
      if (av < bv) return courseSortDir === "asc" ? -1 : 1;
      if (av > bv) return courseSortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [coursePayments, courseSearch, statusFilter, courseSort, courseSortDir]);

  // ── Filtered scenario payments ─────────────────────────────────────────────
  const filteredScenario = useMemo(() => {
    const q = scenarioSearch.toLowerCase();
    if (!q) return scenarioPayments;
    return scenarioPayments.filter(p =>
      p.userEmail.toLowerCase().includes(q) ||
      (p.transactionRef ?? "").toLowerCase().includes(q)
    );
  }, [scenarioPayments, scenarioSearch]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <CreditCard size={28} className="text-green-600" />
            Payment Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            All course payments and scenario assessment purchases, with full transaction details.
          </p>
          <div className="mt-3 h-1 w-20 bg-green-500 rounded-full" />
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-300 px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard
            label="Total Revenue"
            value={fmtMoney(summary.totalRevenue)}
            icon={<TrendingUp size={18} />}
            color="bg-green-50 text-green-700 border-green-200"
          />
          <StatCard
            label="Course Revenue"
            value={fmtMoney(summary.totalCourseRevenue)}
            sub={`${summary.successfulCoursePayments} successful`}
            icon={<BookOpen size={18} />}
            color="bg-blue-50 text-blue-700 border-blue-200"
          />
          <StatCard
            label="Scenario Revenue"
            value={fmtMoney(summary.totalScenarioRevenue, "UGX")}
            sub={`${summary.totalScenarioPayments} purchases`}
            icon={<Brain size={18} />}
            color="bg-purple-50 text-purple-700 border-purple-200"
          />
          <StatCard
            label="Pending"
            value={summary.pendingCoursePayments}
            icon={<Clock size={18} />}
            color="bg-yellow-50 text-yellow-700 border-yellow-200"
          />
          <StatCard
            label="Failed"
            value={summary.failedCoursePayments}
            icon={<XCircle size={18} />}
            color="bg-red-50 text-red-700 border-red-200"
          />
          <StatCard
            label="Cancelled"
            value={summary.cancelledCoursePayments}
            icon={<XCircle size={18} />}
            color="bg-gray-50 text-gray-600 border-gray-200"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["course", "scenario"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "course" ? <BookOpen size={14} /> : <Brain size={14} />}
            {t === "course" ? `Course Payments (${coursePayments.length})` : `Scenario Purchases (${scenarioPayments.length})`}
          </button>
        ))}
      </div>

      {/* ── COURSE PAYMENTS TAB ── */}
      {tab === "course" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search email, course, transaction ref…"
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
              {courseSearch && (
                <button onClick={() => setCourseSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as PaymentStatus | "ALL")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-400 outline-none bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="self-center text-sm text-gray-400 ml-auto whitespace-nowrap">
              {filteredCourse.length} / {coursePayments.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {(
                    [
                      { label: "User",        field: "userEmail" as CourseSort },
                      { label: "Course",      field: "courseTitle" as CourseSort },
                      { label: "Amount",      field: "amount" as CourseSort },
                      { label: "Status",      field: "status" as CourseSort },
                      { label: "Method",      field: null },
                      { label: "Tx Ref",      field: null },
                      { label: "FW ID",       field: null },
                      { label: "Initiated",   field: "createdAt" as CourseSort },
                      { label: "Completed",   field: "completedAt" as CourseSort },
                    ] as { label: string; field: CourseSort | null }[]
                  ).map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && toggleCourseSort(field)}
                      className={`text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide select-none ${field ? "cursor-pointer hover:text-gray-700" : ""}`}
                    >
                      <span className="inline-flex items-center">
                        {label}
                        {field && <CourseSortIcon field={field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCourse.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400">
                      <AlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
                      <p>No payments match your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCourse.map(p => {
                    const s = statusMeta[p.status];
                    return (
                      <tr key={p.paymentId} className="border-b border-gray-50 hover:bg-green-50 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center shrink-0">
                              <span className="text-white font-bold text-xs">{p.userEmail[0].toUpperCase()}</span>
                            </div>
                            <span className="text-gray-800 truncate max-w-[160px]" title={p.userEmail}>{p.userEmail}</span>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-4 py-3">
                          <span className="text-gray-700 truncate max-w-[140px] block" title={p.courseTitle}>{p.courseTitle}</span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-800">
                            {new Intl.NumberFormat("en-US").format(p.amount)} {p.currency}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                            {s.icon}
                            {s.label}
                          </span>
                        </td>

                        {/* Method */}
                        <td className="px-4 py-3">
                          {p.paymentMethod ? (
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <Zap size={11} className="text-gray-400" />
                              {p.paymentMethod}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Tx Ref */}
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-mono" title={p.transactionReference}>
                            <Hash size={10} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[100px]">{p.transactionReference}</span>
                          </span>
                        </td>

                        {/* Flutterwave ID */}
                        <td className="px-4 py-3">
                          {p.flutterwaveTransactionId ? (
                            <span className="text-xs text-gray-500 font-mono truncate max-w-[90px] block" title={p.flutterwaveTransactionId}>
                              {p.flutterwaveTransactionId}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Initiated */}
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            <Calendar size={10} className="inline mr-1 text-gray-400" />
                            {fmtDate(p.createdAt)}
                          </div>
                        </td>

                        {/* Completed */}
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            {p.completedAt ? (
                              <>
                                <Calendar size={10} className="inline mr-1 text-green-500" />
                                {fmtDate(p.completedAt)}
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredCourse.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>{filteredCourse.length} payment{filteredCourse.length !== 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} className="text-green-500" />
                {filteredCourse.filter(p => p.status === "SUCCESSFUL").length} successful
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-yellow-500" />
                {filteredCourse.filter(p => p.status === "PENDING").length} pending
              </span>
              <span className="flex items-center gap-1">
                <XCircle size={11} className="text-red-400" />
                {filteredCourse.filter(p => p.status === "FAILED").length} failed
              </span>
              <span className="ml-auto font-semibold text-gray-700">
                Revenue: {fmtMoney(
                  filteredCourse
                    .filter(p => p.status === "SUCCESSFUL")
                    .reduce((s, p) => s + p.amount, 0),
                  filteredCourse[0]?.currency ?? "UGX"
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── SCENARIO PAYMENTS TAB ── */}
      {tab === "scenario" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search email or transaction ref…"
                value={scenarioSearch}
                onChange={e => setScenarioSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
              {scenarioSearch && (
                <button onClick={() => setScenarioSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <span className="self-center text-sm text-gray-400 ml-auto whitespace-nowrap">
              {filteredScenario.length} / {scenarioPayments.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Currency</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Paid At</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Transaction Ref</th>
                </tr>
              </thead>

              <tbody>
                {filteredScenario.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <AlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
                      <p>No scenario purchases found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredScenario.map(p => (
                    <tr key={p.accessId} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-xs">{p.userEmail?.[0]?.toUpperCase() ?? "?"}</span>
                          </div>
                          <span className="text-gray-800 truncate max-w-[200px]" title={p.userEmail}>{p.userEmail ?? "—"}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">
                          {new Intl.NumberFormat("en-US").format(p.amountPaid)}
                        </span>
                      </td>

                      {/* Currency */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          {p.currency}
                        </span>
                      </td>

                      {/* Paid At */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          <Calendar size={10} className="inline mr-1 text-green-500" />
                          {fmtDateTime(p.paidAt)}
                        </div>
                      </td>

                      {/* Transaction Ref */}
                      <td className="px-4 py-3">
                        {p.transactionRef ? (
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-mono" title={p.transactionRef}>
                            <Hash size={10} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{p.transactionRef}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredScenario.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} className="text-green-500" />
                {filteredScenario.length} purchase{filteredScenario.length !== 1 ? "s" : ""}
              </span>
              <span className="ml-auto font-semibold text-gray-700">
                Revenue: {new Intl.NumberFormat("en-US").format(
                  filteredScenario.reduce((s, p) => s + p.amountPaid, 0)
                )} UGX
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
