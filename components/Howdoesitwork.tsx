import TitleDot from "./TitleDot";
import RandomGridCards from "./AssCards";

const Howdoesitwork = () => {
  return (
    <div className="relative py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-100/25 rounded-full blur-3xl -z-10" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] -z-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="w-full">
        <div className="flex flex-col space-y-10 lg:items-start items-center">
          {/* Header Section */}
          <div className="space-y-6 text-center lg:text-left max-w-3xl">
            {/* Title with enhanced styling */}
            <div className="space-y-3">
              <TitleDot
                title="How Does It Work?"
                className="lg:text-xl md:text-3xl"
              />

              {/* Enhanced subheading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Discover Your Ideal Career Path in{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    4 Easy Steps
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,7 Q50,2 100,7 T200,7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h2>
            </div>

            {/* Optional subtitle */}
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Our streamlined process guides you from self-discovery to confident decision-making
            </p>
          </div>

          {/* Cards Section with enhanced container */}
          <div className="relative w-full">
            {/* Decorative connector line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent -z-10" />

            {/* Cards Container */}
            <div className="relative flex justify-center w-full items-center">
              <div className="w-full">
                <RandomGridCards />
              </div>
            </div>
          </div>

          {/* Optional CTA or additional info */}
          <div className="w-full flex justify-center lg:justify-start pt-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200/50 shadow-sm">
              <div className="flex -space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Start your journey in less than 10 minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Howdoesitwork;