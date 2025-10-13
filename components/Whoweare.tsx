"use client";

import { Button } from "./ui/button";
import TitleDot from "./TitleDot";
import CardMadam from "./CardMadam";
import { useRouter } from "next/navigation";

const Whoweare = () => {
  const router = useRouter();
  return (
    <div className="relative py-24 px-6 md:px-12 lg:px-20 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100/20 rounded-full blur-3xl -z-10" />

      <div className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16">
          {/* Left Content Section */}
          <div className="flex flex-col flex-1 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <TitleDot title="Who We Are" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Empowering Informed Decisions for a{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Fulfilling Career
                </span>
              </h2>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl">
                At Pithy Means, we believe that everyone deserves to find their
                perfect fit. Our mission is to guide students, professionals, and
                business managers towards their most suitable study, professional,
                or business areas.
              </p>
            </div>

            {/* Story and Vision Grid */}
            <div className="grid md:grid-cols-2 gap-8 pt-4">
              {/* Our Story Card */}
              <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    <div className="w-8 h-0.5 bg-emerald-600" />
                    Our Story
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900">
                    Founded in the US and Uganda, our team saw the need to prevent:
                  </h3>

                  <ul className="space-y-3">
                    {[
                      "Identify natural strengths and interests",
                      "Explore suitable career and business paths",
                      "Make informed decisions"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 group/item">
                        <div className="mt-1.5 relative">
                          <div className="w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-500 rotate-45" />
                          <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rotate-45 blur-sm opacity-50" />
                        </div>
                        <span className="text-slate-700 leading-relaxed flex-1">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Our Vision Card */}
              <div className="group relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative space-y-5 h-full flex flex-col">
                  <div className="inline-flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                    <div className="w-8 h-0.5 bg-white" />
                    Our Vision
                  </div>

                  <h3 className="text-2xl font-semibold text-white leading-relaxed flex-1">
                    A world where everyone thrives in their chosen path.
                  </h3>

                  <Button
                    onClick={() => router.push("/about")}
                    className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-slate-50 font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Learn More About Us
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="lg:sticky lg:top-24 flex-shrink-0">
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-3xl blur-2xl" />
              <CardMadam />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whoweare;