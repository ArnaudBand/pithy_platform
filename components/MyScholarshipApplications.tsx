"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getMyScholarshipApplications,
  withdrawScholarshipApplication,
  updateScholarshipApplicationStatus,
  ScholarshipApplicationDTO,
  ScholarshipApplicationStatus,
} from "@/lib/actions/scholarship.actions";
import { Button } from "./ui/button";

const statusConfig: Record<
  ScholarshipApplicationStatus,
  { icon: React.ReactNode; label: string; color: string }
> = {
  PENDING: {
    icon: <Clock size={14} />,
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  SUBMITTED: {
    icon: <CheckCircle2 size={14} />,
    label: "Submitted",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  WITHDRAWN: {
    icon: <XCircle size={14} />,
    label: "Withdrawn",
    color: "bg-gray-100 text-gray-500 border-gray-300",
  },
};

const MyScholarshipApplications: React.FC = () => {
  const [applications, setApplications] = useState<ScholarshipApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    startTransition(async () => {
      const result = await getMyScholarshipApplications();
      if (!result.success) {
        toast.error(result.message ?? "Failed to load applications");
      } else {
        setApplications(result.applications);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (applicationId: string) => {
    startTransition(async () => {
      const result = await updateScholarshipApplicationStatus(applicationId, {
        status: "SUBMITTED",
      });
      if (!result.success) {
        toast.error(result.message ?? "Failed to update");
        return;
      }
      toast.success("Marked as submitted!");
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? result.application! : a))
      );
    });
  };

  const handleWithdraw = (applicationId: string) => {
    setWithdrawingId(applicationId);
    startTransition(async () => {
      const result = await withdrawScholarshipApplication(applicationId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to withdraw");
        setWithdrawingId(null);
        setConfirmWithdrawId(null);
        return;
      }
      toast.success("Application withdrawn");
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
      setWithdrawingId(null);
      setConfirmWithdrawId(null);
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const daysLeft = (iso: string) =>
    Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="text-green-600" size={26} />
          My Scholarship Applications
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track every scholarship you have applied for. You can mark as
          submitted or withdraw at any time.
        </p>
        <div className="mt-3 h-1 w-16 bg-green-500 rounded-full" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-gray-200">
          <GraduationCap size={56} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Browse active scholarships and track your applications here.
          </p>
          <Link
            href="/human-services/dashboard/scholarships"
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Scholarships
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""} total
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => {
              const { icon, label, color } =
                statusConfig[app.status] ?? statusConfig.PENDING;
              const days = daysLeft(app.scholarshipDeadline);

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3"
                >
                  {/* Scholarship info */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 leading-tight">
                      {app.scholarshipTitle}
                    </h3>

                    {/* Deadline */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                      <Calendar size={12} />
                      <span>
                        Deadline:{" "}
                        <span
                          className={
                            days <= 7 && days > 0
                              ? "text-red-500 font-medium"
                              : days <= 0
                              ? "text-red-500"
                              : "text-gray-600"
                          }
                        >
                          {formatDate(app.scholarshipDeadline)}
                          {days <= 7 && days > 0 && ` (${days}d left!)`}
                          {days <= 0 && " (passed)"}
                        </span>
                      </span>
                    </div>

                    {/* Applied at */}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tracked on {formatDate(app.appliedAt)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1 self-start px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}
                  >
                    {icon}
                    {label}
                  </span>

                  {/* Notes */}
                  {app.notes && (
                    <p className="text-xs text-gray-500 italic border-l-2 border-green-200 pl-2">
                      {app.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 flex-wrap">
                    <a
                      href={app.scholarshipApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 flex-1 justify-center text-sm px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors"
                    >
                      <ExternalLink size={13} />
                      Apply
                    </a>

                    {app.status === "PENDING" && (
                      <button
                        onClick={() => handleSubmit(app.id)}
                        disabled={isPending}
                        className="flex-1 text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60"
                      >
                        Mark Submitted
                      </button>
                    )}

                    {app.status !== "WITHDRAWN" && (
                      <>
                        {confirmWithdrawId === app.id ? (
                          <div className="flex gap-1 flex-1">
                            <Button
                              size="sm"
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                              disabled={isPending && withdrawingId === app.id}
                              onClick={() => handleWithdraw(app.id)}
                            >
                              {isPending && withdrawingId === app.id
                                ? "…"
                                : "Confirm"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => setConfirmWithdrawId(null)}
                            >
                              <X size={13} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() => setConfirmWithdrawId(app.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MyScholarshipApplications;
