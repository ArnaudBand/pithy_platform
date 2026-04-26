"use client";

import { useEffect, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getMyFundings,
  createFunding,
  updateFunding,
  deleteFunding,
  completeFunding,
  cancelFunding,
  verifyFunding,
  FundingDTO,
  FundingCreatePayload,
  FundingStatus,
} from "@/lib/actions/funding.actions";
import FundingApplicants from "./FundingApplicants";

const FUNDING_TYPES = [
  "GRANT","EQUITY","DEBT","CONVERTIBLE_NOTE","REVENUE_BASED",
  "SEED","SERIES_A","SERIES_B","SERIES_C","ANGEL",
  "VENTURE_CAPITAL","PRIVATE_EQUITY","CROWDFUNDING","OTHER",
];
const FUNDING_STATUSES: FundingStatus[] = ["PENDING","COMPLETED","CANCELLED","PARTIALLY_FUNDED"];

const emptyForm = (): FundingCreatePayload => ({
  companyName: "", fundingType: "", fundingAmount: 0, currency: "USD",
  fundingDate: new Date().toISOString().slice(0, 10), status: "PENDING",
  fundingRound: "", expectedClosingDate: "", leadInvestor: "",
  industrySector: "", companyLocation: "", fundingPurpose: "", pressReleaseUrl: "",
});

