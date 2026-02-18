"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeft, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { userLoginSchema, UserLogin } from "@/lib/validations/auth-schema";
import { z } from "zod";

// Make sure this is the DEFAULT export
const SignInLoginForm = () => {
  const [formData, setFormData] = useState<UserLogin>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  // Add component mount logging
  useEffect(() => {
    console.log("🎯 SignInLoginForm component mounted");
    console.log("📍 Current URL:", window.location.href);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`✏️ Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const checkUserProfile = async (userId: string, token: string): Promise<boolean> => {
    console.log("🔍 Starting profile check for user:", userId);

    try {
      const url = `http://localhost:8080/api/profiles/${userId}`;
      console.log("📡 Fetching profile from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📊 Profile check response status:", response.status);

      if (response.ok) {
        const profileData = await response.json();
        console.log("✅ Profile found:", profileData);
        localStorage.setItem("profile", JSON.stringify(profileData));
        return true;
      }

      console.log("❌ No profile found (status:", response.status, ")");
      return false;
    } catch (error) {
      console.error("❌ Error checking profile:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 ===== FORM SUBMISSION STARTED =====");
    console.log("📝 Form data:", formData);

    setFormErrors({});

    // Validate form
    try {
      console.log("🔍 Validating form data...");
      userLoginSchema.parse(formData);
      console.log("✅ Form validation passed");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("❌ Form validation failed:", error.errors);
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          newErrors[field as string] = err.message;
        });
        setFormErrors(newErrors);

        const errorKeys = Object.keys(newErrors);
        if (errorKeys.length > 0) {
          toast.error(newErrors[errorKeys[0]]);
        }
        return;
      }
    }

    console.log("⏳ Setting loading state to true");
    setIsLoading(true);

    try {
      console.log("📤 Sending login request to backend...");
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📥 Login response received. Status:", response.status);
      const data = await response.json();
      console.log("📦 Login response data:", data);

      if (!response.ok) {
        console.log("❌ Login request failed with status:", response.status);

        if (response.status === 403 && data.message?.includes("verify your email")) {
          console.log("📧 Email verification required");
          toast.error("Please verify your email before logging in.");
          setIsLoading(false);
          setTimeout(() => {
            router.push("/verify-email-pending");
          }, 2000);
          return;
        }

        if (response.status === 429) {
          console.log("⏱️ Rate limit exceeded");
          toast.error(data.message || "Too many login attempts. Please try again later.");
          setIsLoading(false);
          return;
        }

        throw new Error(data.message || "Login failed");
      }

      console.log("✅ Login successful!");
      console.log("💾 Storing authentication data...");

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.id,
        email: data.email,
      }));

      console.log("✅ Token stored:", !!localStorage.getItem("token"));
      console.log("✅ User stored:", localStorage.getItem("user"));

      toast.success("Login successful!");

      // Check if user has a profile
      console.log("🔄 Checking if user has profile...");
      const hasProfile = await checkUserProfile(data.id, data.token);
      console.log("📋 Profile check result:", hasProfile ? "HAS PROFILE" : "NO PROFILE");

      // CRITICAL: Set loading to false BEFORE redirecting
      console.log("⏳ Setting loading state to false");
      setIsLoading(false);

      // Redirect based on profile status
      const targetRoute = hasProfile ? "/dashboard" : "/create-profile";
      console.log("🔀 Redirecting to:", targetRoute);

      setTimeout(() => {
        console.log("🚀 Executing router.replace to:", targetRoute);
        router.replace(targetRoute);
      }, 500);

    } catch (error) {
      console.error("❌ Login error caught:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Login failed. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
      console.log("⏳ Loading state set to false after error");
    }

    console.log("🏁 ===== FORM SUBMISSION ENDED =====");
  };

  console.log("🔄 Component rendering. isLoading:", isLoading);

  if (isLoading) {
    console.log("⏳ Rendering loading spinner");
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
            SIGNING IN<span className="animate-ping">...</span>
          </p>
        </div>
      </div>
    );
  }

  console.log("📄 Rendering login form");

  return (
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-white flex justify-center items-center flex-col relative">
      <Button
        onClick={() => {
          console.log("🔙 Go Back button clicked");
          router.push("/");
        }}
        className="absolute top-4 right-4 bg-transparent text-gray-800 hover:text-zinc-200 hover:bg-green-500"
      >
        <MoveLeft className="mr-2" />
        Go Back
      </Button>

      <Toaster position="top-center" />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your Pithy account
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
              value={formData.email}
              onChange={handleChange}
              className={`text-black w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="you@example.com"
              required
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-green-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`text-black w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => {
                  console.log("👁️ Toggle password visibility");
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            onClick={() => console.log("🖱️ Submit button clicked")}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/signUp"
                className="text-green-600 font-medium hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📧 Haven't verified your email yet?{" "}
            <a href="/verify-email-pending" className="font-medium underline">
              Resend verification email
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInLoginForm;