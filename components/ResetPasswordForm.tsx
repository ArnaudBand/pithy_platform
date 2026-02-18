"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
    const [formData, setFormData] = useState < ResetPasswordForm > ({
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [resetSuccess, setResetSuccess] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement> ) => {
        e.preventDefault();
        setFormErrors({});

        if (!token) {
            toast.error("Invalid reset link. Please request a new password reset.");
            return;
        }

        // Validate form
        try {
            resetPasswordSchema.parse(formData);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path && err.path.length > 0) {
                        const field = String(err.path[0]);
                        newErrors[field] = err.message;
                    }
                });
                setFormErrors(newErrors);

                const errorKeys = Object.keys(newErrors);
                if (errorKeys.length > 0) {
                    toast.error(newErrors[errorKeys[0]]);
                }
                return;
            }
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/users/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Password reset failed");
            }

            setResetSuccess(true);
            toast.success("Password reset successfully!");

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Password reset failed. Please try again.";
            toast.error(errorMessage);
            console.error("Reset password error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (resetSuccess) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <Toaster position="top-center" />

                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Password Reset Complete!
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Your password has been successfully reset. You can now sign in with your new password.
                    </p>

                    <Button
                        onClick={() => router.push("/signIn")}
                        className="w-full bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white hover:opacity-90"
                    >
                        Continue to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-white p-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Invalid Reset Link
                    </h1>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Button
                        onClick={() => router.push("/forgot-password")}
                        className="bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white"
                    >
                        Request New Reset Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-white flex justify-center items-center flex-col relative">
            <Toaster position="top-center" />

            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-600">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.password ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.password && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPasswordForm;