"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LessonDTO,
  LessonSectionDTO,
  updateLessonProgress,
} from "@/lib/actions/course.actions";
import { checkAssessmentEligibility } from "@/lib/actions/assessment.actions";
import {
  ChevronLeft,
  CheckCircle,
  PlayCircle,
  List,
  FileText,
  Clock,
  ChevronRight,
  CheckCircle2,
  Loader2,
  BookOpen,
  PartyPopper,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

interface Props {
  lesson: LessonDTO;
  courseId: string;
  courseTitle: string;
  /** Override the back-button destination. Defaults to the user dashboard course page. */
  backUrl?: string;
}

type Tab = "overview" | "sections";

/** Returns a YouTube embed URL if the given URL is a YouTube link, otherwise null. */
function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
}

export default function LessonViewerClient({ lesson, courseId, courseTitle, backUrl }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>(
    lesson.sections.length > 0 ? "sections" : "overview"
  );
  const [isCompleted, setIsCompleted] = useState(
    lesson.progress?.isCompleted ?? false
  );
  const [progressPct, setProgressPct] = useState(
    lesson.progress?.progressPercentage ?? 0
  );
  const [markingComplete, setMarkingComplete] = useState(false);
  // null = hidden; { courseComplete: boolean } = overlay visible
  const [completionOverlay, setCompletionOverlay] = useState<{ courseComplete: boolean } | null>(null);

  // Sync progress to backend every 10 s while playing
  const lastSyncedRef = useRef<number>(lesson.progress?.lastWatchedPosition ?? 0);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncProgress = useCallback(
    async (position: number, pct: number, completed: boolean) => {
      if (Math.abs(position - lastSyncedRef.current) < 5 && !completed) return;
      lastSyncedRef.current = position;
      await updateLessonProgress(lesson.id, {
        lastWatchedPosition: Math.floor(position),
        progressPercentage: Math.round(pct),
        isCompleted: completed,
      });
    },
    [lesson.id]
  );

  // Start interval sync while component is mounted
  useEffect(() => {
    // Capture the ref value at effect entry so the cleanup function
    // can safely reference it (the ref may have changed by unmount time).
    const video = videoRef.current;

    syncTimerRef.current = setInterval(() => {
      const v = videoRef.current;
      if (!v || v.paused || v.ended) return;
      const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
      syncProgress(v.currentTime, pct, false);
    }, 10_000);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      // Final sync on unmount using the captured ref value
      if (video && video.currentTime > 0) {
        const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
        syncProgress(video.currentTime, pct, isCompleted);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seek to last watched position on mount
  useEffect(() => {
    const v = videoRef.current;
    const lastPos = lesson.progress?.lastWatchedPosition ?? 0;
    if (v && lastPos > 0) {
      const onLoaded = () => {
        v.currentTime = lastPos;
      };
      v.addEventListener("loadedmetadata", onLoaded);
      return () => v.removeEventListener("loadedmetadata", onLoaded);
    }
  }, [lesson.progress?.lastWatchedPosition]);

  /** Called after any lesson-complete event — checks course eligibility and shows overlay. */
  const onLessonFinished = useCallback(async () => {
    const courseComplete = await checkAssessmentEligibility();
    setCompletionOverlay({ courseComplete });
  }, []);

  const handleVideoEnded = async () => {
    setIsCompleted(true);
    setProgressPct(100);
    await updateLessonProgress(lesson.id, {
      lastWatchedPosition: Math.floor(videoRef.current?.duration ?? 0),
      progressPercentage: 100,
      isCompleted: true,
    });
    await onLessonFinished();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    setProgressPct(Math.round(pct));
  };

  const handleSectionClick = (section: LessonSectionDTO) => {
    const v = videoRef.current;
    if (!v || section.startTime == null) return;
    v.currentTime = section.startTime;
    v.play();
  };

  const handleMarkComplete = async () => {
    if (isCompleted || markingComplete) return;
    setMarkingComplete(true);
    try {
      await updateLessonProgress(lesson.id, {
        lastWatchedPosition: Math.floor(videoRef.current?.currentTime ?? 0),
        progressPercentage: 100,
        isCompleted: true,
      });
      setIsCompleted(true);
      setProgressPct(100);
      await onLessonFinished();
    } finally {
      setMarkingComplete(false);
    }
  };

  const formatSeconds = (s?: number) => {
    if (s == null) return null;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const youtubeEmbedUrl = lesson.videoUrl ? getYouTubeEmbedUrl(lesson.videoUrl) : null;
  const isYouTube = youtubeEmbedUrl !== null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() =>
            router.push(
              backUrl ?? `/human-services/dashboard/courses/${courseId}`
            )
          }
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{courseTitle}</span>
        </button>

        <ChevronRight className="w-4 h-4 text-gray-600 hidden sm:block" />

        <h1 className="text-sm font-semibold text-gray-200 flex-1 truncate">
          {lesson.title}
        </h1>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 bg-green-900/50 border border-green-700/50 rounded-full px-3 py-1 text-xs text-green-400 font-medium shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={markingComplete}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-green-800 border border-gray-700 hover:border-green-600 rounded-full px-3 py-1 text-xs text-gray-300 hover:text-green-300 font-medium shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            title="Mark this lesson as complete"
          >
            {markingComplete ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {markingComplete ? "Saving…" : "Mark as Complete"}
          </button>
        )}
      </div>

      {/* ── Completion overlay ── */}
      {completionOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

            {completionOverlay.courseComplete ? (
              /* ── Course complete → go to assessment ── */
              <>
                <div className="bg-gradient-to-br from-green-900 to-emerald-800 px-8 pt-10 pb-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 border-2 border-green-400/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PartyPopper className="w-8 h-8 text-green-300" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">Course Complete!</h2>
                  <p className="text-green-300 text-sm leading-relaxed">
                    Outstanding work finishing <span className="font-semibold text-white">{courseTitle}</span>.
                    You&apos;ve completed every lesson and unlocked your personality assessment.
                  </p>
                </div>

                <div className="px-8 py-6 bg-gray-900">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800 border border-gray-700 mb-5">
                    <GraduationCap className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300 leading-relaxed">
                      The <span className="font-semibold text-white">Personality Assessment</span> will help map your MBTI type based on everything you&apos;ve learned.
                      It only takes a few minutes.
                    </p>
                  </div>

                  <button
                    onClick={() => router.push(`/human-services/dashboard/assessment`)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    Take the Assessment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCompletionOverlay(null);
                      router.push(`/human-services/dashboard/courses/${courseId}`);
                    }}
                    className="w-full mt-2 text-xs text-gray-500 hover:text-gray-300 py-2 transition-colors"
                  >
                    Back to course
                  </button>
                </div>
              </>
            ) : (
              /* ── Lesson complete → keep learning ── */
              <>
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 px-8 pt-10 pb-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 border-2 border-green-400/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">Lesson Complete!</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Great job finishing <span className="font-semibold text-white">&ldquo;{lesson.title}&rdquo;</span>.
                    Keep going — you&apos;re making real progress.
                  </p>
                </div>

                <div className="px-8 py-6 bg-gray-900">
                  <button
                    onClick={() => {
                      setCompletionOverlay(null);
                      router.push(`/human-services/dashboard/courses/${courseId}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCompletionOverlay(null)}
                    className="w-full mt-2 text-xs text-gray-500 hover:text-gray-300 py-2 transition-colors"
                  >
                    Stay on this lesson
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
        {/* Video column */}
        <div className="flex-1 flex flex-col">
          {/* Video */}
          <div className="relative bg-black aspect-video w-full">
            {isYouTube ? (
              /* ── YouTube embed ── */
              <iframe
                src={youtubeEmbedUrl!}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={lesson.title}
              />
            ) : lesson.videoUrl ? (
              /* ── Direct video file ── */
              <video
                ref={videoRef}
                src={lesson.videoUrl}
                className="w-full h-full object-contain"
                controls
                onEnded={handleVideoEnded}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              /* ── No video placeholder ── */
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center px-6">
                  <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-30" />
                  <p className="text-sm text-gray-400 mb-1 font-medium">Reading lesson</p>
                  <p className="text-xs text-gray-600 mb-5">
                    No video for this lesson — read the overview below, then mark it complete.
                  </p>
                  {isCompleted ? (
                    <div className="inline-flex items-center gap-2 bg-green-900/50 border border-green-700/50 rounded-full px-4 py-2 text-sm text-green-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Lesson completed
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      disabled={markingComplete}
                      className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors"
                    >
                      {markingComplete ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {markingComplete ? "Saving…" : "Mark as Complete"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar — only for direct video files */}
          {lesson.videoUrl && !isYouTube && (
            <div className="h-1 bg-gray-800">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {/* Tab area */}
          <div className="flex-1 bg-gray-900">
            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-4">
              {lesson.sections.length > 0 && (
                <button
                  onClick={() => setActiveTab("sections")}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === "sections"
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                  Chapters
                </button>
              )}
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === "overview"
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Overview
              </button>
            </div>

            {/* Tab content */}
            <div className="p-5 overflow-y-auto max-h-96 xl:max-h-none">
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-3">
                    {lesson.title}
                  </h2>
                  {lesson.durationMinutes && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.durationMinutes} minutes</span>
                    </div>
                  )}
                  {lesson.overview ? (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {lesson.overview}
                    </div>
                  ) : lesson.description ? (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {lesson.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No description available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "sections" && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
                    {lesson.sections.length} chapter
                    {lesson.sections.length !== 1 ? "s" : ""}
                  </p>
                  {lesson.sections
                    .slice()
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section)}
                        disabled={section.startTime == null}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-default transition-colors group"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-700 group-hover:bg-green-700 transition-colors flex items-center justify-center">
                          <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">
                            {section.subtitle}
                          </p>
                          {section.content && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {section.content}
                            </p>
                          )}
                        </div>
                        {section.startTime != null && (
                          <span className="shrink-0 text-xs text-gray-500 font-mono">
                            {formatSeconds(section.startTime)}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
