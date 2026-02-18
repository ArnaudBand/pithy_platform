"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Determine if the current pathname matches the desired routes
  const shouldDisplayNavbar = [
    "/human-services",
    "/human-services/about",
    "/human-services/contact",
    "/human-services/how-it-works",
  ].includes(
    pathname,
    // pathname.replace(/\/$/, "")
  );

  return (
    <div>
      {shouldDisplayNavbar ? <Navbar /> : null}
      {/* Render nothing if not on the specified routes */}
      {children}
    </div>
  );
};

export default ConditionalLayout;
