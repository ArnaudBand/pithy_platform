import EnrollmentGate from "@/components/EnrollmentGate";
import ScholarshipList from "@/components/ScholarshipList";

export const metadata = {
  title: "Scholarships | Human Services",
};

const ScholarshipsPage = () => {
  return (
    <EnrollmentGate>
      <ScholarshipList />
    </EnrollmentGate>
  );
};

export default ScholarshipsPage;
