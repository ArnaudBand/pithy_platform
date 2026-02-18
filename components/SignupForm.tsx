"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeft, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { userRegistrationSchema, UserRegistration } from "@/lib/validations/auth-schema";
import { z } from "zod";

const SignupForm = () => {
  const [formData, setFormData] = useState<UserRegistration>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form
    try {
      userRegistrationSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          newErrors[field as string] = err.message;
        });
        setFormErrors(newErrors);

        // Show first error in toast
        const errorKeys = Object.keys(newErrors);
        if (errorKeys.length > 0) {
          toast.error(newErrors[errorKeys[0]]);
        }
        return;
      }
    }

    setIsLoading(true);

    try {
      // Call your backend API
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success
      toast.success(data.message || "Registration successful! Please check your email to verify your account.");

      // Redirect to verification pending page after 2 seconds
      setTimeout(() => {
        router.push("/verify-email-pending");
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Registration failed. Please try again.";
      toast.error(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white backdrop-blur-sm z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full filter blur-md animate-pulse"></div>
          <div className="relative z-10 w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-green-400 border-r-transparent border-b-green-200 border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-r-green-400 border-b-transparent border-l-green-200 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-t-green-200 border-r-transparent border-b-green-400 border-l-transparent rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-8 text-green-400 font-medium tracking-wider animate-pulse text-center">
            CREATING ACCOUNT<span className="animate-ping">...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-white flex justify-center items-center flex-col relative">
      <Button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 bg-transparent text-gray-800 hover:text-zinc-200 hover:bg-green-500"
      >
        <MoveLeft className="mr-2" />
        Go Back
      </Button>

      <Toaster position="top-center" />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Sign up to get started with Pithy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-green-500 ${formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="you@example.com"
              required
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.password ? "border-red-500" : "border-gray-300"
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
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
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
            {isLoading ? (
              <div className="flex items-center justify-center">
                <span>Creating Account...</span>
                <svg
                  className="animate-spin h-5 w-5 ml-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                  ></path>
                </svg>
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/signIn"
                className="text-green-600 font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📧 After registration, you'll receive a verification email. Please check your inbox and click the verification link to activate your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;