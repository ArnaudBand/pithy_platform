import { getLessonByIdAdmin, getCourseById } from "@/lib/actions/course.actions";
import LessonViewerClient from "@/components/LessonViewerClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ course_id: string; lesson_id: string }>;
}

/**
 * Admin lesson preview page.
 *
 * Uses the /admin endpoint on the backend which bypasses enrollment checks,
 * so admins can preview any lesson — free or paid — without being enrolled.
 */
export default async function AdminLessonPreviewPage({ params }: Props) {
  const { course_id, lesson_id } = await params;

  const [lessonResult, courseResult] = await Promise.all([
    getLessonByIdAdmin(lesson_id),
    getCourseById(course_id),
  ]);

  if (!lessonResult.success || !lessonResult.lesson) {
    notFound();
  }

  return (
    <LessonViewerClient
      lesson={lessonResult.lesson}
      courseId={course_id}
      courseTitle={courseResult.success ? courseResult.course!.title : "Course"}
      backUrl={`/human-services/admin/courses/${course_id}`}
    />
  );
}
