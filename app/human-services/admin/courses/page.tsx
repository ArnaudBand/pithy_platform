import { getAllCourses } from "@/lib/actions/course.actions";
import AdminCoursesClient from "@/components/AdminCoursesClient";

export default async function AdminCoursesPage() {
  const result = await getAllCourses();
  const courses = result.success ? result.courses : [];

  return <AdminCoursesClient initialCourses={courses} />;
}
