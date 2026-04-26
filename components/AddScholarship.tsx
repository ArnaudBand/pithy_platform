"use client";

import { useEffect, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getMyScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  updateScholarshipStatus,
  ScholarshipDTO,
  ScholarshipCreatePayload,
  ScholarshipStatus,
} from "@/lib/actions/scholarship.actions";
import ScholarshipApplicants from "./ScholarshipApplicants";

// Minimum datetime string for the deadline input (today)
const todayISO = () => new Date().toISOString().slice(0, 16);

const emptyForm = (): ScholarshipCreatePayload => ({
  title: "",
  description: "",
  applicationUrl: "",
  provider: "",
  deadline: todayISO(),
});

const AddScholarship = () => {
  const [scholarships, setScholarships] = useState<ScholarshipDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScholarshipCreatePayload>(emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Applicants modal
  const [applicantsScholarship, setApplicantsScholarship] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchScholarships = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await getMyScholarships();
      if (!result.success) {
        toast.error(result.message ?? "Failed to load scholarships");
      } else {
        setScholarships(result.scholarships);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchScholarships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (s: ScholarshipDTO) => {
    setEditingId(s.id);
    setFormData({
      title: s.title,
      description: s.description ?? "",
      applicationUrl: s.applicationUrl,
      provider: s.provider ?? "",
      // backend stores full ISO; datetime-local input needs "YYYY-MM-DDTHH:mm"
      deadline: s.deadline.slice(0, 16),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm());
  };

  // ── Create / Update ───────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload: ScholarshipCreatePayload = {
        ...formData,
        // Ensure ISO datetime with seconds
        deadline: formData.deadline.length === 16
          ? `${formData.deadline}:00`
          : formData.deadline,
      };

      if (editingId) {
        const result = await updateScholarship(editingId, payload);
        if (!result.success) {
          toast.error(result.message ?? "Failed to update scholarship");
          return;
        }
        toast.success("Scholarship updated!");
        setScholarships((prev) =>
          prev.map((s) => (s.id === editingId ? result.scholarship! : s))
        );
      } else {
        const result = await createScholarship(payload);
        if (!result.success) {
          toast.error(result.message ?? "Failed to create scholarship");
          return;
        }
        toast.success("Scholarship created!");
        setScholarships((prev) => [result.scholarship!, ...prev]);
      }
      cancelForm();
    });
  };

  // ── Status update ─────────────────────────────────────────────────────────────
  const handleStatusChange = (id: string, status: ScholarshipStatus) => {
    startTransition(async () => {
      const result = await updateScholarshipStatus(id, { status });
      if (!result.success) {
        toast.error(result.message ?? "Failed to update status");
        return;
      }
      toast.success(`Status changed to ${status}`);
      setScholarships((prev) =>
        prev.map((s) => (s.id === id ? result.scholarship! : s))
      );
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteScholarship(id);
      if (!result.success) {
        toast.error(result.message ?? "Failed to delete scholarship");
        return;
      }
      toast.success("Scholarship deleted");
      setScholarships((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmId(null);
    });
  };

  // ── Helpers ────────────────────────────────────────────────────────────────────
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusBadge = (status: ScholarshipStatus) => {
    const map: Record<ScholarshipStatus, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      CLOSED: "bg-gray-100 text-gray-600",
      EXPIRED: "bg-red-100 text-red-600",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
      >
        {status}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Scholarship Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, edit, and manage scholarship listings.
          </p>
          <div className="mt-2 h-1 w-16 bg-green-500 rounded-full" />
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Scholarship
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editingId ? "Edit Scholarship" : "New Scholarship"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  placeholder="e.g. Chevening, Gates Foundation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Application URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application URL <span className="text-red-500">*</span>
                </label>
                <input
                  name="applicationUrl"
                  type="url"
                  value={formData.applicationUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Eligibility criteria, funding details, field of study..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`px-6 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                  editingId
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isPending
                  ? editingId
                    ? "Saving…"
                    : "Creating…"
                  : editingId
                  ? "Save Changes"
                  : "Create Scholarship"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" />
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500">
            No scholarships yet. Click &quot;Add Scholarship&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Scholarship
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium hidden md:table-cell">
                  Provider
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium hidden lg:table-cell">
                  Deadline
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scholarships.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{s.title}</p>
                    {s.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {s.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                    {s.provider || "—"}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                    {formatDate(s.deadline)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {statusBadge(s.status)}
                      {/* Status change dropdown */}
                      <select
                        className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 bg-white"
                        value={s.status}
                        onChange={(e) =>
                          handleStatusChange(s.id, e.target.value as ScholarshipStatus)
                        }
                        disabled={isPending}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {deleteConfirmId === s.id ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isPending}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs disabled:opacity-60"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() =>
                            setApplicantsScholarship({ id: s.id, title: s.title })
                          }
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                        >
                          Applicants
                        </button>
                        <button
                          onClick={() => startEdit(s)}
                          className="px-3 py-1 border border-blue-400 text-blue-600 hover:bg-blue-50 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="px-3 py-1 border border-red-400 text-red-600 hover:bg-red-50 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicants modal */}
      {applicantsScholarship && (
        <ScholarshipApplicants
          scholarshipId={applicantsScholarship.id}
          scholarshipTitle={applicantsScholarship.title}
          onClose={() => setApplicantsScholarship(null)}
        />
      )}
    </div>
  );
};

export default AddScholarship;
