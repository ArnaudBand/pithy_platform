import JobDashboard from "@/components/JobForm";

export const metadata = {
  title: "Manage Jobs | Admin",
};

const AddJobPage = () => {
  return (
    <div className="w-full p-4">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create, edit, and delete job listings. Only enrolled users can view
          and apply for jobs.
        </p>
        <div className="mt-3 h-1 w-16 bg-green-500 rounded-full" />
      </div>

      <JobDashboard />
    </div>
  );
};

export default AddJobPage;
