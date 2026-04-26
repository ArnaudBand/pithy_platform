import { getLessonById, getCourseById } from "@/lib/actions/course.actions";
import LessonViewerClient from "@/components/LessonViewerClient";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ course_id: string; lesson_id: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { course_id, lesson_id } = await params;

  const [lessonResult, courseResult] = await Promise.all([
    getLessonById(lesson_id),
    getCourseById(course_id),
  ]);

  // Not enrolled on a paid lesson → redirect to course detail for payment
  if (!lessonResult.success && !lessonResult.enrolled) {
    redirect(`/human-services/dashboard/courses/${course_id}`);
  }

  // Other error
  if (!lessonResult.success || !lessonResult.lesson) {
    redirect(`/human-services/dashboard/courses/${course_id}`);
  }

  return (
    <LessonViewerClient
      lesson={lessonResult.lesson}
      courseId={course_id}
      courseTitle={courseResult.success ? courseResult.course!.title : "Course"}
    />
  );
}
