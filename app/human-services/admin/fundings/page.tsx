import AddFundingForm from "@/components/AddFundingForm";

export const metadata = {
  title: "Manage Fundings | Admin",
};

const AddFundingPage = () => {
  return (
    <div className="p-6">
      <AddFundingForm />
    </div>
  );
};

export default AddFundingPage;
