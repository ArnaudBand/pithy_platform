import MyApplications from "@/components/MyApplications";
import EnrollmentGate from "@/components/EnrollmentGate";

export const metadata = {
  title: "My Applications | Dashboard",
};

const MyApplicationsPage = () => {
  return (
    <EnrollmentGate>
      <div className="min-h-screen py-6 px-2">
        <MyApplications />
      </div>
    </EnrollmentGate>
  );
};

export default MyApplicationsPage;
