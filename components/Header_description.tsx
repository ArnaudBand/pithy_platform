"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const Header_description = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const hasAnimated = useRef(false);
  const [displayedHeading, setDisplayedHeading] = useState("");
  const [displayedSubtext, setDisplayedSubtext] = useState("");
  const [headingComplete, setHeadingComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const headingText = "Unlock Your Dream Career.";
  const subtextText = "Discover Your Strengths, Interest, Perfect Career Match And The Business Venture For You";

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
    
    // Check if animation has already played
    const animationPlayed = sessionStorage.getItem('headerAnimationPlayed');
    if (animationPlayed === 'true') {
      // Skip animation, show everything immediately
      hasAnimated.current = true;
      setDisplayedHeading(headingText);
      setDisplayedSubtext(subtextText);
      setHeadingComplete(true);
      setShowButton(true);
    }
  }, []);

  useEffect(() => {
    if (!isClient || hasAnimated.current) return;

    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient || hasAnimated.current) return;
    
    if (displayedHeading.length < headingText.length) {
      const timeout = setTimeout(() => {
        setDisplayedHeading(headingText.slice(0, displayedHeading.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      setHeadingComplete(true);
    }
  }, [displayedHeading, isClient]);

  useEffect(() => {
    if (!isClient || hasAnimated.current) return;
    
    if (headingComplete && displayedSubtext.length < subtextText.length) {
      const timeout = setTimeout(() => {
        setDisplayedSubtext(subtextText.slice(0, displayedSubtext.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else if (headingComplete && displayedSubtext.length === subtextText.length) {
      setTimeout(() => {
        setShowButton(true);
        // Mark animation as complete
        sessionStorage.setItem('headerAnimationPlayed', 'true');
      }, 300);
    }
  }, [displayedSubtext, headingComplete, isClient]);

  return (
    <div className="flex flex-col lg:items-start xl:items-start items-center space-y-4 w-full px-4 lg:px-0 xl:px-2 4k:px-6 relative">
      {/* Animated heading with cursor */}
      <div className="relative">
        <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-6xl 4k:text-8xl text-[#5AC35A] font-extrabold lg:text-start text-center">
          {isClient ? displayedHeading : headingText}
          {isClient && !headingComplete && !hasAnimated.current && (
            <span
              className={`inline-block w-1 h-[0.9em] bg-[#5AC35A] ml-1 align-middle transition-opacity duration-100 ${
                cursorVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </h1>
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#5AC35A]/20 to-emerald-400/20 blur-3xl -z-10 opacity-50 animate-pulse"></div>
      </div>

      {/* Animated paragraph with cursor */}
      <div className="relative min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem]">
        <p className="text-base sm:text-lg md:text-xl xl:text-2xl 4k:text-5xl lg:text-start text-center text-white/90">
          {isClient ? displayedSubtext : subtextText}
          {isClient && headingComplete && displayedSubtext.length < subtextText.length && !hasAnimated.current && (
            <span
              className={`inline-block w-0.5 h-[0.9em] bg-white/70 ml-0.5 align-middle transition-opacity duration-100 ${
                cursorVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </p>
      </div>

      {/* Animated button */}
      <div
        className={`transition-all duration-700 transform ${
          isClient && (showButton || hasAnimated.current)
            ? "opacity-100 translate-y-0"
            : isClient
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <Button
          onClick={() => router.push("/signIn")}
          className="relative bg-gradient-to-tr from-[#5AC35A] to-[#00AE76] w-fit text-sm sm:text-base md:text-2xl xl:text-3xl p-3 4k:rounded-md z-10 overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#5AC35A]/50"
        >
          <span className="relative z-10 flex items-center gap-2">
            Start Your Journey
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
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
          </span>
          {/* Shimmer effect on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
        </Button>
      </div>
    </div>
  );
};

export default Header_description;