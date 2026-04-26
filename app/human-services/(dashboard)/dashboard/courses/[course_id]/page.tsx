import {
  getCourseById,
  getCourseLessons,
  isEnrolledInCourse,
} from "@/lib/actions/course.actions";
import CourseDetailClient from "@/components/CourseDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ course_id: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { course_id } = await params;

  const [courseResult, lessonsResult, enrolled] = await Promise.all([
    getCourseById(course_id),
    getCourseLessons(course_id),
    isEnrolledInCourse(course_id),
  ]);

  if (!courseResult.success) {
    notFound();
  }

  return (
    <CourseDetailClient
      course={courseResult.course!}
      lessons={lessonsResult.success ? lessonsResult.lessons : []}
      enrolled={enrolled}
    />
  );
}
