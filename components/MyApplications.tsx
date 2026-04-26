"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getMyApplications,
  withdrawApplication,
  JobApplicationDTO,
  PageResponse,
} from "@/lib/actions/job.actions";
import { Button } from "./ui/button";

const PAGE_SIZE = 10;

const MyApplications: React.FC = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<JobApplicationDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);

  const fetchPage = (p: number) => {
    setLoading(true);
    startTransition(async () => {
      const result = await getMyApplications(p, PAGE_SIZE);
      if (!result.success || !result.data) {
        toast.error(result.message ?? "Failed to load applications");
      } else {
        setData(result.data);
        setPage(p);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdraw = (applicationId: string) => {
    setWithdrawingId(applicationId);
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to withdraw application");
      } else {
        toast.success("Application withdrawn");
        // Remove from local list optimistically
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            content: prev.content.filter((a) => a.id !== applicationId),
            totalElements: Math.max(0, prev.totalElements - 1),
          };
        });
      }
      setWithdrawingId(null);
      setConfirmWithdrawId(null);
    });
  };

  const applications = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="container mx-auto p-4">
      <Toaster
        position="top-right"
        toastOptions={{ className: "bg-black/50 text-green-200", duration: 4000 }}
      />

      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BriefcaseBusiness className="text-green-600" size={24} />
          My Applications
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track every job you have applied for. You can withdraw an application
          at any time.
        </p>
        <div className="mt-3 h-1 w-16 bg-green-500 rounded-full" />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-gray-200">
          <BriefcaseBusiness size={56} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Browse open positions and track your progress here.
          </p>
          <Link
            href="/human-services/dashboard/jobs"
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {totalElements} application{totalElements !== 1 ? "s" : ""} total
          </p>

          {/* Application cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3"
              >
                {/* Job info */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 leading-tight">
                    {app.jobTitle}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{app.company}</p>
                </div>

                {/* Applied date */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={13} />
                  Applied{" "}
                  {new Date(app.appliedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/human-services/dashboard/jobs/${app.jobId}`}
                    className="flex-1 text-center text-sm px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors"
                  >
                    View Job
                  </Link>

                  {/* Confirm withdraw */}
                  {confirmWithdrawId === app.id ? (
                    <div className="flex gap-1.5 flex-1">
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
                        className="flex-1 text-xs"
                        onClick={() => setConfirmWithdrawId(null)}
                      >
                        <X size={14} />
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
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPage(page - 1)}
                disabled={page === 0 || loading}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPage(page + 1)}
                disabled={page >= totalPages - 1 || loading}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyApplications;
