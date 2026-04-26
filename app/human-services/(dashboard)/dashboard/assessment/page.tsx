import { Metadata } from "next";
import AssessmentTaker from "@/components/AssessmentTaker";

export const metadata: Metadata = {
  title: "Personality Assessment | Pithy Means",
  description:
    "Discover your personality type by completing our Likert-scale assessment.",
};

/**
 * Assessment page — available once the user has completed their enrolled course.
 * The course-completion gate is enforced by the backend (AssessmentService
 * will reject starts from users with no completed enrollments).
 */
export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AssessmentTaker />
    </div>
  );
}
