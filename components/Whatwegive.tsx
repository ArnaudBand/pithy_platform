"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import Image from "next/image";

const Whatwegive = () => {
  const router = useRouter();

  const features = [
    {
      icon: "/assets/briefcase-04.png",
      title: "Find Your Ideal Path",
      description: "Discover suitable study, professional, or business areas tailored to your strengths."
    },
    {
      icon: "/assets/cancel-circle.png",
      title: "Avoid Costly Mistakes",
      description: "Minimize risks and wasted time and resources."
    },
    {
      icon: "/assets/strike - stroke.png",
      title: "Boost Confidence",
      description: "Ensure success in your chosen path."
    },
    {
      icon: "/assets/square-lock-02.png",
      title: "Secure Your Future",
      description: "Make informed decisions for yourself and your collaborators."
    }
  ];

  return (
    <div className="relative py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl -z-10" />

      <div className="w-full">
        <div className="flex flex-col space-y-8 items-center text-center">
          {/* Section Label */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200/50">
            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
              What We Provide You
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Unlock Your Potential
              <span className="inline-block mx-3 w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full align-middle" />
              Future
              <span className="inline-block mx-3 w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full align-middle" />
              Finance with
            </h2>

            <div className="flex flex-col items-center gap-2">
              <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent uppercase tracking-tight">
                Pithy Means
              </h3>
              <div className="relative w-32 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl">
            Avoid costly mistakes and find your perfect fit
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => router.push("/signIn")}
            className="group relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Your Journey
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </Button>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 w-full">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/60 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex flex-col items-center space-y-4 text-center">
                  {/* Icon Container */}
                  <div className="relative">
                    <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 h-16 w-16 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                    </div>
                    <div className="absolute -top-2 -left-2">
                      <Image
                        src={feature.icon}
                        alt={feature.title}
                        width={56}
                        height={56}
                        className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 leading-snug min-h-[3.5rem] flex items-center">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative bottom accent */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full group-hover:w-16 transition-all duration-300" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Whatwegive;