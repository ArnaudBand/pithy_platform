"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CourseDTO,
  LessonDTO,
  LessonRequestPayload,
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseLessons,
} from "@/lib/actions/course.actions";
import {
  ChevronLeft,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Loader2,
  BookOpen,
  PlayCircle,
  Lock,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";

interface Props {
  course: CourseDTO;
  initialLessons: LessonDTO[];
}

const emptyLesson = (courseId: string, nextOrder: number): LessonRequestPayload => ({
  courseId,
  title: "",
  description: "",
  overview: "",
  videoUrl: "",
  durationMinutes: undefined,
  orderIndex: nextOrder,
  isFree: false,
  sections: [],
});

export default function AdminCourseDetailClient({ course, initialLessons }: Props) {
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonDTO[]>(
    [...initialLessons].sort((a, b) => a.orderIndex - b.orderIndex)
  );
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<LessonDTO | null>(null);
  const [form, setForm] = useState<LessonRequestPayload>(emptyLesson(course.id, 0));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<LessonDTO | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Helpers ──────────────────────────────────────────────────────────────

  const refreshLessons = async () => {
    const result = await getCourseLessons(course.id);
    if (result.success) {
      setLessons([...result.lessons].sort((a, b) => a.orderIndex - b.orderIndex));
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyLesson(course.id, lessons.length));
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (lesson: LessonDTO) => {
    setEditTarget(lesson);
    setForm({
      courseId: course.id,
      title: lesson.title,
      description: lesson.description ?? "",
      overview: lesson.overview ?? "",
      videoUrl: lesson.videoUrl ?? "",
      durationMinutes: lesson.durationMinutes,
      orderIndex: lesson.orderIndex,
      isFree: lesson.isFree,
      sections: [],
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setFormError(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const result = editTarget
        ? await updateLesson(editTarget.id, form)
        : await createLesson(form);

      if (!result.success) {
        setFormError(result.message ?? "Something went wrong.");
        return;
      }
      await refreshLessons();
      closeForm();
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (lesson: LessonDTO) => {
    startTransition(async () => {
      const result = await deleteLesson(lesson.id);
      if (!result.success) {
        alert(result.message ?? "Failed to delete lesson.");
        return;
      }
      setDeleteConfirm(null);
      await refreshLessons();
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-8">
        <button
          onClick={() => router.push("/human-services/admin/courses")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to courses
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight mb-1">
              {course.title}
            </h1>
            <p className="text-white/60 text-sm max-w-xl line-clamp-2">
              {course.description}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-lg font-bold text-green-400">
              {course.price === 0 ? "Free" : `${course.price} ${course.currency}`}
            </span>
            <span className="text-xs text-white/50">
              {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Lessons</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add lesson
          </button>
        </div>

        {/* ── Inline lesson form ─────────────────────────────────────────── */}
        {showForm && (
          <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                {editTarget ? "Edit lesson" : "Add new lesson"}
              </h3>
              <button
                onClick={closeForm}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Title + Order row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Introduction to the course"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.orderIndex}
                    onChange={(e) =>
                      setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Short description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="One-line summary shown in the lesson list"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Overview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Overview / full content
                </label>
                <textarea
                  rows={4}
                  value={form.overview}
                  onChange={(e) => setForm({ ...form, overview: e.target.value })}
                  placeholder="Detailed lesson content shown to enrolled students"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Video URL + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.durationMinutes ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        durationMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Free toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFree ?? false}
                    onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
                <span className="text-sm font-medium text-gray-700">
                  Free preview lesson{" "}
                  <span className="text-gray-400 font-normal">
                    (visible without enrollment)
                  </span>
                </span>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm rounded-xl"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editTarget ? "Save changes" : "Add lesson"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Lesson list ────────────────────────────────────────────────── */}
        {lessons.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <BookOpen className="w-10 h-10 mb-2 opacity-40" />
            <p className="font-medium text-sm">No lessons yet.</p>
            <p className="text-xs mt-1">Click "Add lesson" to get started.</p>
          </div>
        )}

        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Icon */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                {lesson.isFree ? (
                  <PlayCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                  {lesson.isFree && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      Free
                    </span>
                  )}
                  {lesson.videoUrl && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      Has video
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm mt-0.5 truncate">
                  {lesson.title}
                </p>
                {lesson.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {lesson.description}
                  </p>
                )}
              </div>

              {/* Duration */}
              {lesson.durationMinutes && (
                <div className="shrink-0 flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.durationMinutes} min
                </div>
              )}

              {/* Sections count */}
              {lesson.sections.length > 0 && (
                <div className="shrink-0 flex items-center gap-1 text-xs text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {lesson.sections.length} chapter{lesson.sections.length !== 1 ? "s" : ""}
                </div>
              )}

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1">
                <button
                  onClick={() =>
                    router.push(
                      `/human-services/admin/courses/${course.id}/lessons/${lesson.id}`
                    )
                  }
                  title="Preview lesson"
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(lesson)}
                  title="Edit lesson"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(lesson)}
                  title="Delete lesson"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Delete lesson modal ───────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-center font-bold text-gray-800 text-lg mb-1">
              Delete lesson?
            </h3>
            <p className="text-center text-sm text-gray-600 font-medium mb-1">
              "{deleteConfirm.title}"
            </p>
            <p className="text-center text-sm text-gray-500 mb-6">
              All student progress for this lesson will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-sm rounded-xl"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
