"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getFundingById,
  submitFundingApplication,
  getMyFundingApplications,
  withdrawFundingApplication,
  FundingDTO,
  FundingApplicationDTO,
} from "@/lib/actions/funding.actions";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, TrendingUp, MapPin, Calendar, ExternalLink, Users, X } from "lucide-react";

const emptyAppForm = (fundingId: string): FundingApplicationDTO => ({
  fundingId, status: "SUBMITTED",
  companyName: "", companyDescription: "", amountRequested: 0, currency: "USD",
  useOfFunds: "", contactName: "", contactEmail: "", contactPhone: "",
  companyWebsite: "", industrySector: "", companyRegistrationNumber: "",
  businessPlanUrl: "", pitchDeckUrl: "",
});

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-300",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-300",
  APPROVED: "bg-green-100 text-green-700 border-green-300",
  REJECTED: "bg-red-100 text-red-600 border-red-300",
  WITHDRAWN: "bg-gray-100 text-gray-500 border-gray-300",
  ON_HOLD: "bg-orange-100 text-orange-700 border-orange-300",
  DRAFT: "bg-purple-100 text-purple-700 border-purple-300",
};

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 text-sm";

const FundingDetailPage = () => {
  const { funding_id } = useParams();
  const router = useRouter();
  const id = (Array.isArray(funding_id) ? funding_id[0] : funding_id) ?? "";

  const [funding, setFunding] = useState<FundingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [myApplication, setMyApplication] = useState<FundingApplicationDTO | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [appForm, setAppForm] = useState<FundingApplicationDTO>(emptyAppForm(id));
  const [isPending, startTransition] = useTransition();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    if (!id) return;
    startTransition(async () => {
      const [fundResult, appsResult] = await Promise.all([
        getFundingById(id),
        getMyFundingApplications(),
      ]);
      if (!fundResult.success) toast.error(fundResult.message ?? "Not found");
      else setFunding(fundResult.funding!);

      if (appsResult.success) {
        const existing = appsResult.applications.find((a) => a.fundingId === id);
        setMyApplication(existing ?? null);
      }
      setLoading(false);
    });
  }, [id]);

  const handleAppChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppForm((prev) => ({ ...prev, [name]: name === "amountRequested" ? parseFloat(value) || 0 : value }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitFundingApplication({ ...appForm, fundingId: id });
      if (!result.success) { toast.error(result.message ?? "Failed to submit"); return; }
      toast.success("Application submitted!");
      setMyApplication(result.application!);
      setShowApplyForm(false);
      setAppForm(emptyAppForm(id));
    });
  };

  const handleWithdraw = () => {
    if (!myApplication?.id) return;
    startTransition(async () => {
      const result = await withdrawFundingApplication(myApplication.id!);
      if (!result.success) { toast.error(result.message ?? "Failed to withdraw"); return; }
      toast.success("Application withdrawn");
      setMyApplication(result.application!);
      setConfirmWithdraw(false);
    });
  };

  const fmt = (n?: number, cur = "USD") =>
    n != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: cur, notation: "compact" }).format(n) : "—";

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
    </div>
  );

  if (!funding) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 text-lg">Funding opportunity not found.</p>
      <button onClick={() => router.back()} className="text-green-600 hover:underline">Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <Toaster position="top-right" />

      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Fundings
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-green-500 to-green-300 flex items-center justify-center px-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{funding.companyName}</h1>
            <p className="text-green-100 text-sm mt-1">{funding.fundingType.replace(/_/g, " ")}{funding.fundingRound ? ` · ${funding.fundingRound}` : ""}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Application status banner */}
          {myApplication && (
            <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium ${statusColors[myApplication.status] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}>
              <Users size={16} />
              Application status: <strong>{myApplication.status}</strong>
              {myApplication.applicationNumber && <span className="ml-auto text-xs opacity-70">#{myApplication.applicationNumber}</span>}
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <TrendingUp size={16} className="text-green-500" />
                <span className="font-semibold text-green-600 text-lg">{fmt(funding.fundingAmount, funding.currency)}</span>
              </div>
              {funding.leadInvestor && <p className="text-gray-700"><span className="font-semibold text-green-600">Lead Investor:</span> {funding.leadInvestor}</p>}
              {funding.industrySector && <p className="text-gray-700"><span className="font-semibold text-green-600">Sector:</span> {funding.industrySector}</p>}
              {funding.companyLocation && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin size={14} className="text-green-500" />
                  {funding.companyLocation}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-gray-700"><span className="font-semibold text-green-600">Funding Date:</span> {fmtDate(funding.fundingDate)}</p>
              {funding.expectedClosingDate && (
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Calendar size={14} className="text-green-500" />
                  <span><span className="font-semibold text-green-600">Closes:</span> {fmtDate(funding.expectedClosingDate)}</span>
                </div>
              )}
              <p className="text-gray-700">
                <span className="font-semibold text-green-600">Status:</span>{" "}
                <span className="font-medium">{funding.status.replace(/_/g, " ")}</span>
              </p>
              {funding.isVerified && <p className="text-green-600 text-sm font-medium">✓ Verified funding</p>}
            </div>
          </div>

          {funding.fundingPurpose && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-800 mb-2">About this Funding</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{funding.fundingPurpose}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {funding.pressReleaseUrl && (
              <a href={funding.pressReleaseUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all">
                <ExternalLink size={16} /> View Press Release
              </a>
            )}

            {/* Apply button — only if no application yet and status is PENDING */}
            {!myApplication && funding.status === "PENDING" && !showApplyForm && (
              <button onClick={() => setShowApplyForm(true)}
                className="px-5 py-3 border-2 border-green-500 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors">
                Apply for Funding
              </button>
            )}

            {/* Withdraw */}
            {myApplication && myApplication.status !== "WITHDRAWN" && (
              <>
                {confirmWithdraw ? (
                  <div className="flex gap-2">
                    <button onClick={handleWithdraw} disabled={isPending} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                      {isPending ? "…" : "Confirm Withdraw"}
                    </button>
                    <button onClick={() => setConfirmWithdraw(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmWithdraw(true)}
                    className="px-5 py-3 border border-red-400 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                    Withdraw Application
                  </button>
                )}
              </>
            )}
          </div>

          {/* Apply form */}
          {showApplyForm && (
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Submit Application</h2>
                <button onClick={() => setShowApplyForm(false)} className="p-1 hover:bg-gray-200 rounded-full">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label><input name="companyName" value={appForm.companyName} onChange={handleAppChange} required className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Name <span className="text-red-500">*</span></label><input name="contactName" value={appForm.contactName} onChange={handleAppChange} required className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label><input name="contactEmail" type="email" value={appForm.contactEmail} onChange={handleAppChange} required className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label><input name="contactPhone" value={appForm.contactPhone} onChange={handleAppChange} className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount Requested <span className="text-red-500">*</span></label><input name="amountRequested" type="number" min="0.01" step="0.01" value={appForm.amountRequested} onChange={handleAppChange} required className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Currency <span className="text-red-500">*</span></label><input name="currency" value={appForm.currency} onChange={handleAppChange} maxLength={3} required className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label><input name="industrySector" value={appForm.industrySector} onChange={handleAppChange} className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label><input name="companyWebsite" type="url" value={appForm.companyWebsite} onChange={handleAppChange} placeholder="https://..." className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Plan URL</label><input name="businessPlanUrl" type="url" value={appForm.businessPlanUrl} onChange={handleAppChange} placeholder="https://..." className={inputCls} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Pitch Deck URL</label><input name="pitchDeckUrl" type="url" value={appForm.pitchDeckUrl} onChange={handleAppChange} placeholder="https://..." className={inputCls} /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Company Description <span className="text-red-500">*</span></label><textarea name="companyDescription" value={appForm.companyDescription} onChange={handleAppChange} required rows={3} className={`${inputCls} resize-none`} placeholder="Describe your company..." /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Use of Funds <span className="text-red-500">*</span></label><textarea name="useOfFunds" value={appForm.useOfFunds} onChange={handleAppChange} required rows={3} className={`${inputCls} resize-none`} placeholder="How will you use the funding?" /></div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={isPending} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                    {isPending ? "Submitting…" : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link href="/human-services/dashboard/fundings/applications" className="text-sm text-green-600 hover:underline">
              View all my funding applications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingDetailPage;
