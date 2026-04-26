"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getScholarshipById,
  applyForScholarship,
  getMyScholarshipApplications,
  withdrawScholarshipApplication,
  updateScholarshipApplicationStatus,
  ScholarshipDTO,
  ScholarshipApplicationDTO,
} from "@/lib/actions/scholarship.actions";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const ScholarshipDetailPage = () => {
  const { scholarship_id } = useParams();
  const router = useRouter();
  const id = (Array.isArray(scholarship_id) ? scholarship_id[0] : scholarship_id) ?? "";

  const [scholarship, setScholarship] = useState<ScholarshipDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [myApplication, setMyApplication] =
    useState<ScholarshipApplicationDTO | null>(null);
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Load scholarship + check existing application ─────────────────────────
  useEffect(() => {
    if (!id) return;
    startTransition(async () => {
      const [schResult, appsResult] = await Promise.all([
        getScholarshipById(id),
        getMyScholarshipApplications(),
      ]);

      if (!schResult.success) {
        toast.error(schResult.message ?? "Scholarship not found");
      } else {
        setScholarship(schResult.scholarship!);
      }

      if (appsResult.success) {
        const existing = appsResult.applications.find(
          (a) => a.scholarshipId === id
        );
        setMyApplication(existing ?? null);
      }

      setLoading(false);
    });
  }, [id]);

  // ── Apply ─────────────────────────────────────────────────────────────────
  const handleApply = () => {
    startTransition(async () => {
      const result = await applyForScholarship({
        scholarshipId: id,
        notes: notes.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.message ?? "Failed to apply");
        return;
      }
      toast.success("Application submitted!");
      setMyApplication(result.application!);
      setShowNotesInput(false);
      setNotes("");
    });
  };

  // ── Submit (PENDING → SUBMITTED) ─────────────────────────────────────────
  const handleSubmitApplication = () => {
    if (!myApplication) return;
    startTransition(async () => {
      const result = await updateScholarshipApplicationStatus(myApplication.id, {
        status: "SUBMITTED",
      });
      if (!result.success) {
        toast.error(result.message ?? "Failed to submit");
        return;
      }
      toast.success("Application marked as submitted!");
      setMyApplication(result.application!);
    });
  };

  // ── Withdraw ──────────────────────────────────────────────────────────────
  const handleWithdraw = () => {
    if (!myApplication) return;
    startTransition(async () => {
      const result = await withdrawScholarshipApplication(myApplication.id);
      if (!result.success) {
        toast.error(result.message ?? "Failed to withdraw");
        return;
      }
      toast.success("Application withdrawn");
      setMyApplication(null);
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const daysLeft = (iso: string) =>
    Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const applicationStatusInfo = (status: string) => {
    const map: Record<
      string,
      { icon: React.ReactNode; label: string; color: string }
    > = {
      PENDING: {
        icon: <Clock size={16} />,
        label: "Application Pending",
        color: "bg-yellow-50 border-yellow-300 text-yellow-700",
      },
      SUBMITTED: {
        icon: <CheckCircle2 size={16} />,
        label: "Application Submitted",
        color: "bg-green-50 border-green-300 text-green-700",
      },
      WITHDRAWN: {
        icon: <XCircle size={16} />,
        label: "Application Withdrawn",
        color: "bg-gray-50 border-gray-300 text-gray-600",
      },
    };
    return map[status] ?? map["PENDING"];
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">Scholarship not found.</p>
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const days = daysLeft(scholarship.deadline);

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <Toaster position="top-right" />

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Listings
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header banner */}
        <div className="h-36 bg-gradient-to-r from-green-500 to-green-300 flex items-center justify-center px-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white text-center leading-tight">
            {scholarship.title}
          </h1>
        </div>

        <div className="p-6 md:p-8">
          {/* Application status banner */}
          {myApplication && (
            <div
              className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium ${
                applicationStatusInfo(myApplication.status).color
              }`}
            >
              {applicationStatusInfo(myApplication.status).icon}
              {applicationStatusInfo(myApplication.status).label}
              {myApplication.notes && (
                <span className="ml-2 text-xs opacity-70">
                  Note: {myApplication.notes}
                </span>
              )}
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              {scholarship.provider && (
                <p className="text-gray-700">
                  <span className="font-semibold text-green-600">Provider:</span>{" "}
                  {scholarship.provider}
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-semibold text-green-600">Status:</span>{" "}
                <span
                  className={`font-medium ${
                    scholarship.status === "ACTIVE"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {scholarship.status}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-green-600">Posted:</span>{" "}
                {formatDate(scholarship.createdAt)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-green-500 mt-0.5" />
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold text-green-600">
                      Deadline:
                    </span>{" "}
                    {formatDate(scholarship.deadline)}
                  </p>
                  {days <= 30 && days > 0 && (
                    <p
                      className={`text-xs mt-0.5 font-medium ${
                        days <= 7 ? "text-red-500" : "text-orange-500"
                      }`}
                    >
                      {days} day{days !== 1 ? "s" : ""} left — apply soon!
                    </p>
                  )}
                  {days <= 0 && (
                    <p className="text-xs mt-0.5 text-red-500 font-medium">
                      Deadline has passed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {scholarship.description && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-800 mb-2">About this Scholarship</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {scholarship.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* External apply link */}
            <a
              href={scholarship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all"
            >
              <ExternalLink size={16} />
              Apply on Official Site
            </a>

            {/* Track application */}
            {!myApplication && scholarship.status === "ACTIVE" && days > 0 && (
              <>
                {showNotesInput ? (
                  <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes (e.g. 'Applied on official site')"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-green-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleApply}
                        disabled={isPending}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                      >
                        {isPending ? "Tracking…" : "Confirm Track"}
                      </button>
                      <button
                        onClick={() => setShowNotesInput(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNotesInput(true)}
                    className="px-5 py-3 border-2 border-green-500 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Track My Application
                  </button>
                )}
              </>
            )}

            {/* Already tracked */}
            {myApplication && myApplication.status === "PENDING" && (
              <button
                onClick={handleSubmitApplication}
                disabled={isPending}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {isPending ? "Updating…" : "Mark as Submitted"}
              </button>
            )}

            {myApplication && myApplication.status !== "WITHDRAWN" && (
              <button
                onClick={handleWithdraw}
                disabled={isPending}
                className="px-5 py-3 border border-red-400 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {isPending ? "Withdrawing…" : "Withdraw Tracking"}
              </button>
            )}
          </div>

          {/* View all applications link */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/human-services/dashboard/scholarships/applications"
              className="text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              View all my scholarship applications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;
