"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  JobSummaryDTO,
  JobCreatePayload,
  JobUpdatePayload,
} from "@/lib/actions/job.actions";
import { Button } from "./ui/button";
import toast, { Toaster } from "react-hot-toast";
import JobApplicants from "./JobApplicants";

const emptyForm: JobCreatePayload = {
  company: "",
  title: "",
  description: "",
  link: "",
  location: "",
  salaryRange: "",
  jobType: "",
  expiresAt: "",
};

const JobDashboard = () => {
  const [jobs, setJobs] = useState<JobSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<JobCreatePayload>(emptyForm);

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<JobUpdatePayload>({});

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Applicants modal
  const [applicantsJob, setApplicantsJob] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // ─── Fetch jobs posted by current admin ────────────────────────────────────

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const result = await getMyJobs();
        if (!result.success) throw new Error(result.message);
        setJobs(result.data?.content ?? []);
        toast.success("Jobs loaded");
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch jobs");
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ─── Create ────────────────────────────────────────────────────────────────

  const handleCreateInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createJob({
        ...formData,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString().slice(0, 19)
          : undefined,
      });
      if (!result.success) {
        toast.error(result.message ?? "Failed to create job");
        return;
      }
      toast.success("Job created successfully!");
      // Optimistically add to list using summary shape
      const created = result.job;
      setJobs((prev) => [
        {
          id: created.id,
          company: created.company,
          title: created.title,
          location: created.location,
          jobType: created.jobType,
          status: created.status,
          applicationCount: created.applicationCount,
          viewCount: created.viewCount,
          createdAt: created.createdAt,
          active: created.active,
        },
        ...prev,
      ]);
      setFormData(emptyForm);
      setShowCreateForm(false);
    });
  };

  // ─── Update ────────────────────────────────────────────────────────────────

  const startEdit = (job: JobSummaryDTO) => {
    setEditingId(job.id);
    setEditData({
      company: job.company,
      title: job.title,
      location: job.location,
      jobType: job.jobType,
    });
  };

  const handleEditInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    if (!editingId) return;
    startTransition(async () => {
      const result = await updateJob(editingId, editData);
      if (!result.success) {
        toast.error(result.message ?? "Failed to update job");
        return;
      }
      toast.success("Job updated successfully!");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === editingId
            ? { ...j, ...editData }
            : j
        )
      );
      setEditingId(null);
      setEditData({});
    });
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteJob(id);
      if (!result.success) {
        toast.error(result.message ?? "Failed to delete job");
        return;
      }
      toast.success("Job deleted");
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setDeleteConfirmId(null);
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading && jobs.length === 0 && !showCreateForm) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-white/80 rounded-lg shadow-md">
      <Toaster
        position="top-right"
        toastOptions={{ className: "bg-black/50 text-green-200", duration: 4000 }}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Job Dashboard</h2>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setShowCreateForm((s) => !s)}
        >
          {showCreateForm ? "Cancel" : "Create New Job"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* ── Create form ── */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold mb-4">Create a New Job</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Job Title *
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleCreateInput}
                  className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  Company *
                </label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleCreateInput}
                  className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleCreateInput}
                rows={4}
                className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Application Link *
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleCreateInput}
                placeholder="https://..."
                className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Location
                </label>
                <input
                  name="location"
                  value={formData.location ?? ""}
                  onChange={handleCreateInput}
                  className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType ?? ""}
                  onChange={handleCreateInput}
                  className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                >
                  <option value="">— Select —</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Salary Range
                </label>
                <input
                  name="salaryRange"
                  value={formData.salaryRange ?? ""}
                  onChange={handleCreateInput}
                  placeholder="e.g. $50k – $70k"
                  className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  Expires At
                </label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt ?? ""}
                  onChange={handleCreateInput}
                  className="w-full mt-1 p-2 border border-gray-300 text-black rounded-md"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? "Creating…" : "Create Job"}
            </Button>
          </form>
        </div>
      )}

      {/* ── Job list ── */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-black">
          {jobs.length > 0 ? "Your Jobs" : ""}
        </h3>

        {jobs.length === 0 && !showCreateForm ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">No jobs posted yet.</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Job
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                {/* Delete confirmation */}
                {deleteConfirmId === job.id ? (
                  <div className="space-y-4">
                    <p className="font-medium text-red-600">
                      Delete &ldquo;{job.title}&rdquo;?
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDelete(job.id)}
                        disabled={isPending}
                      >
                        {isPending ? "Deleting…" : "Yes, Delete"}
                      </Button>
                      <Button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                /* Edit form */
                ) : editingId === job.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Job Title
                      </label>
                      <input
                        name="title"
                        value={editData.title ?? ""}
                        onChange={handleEditInput}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <input
                        name="company"
                        value={editData.company ?? ""}
                        onChange={handleEditInput}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        name="location"
                        value={editData.location ?? ""}
                        onChange={handleEditInput}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Job Type
                      </label>
                      <select
                        name="jobType"
                        value={editData.jobType ?? ""}
                        onChange={handleEditInput}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">— Select —</option>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="REMOTE">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editData.description ?? ""}
                        onChange={handleEditInput}
                        rows={3}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleUpdate}
                        disabled={isPending}
                      >
                        {isPending ? "Saving…" : "Save Changes"}
                      </Button>
                      <Button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                /* Normal card view */
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">{job.company}</p>
                    {job.location && (
                      <p className="text-gray-500 text-sm mb-1">{job.location}</p>
                    )}
                    {job.jobType && (
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2">
                        {job.jobType}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mb-4">
                      {job.applicationCount} applicant
                      {job.applicationCount !== 1 ? "s" : ""} ·{" "}
                      {job.viewCount} view{job.viewCount !== 1 ? "s" : ""}
                    </p>

                    <div className="flex space-x-2 flex-wrap gap-y-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white text-sm flex-1"
                        onClick={() =>
                          setApplicantsJob({ id: job.id, title: job.title })
                        }
                      >
                        Applicants ({job.applicationCount})
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex-1"
                        onClick={() => startEdit(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white text-sm flex-1"
                        onClick={() => setDeleteConfirmId(job.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicants Modal */}
      {applicantsJob && (
        <JobApplicants
          jobId={applicantsJob.id}
          jobTitle={applicantsJob.title}
          onClose={() => setApplicantsJob(null)}
        />
      )}
    </div>
  );
};

export default JobDashboard;
