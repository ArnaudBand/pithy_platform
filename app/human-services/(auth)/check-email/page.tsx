"use client";

import { resendVerification } from "@/lib/actions/auth.actions";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const CheckEmailPage = () => {
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first.");
      return;
    }
    setIsResending(true);
    try {
      const result = await resendVerification(email.trim());
      if (result.success) {
        toast.success("Verification email sent successfully.");
      } else {
        toast.error(result.message ?? "Could not resend verification email.");
      }
    } catch {
      toast.error("An error occurred while resending the verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToInbox = () => {
    const domain = email.split("@")[1]?.toLowerCase();
    let inboxUrl = "https://mail.google.com/mail/u/0/#inbox";
    if (domain === "yahoo.com") inboxUrl = "https://mail.yahoo.com";
    else if (domain === "outlook.com" || domain === "hotmail.com")
      inboxUrl = "https://outlook.live.com/mail/";
    window.open(inboxUrl, "_blank");
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col space-y-6 p-4 bg-white w-full">
      <Toaster />
      <h2 className="text-xl font-bold mb-4 text-black">Check Your Email</h2>
      <p className="text-black text-center max-w-sm">
        We sent a verification link to your email. Please check your inbox and
        click the link to verify your account.
      </p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email to resend"
        className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <button
        onClick={handleResendVerification}
        disabled={isResending}
        className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
      >
        {isResending ? "Resending..." : "Resend Verification Email"}
      </button>
      <button
        onClick={handleGoToInbox}
        className="px-4 py-2 bg-green-800 text-white rounded-lg"
      >
        Go to Inbox
      </button>
    </div>
  );
};

export default CheckEmailPage;
