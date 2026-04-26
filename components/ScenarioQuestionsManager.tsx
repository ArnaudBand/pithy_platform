"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  adminGetScenarioQuestions,
  adminCreateScenarioQuestion,
  adminUpdateScenarioQuestion,
  adminDeleteScenarioQuestion,
  ScenarioQuestionResponse,
  ScenarioQuestionRequest,
  ScenarioOptionRequest,
} from "@/lib/actions/scenario-assessment.actions";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Layers,
  Info,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIMENSIONS = ["EI", "NS", "TF", "JP"] as const;
type DimCode = (typeof DIMENSIONS)[number];

const POLE_MAP: Record<DimCode, [string, string]> = {
  EI: ["E", "I"],
  NS: ["N", "S"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

const DIMENSION_LABELS: Record<DimCode, string> = {
  EI: "Extraversion / Introversion",
  NS: "Intuition / Sensing",
  TF: "Thinking / Feeling",
  JP: "Judging / Perceiving",
};

/**
 * Builds the 5 fixed Likert options for a given dimension.
 *
 * Scoring weight:
 *   Strongly Agree  → poleA  (e.g. E)
 *   Agree           → poleA
 *   Neutral         → NEUTRAL (not counted in scoring)
 *   Disagree        → poleB  (e.g. I)
 *   Strongly Disagree → poleB
 */
function buildLikertOptions(dimension: DimCode): ScenarioOptionRequest[] {
  const [poleA, poleB] = POLE_MAP[dimension];
  return [
    { text: "Strongly Agree",    poleTarget: poleA,     displayOrder: 1 },
    { text: "Agree",             poleTarget: poleA,     displayOrder: 2 },
    { text: "Neutral",           poleTarget: "NEUTRAL", displayOrder: 3 },
    { text: "Disagree",          poleTarget: poleB,     displayOrder: 4 },
    { text: "Strongly Disagree", poleTarget: poleB,     displayOrder: 5 },
  ];
}

function emptyQuestion(dimension: DimCode = "EI"): ScenarioQuestionRequest {
  return {
    text: "",
    dimensionCode: dimension,
    displayOrder: 0,
    options: buildLikertOptions(dimension),
  };
}

// ─── Likert preview chip ──────────────────────────────────────────────────────

const LIKERT_STYLES: Record<string, string> = {
  "Strongly Agree":    "bg-green-500 text-white",
  "Agree":             "bg-green-200 text-green-800",
  "Neutral":           "bg-slate-200 text-slate-600",
  "Disagree":          "bg-orange-200 text-orange-800",
  "Strongly Disagree": "bg-red-500 text-white",
};

function LikertPreview({ poleA, poleB }: { poleA: string; poleB: string }) {
  const labels = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];
  const poles  = [poleA, poleA, "—", poleB, poleB];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${LIKERT_STYLES[label]}`}>
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{poles[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Question Form ────────────────────────────────────────────────────────────

function QuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
  nextOrder,
}: {
  initial: ScenarioQuestionRequest;
  onSave: (q: ScenarioQuestionRequest) => void;
  onCancel: () => void;
  saving: boolean;
  nextOrder: number;
}) {
  const [text, setText] = useState(initial.text);
  const [dimension, setDimension] = useState<DimCode>(initial.dimensionCode as DimCode);
  const [displayOrder, setDisplayOrder] = useState(initial.displayOrder || nextOrder);

  // Rebuild options whenever dimension changes
  const handleDimChange = (d: DimCode) => {
    setDimension(d);
  };

  const handleSave = () => {
    onSave({
      text,
      dimensionCode: dimension,
      displayOrder,
      options: buildLikertOptions(dimension),
    });
  };

  const [poleA, poleB] = POLE_MAP[dimension];

  return (
    <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
      {/* Info banner */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>
          Write the question as a statement about the <strong>{poleA}-pole</strong> behaviour.
          The 5 Likert options (Strongly Agree → {poleA}, Agree → {poleA}, Neutral, Disagree → {poleB}, Strongly Disagree → {poleB}) are generated automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Question text */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Question / Statement *
          </label>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`e.g. "You prefer organising group activities and thrive in social settings."`}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        {/* Dimension */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Dimension *</label>
          <select
            value={dimension}
            onChange={(e) => handleDimChange(e.target.value as DimCode)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {DIMENSIONS.map((d) => (
              <option key={d} value={d}>
                {d} — {DIMENSION_LABELS[d]}
              </option>
            ))}
          </select>

          <label className="block text-xs font-semibold text-slate-500 mt-3 mb-1">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      {/* Likert preview */}
      <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
        <p className="text-xs font-semibold text-slate-500 mb-1">Answer options (auto-generated)</p>
        <LikertPreview poleA={poleA} poleB={poleB} />
      </div>

      <div className="flex gap-2 mt-5 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm
                     hover:bg-green-600 disabled:opacity-40 transition-colors"
        >
          <Check size={16} />
          {saving ? "Saving…" : "Save Question"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScenarioQuestionsManager() {
  const [questions, setQuestions] = useState<ScenarioQuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminGetScenarioQuestions();
    if (res.success) {
      setQuestions(res.questions.sort((a, b) => a.displayOrder - b.displayOrder));
      setError(null);
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (req: ScenarioQuestionRequest) => {
    setSaving(true);
    const res = await adminCreateScenarioQuestion(req);
    if (res.success) {
      setShowCreate(false);
      await load();
    } else {
      alert(res.message);
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string, req: ScenarioQuestionRequest) => {
    setSaving(true);
    const res = await adminUpdateScenarioQuestion(id, req);
    if (res.success) {
      setEditingId(null);
      await load();
    } else {
      alert(res.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    const res = await adminDeleteScenarioQuestion(id);
    if (res.success) await load();
    else alert(res.message);
  };

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const nextOrder = questions.length + 1;

  // ── Dimension distribution ─────────────────────────────────────────────────
  const countByDimension = DIMENSIONS.reduce<Record<string, number>>((acc, d) => {
    acc[d] = questions.filter((q) => q.dimensionCode === d).length;
    return acc;
  }, {});

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Layers size={22} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Scenario Questions</h1>
            <p className="text-sm text-slate-400">
              {questions.length} question{questions.length !== 1 ? "s" : ""} · Likert scale answers
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold
                     hover:bg-green-600 transition-colors shadow-sm"
        >
          <Plus size={18} /> New Question
        </button>
      </div>

      {/* Dimension stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {DIMENSIONS.map((d) => (
          <div key={d} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-700">{countByDimension[d]}</p>
            <p className="text-xs text-slate-400 mt-0.5">{d}</p>
          </div>
        ))}
      </div>

      {/* Answer legend */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-2">How Likert answers are scored</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Strongly Agree", note: "→ Pole A (×1)", style: "bg-green-500 text-white" },
            { label: "Agree",          note: "→ Pole A (×1)", style: "bg-green-200 text-green-800" },
            { label: "Neutral",        note: "→ not counted", style: "bg-slate-200 text-slate-600" },
            { label: "Disagree",       note: "→ Pole B (×1)", style: "bg-orange-200 text-orange-800" },
            { label: "Strongly Disagree", note: "→ Pole B (×1)", style: "bg-red-500 text-white" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.style}`}>
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-600 mb-3">New Question</h2>
          <QuestionForm
            initial={emptyQuestion()}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
            saving={saving}
            nextOrder={nextOrder}
          />
        </div>
      )}

      {/* Question list */}
      {questions.length === 0 && !showCreate ? (
        <div className="text-center py-16 text-slate-400">
          No scenario questions yet. Click &ldquo;New Question&rdquo; to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const [poleA] = POLE_MAP[q.dimensionCode as DimCode] ?? ["?", "?"];

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  editingId === q.id ? "border-green-300" : "border-slate-100"
                }`}
              >
                {editingId === q.id ? (
                  <div className="p-4">
                    <QuestionForm
                      initial={{
                        text: q.text,
                        dimensionCode: q.dimensionCode,
                        displayOrder: q.displayOrder,
                        options: buildLikertOptions(q.dimensionCode as DimCode),
                      }}
                      onSave={(req) => handleUpdate(q.id, req)}
                      onCancel={() => setEditingId(null)}
                      saving={saving}
                      nextOrder={nextOrder}
                    />
                  </div>
                ) : (
                  <>
                    {/* Collapsed header */}
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer select-none"
                      onClick={() => toggleExpand(q.id)}
                    >
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-700">
                        {q.dimensionCode}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400 font-mono">#{q.displayOrder}</span>
                      <p className="flex-1 text-sm font-medium text-slate-700 line-clamp-1">{q.text}</p>
                      {expandedId === q.id ? (
                        <ChevronUp size={16} className="text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400 shrink-0" />
                      )}
                    </div>

                    {/* Expanded */}
                    {expandedId === q.id && (
                      <div className="px-4 pb-4 border-t border-slate-50">
                        <p className="text-sm text-slate-600 mt-3 mb-3">{q.text}</p>

                        {/* Likert options display */}
                        <div className="space-y-1.5">
                          {q.options
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((opt) => {
                              const isNeutral = opt.poleTarget === "NEUTRAL" || !opt.poleTarget;
                              const isPoleA = opt.poleTarget === poleA;
                              const style = isPoleA
                                ? opt.text === "Strongly Agree"
                                  ? "bg-green-500 text-white"
                                  : "bg-green-100 text-green-700"
                                : isNeutral
                                ? "bg-slate-100 text-slate-500"
                                : opt.text === "Strongly Disagree"
                                ? "bg-red-500 text-white"
                                : "bg-orange-100 text-orange-700";

                              return (
                                <div
                                  key={opt.id}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${style}`}
                                >
                                  <span className="font-medium">{opt.text}</span>
                                  <span className="text-xs font-mono opacity-70">
                                    {isNeutral ? "not counted" : `→ ${opt.poleTarget}`}
                                  </span>
                                </div>
                              );
                            })}
                        </div>

                        <div className="flex gap-2 mt-4 justify-end">
                          <button
                            onClick={() => { setEditingId(q.id); setShowCreate(false); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200
                                       rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-red-200
                                       rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
