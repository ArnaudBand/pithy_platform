import { getCourseById, getCourseLessons } from "@/lib/actions/course.actions";
import AdminCourseDetailClient from "@/components/AdminCourseDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ course_id: string }>;
}

export default async function AdminCourseDetailPage({ params }: Props) {
  const { course_id } = await params;

  const [courseResult, lessonsResult] = await Promise.all([
    getCourseById(course_id),
    getCourseLessons(course_id),
  ]);

  if (!courseResult.success) notFound();

  return (
    <AdminCourseDetailClient
      course={courseResult.course!}
      initialLessons={lessonsResult.success ? lessonsResult.lessons : []}
    />
  );
}
