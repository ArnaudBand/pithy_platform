"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CourseDTO,
  CourseRequestPayload,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
} from "@/lib/actions/course.actions";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  BookOpen,
  CircleDollarSign,
  Loader2,
  LayoutList,
} from "lucide-react";

interface Props {
  initialCourses: CourseDTO[];
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "XAF", "NGN"];

const emptyForm = (): CourseRequestPayload => ({
  title: "",
  description: "",
  price: 0,
  currency: "USD",
});

export default function AdminCoursesClient({ initialCourses }: Props) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseDTO[]>(initialCourses);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CourseDTO | null>(null);
  const [form, setForm] = useState<CourseRequestPayload>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Helpers ──────────────────────────────────────────────────────────────

  const refreshCourses = async () => {
    const result = await getAllCourses();
    if (result.success) setCourses(result.courses);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (course: CourseDTO) => {
    setEditTarget(course);
    setForm({
      title: course.title,
      description: course.description ?? "",
      price: course.price,
      currency: course.currency,
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(emptyForm());
    setFormError(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const result = editTarget
        ? await updateCourse(editTarget.id, form)
        : await createCourse(form);

      if (!result.success) {
        setFormError(result.message ?? "Something went wrong.");
        return;
      }
      await refreshCourses();
      closeForm();
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (courseId: string) => {
    startTransition(async () => {
      const result = await deleteCourse(courseId);
      if (!result.success) {
        alert(result.message ?? "Failed to delete course.");
        return;
      }
      setDeleteConfirm(null);
      await refreshCourses();
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Manage Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          New course
        </button>
      </div>

      {/* ── Inline create / edit form ──────────────────────────────────────── */}
      {showForm && (
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">
              {editTarget ? "Edit course" : "Create new course"}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Resume Writing Masterclass"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What will students learn?"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white focus:border-transparent"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editTarget ? "Save changes" : "Create course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {courses.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <BookOpen className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-medium">No courses yet.</p>
          <p className="text-sm mt-1">Click "New course" to add the first one.</p>
        </div>
      )}

      {/* ── Course cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Colour accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-400" />

            <div className="p-5">
              {/* Title */}
              <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {course.description || (
                  <span className="italic text-gray-400">No description.</span>
                )}
              </p>

              {/* Price + date row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <CircleDollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">
                    {course.price === 0 ? "Free" : `${course.price} ${course.currency}`}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(`/human-services/admin/courses/${course.id}`)
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  Manage lessons
                </button>
                <button
                  onClick={() => openEdit(course)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-500 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(course.id)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-red-400 hover:text-red-600 text-gray-500 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-center font-bold text-gray-800 text-lg mb-1">Delete course?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              All lessons and enrollments will also be removed. This cannot be undone.
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
