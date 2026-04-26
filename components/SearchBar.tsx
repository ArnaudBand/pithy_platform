"use client";

import React, { useState } from "react";
import { searchFundings, getAllFundings, FundingDTO } from "@/lib/actions/funding.actions";

interface SearchBarProps {
  onSearchResults: (results: FundingDTO[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults, setLoading, setError }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!searchTerm.trim()) {
        const result = await getAllFundings();
        onSearchResults(result.fundings);
      } else {
        const result = await searchFundings(searchTerm.trim());
        if (!result.success) { setError(result.message ?? "Search failed"); onSearchResults([]); }
        else onSearchResults(result.fundings);
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setSearchTerm("");
    setLoading(true);
    setError(null);
    try {
      const result = await getAllFundings();
      onSearchResults(result.fundings);
    } catch {
      setError("Failed to reset search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-10 bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 shadow-lg border border-green-200">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Search Fundings
            </label>
            <input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300">
              Search
            </button>
            {searchTerm && (
              <button type="button" onClick={handleReset} className="px-4 py-3 border border-green-500 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-all duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
