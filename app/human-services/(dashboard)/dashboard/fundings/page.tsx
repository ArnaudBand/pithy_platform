import EnrollmentGate from "@/components/EnrollmentGate";
import FundingsList from "@/components/FundingsList";

export const metadata = {
  title: "Fundings | Human Services",
};

const FundingsPage = () => {
  return (
    <EnrollmentGate>
      <FundingsList />
    </EnrollmentGate>
  );
};

export default FundingsPage;
