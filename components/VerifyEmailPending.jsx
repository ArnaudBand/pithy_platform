"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { Mail, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { resendVerification } from "@/lib/actions/auth.actions";

// email can be passed as a prop (legacy) or read from the ?email= search param
const VerifyEmailPending = ({ email: emailProp }) => {
    const searchParams = useSearchParams();
    const email = emailProp || searchParams.get("email") || "";
    const [isResending, setIsResending] = useState(false);

    const handleResendEmail = async () => {
        if (!email) {
            toast.error("Email address not found. Please sign up again.");
            return;
        }

        setIsResending(true);
        try {
            const result = await resendVerification(email);
            if (!result.success) {
                toast.error(result.message ?? "Failed to resend verification email.");
                return;
            }
            toast.success(result.message ?? "Verification email sent! Check your inbox.");
        } catch {
            toast.error("Failed to resend email. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4 w-full">
            <Toaster position="top-center" />

            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Mail Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Check Your Email
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    We've sent a verification link to{" "}
                    {email ? (
                        <span className="font-semibold text-gray-800">{email}</span>
                    ) : (
                        "your email address"
                    )}
                    . Please check your inbox and click the link to verify your account.
                </p>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-left">
                    <h3 className="font-semibold text-gray-800 mb-2">Next Steps:</h3>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Open your email inbox</li>
                        <li>Look for an email from Pithy</li>
                        <li>Click the verification link in the email</li>
                        <li>Return here to sign in</li>
                    </ol>
                </div>

                {/* Resend Email */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                        Didn't receive the email?
                    </p>
                    <Button
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                        {isResending ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Resending...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Resend Verification Email
                            </>
                        )}
                    </Button>
                </div>

                {/* Tips */}
                <div className="text-xs text-gray-500 space-y-1">
                    <p>💡 Check your spam or junk folder</p>
                    <p>⏱️ The verification link expires in 24 hours</p>
                </div>

                {/* Sign In Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Already verified?{" "}
                        <a
                            href="/human-services/signIn"
                            className="text-green-600 font-medium hover:underline"
                        >
                            Sign in here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPending;