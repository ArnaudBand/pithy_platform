"use client";

import { useState, useEffect } from "react";
import { Course, UserInfo } from "@/types/schema";
import { createCourse, getLoggedInUser } from "@/lib/actions/user.actions";

const CourseAdmin: React.FC = () => {
  const [formData, setFormData] = useState<Course>({
    course_id: "",
    user_id: "",
    title: "",
    description: "",
    price: 0,
    duration: "",
    video: null as File | null, // Initial value for the video
  });
  const [user, setUser] = useState<UserInfo | null>(null);

  
  useEffect(() => {
    const fetchUser = async () => {
      const userLogged = await getLoggedInUser();
      setUser(userLogged);
    }

    fetchUser();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Course = {
      course_id: formData.course_id,
      user_id: user?.user_id || "",
      title: formData.title,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      video: formData.video,
    }
    try {
      const newCourse = await createCourse(data);
      console.log("Course created:", newCourse);
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, video: e.target.files[0] });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create a New Course</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Course Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Course Description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              id="price"
              placeholder="Course Price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              id="duration"
              placeholder="Course Duration (e.g., 10 hours)"
              value={formData.duration}
              onChange={handleInputChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">
              Video Upload
            </label>
            <input
              type="file"
              name="video"
              id="video"
              accept="video/mp4"
              onChange={handleFileChange}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSubmit} 
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseAdmin;
// "use client";
// import CourseForm from "@/components/CourseForm";

// const CourseAdmin = () => {
//   return (
//     <div>
//       <CourseForm />
//     </div>
//   )
// }

// export default CourseAdmin;
