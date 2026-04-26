"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Users, Mail, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getApplicationsForScholarship,
  ScholarshipApplicationDTO,
  ScholarshipApplicationStatus,
} from "@/lib/actions/scholarship.actions";

interface ScholarshipApplicantsProps {
  scholarshipId: string;
  scholarshipTitle: string;
  onClose: () => void;
}

const statusConfig: Record<
  ScholarshipApplicationStatus,
  { icon: React.ReactNode; color: string }
> = {
  PENDING: {
    icon: <Clock size={13} />,
    color: "bg-yellow-100 text-yellow-700",
  },
  SUBMITTED: {
    icon: <CheckCircle2 size={13} />,
    color: "bg-green-100 text-green-700",
  },
  WITHDRAWN: {
    icon: <XCircle size={13} />,
    color: "bg-gray-100 text-gray-500",
  },
};

const ScholarshipApplicants: React.FC<ScholarshipApplicantsProps> = ({
  scholarshipId,
  scholarshipTitle,
  onClose,
}) => {
  const [applications, setApplications] = useState<ScholarshipApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    startTransition(async () => {
      const result = await getApplicationsForScholarship(scholarshipId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to load applicants");
      } else {
        setApplications(result.applications);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scholarshipId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Toaster position="top-right" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-green-600" />
              Applicants
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {scholarshipTitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {applications.length} total
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
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No applicants yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Applicants will appear here once users start tracking their
                applications.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Applicant
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const { icon, color } = statusConfig[app.status] ?? statusConfig.PENDING;
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-green-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-700 font-semibold text-sm">
                              {/* Profile-based — show placeholder */}
                              A
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              Applicant #{app.id.slice(-6)}
                            </p>
                            {app.notes && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                Note: {app.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
                        >
                          {icon}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(app.appliedAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary footer */}
        {applications.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-4 text-xs text-gray-500">
            {(["PENDING", "SUBMITTED", "WITHDRAWN"] as ScholarshipApplicationStatus[]).map(
              (s) => {
                const count = applications.filter((a) => a.status === s).length;
                return (
                  <span key={s} className={`flex items-center gap-1 ${statusConfig[s].color} px-2 py-0.5 rounded-full`}>
                    {statusConfig[s].icon}
                    {count} {s}
                  </span>
                );
              }
            )}
            <span className="ml-auto flex items-center gap-1">
              <Mail size={12} />
              {applications.length} total
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipApplicants;
