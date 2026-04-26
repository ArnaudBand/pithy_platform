"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getActiveScholarships, ScholarshipDTO } from "@/lib/actions/scholarship.actions";
import SearchScholarship from "@/components/SearchScholarship";
import { Calendar, ExternalLink } from "lucide-react";

const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState<ScholarshipDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const result = await getActiveScholarships();
      if (!result.success) {
        setError(result.message ?? "Failed to load scholarships");
      } else {
        setScholarships(result.scholarships);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSearchResults = (results: ScholarshipDTO[]) => {
    setScholarships(results);
    setError(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const daysUntilDeadline = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen w-full p-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 animate-pulse">
          Your Next Scholarship is Waiting
        </h1>
        <p className="text-lg text-gray-700 mt-4">
          Discover opportunities to fund your future.
        </p>
      </div>

      {/* Search */}
      <SearchScholarship
        onSearchResults={handleSearchResults}
        setLoading={setLoading}
        setError={setError}
      />

      {/* Count */}
      {!loading && !error && (
        <p className="text-gray-600 font-medium mb-6">
          {scholarships.length === 0
            ? "No scholarships found. Try a different search."
            : `Showing ${scholarships.length} scholarship${scholarships.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-500">
            No active scholarships at the moment
          </h3>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((s) => {
            const days = daysUntilDeadline(s.deadline);
            return (
              <div
                key={s.id}
                className="bg-white border border-green-200 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:border-green-400 transition-all duration-300"
              >
                {/* Title & provider */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                    {s.title}
                  </h2>
                  {s.provider && (
                    <p className="text-sm text-green-600 font-medium mb-3">
                      {s.provider}
                    </p>
                  )}
                  {s.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {s.description}
                    </p>
                  )}
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                  <Calendar size={14} className="text-green-500" />
                  <span>
                    Deadline:{" "}
                    <span
                      className={
                        days <= 7
                          ? "text-red-500 font-semibold"
                          : days <= 30
                          ? "text-orange-500 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {formatDate(s.deadline)}{" "}
                      {days <= 30 && `(${days}d left)`}
                    </span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/human-services/dashboard/scholarships/${s.id}`}
                    className="flex-1 text-center bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-lg transition-all duration-300"
                  >
                    View Details
                  </Link>
                  <a
                    href={s.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 border border-green-400 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    title="Apply externally"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScholarshipList;
