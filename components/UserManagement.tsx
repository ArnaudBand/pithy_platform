"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Users, CheckCircle2, XCircle, Search, Trash2, X,
  ShieldCheck, User, Clock, Calendar, ChevronUp, ChevronDown,
  ChevronsUpDown, GraduationCap, DollarSign, ChevronRight,
  BookOpen, CreditCard, AlertCircle, Brain, Activity, Lock,
  ShieldOff, Ban, UserCheck, UserX, ChevronDown as ChevDown,
} from "lucide-react";
import {
  getAdminUsers,
  deleteUser,
  changeUserRole,
  toggleUserDisabled,
  toggleUserBlocked,
  AdminUserSummaryDTO,
  AdminEnrollmentInfo,
  UserRole,
  PaymentStatus,
  AssessmentStatus,
  ScenarioAssessmentStatus,
} from "@/lib/actions/admin.actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const fmtDateTime = (iso: string | null) => {
  if (!iso) return "Never";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
};

const timeAgo = (iso: string | null) => {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const fmtMoney = (amount: number | null, currency = "USD") => {
  if (amount == null) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact" }).format(amount);
};

const paymentBadge: Record<PaymentStatus, { label: string; cls: string }> = {
  SUCCESSFUL: { label: "Paid",      cls: "bg-green-100 text-green-700" },
  PENDING:    { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
  FAILED:     { label: "Failed",    cls: "bg-red-100 text-red-600" },
  CANCELLED:  { label: "Cancelled", cls: "bg-gray-100 text-gray-500" },
};

type SortField = "email" | "role" | "isVerified" | "lastLoginAt" | "createdAt" | "enrollmentCount" | "totalAmountPaid";
type SortDir = "asc" | "desc";

// ─── Enrollment Panel ─────────────────────────────────────────────────────────

// ─── Assessment status badge helpers ─────────────────────────────────────────

const assessmentBadge: Record<AssessmentStatus, { label: string; cls: string }> = {
  NOT_STARTED: { label: "Not Started", cls: "bg-gray-100 text-gray-500" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700" },
  COMPLETED:   { label: "Completed",   cls: "bg-green-100 text-green-700" },
};

const scenarioBadge: Record<ScenarioAssessmentStatus, { label: string; cls: string }> = {
  NOT_PAID:    { label: "Not Paid",    cls: "bg-red-50 text-red-500" },
  NOT_STARTED: { label: "Not Started", cls: "bg-gray-100 text-gray-500" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700" },
  COMPLETED:   { label: "Completed",   cls: "bg-green-100 text-green-700" },
};

// ─── Enrollment Panel ─────────────────────────────────────────────────────────

const EnrollmentPanel = ({ enrollments }: { enrollments: AdminEnrollmentInfo[] }) => {
  if (enrollments.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 px-6 text-gray-400 text-sm">
        <BookOpen size={16} />
        No enrollments yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {enrollments.map((e) => {
        const ps = e.paymentStatus ? paymentBadge[e.paymentStatus] : null;
        const pct = e.progressPercent ?? 0;
        const progressColor = pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-orange-400";
        return (
          <div key={e.enrollmentId} className="px-6 py-3 bg-gray-50 text-sm">
            {/* Top row: course + meta */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Course title */}
              <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                <GraduationCap size={15} className="text-green-500 shrink-0" />
                <span className="font-medium text-gray-800 truncate">{e.courseTitle}</span>
              </div>

              {/* Enrolled date */}
              <div className="flex items-center gap-1.5 text-gray-500 text-xs whitespace-nowrap">
                <Calendar size={12} />
                Enrolled {fmtDate(e.enrolledAt)}
              </div>

              {/* Payment status */}
              <div className="flex items-center gap-2">
                {ps ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ps.cls}`}>
                    {ps.label}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
                    Free
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className="flex items-center gap-1 text-gray-600 text-xs whitespace-nowrap">
                <DollarSign size={12} className="text-gray-400" />
                {fmtMoney(e.amountPaid, e.courseCurrency)}
              </div>

              {/* Txn ref */}
              {e.transactionReference && (
                <span className="text-xs text-gray-400 truncate max-w-[140px]" title={e.transactionReference}>
                  {e.transactionReference}
                </span>
              )}

              {/* Paid date */}
              {e.paidAt && (
                <div className="flex items-center gap-1 text-gray-400 text-xs whitespace-nowrap">
                  <CreditCard size={11} />
                  {fmtDate(e.paidAt)}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {e.lessonsTotal > 0 && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    Course Progress
                  </span>
                  <span className="font-medium text-gray-700">
                    {e.lessonsCompleted}/{e.lessonsTotal} lessons · {pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUserSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
  const [enrollFilter, setEnrollFilter] = useState<"ALL" | "ENROLLED" | "NOT_ENROLLED">("ALL");
  const [paidFilter, setPaidFilter] = useState<"ALL" | "PAID" | "FREE">("ALL");

  // Sort
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Expanded rows (show enrollments)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // In-flight action tracking (userId → action name)
  const [pendingAction, setPendingAction] = useState<Record<string, string>>({});

  // ── Load ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    startTransition(async () => {
      const result = await getAdminUsers();
      if (!result.success) {
        toast.error(result.message ?? "Failed to load users");
      } else {
        setUsers(result.users);
      }
      setLoading(false);
    });
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteUser(id);
      if (!result.success) {
        toast.error(result.message ?? "Failed to delete user");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
      toast.success("User deleted");
    });
  };

  // ── Role / disable / block ────────────────────────────────────────────────────
  const handleRoleChange = (id: string, newRole: UserRole) => {
    setPendingAction(p => ({ ...p, [id]: "role" }));
    startTransition(async () => {
      const result = await changeUserRole(id, newRole);
      if (!result.success) toast.error(result.message ?? "Failed to change role");
      else {
        setUsers(prev => prev.map(u => u.id === id ? result.user : u));
        toast.success(`Role changed to ${newRole}`);
      }
      setPendingAction(p => { const n = { ...p }; delete n[id]; return n; });
    });
  };

  const handleToggleDisabled = (id: string) => {
    setPendingAction(p => ({ ...p, [id]: "disable" }));
    startTransition(async () => {
      const result = await toggleUserDisabled(id);
      if (!result.success) toast.error(result.message ?? "Failed to update");
      else {
        setUsers(prev => prev.map(u => u.id === id ? result.user : u));
        toast.success(result.user.isDisabled ? "Account disabled" : "Account enabled");
      }
      setPendingAction(p => { const n = { ...p }; delete n[id]; return n; });
    });
  };

  const handleToggleBlocked = (id: string) => {
    setPendingAction(p => ({ ...p, [id]: "block" }));
    startTransition(async () => {
      const result = await toggleUserBlocked(id);
      if (!result.success) toast.error(result.message ?? "Failed to update");
      else {
        setUsers(prev => prev.map(u => u.id === id ? result.user : u));
        toast.success(result.user.isBlocked ? "Account blocked" : "Account unblocked");
      }
      setPendingAction(p => { const n = { ...p }; delete n[id]; return n; });
    });
  };

  // ── Toggle expand ─────────────────────────────────────────────────────────────
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  // ── Filtered + sorted ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users];
    if (search.trim()) list = list.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== "ALL") list = list.filter((u) => u.role === roleFilter);
    if (verifiedFilter === "VERIFIED") list = list.filter((u) => u.isVerified);
    if (verifiedFilter === "UNVERIFIED") list = list.filter((u) => !u.isVerified);
    if (enrollFilter === "ENROLLED") list = list.filter((u) => u.enrollmentCount > 0);
    if (enrollFilter === "NOT_ENROLLED") list = list.filter((u) => u.enrollmentCount === 0);
    if (paidFilter === "PAID") list = list.filter((u) => u.hasPaid);
    if (paidFilter === "FREE") list = list.filter((u) => !u.hasPaid);

    list.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const an = typeof av === "boolean" ? (av ? 1 : 0) : av;
      const bn = typeof bv === "boolean" ? (bv ? 1 : 0) : bv;
      if (an < bn) return sortDir === "asc" ? -1 : 1;
      if (an > bn) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [users, search, roleFilter, verifiedFilter, enrollFilter, paidFilter, sortField, sortDir]);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: users.length,
    verified: users.filter((u) => u.isVerified).length,
    enrolled: users.filter((u) => u.enrollmentCount > 0).length,
    paid: users.filter((u) => u.hasPaid).length,
    activeThisWeek: users.filter((u) => u.lastLoginAt &&
      Date.now() - new Date(u.lastLoginAt).getTime() < 7 * 24 * 60 * 60 * 1000).length,
  }), [users]);

  // ── Sort icon ─────────────────────────────────────────────────────────────────
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-gray-400 ml-1" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-green-600 ml-1" />
      : <ChevronDown size={12} className="text-green-600 ml-1" />;
  };

  const Th = ({ label, field, className = "" }: { label: string; field: SortField; className?: string }) => (
    <th
      className={`text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide select-none cursor-pointer hover:text-gray-700 ${className}`}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center">{label}<SortIcon field={field} /></span>
    </th>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Users size={28} className="text-green-600" />
          User Management
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Monitor all registered users — verification, login activity, enrollments, and payments.
        </p>
        <div className="mt-3 h-1 w-20 bg-green-500 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total",    value: stats.total,         icon: <Users size={18} />,       color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Verified", value: stats.verified,      icon: <CheckCircle2 size={18} />, color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Enrolled", value: stats.enrolled,      icon: <GraduationCap size={18} />, color: "bg-purple-50 text-purple-700 border-purple-200" },
          { label: "Paid",     value: stats.paid,          icon: <DollarSign size={18} />,  color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Active 7d",value: stats.activeThisWeek,icon: <Clock size={18} />,       color: "bg-orange-50 text-orange-700 border-orange-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 flex items-center gap-3 ${s.color}`}>
            <div className="opacity-80">{s.icon}</div>
            <div>
              <p className="text-xl font-bold leading-none">{s.value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by email…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={13} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Role */}
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-400 outline-none bg-white">
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        {/* Verified */}
        <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-400 outline-none bg-white">
          <option value="ALL">All Verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>

        {/* Enrollment */}
        <select value={enrollFilter} onChange={(e) => setEnrollFilter(e.target.value as typeof enrollFilter)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-400 outline-none bg-white">
          <option value="ALL">All Enrollments</option>
          <option value="ENROLLED">Enrolled</option>
          <option value="NOT_ENROLLED">Not Enrolled</option>
        </select>

        {/* Paid */}
        <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value as typeof paidFilter)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-400 outline-none bg-white">
          <option value="ALL">All Payments</option>
          <option value="PAID">Has Paid</option>
          <option value="FREE">Free Only</option>
        </select>

        <span className="self-center text-sm text-gray-400 ml-auto whitespace-nowrap">
          {filtered.length} / {users.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* expand toggle col */}
                <th className="w-8 px-3 py-3" />
                <Th label="User" field="email" />
                <Th label="Role" field="role" className="hidden sm:table-cell" />
                <Th label="Verified" field="isVerified" className="hidden md:table-cell" />
                <Th label="Enrolled" field="enrollmentCount" className="hidden md:table-cell" />
                <Th label="Paid" field="totalAmountPaid" className="hidden lg:table-cell" />
                <Th label="Last Login" field="lastLoginAt" className="hidden lg:table-cell" />
                <Th label="Joined" field="createdAt" className="hidden xl:table-cell" />
                <th className="px-4 py-3 text-xs uppercase text-gray-500 hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs uppercase text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400">
                    <AlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
                    <p>No users match your filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isExpanded = expandedIds.has(user.id);
                  return (
                    <React.Fragment key={user.id}>
                      {/* Main row */}
                      <tr className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${isExpanded ? "bg-green-50" : ""}`}>

                        {/* Expand toggle */}
                        <td className="px-3 py-4 text-center">
                          <button
                            onClick={() => toggleExpand(user.id)}
                            className="p-1 rounded transition-colors text-green-600 hover:bg-green-100 cursor-pointer"
                            title="View details"
                          >
                            <ChevronRight size={15} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </button>
                        </td>

                        {/* Email + avatar */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white font-bold text-sm">{user.email[0].toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 truncate max-w-[200px]">{user.email}</p>
                              {/* Mobile: compact badges */}
                              <div className="flex items-center gap-2 mt-0.5 sm:hidden flex-wrap">
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                  {user.role}
                                </span>
                                {user.isVerified
                                  ? <CheckCircle2 size={11} className="text-green-500" />
                                  : <XCircle size={11} className="text-red-400" />}
                                {user.enrollmentCount > 0 && (
                                  <span className="text-xs text-purple-600 flex items-center gap-0.5">
                                    <GraduationCap size={11} />{user.enrollmentCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                            {user.role === "ADMIN" ? <ShieldCheck size={11} /> : <User size={11} />}
                            {user.role}
                          </span>
                        </td>

                        {/* Verified */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          {user.isVerified
                            ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 size={14} />Verified</span>
                            : <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium"><XCircle size={14} />Unverified</span>}
                        </td>

                        {/* Enrollments */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          {user.enrollmentCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold text-xs bg-purple-50 px-2.5 py-1 rounded-full">
                              <GraduationCap size={12} />
                              {user.enrollmentCount} course{user.enrollmentCount !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>

                        {/* Total paid */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {user.hasPaid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">
                              <DollarSign size={11} />
                              {fmtMoney(user.totalAmountPaid)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Last login */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <p className="text-gray-700 text-xs">{fmtDateTime(user.lastLoginAt)}</p>
                          {user.lastLoginAt && (
                            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                              <Clock size={10} />{timeAgo(user.lastLoginAt)}
                            </p>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-4 hidden xl:table-cell">
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <Calendar size={12} className="text-gray-400" />
                            {fmtDate(user.createdAt)}
                          </div>
                        </td>

                        {/* Account status badges */}
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {user.isBlocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                <Ban size={10} /> Blocked
                              </span>
                            )}
                            {user.isDisabled && !user.isBlocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                <ShieldOff size={10} /> Disabled
                              </span>
                            )}
                            {!user.isBlocked && !user.isDisabled && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <UserCheck size={10} /> Active
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">

                            {/* Role selector */}
                            <div className="relative">
                              <select
                                value={user.role}
                                onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                                disabled={!!pendingAction[user.id]}
                                className="appearance-none pl-2 pr-6 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 hover:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 cursor-pointer disabled:opacity-50"
                                title="Change role"
                              >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              <ChevDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Disable / Enable */}
                            <button
                              onClick={() => handleToggleDisabled(user.id)}
                              disabled={!!pendingAction[user.id] || user.isBlocked}
                              title={user.isDisabled ? "Enable account" : "Disable account"}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                user.isDisabled
                                  ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                  : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                              }`}
                            >
                              {user.isDisabled ? <UserCheck size={14} /> : <UserX size={14} />}
                            </button>

                            {/* Block / Unblock */}
                            <button
                              onClick={() => handleToggleBlocked(user.id)}
                              disabled={!!pendingAction[user.id]}
                              title={user.isBlocked ? "Unblock account" : "Block account"}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                user.isBlocked
                                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                                  : "text-gray-400 hover:bg-red-50 hover:text-red-500"
                              }`}
                            >
                              <Ban size={14} />
                            </button>

                            {/* Delete */}
                            {confirmDeleteId === user.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(user.id)} disabled={isPending}
                                  className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg disabled:opacity-60">
                                  {isPending ? "…" : "Confirm"}
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                                  <X size={12} className="text-gray-500" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDeleteId(user.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete user">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail panel */}
                      {isExpanded && (
                        <tr className="border-b border-gray-100">
                          <td colSpan={10} className="p-0">
                            <div className="border-l-4 border-green-400 ml-6">
                              {/* Enrollments + course progress */}
                              <EnrollmentPanel enrollments={user.enrollments} />

                              {/* Assessment info */}
                              <div className="px-6 py-4 bg-white border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                  <Brain size={13} className="text-purple-500" />
                                  Assessment Overview
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Regular assessment */}
                                  <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                                    <Activity size={16} className="text-purple-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Personality Assessment</p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${assessmentBadge[user.assessmentStatus].cls}`}>
                                          {assessmentBadge[user.assessmentStatus].label}
                                        </span>
                                        {user.assessmentPersonalityType && (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
                                            {user.assessmentPersonalityType}
                                          </span>
                                        )}
                                      </div>
                                      {user.assessmentCompletedAt && (
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                          <Clock size={10} />
                                          Completed {fmtDate(user.assessmentCompletedAt)}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Scenario assessment */}
                                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                    {user.hasScenarioPaid
                                      ? <Brain size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                      : <Lock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                    }
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Scenario Assessment</p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scenarioBadge[user.scenarioAssessmentStatus].cls}`}>
                                          {scenarioBadge[user.scenarioAssessmentStatus].label}
                                        </span>
                                        {user.scenarioPersonalityType && (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                                            {user.scenarioPersonalityType}
                                          </span>
                                        )}
                                      </div>
                                      {user.hasScenarioPaid && (
                                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                          <CheckCircle2 size={10} />
                                          Access purchased (5,000 UGX)
                                        </p>
                                      )}
                                      {user.scenarioCompletedAt && (
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                          <Clock size={10} />
                                          Completed {fmtDate(user.scenarioCompletedAt)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span>{filtered.length} user{filtered.length !== 1 ? "s" : ""} shown</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-500" />{filtered.filter((u) => u.isVerified).length} verified</span>
            <span className="flex items-center gap-1"><GraduationCap size={11} className="text-purple-500" />{filtered.filter((u) => u.enrollmentCount > 0).length} enrolled</span>
            <span className="flex items-center gap-1"><DollarSign size={11} className="text-emerald-500" />{filtered.filter((u) => u.hasPaid).length} paid</span>
            <span className="ml-auto text-gray-400">Click <ChevronRight size={11} className="inline" /> to see course progress &amp; assessment details</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
