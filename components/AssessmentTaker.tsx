"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  startAssessment,
  submitAssessment,
  getLatestAssessmentResult,
  QuestionDTO,
  AssessmentResultResponse,
} from "@/lib/actions/assessment.actions";
import { Brain, ChevronRight, ChevronLeft, Trophy, RotateCcw } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIMENSION_LABELS: Record<string, string> = {
  EI: "Energy Direction",
  NS: "Information Gathering",
  TF: "Decision Making",
  JP: "Lifestyle",
};

// ─── Result Panel ─────────────────────────────────────────────────────────────

function ResultPanel({ result, onRetake }: { result: AssessmentResultResponse; onRetake: () => void }) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <Trophy size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">{result.personalityType.code}</h1>
        <p className="text-xl text-green-600 font-semibold mt-1">{result.personalityType.name}</p>
        <p className="text-slate-500 mt-3 max-w-md mx-auto">{result.personalityType.description}</p>
      </div>

      {/* Dimension bars */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-slate-700 text-lg mb-2">Your Dimension Scores</h2>
        {Object.entries(result.dimensionScores).map(([code, dim]) => (
          <div key={code}>
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>{dim.poleALabel} ({dim.poleA})</span>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {DIMENSION_LABELS[code] ?? code}
              </span>
              <span>{dim.poleBLabel} ({dim.poleB})</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
              <div
                className="bg-green-500 transition-all duration-700"
                style={{ width: `${dim.poleAPercent}%` }}
              />
              <div
                className="bg-slate-300 transition-all duration-700"
                style={{ width: `${dim.poleBPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>{dim.poleAPercent}%</span>
              <span className={`font-bold text-sm ${dim.winner === dim.poleA ? "text-green-600" : "text-slate-600"}`}>
                Winner: {dim.winner}
              </span>
              <span>{dim.poleBPercent}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-2 border border-slate-200 rounded-lg
                     text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={16} /> Retake Assessment
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Phase = "idle" | "loading" | "taking" | "submitting" | "result" | "error";

export default function AssessmentTaker() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Map of questionId → selectedOptionId
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<AssessmentResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    setPhase("loading");
    const res = await startAssessment();
    if (!res.success) {
      setError(res.message);
      setPhase("error");
      return;
    }
    setAssessmentId(res.data.assessmentId);
    setQuestions(res.data.questions.sort((a, b) => a.displayOrder - b.displayOrder));
    setCurrentIndex(0);
    setAnswers(new Map());
    setPhase("taking");
  }, []);

  const handleCheckLatest = useCallback(async () => {
    setPhase("loading");
    const res = await getLatestAssessmentResult();
    if (res.success) {
      setResult(res.result);
      setPhase("result");
    } else {
      setPhase("idle");
    }
  }, []);

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, optionId));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setPhase("submitting");
    const responses = Array.from(answers.entries()).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    const res = await submitAssessment(assessmentId, responses);
    if (!res.success) {
      setError(res.message);
      setPhase("error");
      return;
    }
    setResult(res.result);
    setPhase("result");
    router.refresh();
  };

  // ── Idle / load latest ───────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <Brain size={40} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personality Assessment</h1>
          <p className="text-slate-500 mt-2 max-w-sm">
            Discover your personality type based on the four MBTI dimensions. The assessment
            takes about 5 minutes to complete.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-sm"
          >
            Start Assessment
          </button>
          <button
            onClick={handleCheckLatest}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            View Latest Result
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading" || phase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
        <p className="text-slate-500">{phase === "submitting" ? "Computing your results…" : "Loading…"}</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => setPhase("idle")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (phase === "result" && result) {
    return <ResultPanel result={result} onRetake={handleStart} />;
  }

  // ── Taking the assessment ───────────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const currentAnswer = answers.get(currentQ?.id ?? "");
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = answers.size === questions.length;

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-2 block">
          {DIMENSION_LABELS[currentQ?.dimensionCode] ?? currentQ?.dimensionCode}
        </span>
        <p className="text-lg font-semibold text-slate-800 leading-snug">{currentQ?.text}</p>
      </div>

      {/* Custom options */}
      <div className="flex flex-col gap-2 mb-8">
        {currentQ?.options.map((opt, idx) => {
          const isSelected = currentAnswer === opt.id;
          // Cycle through a set of accent colors for visual variety
          const accentColors = [
            "border-green-500 bg-green-500 text-white",
            "border-green-400 bg-green-400 text-white",
            "border-teal-500 bg-teal-500 text-white",
            "border-blue-400 bg-blue-400 text-white",
            "border-indigo-400 bg-indigo-400 text-white",
            "border-purple-400 bg-purple-400 text-white",
          ];
          const selectedColor = accentColors[idx % accentColors.length];
          return (
            <button
              key={opt.id}
              onClick={() => handleAnswer(currentQ.id, opt.id)}
              className={`
                w-full py-3 px-5 rounded-xl border-2 font-medium text-sm transition-all duration-150 text-left
                ${isSelected
                  ? selectedColor
                  : "bg-white border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50"
                }
              `}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200
                     text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-white
                       hover:bg-green-600 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex items-center gap-1 px-5 py-2 rounded-lg bg-green-500 text-white font-semibold
                       hover:bg-green-600 disabled:opacity-40 transition-colors"
          >
            Submit <Trophy size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
