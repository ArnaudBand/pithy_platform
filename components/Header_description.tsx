"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

// Register the TextPlugin
gsap.registerPlugin(TextPlugin);

const Header_description = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const headingRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const subtextRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const cursorRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const timelineRef: React.MutableRefObject<gsap.core.Timeline | null> = useRef(null);

  const headingText = "Unlock Your Dream Career.";
  const subtextText = "Discover Your Strengths, Interest, Perfect Career Match And The Business Venture For You";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !headingRef.current || !subtextRef.current) return;

    // Create GSAP timeline for infinite animation
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    timelineRef.current = tl;

    // Cursor blink animation
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }

    // Heading typing animation
    tl.fromTo(
      headingRef.current,
      { text: "" },
      {
        duration: headingText.length * 0.08,
        text: headingText,
        ease: "none",
        onUpdate: function () {
          // Show cursor during typing
          if (cursorRef.current) {
            cursorRef.current.style.display = "inline-block";
          }
        }
      }
    );

    // Pause after heading
    tl.to({}, { duration: 0.3 });

    // Hide heading cursor, show subtext cursor
    tl.call(() => {
      if (cursorRef.current) {
        cursorRef.current.style.display = "none";
      }
    });

    // Subtext typing animation
    tl.fromTo(
      subtextRef.current,
      { text: "" },
      {
        duration: subtextText.length * 0.03,
        text: subtextText,
        ease: "none"
      }
    );

    // Pause before deleting
    tl.to({}, { duration: 2 });

    // Delete subtext
    tl.to(subtextRef.current, {
      duration: subtextText.length * 0.02,
      text: "",
      ease: "none"
    });

    // Delete heading
    tl.to(headingRef.current, {
      duration: headingText.length * 0.05,
      text: "",
      ease: "none"
    });

    // Pause before restart
    tl.to({}, { duration: 0.5 });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isClient, headingText, subtextText]);

  return (
    <div className="flex flex-col lg:items-start xl:items-start items-center space-y-4 w-full px-4 lg:px-0 xl:px-2 4k:px-6 relative">
      {/* Animated heading with cursor */}
      <div className="relative">
        <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-6xl 4k:text-8xl text-[#5AC35A] font-extrabold lg:text-start text-center">
          <span ref={headingRef}></span>
          <span
            ref={cursorRef}
            className="inline-block w-1 h-[0.9em] bg-[#5AC35A] ml-1 align-middle"
          />
        </h1>
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#5AC35A]/20 to-emerald-400/20 blur-3xl -z-10 opacity-50 animate-pulse"></div>
      </div>

      {/* Animated paragraph */}
      <div className="relative min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem]">
        <p className="text-base sm:text-lg md:text-xl xl:text-2xl 4k:text-5xl lg:text-start text-center text-white/90">
          <span ref={subtextRef}></span>
        </p>
      </div>

      {/* Button with entrance animation */}
      <div className="animate-fadeIn">
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