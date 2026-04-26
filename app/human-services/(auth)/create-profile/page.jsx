"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveLeft, Briefcase, Building2, GraduationCap } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// ─── Shared input / label styles ────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const sectionHeadingCls = "text-lg font-semibold text-gray-800 border-b pb-2 mb-4";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
  bio: "",
  category: "",
  // STUDENT
  major: "",
  educationLevel: "",
  institutionName: "",
  faculty: "",
  subject: "",
  yearOfGraduation: "",
  // EMPLOYEE
  companyName: "",
  position: "",
  department: "",
  employmentType: "",
  yearsOfExperience: "",
  // OWNER
  businessName: "",
  businessType: "",
  registrationNumber: "",
  industry: "",
};

// ─── Inner component — must be inside <Suspense> so useSearchParams() works ──
function ProfileCreationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(null);
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Resolve the userId using three layers (most → least reliable):
  //  1. sessionStorage  — set by SignInForm before router.replace(), always reliable
  //  2. URL ?userId=    — works when useSearchParams() resolves in time
  //  3. getCurrentUser() — fallback for direct navigation (not via login flow)
  useEffect(() => {
    // Layer 1: sessionStorage (most reliable — set synchronously before navigation)
    const stored = sessionStorage.getItem("pithy_pending_user_id");
    if (stored) {
      sessionStorage.removeItem("pithy_pending_user_id");
      setUserId(stored);
      setIsAuthChecking(false);
      return;
    }

    // Layer 2: URL param (works when Suspense + useSearchParams resolves correctly)
    const urlUserId = searchParams.get("userId");
    if (urlUserId) {
      setUserId(urlUserId);
      setIsAuthChecking(false);
      return;
    }

    // Layer 3: Direct navigation — verify auth via cookie (with one retry)
    const tryGetUser = (retries) => {
      getCurrentUser().then((user) => {
        if (user) {
          setUserId(user.id);
          setIsAuthChecking(false);
        } else if (retries > 0) {
          // Cookie might not be committed yet — retry once after a short wait
          setTimeout(() => tryGetUser(retries - 1), 600);
        } else {
          toast.error("Please log in first.");
          router.replace("/human-services/signIn");
        }
      });
    };
    tryGetUser(1);
  }, [router, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleCategorySelect = (selected) => {
    setCategory(selected);
    setFormData((prev) => ({ ...prev, category: selected }));
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim())  e.firstName  = "First name is required";
    if (!formData.lastName.trim())   e.lastName   = "Last name is required";
    if (!formData.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    if (!formData.address.trim())    e.address    = "Address is required";

    if (category === "STUDENT") {
      if (!formData.major.trim())          e.major          = "Major is required";
      if (!formData.educationLevel)        e.educationLevel = "Education level is required";
      if (!formData.institutionName.trim()) e.institutionName = "Institution name is required";
    }
    if (category === "EMPLOYEE") {
      if (!formData.companyName.trim()) e.companyName = "Company name is required";
      if (!formData.position.trim())    e.position    = "Position is required";
    }
    if (category === "OWNER") {
      if (!formData.businessName.trim()) e.businessName = "Business name is required";
      if (!formData.businessType.trim()) e.businessType = "Business type is required";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      // Use the Next.js Route Handler instead of a server action.
      // Route Handlers receive the browser's real HTTP request, so `cookies()`
      // inside the handler reliably sees the httpOnly JWT token.
      const response = await fetch(`/api/profiles/register/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || result.error || "Profile creation failed.");
        return;
      }

      toast.success("Profile created successfully!");
      setTimeout(() => router.replace("/human-services/dashboard"), 1000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading states ─────────────────────────────────────────────────────────
  if (isAuthChecking) return null;

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
            CREATING PROFILE<span className="animate-ping">...</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-gradient-to-br from-green-50 to-white flex justify-center items-start flex-col relative">
      <Button
        onClick={() => router.push("/human-services/dashboard")}
        className="absolute top-4 right-4 bg-transparent text-gray-800 hover:text-zinc-200 hover:bg-green-500"
      >
        <MoveLeft className="mr-2" />
        Skip for Now
      </Button>

      <Toaster position="top-center" />

      <div className="w-full max-w-4xl mx-auto space-y-6 pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself to get started</p>
        </div>

        {/* ── Step 1: Category selection ───────────────────────────────── */}
        {!category && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              What best describes you?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "STUDENT",  Icon: GraduationCap, title: "Student",        desc: "Currently pursuing education" },
                { value: "EMPLOYEE", Icon: Briefcase,     title: "Employee",       desc: "Working at a company" },
                { value: "OWNER",    Icon: Building2,     title: "Business Owner", desc: "Own or run a business" },
              ].map(({ value, Icon, title, desc }) => (
                <button
                  key={value}
                  onClick={() => handleCategorySelect(value)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all group text-center"
                >
                  <Icon className="w-12 h-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Profile form ─────────────────────────────────────── */}
        {category && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-8">

            {/* Change category link */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="text-sm font-medium text-green-700 capitalize">
                {category.charAt(0) + category.slice(1).toLowerCase()}
              </span>
              <button
                type="button"
                onClick={() => { setCategory(""); setFormData(EMPTY_FORM); setErrors({}); }}
                className="text-xs text-gray-400 hover:text-green-600 underline ml-1"
              >
                Change
              </button>
            </div>

            {/* ── Common fields ────────────────────────────────────────── */}
            <section>
              <h3 className={sectionHeadingCls}>Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputCls} placeholder="John" />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputCls} placeholder="Doe" />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputCls} placeholder="+1 234 567 8900" />
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                </div>
                <div>
                  <label className={labelCls}>Address <span className="text-red-500">*</span></label>
                  <input name="address" value={formData.address} onChange={handleChange} className={inputCls} placeholder="123 Main St, City, Country" />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Bio <span className="text-gray-400 text-xs">(optional)</span></label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>
            </section>

            {/* ── STUDENT fields ───────────────────────────────────────── */}
            {category === "STUDENT" && (
              <section>
                <h3 className={sectionHeadingCls}>Education Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Institution Name <span className="text-red-500">*</span></label>
                    <input name="institutionName" value={formData.institutionName} onChange={handleChange} className={inputCls} placeholder="University of ..." />
                    {errors.institutionName && <p className="mt-1 text-xs text-red-500">{errors.institutionName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Education Level <span className="text-red-500">*</span></label>
                    <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={inputCls}>
                      <option value="">Select level</option>
                      <option value="HIGH_SCHOOL">High School</option>
                      <option value="UNDERGRADUATE">Undergraduate</option>
                      <option value="BACHELORS">Bachelor's Degree</option>
                      <option value="MASTERS">Master's Degree</option>
                      <option value="DOCTORATE">Doctorate / PhD</option>
                    </select>
                    {errors.educationLevel && <p className="mt-1 text-xs text-red-500">{errors.educationLevel}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Major / Field of Study <span className="text-red-500">*</span></label>
                    <input name="major" value={formData.major} onChange={handleChange} className={inputCls} placeholder="Computer Science" />
                    {errors.major && <p className="mt-1 text-xs text-red-500">{errors.major}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Faculty</label>
                    <input name="faculty" value={formData.faculty} onChange={handleChange} className={inputCls} placeholder="Faculty of Engineering" />
                  </div>
                  <div>
                    <label className={labelCls}>Subject</label>
                    <input name="subject" value={formData.subject} onChange={handleChange} className={inputCls} placeholder="Software Engineering" />
                  </div>
                  <div>
                    <label className={labelCls}>Expected Graduation Year</label>
                    <input name="yearOfGraduation" value={formData.yearOfGraduation} onChange={handleChange} className={inputCls} placeholder="2026" />
                  </div>
                </div>
              </section>
            )}

            {/* ── EMPLOYEE fields ──────────────────────────────────────── */}
            {category === "EMPLOYEE" && (
              <section>
                <h3 className={sectionHeadingCls}>Employment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Company Name <span className="text-red-500">*</span></label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} className={inputCls} placeholder="Acme Corp" />
                    {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Position / Job Title <span className="text-red-500">*</span></label>
                    <input name="position" value={formData.position} onChange={handleChange} className={inputCls} placeholder="Software Engineer" />
                    {errors.position && <p className="mt-1 text-xs text-red-500">{errors.position}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Department</label>
                    <input name="department" value={formData.department} onChange={handleChange} className={inputCls} placeholder="Engineering" />
                  </div>
                  <div>
                    <label className={labelCls}>Employment Type</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputCls}>
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Years of Experience</label>
                    <input name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className={inputCls} placeholder="3" />
                  </div>
                </div>
              </section>
            )}

            {/* ── OWNER fields ─────────────────────────────────────────── */}
            {category === "OWNER" && (
              <section>
                <h3 className={sectionHeadingCls}>Business Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Business Name <span className="text-red-500">*</span></label>
                    <input name="businessName" value={formData.businessName} onChange={handleChange} className={inputCls} placeholder="My Business LLC" />
                    {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Business Type <span className="text-red-500">*</span></label>
                    <input name="businessType" value={formData.businessType} onChange={handleChange} className={inputCls} placeholder="Retail / SaaS / Consulting ..." />
                    {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Registration Number</label>
                    <input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={inputCls} placeholder="RC-123456" />
                  </div>
                  <div>
                    <label className={labelCls}>Industry</label>
                    <input name="industry" value={formData.industry} onChange={handleChange} className={inputCls} placeholder="Technology / Finance / Health ..." />
                  </div>
                </div>
              </section>
            )}

            {/* ── Actions ──────────────────────────────────────────────── */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push("/human-services/dashboard")}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Page export — wraps the form in Suspense so useSearchParams() works ─────
// Next.js App Router requires any component using useSearchParams() to be
// inside a <Suspense> boundary. Without it the hook returns null on the
// initial render, causing the userId URL param to be missed and falling back
// to getCurrentUser() which has a cookie-timing race on fresh logins.
export default function CreateProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileCreationForm />
    </Suspense>
  );
}
