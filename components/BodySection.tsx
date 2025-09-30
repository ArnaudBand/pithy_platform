"use client";

import React from "react";
import Header_description from "./Header_description";
import CardImage from "./CardImage";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const BodySection = () => {
  const router = useRouter();

  return (
    <div className="relative bg-black overflow-hidden h-screen flex items-center justify-between lg:flex-row lg:justify-between py-8">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5AC35A]/5 via-transparent to-emerald-900/5 pointer-events-none"></div>

      <div className="relative w-full px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Section - Content */}
          <div className="space-y-12">
            <Header_description />

            {/* Feature Buttons - Below description */}
            <div className="space-y-4">
              <p className="text-white/60 text-sm font-medium tracking-wide uppercase">
                Explore Opportunities
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Jobs Button */}
                <Button
                  onClick={() => router.push("/signIn")}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 hover:from-[#5AC35A]/20 hover:to-[#5AC35A]/10 border border-white/20 hover:border-[#5AC35A]/50 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#5AC35A]/20 overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5AC35A]/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-[#5AC35A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div> */}
                    <span className="text-white font-semibold group-hover:text-[#5AC35A] transition-colors">
                      Jobs
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Button>

                {/* Scholarships Button */}
                <Button
                  onClick={() => router.push("/signIn")}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 hover:from-[#5AC35A]/20 hover:to-[#5AC35A]/10 border border-white/20 hover:border-[#5AC35A]/50 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#5AC35A]/20 overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5AC35A]/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-[#5AC35A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div> */}
                    <span className="text-white font-semibold group-hover:text-[#5AC35A] transition-colors">
                      Scholarships
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Button>

                {/* Fundings Button */}
                <Button
                  onClick={() => router.push("/signIn")}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 hover:from-[#5AC35A]/20 hover:to-[#5AC35A]/10 border border-white/20 hover:border-[#5AC35A]/50 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#5AC35A]/20 overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    {/* <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5AC35A]/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-[#5AC35A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div> */}
                    <span className="text-white font-semibold group-hover:text-[#5AC35A] transition-colors">
                      Fundings
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Section - Image with floating effect */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Ambient glow */}
              <div className="absolute -inset-12 bg-gradient-to-r from-[#5AC35A]/20 via-emerald-400/20 to-[#5AC35A]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 animate-pulse"></div>

              {/* Image container */}
              <div className="relative transform group-hover:scale-105 transition-transform duration-500 hidden lg:block">
                <CardImage />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BodySection;