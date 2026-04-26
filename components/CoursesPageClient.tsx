"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CourseDTO } from "@/lib/actions/course.actions";
import { CircleDollarSign, BookOpen, Clock } from "lucide-react";

interface Props {
  courses: CourseDTO[];
}

export default function CoursesPageClient({ courses }: Props) {
  const router = useRouter();

  return (
    <div className="w-full h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-extrabold text-gray-800">All Courses</h1>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BookOpen className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No courses available yet.</p>
          <p className="text-sm mt-1">Check back soon for new content.</p>
        </div>
      )}

      {/* Course grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Course header band */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 h-3 w-full" />

            <div className="p-6 flex flex-col flex-grow">
              {/* Title */}
              <h2 className="text-gray-900 font-bold text-lg mb-2 leading-tight">
                {course.title}
              </h2>

              {/* Description */}
              <p className="text-gray-500 text-sm line-clamp-3 flex-grow mb-4">
                {course.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Self-paced</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span>Video lessons</span>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <CircleDollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    {course.price === 0
                      ? "Free"
                      : `${course.price} ${course.currency}`}
                  </span>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/human-services/dashboard/courses/${course.id}`
                    )
                  }
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all duration-200"
                >
                  View course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
