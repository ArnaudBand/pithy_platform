"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeft, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        try {
            emailSchema.parse({ email });
        } catch (error) {
            if (error instanceof z.ZodError) {
                toast.error(error.errors[0].message);
                return;
            }
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `http://localhost:8080/api/users/forgot-password?email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            // Always show success message for security (don't reveal if email exists)
            setEmailSent(true);
            toast.success("If an account exists with this email, a password reset link has been sent.");

        } catch (error) {
            // Still show success for security
            setEmailSent(true);
            console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <Toaster position="top-center" />

                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-green-600" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Check Your Email
                    </h1>

                    <p className="text-gray-600 mb-6">
                        If an account exists with{" "}
                        <span className="font-semibold text-gray-800">{email}</span>, you will
                        receive a password reset link shortly.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-2">Next Steps:</h3>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Check your email inbox</li>
                            <li>Click the reset link in the email</li>
                            <li>Create a new password</li>
                            <li>Sign in with your new password</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-3">
                            💡 The reset link expires in 1 hour
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push("/signIn")}
                        className="w-full bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white hover:opacity-90"
                    >
                        Back to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-white flex justify-center items-center flex-col relative">
            <Button
                onClick={() => router.push("/signIn")}
                className="absolute top-4 right-4 bg-transparent text-gray-800 hover:text-zinc-200 hover:bg-green-500"
            >
                <MoveLeft className="mr-2" />
                Back to Sign In
            </Button>

            <Toaster position="top-center" />

            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-600">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{" "}
                            <a
                                href="/signIn"
                                className="text-green-600 font-medium hover:underline"
                            >
                                Sign in
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;