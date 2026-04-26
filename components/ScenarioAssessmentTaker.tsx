"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  startScenarioAssessment,
  submitScenarioAssessment,
  getLatestScenarioResult,
  getCombinedProfile,
  initiateScenarioPayment,
  verifyScenarioPayment,
  ScenarioQuestionDTO,
  ScenarioResultResponse,
  CombinedProfileResponse,
} from "@/lib/actions/scenario-assessment.actions";
import {
  Layers,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw,
  Lock,
  Combine,
} from "lucide-react";

// ─── Combined profile view ─────────────────────────────────────────────────────

function CombinedProfilePanel({ data }: { data: CombinedProfileResponse }) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Your Combined Profile</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Personality result */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Personality (Likert)
          </p>
          {data.likertResult ? (
            <>
              <p className="text-3xl font-bold text-green-600">
                {data.likertResult.personalityType.code}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {data.likertResult.personalityType.name}
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Not taken yet.</p>
          )}
        </div>

        {/* Scenario result */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Scenario Assessment
          </p>
          {data.scenarioResult ? (
            <>
              <p className="text-3xl font-bold text-green-600">
                {data.scenarioResult.personalityType.code}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {data.scenarioResult.personalityType.name}
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Not taken yet.</p>
          )}
        </div>
      </div>

      {data.likertResult && data.scenarioResult && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <p className="font-semibold text-slate-700 mb-1">Combined insight</p>
          <p className="text-slate-500 text-sm">
            Your personality type from both assessments is consistent: you are a{" "}
            <strong>{data.likertResult.personalityType.code}</strong> profile. This cross-validation
            gives a more reliable picture of how you think and work.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/human-services/dashboard/assessment"
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
          Go to Personality Assessment
        </Link>
      </div>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────────────

function ResultPanel({
  result,
  remainingAttempts,
  onRetake,
  onViewCombined,
}: {
  result: ScenarioResultResponse;
  remainingAttempts: number;
  onRetake: () => void;
  onViewCombined: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <Trophy size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">{result.personalityType.code}</h1>
        <p className="text-xl text-green-600 font-semibold mt-1">{result.personalityType.name}</p>
        <p className="text-slate-500 mt-3 max-w-md mx-auto">{result.personalityType.description}</p>
        {/* Attempts remaining badge */}
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
          remainingAttempts > 0
            ? "bg-green-50 text-green-700 border border-green-100"
            : "bg-orange-50 text-orange-700 border border-orange-100"
        }`}>
          {remainingAttempts > 0
            ? `${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining`
            : "No attempts left — pay to retake"}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 mb-6">
        <h2 className="font-semibold text-slate-700 text-lg mb-2">Dimension Scores</h2>
        {Object.entries(result.dimensionScores).map(([code, dim]) => (
          <div key={code}>
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>{dim.poleALabel} ({dim.poleA})</span>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{code}</span>
              <span>{dim.poleBLabel} ({dim.poleB})</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
              <div className="bg-green-500 transition-all duration-700" style={{ width: `${dim.poleAPercent}%` }} />
              <div className="bg-slate-300 transition-all duration-700" style={{ width: `${dim.poleBPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>{dim.poleAPercent}%</span>
              <span className="font-bold text-sm text-green-600">Winner: {dim.winner}</span>
              <span>{dim.poleBPercent}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onViewCombined}
          className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
        >
          <Combine size={18} /> Combined Profile
        </button>
        <button
          onClick={onRetake}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-colors ${
            remainingAttempts > 0
              ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
              : "border border-orange-200 text-orange-600 hover:bg-orange-50"
          }`}
        >
          {remainingAttempts > 0 ? (
            <><RotateCcw size={16} /> Retake</>
          ) : (
            <><Lock size={16} /> Pay to Retake</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Paywall Screen ────────────────────────────────────────────────────────────

function PaywallScreen({ onPaid, exhausted = false }: { onPaid: () => void; exhausted?: boolean }) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [status, setStatus] = React.useState<
    "idle" | "verifying" | "redirecting" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  // ── Auto-verify when Flutterwave redirects back ──────────────────────────
  // Flutterwave appends ?transaction_id=...&status=...&tx_ref=... to the URL
  useEffect(() => {
    const transactionId = searchParams.get("transaction_id");
    const txRef         = searchParams.get("tx_ref");
    const flwStatus     = searchParams.get("status");

    if (!transactionId || !txRef) return;

    if (flwStatus !== "successful") {
      setError("Payment was cancelled or failed. Please try again.");
      // Clean the URL params
      router.replace(window.location.pathname);
      return;
    }

    setStatus("verifying");
    verifyScenarioPayment(transactionId, txRef).then((res) => {
      if (res.success) {
        router.replace(window.location.pathname); // strip query params
        onPaid();
      } else {
        setError(res.message);
        setStatus("error");
        router.replace(window.location.pathname);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Initiate payment → redirect to Flutterwave ───────────────────────────
  const handlePay = async () => {
    setStatus("redirecting");
    setError(null);

    // Use the current page URL (without params) as the return URL
    const redirectUrl = window.location.origin + window.location.pathname;

    const res = await initiateScenarioPayment(redirectUrl);
    if (res.success) {
      window.location.href = res.paymentLink; // hand off to Flutterwave
    } else {
      setError(res.message);
      setStatus("error");
    }
  };

  // ── Verifying state ──────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
        <p className="text-slate-500 font-medium">Verifying your payment…</p>
      </div>
    );
  }

  // ── Redirecting state ────────────────────────────────────────────────────
  if (status === "redirecting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
        <p className="text-slate-500 font-medium">Opening Flutterwave checkout…</p>
      </div>
    );
  }

  // ── Default paywall ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
        <Lock size={40} className="text-green-400" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Scenario Assessment</h1>
        {exhausted ? (
          <p className="text-slate-500 mt-2 max-w-sm">
            You have used all <strong>3 attempts</strong> included in your previous payment.
            Pay again to get 3 more attempts.
          </p>
        ) : (
          <p className="text-slate-500 mt-2 max-w-sm">
            Unlock scenario-based personality evaluation and your combined profile
            with a one-time payment. Includes <strong>3 attempts</strong>.
          </p>
        )}
      </div>

      {/* Price badge */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-8 py-4">
        <p className="text-3xl font-bold text-green-700">5,000 UGX</p>
        <p className="text-sm text-slate-500 mt-1">One-time payment · 3 attempts included</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3 max-w-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handlePay}
        className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold
                   hover:bg-green-600 transition-colors shadow-sm"
      >
        Pay with Flutterwave
      </button>

      <p className="text-xs text-slate-400">
        Secured by Flutterwave · Card, Mobile Money & more accepted
      </p>
    </div>
  );
}

// ─── Likert scale config ───────────────────────────────────────────────────────

const LIKERT_STYLES: Record<
  string,
  { label: string; bg: string; activeBg: string; activeBorder: string; activeText: string; dot: string }
> = {
  "Strongly Agree": {
    label: "Strongly Agree",
    bg: "bg-white border-slate-200 text-slate-700 hover:border-green-400 hover:bg-green-50",
    activeBg: "bg-green-600 border-green-600 text-white",
    activeBorder: "",
    activeText: "",
    dot: "bg-green-600",
  },
  "Agree": {
    label: "Agree",
    bg: "bg-white border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50",
    activeBg: "bg-green-400 border-green-400 text-white",
    activeBorder: "",
    activeText: "",
    dot: "bg-green-400",
  },
  "Neutral": {
    label: "Neutral",
    bg: "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
    activeBg: "bg-slate-400 border-slate-400 text-white",
    activeBorder: "",
    activeText: "",
    dot: "bg-slate-400",
  },
  "Disagree": {
    label: "Disagree",
    bg: "bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50",
    activeBg: "bg-orange-400 border-orange-400 text-white",
    activeBorder: "",
    activeText: "",
    dot: "bg-orange-400",
  },
  "Strongly Disagree": {
    label: "Strongly Disagree",
    bg: "bg-white border-slate-200 text-slate-700 hover:border-red-400 hover:bg-red-50",
    activeBg: "bg-red-500 border-red-500 text-white",
    activeBorder: "",
    activeText: "",
    dot: "bg-red-500",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

type Phase = "idle" | "loading" | "taking" | "submitting" | "result" | "combined" | "error" | "paywall";

interface ScenarioAssessmentTakerProps {
  hasPaid: boolean;
  remainingAttempts: number;
}

export default function ScenarioAssessmentTaker({ hasPaid, remainingAttempts: initialRemaining }: ScenarioAssessmentTakerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(hasPaid ? "idle" : "paywall");
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [questions, setQuestions] = useState<ScenarioQuestionDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<ScenarioResultResponse | null>(null);
  const [combinedProfile, setCombinedProfile] = useState<CombinedProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(initialRemaining);

  const handleStart = useCallback(async () => {
    setPhase("loading");
    const res = await startScenarioAssessment();
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
    const res = await getLatestScenarioResult();
    if (res.success) {
      setResult(res.result);
      setPhase("result");
    } else {
      setPhase("idle");
    }
  }, []);

  const handleViewCombined = useCallback(async () => {
    setPhase("loading");
    const res = await getCombinedProfile();
    if (res.success) {
      setCombinedProfile(res.data);
      setPhase("combined");
    } else {
      setError(res.message);
      setPhase("error");
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
    const res = await submitScenarioAssessment(assessmentId, responses);
    if (!res.success) {
      setError(res.message);
      setPhase("error");
      return;
    }
    // Decrement remaining attempts locally after a successful submit
    const newRemaining = Math.max(0, remainingAttempts - 1);
    setRemainingAttempts(newRemaining);
    setResult(res.result);
    setPhase("result");
    router.refresh();
  };

  // ── Renders ──────────────────────────────────────────────────────────────────

  if (phase === "paywall") return (
    <PaywallScreen
      onPaid={() => { setRemainingAttempts(3); setPhase("idle"); }}
      exhausted={initialRemaining === 0 && !hasPaid}
    />
  );

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
    return (
      <ResultPanel
        result={result}
        remainingAttempts={remainingAttempts}
        onRetake={remainingAttempts > 0 ? handleStart : () => setPhase("paywall")}
        onViewCombined={handleViewCombined}
      />
    );
  }

  if (phase === "combined" && combinedProfile) {
    return <CombinedProfilePanel data={combinedProfile} />;
  }

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <Layers size={40} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Scenario Assessment</h1>
          <p className="text-slate-500 mt-2 max-w-sm">
            Answer scenario-based questions to discover how your personality shapes
            your real-world decisions. Combines with your Likert profile.
          </p>
          {/* Attempts badge */}
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
            remainingAttempts > 1
              ? "bg-green-50 text-green-700 border border-green-100"
              : remainingAttempts === 1
              ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
              : "bg-orange-50 text-orange-700 border border-orange-100"
          }`}>
            {remainingAttempts > 0
              ? `${remainingAttempts} of 3 attempt${remainingAttempts === 1 ? "" : "s"} remaining`
              : "No attempts left — pay to continue"}
          </div>
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
          <button
            onClick={handleViewCombined}
            className="px-6 py-3 border border-green-200 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            Combined Profile
          </button>
        </div>
      </div>
    );
  }

  // ── Taking the assessment ────────────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const currentAnswer = answers.get(currentQ?.id ?? "");
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = answers.size === questions.length;

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-2 block">
          Dimension: {currentQ?.dimensionCode}
        </span>
        <p className="text-lg font-semibold text-slate-800 leading-snug">{currentQ?.text}</p>
      </div>

      {/* Likert scale legend */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <span className="font-medium text-green-500">← Agree</span>
        <span>Neutral</span>
        <span className="font-medium text-red-400">Disagree →</span>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {currentQ?.options
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((opt) => {
            const style = LIKERT_STYLES[opt.text];
            const isSelected = currentAnswer === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(currentQ.id, opt.id)}
                className={`
                  w-full py-3 px-5 rounded-xl border-2 font-medium text-sm transition-all duration-150
                  flex items-center gap-3
                  ${isSelected
                    ? style?.activeBg ?? "bg-green-500 border-green-500 text-white"
                    : style?.bg ?? "bg-white border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50"
                  }
                `}
              >
                {/* colour dot */}
                {style && (
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isSelected ? "bg-white/70" : style.dot
                    }`}
                  />
                )}
                {opt.text}
              </button>
            );
          })}
      </div>

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
