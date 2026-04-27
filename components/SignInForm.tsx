"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { MoveLeft, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { userLoginSchema, UserLogin } from "@/lib/validations/auth-schema";
import { z } from "zod";
import { login } from "@/lib/actions/auth.actions";

const SignInLoginForm = () => {
  const [formData, setFormData] = useState<UserLogin>({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side validation first
    try {
      userLoginSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => { errors[String(e.path[0])] = e.message; });
        setFormErrors(errors);
        toast.error(Object.values(errors)[0]);
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        const msg = result.message ?? "Login failed";

        // Backend surfaces "verify your email" for unverified accounts
        if (msg.toLowerCase().includes("verify your email")) {
          toast.error("Please verify your email before signing in.");
          setTimeout(() => {
            router.push(`/verify-email-pending?email=${encodeURIComponent(formData.email)}`);
          }, 1800);
          return;
        }

        toast.error(msg);
        return;
      }

      toast.success("Welcome back!");

      const { role } = result.user!;

      // Admins skip the profile check and go straight to the admin panel.
      if (role === "ADMIN") {
        window.location.href = "/human-services/admin";
        return;
      }

      // profileExists was resolved inside the login() server action so the
      // cookie was already available — no separate request needed here.
      if (!result.profileExists) {
        // Store userId in sessionStorage so create-profile can read it reliably
        // even if useSearchParams() doesn't catch the URL param in time.
        sessionStorage.setItem("pithy_pending_user_id", result.user!.id);
        router.replace(`/human-services/create-profile?userId=${result.user!.id}`);
      } else {
        window.location.href = "/human-services/dashboard";
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white backdrop-blur-sm z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full filter blur-md animate-pulse" />
          <div className="relative z-10 w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-green-400 border-r-transparent border-b-green-200 border-l-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-t-transparent border-r-green-400 border-b-transparent border-l-green-200 rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-t-green-200 border-r-transparent border-b-green-400 border-l-transparent rounded-full animate-spin animation-delay-150" />
          </div>
          <p className="mt-8 text-green-400 font-medium tracking-wider animate-pulse text-center">
            SIGNING IN<span className="animate-ping">...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-white flex justify-center items-center flex-col relative">
      <Button
        onClick={() => router.push("/human-services/signIn")}
        className="absolute top-4 right-4 bg-transparent text-gray-800 hover:text-zinc-200 hover:bg-green-500"
      >
        <MoveLeft className="mr-2" />
        Go Back
      </Button>

      <Toaster position="top-center" />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Pithy account</p>
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
              className={`text-black w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                formErrors.email ? "border-red-500" : "border-gray-300"
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
              <a href="/forgot-password" className="text-xs text-green-600 hover:underline">
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
                className={`text-black w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/human-services/signUp" className="text-green-600 font-medium hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📧 Haven't verified your email yet?{" "}
            <a href="/human-services/verify-email-pending" className="font-medium underline">
              Resend verification email
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInLoginForm;
