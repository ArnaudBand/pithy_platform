"use client";

import React from "react";
import Header_description from "./Header_description";
import CardImage from "./CardImage";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import LiquidEther from "./LiquidEther";

const BodySection = () => {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden h-screen flex items-center justify-between lg:flex-row lg:justify-between py-8">
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#0AF41D', '#529652', '#20CC6B']}
          mouseForce={100}
          cursorSize={180}
          isViscous={true}
          viscous={20}
          resolution={0.7}
          autoDemo={true}
          autoSpeed={0.8}
          autoIntensity={3.0}
          takeoverDuration={0.25}
          autoResumeDelay={1000}
          autoRampDuration={0.9}
          className="w-full h-full"
        />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/70 z-[1]"></div>

      {/* Gradient overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5AC35A]/5 via-transparent to-emerald-900/5 pointer-events-none z-[2]"></div>

      <div className="relative z-10 w-full px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Section - Content */}
          <div className="space-y-12">
            <Header_description />

            {/* Feature Buttons - Below description */}
            <div className="space-y-8">
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