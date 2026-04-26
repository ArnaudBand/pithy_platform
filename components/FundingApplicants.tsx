"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Users, Mail, Calendar, DollarSign, Clock, CheckCircle2, XCircle, Eye, AlertCircle, Pause } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getApplicationsForFunding,
  FundingApplicationDTO,
  FundingApplicationStatus,
} from "@/lib/actions/funding.actions";

interface FundingApplicantsProps {
  fundingId: string;
  fundingName: string;
  onClose: () => void;
}

const statusConfig: Record<
  FundingApplicationStatus,
  { icon: React.ReactNode; color: string }
> = {
  DRAFT:        { icon: <Clock size={13} />,        color: "bg-purple-100 text-purple-700" },
  SUBMITTED:    { icon: <Mail size={13} />,          color: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { icon: <Eye size={13} />,           color: "bg-yellow-100 text-yellow-700" },
  APPROVED:     { icon: <CheckCircle2 size={13} />,  color: "bg-green-100 text-green-700" },
  REJECTED:     { icon: <XCircle size={13} />,       color: "bg-red-100 text-red-600" },
  WITHDRAWN:    { icon: <XCircle size={13} />,       color: "bg-gray-100 text-gray-500" },
  ON_HOLD:      { icon: <Pause size={13} />,         color: "bg-orange-100 text-orange-700" },
};

const ALL_STATUSES: FundingApplicationStatus[] = [
  "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN", "ON_HOLD", "DRAFT",
];

const FundingApplicants: React.FC<FundingApplicantsProps> = ({
  fundingId,
  fundingName,
  onClose,
}) => {
  const [applications, setApplications] = useState<FundingApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    startTransition(async () => {
      const result = await getApplicationsForFunding(fundingId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to load applicants");
      } else {
        setApplications(result.applications);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundingId]);

  const fmt = (n?: number, cur = "USD") =>
    n != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: cur, notation: "compact" }).format(n)
      : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Toaster position="top-right" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-green-600" />
              Funding Applicants
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{fundingName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{applications.length} total</span>
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
              <AlertCircle size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No applicants yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Applications will appear here once users submit their requests.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Company</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden lg:table-cell">Requested</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app, idx) => {
                  const cfg = statusConfig[app.status] ?? statusConfig.SUBMITTED;
                  return (
                    <tr key={app.id ?? idx} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-700 font-semibold text-sm">
                              {app.companyName?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{app.companyName}</p>
                            {app.applicationNumber && (
                              <p className="text-xs text-gray-400 mt-0.5">#{app.applicationNumber}</p>
                            )}
                            {app.industrySector && (
                              <p className="text-xs text-gray-400 truncate">{app.industrySector}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="min-w-0">
                          <p className="text-gray-700 truncate">{app.contactName}</p>
                          <a
                            href={`mailto:${app.contactEmail}`}
                            className="text-xs text-green-600 hover:underline truncate block"
                          >
                            {app.contactEmail}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-gray-700">
                          <DollarSign size={13} className="text-green-500" />
                          {fmt(app.amountRequested, app.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          {cfg.icon}
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                        {app.appliedAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            {new Date(app.appliedAt).toLocaleDateString(undefined, {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </div>
                        ) : "—"}
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
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex flex-wrap gap-2 text-xs text-gray-500">
            {ALL_STATUSES.filter((s) => applications.some((a) => a.status === s)).map((s) => {
              const count = applications.filter((a) => a.status === s).length;
              const { icon, color } = statusConfig[s];
              return (
                <span key={s} className={`inline-flex items-center gap-1 ${color} px-2 py-0.5 rounded-full`}>
                  {icon}
                  {count} {s.replace(/_/g, " ")}
                </span>
              );
            })}
            <span className="ml-auto flex items-center gap-1">
              <Users size={12} />
              {applications.length} total
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingApplicants;
