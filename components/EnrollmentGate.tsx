import React from "react";
import Link from "next/link";
import { GraduationCap, Lock, BookOpen } from "lucide-react";
import { getMyEnrollments } from "@/lib/actions/course.actions";

interface EnrollmentGateProps {
  children: React.ReactNode;
}

/**
 * Server component that guards access to jobs, scholarships, and fundings.
 * The user must be enrolled in at least one course to proceed.
 */
const EnrollmentGate = async ({ children }: EnrollmentGateProps) => {
  const result = await getMyEnrollments();

  const isEnrolled = result.success && result.enrollments.length > 0;

  if (isEnrolled) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <Lock size={40} className="text-green-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shadow-md">
              <GraduationCap size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-3">
          Course Enrollment Required
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          You need to be enrolled in at least one course to access jobs,
          scholarships, and funding opportunities. Enroll in a course to unlock
          these features.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
          {[
            { label: "Jobs", icon: "💼" },
            { label: "Scholarships", icon: "🎓" },
            { label: "Fundings", icon: "💰" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 opacity-60"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-gray-500 font-medium">{item.label}</span>
              <span className="text-xs text-gray-400">Locked</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/human-services/dashboard/courses"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all duration-300 hover:shadow-xl text-base"
        >
          <BookOpen size={20} />
          Browse Courses
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Already enrolled?{" "}
          <Link
            href="/human-services/dashboard"
            className="text-green-600 hover:underline"
          >
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EnrollmentGate;
