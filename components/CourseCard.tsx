"use client";

import React from "react";
import Image from "next/image";
import { MdAccessTimeFilled } from "react-icons/md";
import { FaBookReader } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Courses } from "@/types/schema";
import PaymentButton from "./PaymentButton";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCourseStore } from "@/lib/store/courseStore";
import { CircleDollarSign } from "lucide-react";

const CourseCard: React.FC<{ courses: Courses[] }> = ({ courses }) => {
  const router = useRouter();
  const { user } = useAuthStore((state) => state);
  const { isCoursePurchased } = useCourseStore();

  // Sync courses on component mount
  React.useEffect(() => {
    if (user?.user_id) {
      // This would be a good place to sync with server on initial load
      const { syncPurchasesFromServer } = useCourseStore.getState();
      syncPurchasesFromServer(user.user_id);
    }
  }, [user?.user_id]);

  const handleViewMore = (course: Courses) => {
    router.push(`/dashboard/courses/${course.course_id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {courses.map((course) => {
        // Check if this course is purchased by the current user
        const isEnrolled = isCoursePurchased(user?.user_id, course.course_id);

        // Determine if this course should be displayed as locked
        const shouldLockCourse = !isEnrolled && user?.paid === false;

        return (
          <div
            key={course.course_id}
            className="bg-white shadow-lg rounded-lg overflow-hidden w-full flex flex-col"
            style={{ minHeight: "350px" }}
          >
            <div className="py-4 px-6 flex flex-col justify-between flex-grow">
              {/* Check if the course is locked */}
              {shouldLockCourse ? (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <p className="text-red-600 font-bold text-lg mb-2">
                    Upgrade your membership
                  </p>
                  <PaymentButton
                    course={{
                      course_id: course.course_id,
                      title: course.title,
                      price: course.price,
                    }}
                  />
                </div>
              ) : (
                <>
                  {/* Display course details if enrolled or unlocked */}
                  <div className="flex flex-col space-y-1 border-b-slate-300 border-b-4">
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={800}
                      height={400}
                      unoptimized
                      className="object-cover w-full h-72"
                    />
                    <p className="text-black font-bold text-lg mb-2">
                      {course.title}
                    </p>
                       {/* Stats with glassmorphism */}
                    <div className="flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 md:px-4 py-1.5 xs:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 sm:hover:scale-105 transition-all duration-300 flex-1 justify-center min-w-0">
                        <MdAccessTimeFilled className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-300 font-semibold text-[10px] xs:text-xs sm:text-sm truncate text-black">{course.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 md:px-4 py-1.5 xs:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 sm:hover:scale-105 transition-all duration-300 flex-1 justify-center min-w-0">
                        <FaBookReader className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                        <span className="text-gray-300 font-semibold text-[10px] xs:text-xs sm:text-sm truncate">
                          {course.students?.length || 0}
                          <span className="hidden xs:inline text-black"> Learners</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between items-center mt-4">
                        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-2 xs:px-2.5 sm:px-3 md:px-4 py-1.5 xs:py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 backdrop-blur-sm flex-shrink-0">
                          <CircleDollarSign className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                          <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-green-400 whitespace-nowrap">
                            ${course.price}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewMore(course)}
                          className="relative px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs xs:text-sm sm:text-base rounded-lg overflow-hidden group/btn hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 sm:hover:scale-105 transition-all duration-300 flex-shrink-0"
                        >
                          View more
                        </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseCard;
