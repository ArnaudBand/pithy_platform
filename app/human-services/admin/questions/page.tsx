"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminOptionDTO {
  id: string;
  text: string;
  poleTarget: string;
  displayOrder: number;
}

interface AdminQuestion {
  id: string;
  text: string;
  dimensionCode: string;
  poleTarget: string | null;
  weight: number;
  displayOrder: number | null;
  active: boolean;
  options: AdminOptionDTO[];
}

interface OptionDraft {
  text: string;
  poleTarget: string;
  displayOrder: number;
}

interface QuestionForm {
  text: string;
  dimensionCode: string;
  weight: number;
  displayOrder: string;
  options: OptionDraft[];
}

const DIMENSIONS = [
  { code: "EI", poles: ["E", "I"], labels: ["Extraversion", "Introversion"] },
  { code: "NS", poles: ["N", "S"], labels: ["Intuition", "Sensing"] },
  { code: "TF", poles: ["T", "F"], labels: ["Thinking", "Feeling"] },
  { code: "JP", poles: ["J", "P"], labels: ["Judging", "Perceiving"] },
];

function defaultOptions(dimensionCode: string): OptionDraft[] {
  const dim = DIMENSIONS.find((d) => d.code === dimensionCode)!;
  // Seed with 4 blank options alternating poles, so admin can fill in text
  return [
    { text: "", poleTarget: dim.poles[0], displayOrder: 1 },
    { text: "", poleTarget: dim.poles[0], displayOrder: 2 },
    { text: "", poleTarget: dim.poles[1], displayOrder: 3 },
    { text: "", poleTarget: dim.poles[1], displayOrder: 4 },
  ];
}

