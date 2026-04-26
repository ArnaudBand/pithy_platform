"use client";

import React, { FC, useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FaTwitter,
  FaFacebook,
  FaTelegram,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import {
  getJobById,
  checkIfApplied,
  applyForJob,
  withdrawApplication,
  getApplicationCount,
  JobDTO,
} from "@/lib/actions/job.actions";

const JobDetail: FC = () => {
  const { job_id } = useParams();
  const jobId = Array.isArray(job_id) ? job_id[0] : job_id;

  const [job, setJob] = useState<JobDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!jobId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobResult, applied, count] = await Promise.all([
          getJobById(jobId),
          checkIfApplied(jobId),
          getApplicationCount(jobId),
        ]);

        if (!jobResult.success || !jobResult.job) {
          toast.error("Job not found");
          return;
        }

        setJob(jobResult.job);
        setHasApplied(applied);
        setApplicationCount(count);
        toast.success("Job details loaded");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleApply = () => {
    if (!jobId) return;
    startTransition(async () => {
      const result = await applyForJob(jobId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to apply");
        return;
      }
      setHasApplied(true);
      setApplicationId(result.application.id);
      setApplicationCount((c) => c + 1);
      toast.success("Application submitted successfully!");
    });
  };

  const handleWithdraw = () => {
    if (!applicationId) return;
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to withdraw");
        return;
      }
      setHasApplied(false);
      setApplicationId(null);
      setApplicationCount((c) => Math.max(0, c - 1));
      toast.success("Application withdrawn");
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-opacity-75 z-50">
        <p className="text-green-500 text-xl font-medium animate-pulse">
          Loading job...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-red-400 text-lg">Job not found.</p>
      </div>
    );
  }

  return (
    <main className="w-full mx-auto p-8 mt-2 bg-gray-50 rounded-3xl shadow-2xl border border-gray-300 relative">
      <Toaster reverseOrder={false} />

      {/* Header */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-200 text-white rounded-t-3xl shadow-lg p-10">
        <h1 className="text-4xl font-bold">{job.title}</h1>
        <p className="mt-2 text-lg font-medium">{job.company}</p>
        {job.location && (
          <p className="mt-1 text-sm text-green-100">{job.location}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {job.jobType && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {job.jobType}
            </span>
          )}
          {job.salaryRange && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {job.salaryRange}
            </span>
          )}
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            {applicationCount} applicant{applicationCount !== 1 ? "s" : ""}
          </span>
        </div>
        {job.expiresAt && (
          <p className="mt-4 text-sm italic text-green-100">
            Closes: {new Date(job.expiresAt).toLocaleDateString()}
          </p>
        )}
      </section>

      {/* Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Job Description
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How to Apply
          </h2>
          <p className="text-gray-700 mb-4">
            Apply directly using the button below, or track your application
            from this page.
          </p>

          {/* External apply link */}
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-lg hover:bg-green-700 transition duration-300"
          >
            Apply on {job.sourceSite ?? "Company Site"}
          </a>

          {/* Track application */}
          <div className="mt-6">
            {hasApplied ? (
              <div className="space-y-3">
                <p className="text-green-600 font-semibold">
                  ✓ You have applied for this position
                </p>
                {applicationId && (
                  <button
                    onClick={handleWithdraw}
                    disabled={isPending}
                    className="px-4 py-2 border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition duration-300 text-sm disabled:opacity-50"
                  >
                    {isPending ? "Withdrawing…" : "Withdraw Application"}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={isPending}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              >
                {isPending ? "Submitting…" : "Track My Application"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="mt-12 bg-gray-100 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Share This Opportunity
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`https://twitter.com/share?text=${encodeURIComponent(job.title)}&url=${encodeURIComponent(job.link)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
          >
            <FaTwitter /> Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(job.link)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            <FaFacebook /> Facebook
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(job.link)}&text=${encodeURIComponent(job.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            <FaTelegram /> Telegram
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(job.title + " " + job.link)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            <FaWhatsapp /> WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent("Job Opportunity: " + job.title)}&body=${encodeURIComponent(job.link)}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
          >
            <FaEnvelope /> Email
          </a>
        </div>
      </section>

      <section className="mt-8 flex justify-end">
        <Link
          href="/human-services/dashboard/jobs"
          className="bg-green-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg text-center transition duration-300"
        >
          Back to Job Listings
        </Link>
      </section>
    </main>
  );
};

export default JobDetail;
