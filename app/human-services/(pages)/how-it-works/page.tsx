"use client";

import DiscoverFit from "@/components/DiscoverFit";
import Footer from "@/components/Footer";
import FreqAskeQuestion from "@/components/FreqAskeQuestion";
import SpecialMobile from "@/components/SpecialMobile";
import SpecialOffer from "@/components/SpecialOffer";
import LiquidEther from "@/components/LiquidEther";
// import { Metadata } from "next";
import React from "react";

// export const metadata: Metadata = {
//   title: "How It Works",
//   description: "Learn how Pithy Means works and how you can benefit from our platform.",
//   keywords: ["Pithy Means", "how it works", "benefits", "platform"],
//   openGraph: {
//     title: "How It Works",
//     description: "Learn how Pithy Means works and how you can benefit from our platform.",
//     url: "https://www.pithymeans.com/how-it-works",
//     siteName: "Pithy Means",
//     images: [
//       {
//         url: "/opengraph-image.png",
//         width: 1200,
//         height: 630,
//         alt: "Pithy Means - Empowering Individuals",
//       },
//     ],
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "How It Works",
//     description: "Learn how Pithy Means works and how you can benefit from our platform.",
//     images: ["/opengraph-image.png"],
//   },
// }

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Header Section with LiquidEther Background */}
      <div className="relative flex flex-col justify-center items-center bg-black min-h-[60vh] overflow-hidden px-4 py-32 w-full">
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
            autoSpeed={0.7}
            autoIntensity={2.8}
            takeoverDuration={0.25}
            autoResumeDelay={1000}
            autoRampDuration={0.9}
            className="w-full h-full"
          />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70 z-[1]"></div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20 z-[2]"
          style={{
            backgroundImage: `linear-gradient(rgba(90,195,90,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(90,195,90,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5AC35A]/10 backdrop-blur-sm border border-[#5AC35A]/30 mb-4">
            <svg
              className="w-4 h-4 text-[#5AC35A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm text-[#5AC35A] font-medium">Simple & Effective</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="block text-white mb-2">How It</span>
            <span className="bg-gradient-to-r from-[#5AC35A] via-[#00AE76] to-[#5AC35A] bg-clip-text text-transparent">
              Works
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover your strengths, find your perfect career match, and unlock opportunities—all in just a few simple steps.
          </p>

          {/* Step Indicators */}
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <div className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5AC35A]/20 border border-[#5AC35A]/40">
                <span className="text-[#5AC35A] font-bold text-sm">1</span>
              </div>
              <span className="text-white text-sm font-medium">Take Assessment</span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5AC35A]/20 border border-[#5AC35A]/40">
                <span className="text-[#5AC35A] font-bold text-sm">2</span>
              </div>
              <span className="text-white text-sm font-medium">Get Matched</span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5AC35A]/20 border border-[#5AC35A]/40">
                <span className="text-[#5AC35A] font-bold text-sm">3</span>
              </div>
              <span className="text-white text-sm font-medium">Start Journey</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={() => document.getElementById('discover-fit')?.scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] rounded-xl hover:shadow-lg hover:shadow-[#5AC35A]/30 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white font-semibold">Explore the Process</span>
              <svg
                className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          {/* Info Badge */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              <svg
                className="w-4 h-4 text-[#5AC35A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-gray-400">Takes less than 15 minutes</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-6 h-6 text-[#5AC35A]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* DiscoverFit Component */}
      <DiscoverFit />

      {/* Ensure FreqAskeQuestion gets full width */}
      <div className="w-full">
        <FreqAskeQuestion />
      </div>

      {/* Special Offer for larger screens */}
      <div className="lg:block hidden w-full">
        <SpecialOffer />
      </div>

      {/* Special Mobile Offer for smaller screens */}
      <div className="lg:hidden block w-full">
        <SpecialMobile />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}