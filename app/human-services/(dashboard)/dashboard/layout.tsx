"use client";

import DashboardNavBar from "@/components/dashboard_navBar";
import FooterSmallScreen from "@/components/FooterSmallScreen";
import OverView from "@/components/OverView";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

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

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      // Check authentication
      if (!token || !user) {
        router.replace("/signIn");
        return;
      }

      try {
        const userData = JSON.parse(user);

        // Check if user has a profile
        const response = await fetch(`http://localhost:8080/api/profiles/${userData.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // No profile found, redirect to create profile
          router.replace("/create-profile");
          return;
        }

        // Profile exists, store it and continue
        const profileData = await response.json();
        localStorage.setItem("profile", JSON.stringify(profileData));

        // All checks passed, show dashboard
        setIsChecking(false);

      } catch (error) {
        console.error("Error checking profile:", error);
        // On error, redirect to create profile to be safe
        router.replace("/create-profile");
      }
    };

    checkAuthAndProfile();
  }, [router]);

  // Show loading while checking authentication and profile
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
    <DashboardNavBar>
      <OverView>
        {children}
        <Toaster />
      </OverView>
      <FooterSmallScreen />
    </DashboardNavBar>
  );
}