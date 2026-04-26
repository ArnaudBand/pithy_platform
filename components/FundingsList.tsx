"use client";

import { useState, useEffect } from "react";
import { getAllFundings, FundingDTO } from "@/lib/actions/funding.actions";
import FundingCard from "@/components/FundingCard";
import SearchBar from "@/components/SearchBar";

const FundingsList = () => {
  const [fundings, setFundings] = useState<FundingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllFundings().then((result) => {
      if (!result.success) setError(result.message ?? "Failed to load fundings");
      else setFundings(result.fundings);
      setLoading(false);
    });
  }, []);

  const handleSearchResults = (results: FundingDTO[]) => {
    setFundings(results);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full p-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 animate-pulse">
          Funding Opportunities
        </h1>
        <p className="text-lg text-gray-700 mt-4">
          Discover grants, equity rounds, and investment opportunities for your venture.
        </p>
      </div>

      <SearchBar onSearchResults={handleSearchResults} setLoading={setLoading} setError={setError} />

      {!loading && !error && (
        <p className="text-gray-600 font-medium mb-6">
          {fundings.length === 0
            ? "No fundings found. Try a different search."
            : `Showing ${fundings.length} funding${fundings.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : fundings.length === 0 ? (
        <div className="text-center py-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-500">No funding opportunities available</h3>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {fundings.map((f) => <FundingCard key={f.fundingId} funding={f} />)}
        </div>
      )}
    </div>
  );
};

export default FundingsList;
