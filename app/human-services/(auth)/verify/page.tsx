import { Suspense } from "react";
import EmailVerificationHandler from "@/components/EmailVerificationHandler";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EmailVerificationHandler />
    </Suspense>
  );
}