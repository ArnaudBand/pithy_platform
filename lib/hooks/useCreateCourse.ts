import { Courses } from "@/types/schema";
import { useFetch } from "./useFetch";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export const useCreateCourse = () => {
  const { data, error, loading, fetchData } = useFetch();

  const handleSubmit = async (course: Courses) => {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not logged in");
    }

    const newCourse = {
      ...course,
      user_id: user.id,
    };

    const result = await fetchData(
      "/api/create-course",
      "POST",
      { "Content-Type": "application/json" },
      newCourse,
    );

    if (result) {
      console.log("Course created:", result);
    } else {
      console.error("Failed to create course.");
    }

    return result;
  };

  return { handleSubmit, data, error, loading };
};
