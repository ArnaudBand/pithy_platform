import { redirect } from "next/navigation";
import { getCurrentUser, hasProfile } from "@/lib/actions/auth.actions";
import DashboardNavBar from "@/components/dashboard_navBar";
import FooterSmallScreen from "@/components/FooterSmallScreen";
import OverView from "@/components/OverView";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/human-services/signIn");
  }

  if (user.role === "ADMIN") {
    redirect("/human-services/admin");
  }

  const profileExists = await hasProfile(user.id);
  if (!profileExists) {
    redirect("/human-services/create-profile");
  }

  return (
    <DashboardNavBar isAdmin={false}>
      <OverView>
        {children}
        <Toaster />
      </OverView>
      <FooterSmallScreen />
    </DashboardNavBar>
  );
}