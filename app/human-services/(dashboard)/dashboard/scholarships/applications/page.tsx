import MyScholarshipApplications from "@/components/MyScholarshipApplications";
import EnrollmentGate from "@/components/EnrollmentGate";

export const metadata = {
  title: "My Scholarship Applications | Dashboard",
};

const MyScholarshipApplicationsPage = () => {
  return (
    <EnrollmentGate>
      <div className="min-h-screen py-6 px-2">
        <MyScholarshipApplications />
      </div>
    </EnrollmentGate>
  );
};

export default MyScholarshipApplicationsPage;