const emptyForm = (dimensionCode = "EI"): QuestionForm => ({
  text: "",
  dimensionCode,
  weight: 1,
  displayOrder: "",
  options: defaultOptions(dimensionCode),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Expanded question row to show options
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdminQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterDimension, setFilterDimension] = useState("ALL");
  const [filterActive, setFilterActive] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ACTIVE");
  const [sortField, setSortField] = useState<"displayOrder" | "dimensionCode">("displayOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/questions");
      if (!res.ok) throw new Error("Failed to load questions");
      setQuestions(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = questions
    .filter((q) => filterDimension === "ALL" || q.dimensionCode === filterDimension)
    .filter((q) => {
      if (filterActive === "ACTIVE") return q.active;
      if (filterActive === "INACTIVE") return !q.active;
      return true;
    })
    .sort((a, b) => {
      const av = sortField === "displayOrder" ? (a.displayOrder ?? 999) : a.dimensionCode;
      const bv = sortField === "displayOrder" ? (b.displayOrder ?? 999) : b.dimensionCode;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const stats = {
    total: questions.length,
    active: questions.filter((q) => q.active).length,
    byDimension: DIMENSIONS.map((d) => ({
      code: d.code,
      count: questions.filter((q) => q.dimensionCode === d.code && q.active).length,
    })),
  };

  // ── Form helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (q: AdminQuestion) => {
    setEditingId(q.id);
    setForm({
      text: q.text,
      dimensionCode: q.dimensionCode,
      weight: q.weight,
      displayOrder: q.displayOrder?.toString() ?? "",
      options: q.options.length > 0
        ? q.options.map((o) => ({ text: o.text, poleTarget: o.poleTarget, displayOrder: o.displayOrder }))
        : defaultOptions(q.dimensionCode),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleDimensionChange = (code: string) => {
    setForm((prev) => ({
      ...prev,
      dimensionCode: code,
      // Reset options to defaults for the new dimension
      options: defaultOptions(code),
    }));
  };

  // ── Option management ─────────────────────────────────────────────────────

  const addOption = () => {
    const dim = DIMENSIONS.find((d) => d.code === form.dimensionCode)!;
    const nextOrder = (form.options[form.options.length - 1]?.displayOrder ?? 0) + 1;
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", poleTarget: dim.poles[0], displayOrder: nextOrder }],
    }));
  };

  const removeOption = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  const updateOption = (idx: number, patch: Partial<OptionDraft>) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.text.trim()) { setFormError("Question text is required."); return; }
    if (form.options.length === 0) { setFormError("At least one answer option is required."); return; }
    const emptyOpt = form.options.find((o) => !o.text.trim());
    if (emptyOpt) { setFormError("All option texts must be filled in."); return; }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        text: form.text.trim(),
        dimensionCode: form.dimensionCode,
        poleTarget: null, // options carry the pole info
        weight: form.weight,
        displayOrder: form.displayOrder ? parseInt(form.displayOrder, 10) : null,
        options: form.options.map((o, i) => ({
          text: o.text.trim(),
          poleTarget: o.poleTarget,
          displayOrder: i + 1,
        })),
      };

      const url = editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed");
      }

      closeModal();
      fetchQuestions();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
      setDeleteTarget(null);
      fetchQuestions();
    } finally {
      setDeleting(false);
    }
  };

  // ── Sort toggle ───────────────────────────────────────────────────────────

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? sortDir === "asc"
        ? <ChevronUp size={14} className="inline ml-1" />
        : <ChevronDown size={14} className="inline ml-1" />
      : null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const dimLabel = (code: string) => {
    const dim = DIMENSIONS.find((d) => d.code === code);
    return dim ? `${code} (${dim.labels.join(" / ")})` : code;
  };

  const poleLabel = (dimCode: string, pole: string) => {
    const dim = DIMENSIONS.find((d) => d.code === dimCode);
    if (!dim) return pole;
    const idx = dim.poles.indexOf(pole);
    return idx >= 0 ? `${pole} — ${dim.labels[idx]}` : pole;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assessment Questions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage personality assessment questions and their answer options
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active</p>
        </div>
        {stats.byDimension.map((d) => (
          <div key={d.code} className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">{d.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{d.code}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterDimension}
          onChange={(e) => setFilterDimension(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
        >
          <option value="ALL">All Dimensions</option>
          {DIMENSIONS.map((d) => (
            <option key={d.code} value={d.code}>{d.code} — {d.labels.join(" / ")}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as typeof filterActive)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
        >
          <option value="ACTIVE">Active only</option>
          <option value="INACTIVE">Inactive only</option>
          <option value="ALL">All statuses</option>
        </select>
        <span className="text-sm text-slate-500 self-center ml-auto">
          {filtered.length} question{filtered.length !== 1 ? "s" : ""}
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
                <th className="px-4 py-3 font-medium w-8" />
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none w-12"
                  onClick={() => toggleSort("displayOrder")}
                >
                  # <SortIcon field="displayOrder" />
                </th>
                <th className="px-4 py-3 font-medium">Question Text</th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer select-none w-32"
                  onClick={() => toggleSort("dimensionCode")}
                >
                  Dimension <SortIcon field="dimensionCode" />
                </th>
                <th className="px-4 py-3 font-medium w-20 text-center">Options</th>
                <th className="px-4 py-3 font-medium w-16 text-center">Weight</th>
                <th className="px-4 py-3 font-medium w-20 text-center">Status</th>
                <th className="px-4 py-3 font-medium w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-10">
                    No questions match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map((q) => {
                const isExpanded = expandedId === q.id;
                return (
                  <>
                    <tr
                      key={q.id}
                      className={`transition-colors hover:bg-slate-50 ${!q.active ? "opacity-50" : ""}`}
                    >
                      {/* Expand toggle */}
                      <td className="px-3 py-3">
                        {q.options.length > 0 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : q.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} className="rotate-180" />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{q.displayOrder ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-800 max-w-xs">
                        <span className="line-clamp-2">{q.text}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {q.dimensionCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold ${q.options.length === 0 ? "text-amber-500" : "text-slate-600"}`}>
                          {q.options.length === 0 ? "No options" : `${q.options.length} opts`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{q.weight}</td>
                      <td className="px-4 py-3 text-center">
                        {q.active ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                            <Eye size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <EyeOff size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(q)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {q.active && (
                            <button
                              onClick={() => setDeleteTarget(q)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded options row */}
                    {isExpanded && q.options.length > 0 && (
                      <tr key={`${q.id}-opts`} className="bg-slate-50">
                        <td colSpan={8} className="px-8 pb-4 pt-2">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                            Answer Options
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              >
                                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-bold
                                  ${opt.poleTarget === "E" || opt.poleTarget === "N" || opt.poleTarget === "T" || opt.poleTarget === "J"
                                    ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}>
                                  {opt.poleTarget}
                                </span>
                                <span className="text-slate-700">{opt.text}</span>
                              </div>
                            ))}
                          </div>
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

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Edit Question" : "Add Question"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  placeholder="e.g. When you face a big challenge, you tend to…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Dimension */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dimension <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.dimensionCode}
                    onChange={(e) => handleDimensionChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {DIMENSIONS.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} ({d.labels.join(" / ")})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weight</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Default 1 (higher = more impact)</p>
                </div>
                {/* Display order */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))}
                    placeholder="Auto"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Options section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Answer Options <span className="text-red-500">*</span>
                    <span className="text-slate-400 font-normal ml-1 text-xs">(each option maps to a pole)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <Plus size={13} /> Add option
                  </button>
                </div>

                <div className="space-y-2">
                  {form.options.map((opt, idx) => {
                    const dim = DIMENSIONS.find((d) => d.code === form.dimensionCode)!;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(idx, { text: e.target.value })}
                          placeholder={`Option ${idx + 1} text…`}
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <select
                          value={opt.poleTarget}
                          onChange={(e) => updateOption(idx, { poleTarget: e.target.value })}
                          className="w-36 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          {dim.poles.map((p, pi) => (
                            <option key={p} value={p}>
                              {p} — {dim.labels[pi]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          disabled={form.options.length <= 2}
                          className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                          title="Remove option"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {form.options.length < 2 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> At least 2 options are recommended.
                  </p>
                )}

                {/* Pole distribution preview */}
                {form.options.length > 0 && (() => {
                  const dim = DIMENSIONS.find((d) => d.code === form.dimensionCode)!;
                  const counts = dim.poles.reduce<Record<string, number>>((acc, p) => {
                    acc[p] = form.options.filter((o) => o.poleTarget === p).length;
                    return acc;
                  }, {});
                  return (
                    <div className="mt-2 flex gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-600">Pole distribution:</span>
                      {dim.poles.map((p, i) => (
                        <span key={p} className="flex items-center gap-1">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold
                            ${i === 0 ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}>
                            {p}
                          </span>
                          {counts[p]} option{counts[p] !== 1 ? "s" : ""}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {formError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> {formError}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Dimension: <span className="font-medium">{dimLabel(form.dimensionCode)}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  ) : (
                    <Check size={14} />
                  )}
                  {editingId ? "Save Changes" : "Create Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Deactivate Question?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This question will be hidden from the assessment but preserved in the database.
                  No responses will be deleted.
                </p>
                <p className="text-sm text-slate-700 mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 line-clamp-3">
                  &ldquo;{deleteTarget.text}&rdquo;
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
              >
                {deleting ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                ) : (
                  <Trash2 size={14} />
                )}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
