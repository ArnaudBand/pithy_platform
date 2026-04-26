import { getAllCourses } from "@/lib/actions/course.actions";
import CoursesPageClient from "@/components/CoursesPageClient";

export default async function CoursesPage() {
  const result = await getAllCourses();
  const courses = result.success ? result.courses : [];

  return <CoursesPageClient courses={courses} />;
}
