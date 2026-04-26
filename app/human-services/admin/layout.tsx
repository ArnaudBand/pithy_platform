import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardNavBar from "@/components/dashboard_navBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Not logged in → back to sign-in
  if (!user) {
    redirect("/human-services/signIn");
  }

  // Logged in but not ADMIN → 403 page
  if (user.role !== "ADMIN") {
    redirect("/human-services/403");
  }

  return (
    <div className="relative">
      <DashboardNavBar isAdmin={true}>
        <div className="flex mt-4 space-x-4">
          <AdminSidebar>{children}</AdminSidebar>
        </div>
      </DashboardNavBar>
    </div>
  );
}
