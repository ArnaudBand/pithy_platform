import MyFundingApplications from "@/components/MyFundingApplications";
import EnrollmentGate from "@/components/EnrollmentGate";

export const metadata = {
  title: "My Funding Applications | Human Services",
};

const MyFundingApplicationsPage = () => {
  return (
    <EnrollmentGate>
      <MyFundingApplications />
    </EnrollmentGate>
  );
};

export default MyFundingApplicationsPage;
