"use client";

import React, { useState } from "react";
import Posts from "./Posts";
import { CircleUserRound, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { PostDTO } from "@/lib/actions/post.actions";
import toast, { Toaster } from "react-hot-toast";

const ShareSomething = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setSearchMode] = useState(false);
  const [newPost] = useState<PostDTO | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      clearSearch();
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      clearSearch();
      return;
    }
    // Search is not yet migrated to the new backend — coming soon.
    toast("Search is coming soon!", { icon: "🔍" });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchMode(false);
  };

  return (
    <div className="flex flex-col no-scrollbar items-center justify-center max-h-screen mt-4">
      <Toaster />

      {/* Search Bar */}
      <div className="flex flex-col bg-white text-black rounded-lg shadow-md p-2 w-full mt-2">
        <div className="flex items-center justify-center">
          <CircleUserRound
            size={32}
            className="flex-shrink-0 text-gray-600 hidden md:block"
          />

          <div className="relative flex-1 mx-2">
            <input
              type="text"
              placeholder="Search Posts (coming soon)"
              className="border border-gray-300 rounded-lg w-full py-1 px-2 focus:outline-none focus:ring-2 focus:ring-[#5AC35A]"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Button
            className="bg-gradient-to-t from-[#5AC35A] to-[#00AE76] text-white rounded-lg py-1 px-2 flex-shrink-0 hover:bg-gradient-to-tr"
            onClick={handleSearch}
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Create Post
      {!searchMode && (
        <div className="w-full mt-4">
          <CreatePosts onPostCreated={(post) => setNewPost(post)} />
        </div>
      )} */}

      {/* Posts Feed */}
      <div className="overflow-y-auto no-scrollbar h-full mt-8 w-full">
        <Posts newPost={newPost} />
      </div>
    </div>
  );
};

export default ShareSomething;
