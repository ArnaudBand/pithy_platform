"use client";

import DashboardNavBar from "@/components/dashboard_navBar";
import FooterSmallScreen from "@/components/FooterSmallScreen";
import OverView from "@/components/OverView";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser, hasProfile } from "@/lib/actions/auth.actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      // getCurrentUser() reads the httpOnly JWT cookie server-side.
      // Returns null when the user is not logged in.
      const user = await getCurrentUser();
      console.log("Dashboard layout - getCurrentUser result:", JSON.stringify(user));

      if (!user) {
        console.log("No user found, redirecting to signIn");
        router.replace("/human-services/signIn");
        return;
      }

      // Admins don't need a profile — send them to the admin panel.
      if (user.role === "ADMIN") {
        console.log("Admin user found, redirecting to admin panel");
        router.replace("/human-services/admin");
        return;
      }

      // hasProfile() calls GET /api/profiles/{id} with the cookie automatically.
      // Retry once in case the profile was just created and DB write is in flight.
      let profileExists = await hasProfile(user.id);
      if (!profileExists) {
        await new Promise((r) => setTimeout(r, 400));
        profileExists = await hasProfile(user.id);
      }

      if (!profileExists) {
        router.replace("/human-services/create-profile");
        return;
      }

      setIsAdmin(false);
      setIsChecking(false);
    };

    checkAuthAndProfile();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full filter blur-md animate-pulse"></div>
          <div className="relative z-10 w-16 h-16">
            <div className="absolute inset-0 border-4 border-t-green-400 border-r-transparent border-b-green-200 border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardNavBar isAdmin={isAdmin}>
      <OverView>
        {children}
        <Toaster />
      </OverView>
      <FooterSmallScreen />
    </DashboardNavBar>
  );
}