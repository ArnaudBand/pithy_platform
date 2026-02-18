"use client";

import React, { useState } from "react";
import ShareSomething from "@/components/ShareSomething";
import PersonSidebar from "@/components/PersonSidebar";
import { Menu, X } from "lucide-react";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative w-full max-w-screen mx-auto">
      <div className="flex flex-col lg:flex-row lg:space-x-4 w-full">
        <div className="px-4 sm:px-6 lg:px-8 w-full lg:w-[65%]">
          <ShareSomething />
        </div>

        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-10 right-4 z-50 bg-black text-white p-2 rounded-full shadow-lg"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggleSidebar}
          >
            <div
              className="h-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <PersonSidebar />
            </div>
          </div>
        )}

        <div className="hidden lg:block">
          <PersonSidebar />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;