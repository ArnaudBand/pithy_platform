"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

const EmailVerificationHandler = () => {
    const [status, setStatus] = useState < "loading" | "success" | "error" > ("loading");
    const [message, setMessage] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Invalid verification link. No token provided.");
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/users/verify?token=${encodeURIComponent(token)}`,
                    {
                        method: "GET",
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully! You can now sign in.");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Email verification failed. The link may be expired or invalid.");
                }
            } catch (error) {
                setStatus("error");
                setMessage("An error occurred during verification. Please try again.");
                console.error("Verification error:", error);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === "loading" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Verifying Your Email
                        </h1>
                        <p className="text-gray-600">
                            Please wait while we verify your email address...
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Email Verified!
                        </h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Button
                            onClick={() => router.push("/signIn")}
                            className="w-full bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white hover:opacity-90"
                        >
                            Continue to Sign In
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-gray-600 mb-6">{message}</p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push("/signup")}
                                variant="outline"
                                className="w-full"
                            >
                                Try Signing Up Again
                            </Button>
                            <Button
                                onClick={() => router.push("/signIn")}
                                className="w-full bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white hover:opacity-90"
                            >
                                Go to Sign In
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                            <p className="text-sm text-yellow-800 font-semibold mb-2">
                                Common issues:
                            </p>
                            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                                <li>The verification link has expired (24 hours)</li>
                                <li>The link has already been used</li>
                                <li>The link was copied incorrectly</li>
                            </ul>
                            <p className="text-xs text-yellow-700 mt-2">
                                Try registering again to get a new verification link.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationHandler;