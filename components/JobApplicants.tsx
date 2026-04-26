"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Users, Mail, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import toast, { Toaster } from "react-hot-toast";
import {
  getApplicationsForJob,
  JobApplicationDTO,
  PageResponse,
} from "@/lib/actions/job.actions";

interface JobApplicantsProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

const PAGE_SIZE = 10;

const JobApplicants: React.FC<JobApplicantsProps> = ({
  jobId,
  jobTitle,
  onClose,
}) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<JobApplicationDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();

  const fetchPage = (p: number) => {
    setLoading(true);
    startTransition(async () => {
      const result = await getApplicationsForJob(jobId, p, PAGE_SIZE);
      if (!result.success || !result.data) {
        toast.error(result.message ?? "Failed to load applicants");
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
  }, [jobId]);

  const applicants = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Toaster position="top-right" />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-green-600" />
              Applicants
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {jobTitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {totalElements} total
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No applicants yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Applicants will appear here once users start applying.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Applicant
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicants.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-green-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar placeholder */}
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-semibold text-sm">
                            {app.applicantEmail.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {app.applicantEmail}
                          </p>
                          <a
                            href={`mailto:${app.applicantEmail}`}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-0.5"
                          >
                            <Mail size={11} />
                            Send email
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <span className="text-xs text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPage(page - 1)}
                disabled={page === 0 || loading}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPage(page + 1)}
                disabled={page >= totalPages - 1 || loading}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
