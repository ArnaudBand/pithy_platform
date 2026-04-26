"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CourseDTO, LessonDTO, enrollInCourse, initiatePayment } from "@/lib/actions/course.actions";
import {
  Lock,
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  CircleDollarSign,
  BookOpen,
  Loader2,
} from "lucide-react";

interface Props {
  course: CourseDTO;
  lessons: LessonDTO[];
  enrolled: boolean;
}

export default function CourseDetailClient({ course, lessons, enrolled: initialEnrolled }: Props) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    setEnrollError(null);

    if (course.price === 0) {
      // ── Free course: enrol directly ────────────────────────────────────────
      startTransition(async () => {
        const result = await enrollInCourse(course.id);
        if (!result.success) {
          setEnrollError(result.message ?? "Failed to enroll. Please try again.");
          return;
        }
        setEnrolled(true);
        router.refresh();
      });
    } else {
      // ── Paid course: redirect to Flutterwave checkout ─────────────────────
      startTransition(async () => {
        // Build the callback URL the user will land on after Flutterwave
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_BASE_URL ?? "");
        // NOTE: payment-callback lives OUTSIDE the (dashboard) layout group
        // so it is never subject to auth/profile-check redirects.
        const redirectUrl = `${origin}/human-services/payment-callback?courseId=${course.id}`;

        const result = await initiatePayment(course.id, redirectUrl);
        if (!result.success) {
          setEnrollError(result.message ?? "Failed to start payment. Please try again.");
          return;
        }
        // Hard-navigate to the Flutterwave hosted checkout page
        window.location.href = result.paymentLink;
      });
    }
  };

  const completedCount = lessons.filter(
    (l) => l.progress?.isCompleted
  ).length;
  const progressPct =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const handleLessonClick = (lesson: LessonDTO) => {
    const accessible = lesson.isFree || enrolled;
    if (!accessible) return;
    router.push(
      `/human-services/dashboard/courses/${course.id}/lessons/${lesson.id}`
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to courses
          </button>

          <h1 className="text-3xl font-extrabold mb-3 leading-tight">
            {course.title}
          </h1>
          <p className="text-white/80 text-base max-w-2xl leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            {/* Price badge */}
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold">
              <CircleDollarSign className="w-4 h-4" />
              {course.price === 0
                ? "Free"
                : `${course.price} ${course.currency}`}
            </div>

            {/* Lessons count */}
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold">
              <BookOpen className="w-4 h-4" />
              {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
            </div>

            {/* Enrolled badge */}
            {enrolled && (
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Enrolled
              </div>
            )}
          </div>

          {/* Progress bar — only if enrolled */}
          {enrolled && lessons.length > 0 && (
            <div className="mt-6 max-w-md">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">Your progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1.5">
                {completedCount} of {lessons.length} lessons completed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lessons list */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enrollment CTA if not enrolled */}
        {!enrolled && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-base">
                {course.price === 0
                  ? "Enroll to track your progress"
                  : "Enroll to unlock all lessons"}
              </p>
              <p className="text-amber-700 text-sm mt-1">
                {course.price === 0
                  ? "This course is free — enroll to start tracking your progress."
                  : "Free lessons are available to preview. Purchase the course to access all content."}
              </p>
              {enrollError && (
                <p className="text-red-600 text-sm mt-2 font-medium">{enrollError}</p>
              )}
            </div>
            <button
              onClick={handleEnroll}
              disabled={isPending}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {course.price === 0
                ? "Enroll for free"
                : `Enroll — ${course.price} ${course.currency}`}
            </button>
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-800 mb-4">Lessons</h2>

        {lessons.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No lessons available yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {lessons
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((lesson, idx) => {
              const accessible = lesson.isFree || enrolled;
              const completed = lesson.progress?.isCompleted ?? false;
              const inProgress =
                !completed &&
                (lesson.progress?.progressPercentage ?? 0) > 0;

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  disabled={!accessible}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                    accessible
                      ? "bg-white border-gray-200 hover:border-green-400 hover:shadow-md cursor-pointer"
                      : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-70"
                  }`}
                >
                  {/* Index / status icon */}
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                    {completed ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : !accessible ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <PlayCircle className="w-8 h-8 text-purple-500" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-400">
                        Lesson {idx + 1}
                      </span>
                      {lesson.isFree && !enrolled && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          Free preview
                        </span>
                      )}
                      {inProgress && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          In progress
                        </span>
                      )}
                    </div>
                    <p
                      className={`font-semibold text-sm mt-0.5 truncate ${
                        accessible ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {/* Right meta */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {lesson.durationMinutes && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.durationMinutes} min
                      </span>
                    )}
                    {inProgress && (
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${lesson.progress?.progressPercentage ?? 0}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
