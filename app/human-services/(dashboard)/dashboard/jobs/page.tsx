import React from "react";
import JobList from "@/components/JobList";
import EnrollmentGate from "@/components/EnrollmentGate";

export const metadata = {
  title: "Jobs | Human Services",
};

const JobsPage = () => {
  return (
    <EnrollmentGate>
      <div className="min-h-screen no-scrollbar">
        <JobList />
      </div>
    </EnrollmentGate>
  );
};

export default JobsPage;
