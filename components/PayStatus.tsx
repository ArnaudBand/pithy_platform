"use client";

import { useCourseStore } from "@/lib/store/courseStore";
import { getCurrentUser, AuthUser } from "@/lib/actions/auth.actions";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PaymentStatus = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get parameters from URL
  const transaction_id = searchParams.get("transaction_id");
  let course_id = searchParams.get("course_id");

  // Fallback: try to get course_id from sessionStorage if not in URL
  if (!course_id && typeof window !== "undefined") {
    course_id = sessionStorage.getItem("pending_course_purchase");
    console.log("Retrieved course_id from sessionStorage:", course_id);
  }

  // Debug all URL parameters
  console.log("=== PAYMENT STATUS DEBUG ===");
  console.log("All URL parameters:", Object.fromEntries(searchParams.entries()));
  console.log("Transaction ID:", transaction_id);
  console.log("Course ID from URL:", searchParams.get("course_id"));
  console.log("Course ID final:", course_id);
  console.log("Full URL:", typeof window !== "undefined" ? window.location.href : "SSR");
  console.log(
    "SessionStorage course:",
    typeof window !== "undefined"
      ? sessionStorage.getItem("pending_course_purchase")
      : "SSR",
  );

  const [message, setMessage] = useState("Processing payment...");
  const [loading, setLoading] = useState<boolean>(true);
  const [messageStyle, setMessageStyle] = useState("text-gray-700");
  const [user, setUser] = useState<AuthUser | null>(null);

  const { setUserCoursePurchase } = useCourseStore();

  // Load the current user once on mount
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!transaction_id) {
      setMessage("Invalid transaction. Missing transaction ID.");
      setMessageStyle("text-red-600 bg-red-50 border border-red-200");
      setLoading(false);
      return;
    }

    // Check for course_id after attempting to get it from sessionStorage
    if (!course_id) {
      setMessage(
        "Warning: missing course ID. Please contact support with your transaction ID: " +
          transaction_id,
      );
      setMessageStyle("text-yellow-600 bg-yellow-50 border border-yellow-200");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        // POST to our Next.js route handler which proxies to Spring Boot with auth cookie
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: transaction_id,
            courseId: course_id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment verification failed");
        }

        const data = await response.json();
        console.log("Payment verification response:", data);

        if (data.success && data.courseUnlocked) {
          console.log("=== UNLOCKING COURSE ===");
          console.log("User:", user?.id);
          console.log("Course:", course_id);

          // Mark this course as purchased locally
          if (user?.id && course_id) {
            setUserCoursePurchase(user.id, course_id, true);
          }

          // Clear the pending purchase from sessionStorage
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pending_course_purchase");
          }

          setMessage("Payment successful! Your course has been unlocked.");
          setMessageStyle("text-green-600 bg-green-50 border border-green-200");

          // Redirect after a short delay so the user sees the message
          setTimeout(() => {
            router.push("/human-services/dashboard");
          }, 3000);
        } else if (
          data.error === "Student already exists in the course." ||
          data.error === "Student email already exists in the course."
        ) {
          console.log("=== COURSE ALREADY PURCHASED ===");
          console.log("User:", user?.id);
          console.log("Course:", course_id);

          if (user?.id && course_id) {
            setUserCoursePurchase(user.id, course_id, true);
          }

          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pending_course_purchase");
          }

          setMessage(
            "You have already purchased this course. Redirecting to dashboard...",
          );
          setMessageStyle("text-blue-600 bg-blue-50 border border-blue-200");

          setTimeout(() => {
            router.push("/human-services/dashboard");
          }, 3000);
        } else {
          throw new Error(
            data.error || "Payment verification failed. Please try again.",
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage(
          error instanceof Error
            ? error.message
            : "An error occurred while verifying the payment. Please try again later.",
        );
        setMessageStyle("text-red-600 bg-red-50 border border-red-200");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [transaction_id, course_id, router, user, setUserCoursePurchase]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className={`max-w-md p-6 rounded-lg shadow-md ${messageStyle} transition duration-300`}
      >
        <h1 className="text-xl font-semibold mb-2">Payment Status</h1>
        <p className="text-sm mb-4">{message}</p>

        {/* Debug info for development */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs bg-gray-100 p-2 rounded mb-4">
            <p>Debug Info:</p>
            <p>Transaction: {transaction_id}</p>
            <p>Course ID: {course_id}</p>
            <p>User: {user?.id}</p>
          </div>
        )}

        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          </div>
        )}

        {!loading && (
          <div className="mt-4 space-y-2">
            <button
              onClick={() => router.push("/human-services/dashboard")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
            >
              Go to Dashboard
            </button>
            {!course_id && (
              <button
                onClick={() => router.push("/human-services/courses")}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
              >
                Browse Courses
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