const statusColors: Record<FundingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  PARTIALLY_FUNDED: "bg-blue-100 text-blue-700",
};

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const AddFundingForm = () => {
  const [fundings, setFundings] = useState<FundingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FundingCreatePayload>(emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [applicantsFunding, setApplicantsFunding] = useState<{ id: string; name: string } | null>(null);

  const fetchFundings = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await getMyFundings();
      if (!result.success) toast.error(result.message ?? "Failed to load fundings");
      else setFundings(result.fundings);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFundings(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "fundingAmount" ? parseFloat(value) || 0 : value }));
  };

  const startEdit = (f: FundingDTO) => {
    setEditingId(f.fundingId);
    setFormData({
      companyName: f.companyName, fundingType: f.fundingType,
      fundingAmount: f.fundingAmount, currency: f.currency,
      fundingDate: f.fundingDate, status: f.status,
      fundingRound: f.fundingRound ?? "", expectedClosingDate: f.expectedClosingDate ?? "",
      leadInvestor: f.leadInvestor ?? "", industrySector: f.industrySector ?? "",
      companyLocation: f.companyLocation ?? "", fundingPurpose: f.fundingPurpose ?? "",
      pressReleaseUrl: f.pressReleaseUrl ?? "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm()); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = { ...formData, expectedClosingDate: formData.expectedClosingDate || undefined };
      if (editingId) {
        const result = await updateFunding(editingId, payload);
        if (!result.success) { toast.error(result.message ?? "Failed to update"); return; }
        toast.success("Funding updated!");
        setFundings((prev) => prev.map((f) => f.fundingId === editingId ? result.funding! : f));
      } else {
        const result = await createFunding(payload);
        if (!result.success) { toast.error(result.message ?? "Failed to create"); return; }
        toast.success("Funding created!");
        setFundings((prev) => [result.funding!, ...prev]);
      }
      cancelForm();
    });
  };

  const doAction = (action: (id: string) => Promise<{ success: boolean; funding?: FundingDTO; message?: string }>, id: string, msg: string) =>
    startTransition(async () => {
      const r = await action(id);
      if (!r.success) { toast.error(r.message ?? "Failed"); return; }
      toast.success(msg);
      setFundings((prev) => prev.map((f) => f.fundingId === id ? r.funding! : f));
    });

  const handleDelete = (id: string) => startTransition(async () => {
    const r = await deleteFunding(id);
    if (!r.success) { toast.error(r.message ?? "Failed to delete"); return; }
    toast.success("Funding deleted");
    setFundings((prev) => prev.filter((f) => f.fundingId !== id));
    setDeleteConfirmId(null);
  });

  const fmt = (n?: number, cur = "USD") =>
    n != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: cur, notation: "compact" }).format(n) : "—";

  return (
    <div className="w-full">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Funding Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create, edit, and manage funding opportunities.</p>
          <div className="mt-2 h-1 w-16 bg-green-500 rounded-full" />
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
            + Add Funding
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{editingId ? "Edit Funding" : "New Funding"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" required><input name="companyName" value={formData.companyName} onChange={handleChange} required className={inputCls} /></Field>
              <Field label="Funding Type" required>
                <select name="fundingType" value={formData.fundingType} onChange={handleChange} required className={inputCls}>
                  <option value="" disabled>Select type</option>
                  {FUNDING_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <Field label="Funding Amount" required><input name="fundingAmount" type="number" min="0.01" step="0.01" value={formData.fundingAmount} onChange={handleChange} required className={inputCls} /></Field>
              <Field label="Currency (3-letter ISO)" required><input name="currency" value={formData.currency} onChange={handleChange} maxLength={3} placeholder="USD" required className={inputCls} /></Field>
              <Field label="Funding Date" required><input name="fundingDate" type="date" value={formData.fundingDate} onChange={handleChange} required className={inputCls} /></Field>
              <Field label="Expected Closing Date"><input name="expectedClosingDate" type="date" value={formData.expectedClosingDate} onChange={handleChange} className={inputCls} /></Field>
              <Field label="Status" required>
                <select name="status" value={formData.status} onChange={handleChange} required className={inputCls}>
                  {FUNDING_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <Field label="Funding Round"><input name="fundingRound" value={formData.fundingRound} onChange={handleChange} placeholder="e.g. Series A" className={inputCls} /></Field>
              <Field label="Lead Investor"><input name="leadInvestor" value={formData.leadInvestor} onChange={handleChange} className={inputCls} /></Field>
              <Field label="Industry Sector"><input name="industrySector" value={formData.industrySector} onChange={handleChange} className={inputCls} /></Field>
              <Field label="Company Location"><input name="companyLocation" value={formData.companyLocation} onChange={handleChange} placeholder="City, Country" className={inputCls} /></Field>
              <Field label="Press Release / Reference URL"><input name="pressReleaseUrl" type="url" value={formData.pressReleaseUrl} onChange={handleChange} placeholder="https://..." className={inputCls} /></Field>
              <div className="md:col-span-2">
                <Field label="Funding Purpose">
                  <textarea name="fundingPurpose" value={formData.fundingPurpose} onChange={handleChange} rows={3} placeholder="Describe what the funding is for..." className={`${inputCls} resize-none`} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={cancelForm} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={isPending} className={`px-6 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-60 ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
                {isPending ? (editingId ? "Saving…" : "Creating…") : (editingId ? "Save Changes" : "Create Funding")}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" />
        </div>
      ) : fundings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500">No fundings yet. Click &quot;Add Funding&quot; to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">Amount</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fundings.map((f) => (
                <tr key={f.fundingId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{f.companyName}</p>
                    {f.fundingRound && <p className="text-xs text-gray-400 mt-0.5">{f.fundingRound}</p>}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{f.fundingType.replace(/_/g, " ")}</td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                    {fmt(f.fundingAmount, f.currency)}
                    {f.isVerified && <span className="ml-1.5 text-xs text-green-600 font-medium">✓</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[f.status]}`}>
                      {f.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {deleteConfirmId === f.fundingId ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleDelete(f.fundingId)} disabled={isPending} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs disabled:opacity-60">Confirm</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-100">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => setApplicantsFunding({ id: f.fundingId, name: f.companyName })} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">Applicants</button>
                        <button onClick={() => startEdit(f)} className="px-3 py-1 border border-blue-400 text-blue-600 hover:bg-blue-50 rounded text-xs">Edit</button>
                        {f.status === "PENDING" && <button onClick={() => doAction(completeFunding, f.fundingId, "Marked as completed")} disabled={isPending} className="px-3 py-1 border border-green-400 text-green-600 hover:bg-green-50 rounded text-xs disabled:opacity-60">Complete</button>}
                        {f.status === "PENDING" && <button onClick={() => doAction(cancelFunding, f.fundingId, "Funding cancelled")} disabled={isPending} className="px-3 py-1 border border-orange-400 text-orange-600 hover:bg-orange-50 rounded text-xs disabled:opacity-60">Cancel</button>}
                        {!f.isVerified && <button onClick={() => doAction(verifyFunding, f.fundingId, "Funding verified ✓")} disabled={isPending} className="px-3 py-1 border border-purple-400 text-purple-600 hover:bg-purple-50 rounded text-xs disabled:opacity-60">Verify</button>}
                        <button onClick={() => setDeleteConfirmId(f.fundingId)} className="px-3 py-1 border border-red-400 text-red-600 hover:bg-red-50 rounded text-xs">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {applicantsFunding && (
        <FundingApplicants fundingId={applicantsFunding.id} fundingName={applicantsFunding.name} onClose={() => setApplicantsFunding(null)} />
      )}
    </div>
  );
};

export default AddFundingForm;
