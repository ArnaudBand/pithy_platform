"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { HandCoins, Calendar, DollarSign, X, ExternalLink, FileText } from "lucide-react";
import {
  getMyFundingApplications,
  withdrawFundingApplication,
  FundingApplicationDTO,
  FundingApplicationStatus,
} from "@/lib/actions/funding.actions";

const statusColors: Record<FundingApplicationStatus, string> = {
  DRAFT:        "bg-purple-100 text-purple-700 border-purple-300",
  SUBMITTED:    "bg-blue-100 text-blue-700 border-blue-300",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-300",
  APPROVED:     "bg-green-100 text-green-700 border-green-300",
  REJECTED:     "bg-red-100 text-red-600 border-red-300",
  WITHDRAWN:    "bg-gray-100 text-gray-500 border-gray-300",
  ON_HOLD:      "bg-orange-100 text-orange-700 border-orange-300",
};

const MyFundingApplications = () => {
  const [applications, setApplications] = useState<FundingApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const result = await getMyFundingApplications();
      if (!result.success) {
        toast.error(result.message ?? "Failed to load applications");
      } else {
        setApplications(result.applications);
      }
      setLoading(false);
    });
  }, []);

  const handleWithdraw = (appId: string) => {
    startTransition(async () => {
      const result = await withdrawFundingApplication(appId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to withdraw application");
        return;
      }
      toast.success("Application withdrawn");
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? result.application! : a))
      );
      setConfirmWithdrawId(null);
    });
  };

  const fmt = (n?: number, cur = "USD") =>
    n != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: cur, notation: "compact" }).format(n)
      : "—";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">
          My Funding Applications
        </h1>
        <p className="text-gray-600 mt-2">
          Track all the funding opportunities you have applied for.
        </p>
        <div className="mt-3 h-1 w-20 bg-green-500 rounded-full" />
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <HandCoins size={56} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No applications yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Browse available funding opportunities and submit your first application.
          </p>
          <Link
            href="/human-services/dashboard/fundings"
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Fundings
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-6">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((app) => (
              <div
                key={app.id ?? app.fundingId}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Top: company + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-base leading-tight truncate">
                      {app.fundingCompanyName ?? app.companyName}
                    </p>
                    {app.fundingType && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.fundingType.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusColors[app.status] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}
                  >
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Application number */}
                {app.applicationNumber && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <FileText size={12} />
                    Application #{app.applicationNumber}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-green-500 shrink-0" />
                    <span>
                      <span className="font-medium text-green-600">Requested:</span>{" "}
                      {fmt(app.amountRequested, app.currency)}
                    </span>
                  </div>
                  {app.fundingAmount != null && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-gray-400 shrink-0" />
                      <span>
                        <span className="font-medium">Available:</span>{" "}
                        {fmt(app.fundingAmount, app.currency)}
                      </span>
                    </div>
                  )}
                  {app.industrySector && (
                    <p>
                      <span className="font-medium text-green-600">Sector:</span>{" "}
                      {app.industrySector}
                    </p>
                  )}
                  {app.appliedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 shrink-0" />
                      Applied{" "}
                      {new Date(app.appliedAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </div>
                  )}
                </div>

                {/* Use of funds excerpt */}
                {app.useOfFunds && (
                  <p className="text-xs text-gray-500 line-clamp-2 border-t border-gray-100 pt-2">
                    {app.useOfFunds}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1 mt-auto">
                  <Link
                    href={`/human-services/dashboard/fundings/${app.fundingId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <ExternalLink size={13} /> View Funding
                  </Link>

                  {app.status !== "WITHDRAWN" && app.id && (
                    <>
                      {confirmWithdrawId === app.id ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleWithdraw(app.id!)}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg disabled:opacity-60"
                          >
                            {isPending ? "…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmWithdrawId(null)}
                            className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <X size={12} className="text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmWithdrawId(app.id!)}
                          className="px-3 py-1.5 border border-red-400 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyFundingApplications;
