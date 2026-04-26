"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getProfile,
  updateProfile,
  ProfileRequest,
  ProfileResponse,
  UserCategory,
} from "@/lib/actions/profile.actions";
import { changePassword } from "@/lib/actions/auth.actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileFormData = Partial<ProfileRequest>;

interface PasswordFields {
  currentPassword: string;
  newPassword: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profileCategory, setProfileCategory] = useState<UserCategory | null>(null); // locked — never changes
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [passwordFields, setPasswordFields] = useState<PasswordFields>({
    currentPassword: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Fetch current profile on mount ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          toast.error("Not authenticated.");
          setIsLoading(false);
          return;
        }
        setUserId(user.id);

        const result = await getProfile(user.id);
        if (result.success && result.profile) {
          const p: ProfileResponse = result.profile;

          // Lock the category — the backend does not support changing it
          setProfileCategory(p.category);

          // Flatten the nested profile into a single ProfileRequest-shaped object
          setFormData({
            firstName: p.firstName,
            lastName: p.lastName,
            phoneNumber: p.phoneNumber,
            address: p.address,
            bio: p.bio ?? "",
            category: p.category,
            // STUDENT
            major: p.student?.major ?? "",
            educationLevel: p.student?.educationLevel ?? "",
            institutionName: p.student?.institutionName ?? "",
            faculty: p.student?.faculty ?? "",
            subject: p.student?.subject ?? "",
            yearOfGraduation: p.student?.yearOfGraduation ?? "",
            // EMPLOYEE
            companyName: p.employee?.companyName ?? "",
            position: p.employee?.position ?? "",
            department: p.employee?.department ?? "",
            employmentType: p.employee?.employmentType ?? "",
            yearsOfExperience: p.employee?.yearsOfExperience ?? "",
            // OWNER
            businessName: p.owner?.businessName ?? "",
            businessType: p.owner?.businessType ?? "",
            registrationNumber: p.owner?.registrationNumber ?? "",
            industry: p.owner?.industry ?? "",
          });
        } else {
          toast.error(result.message ?? "Could not load profile.");
        }
      } catch {
        toast.error("Something went wrong loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // ── Validate required fields before hitting the API ───────────────────────
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      toast.error("First name and last name are required.");
      return;
    }
    if (!formData.phoneNumber?.trim() || !formData.address?.trim()) {
      toast.error("Phone number and address are required.");
      return;
    }
    // Use profileCategory (from DB) — NOT formData.category — as the source of truth
    const category = profileCategory;
    if (!category) {
      toast.error("Profile category is missing. Please refresh the page.");
      return;
    }
    if (category === "STUDENT" && !formData.educationLevel) {
      toast.error("Please select an education level.");
      return;
    }

    // Build the payload — always send the stored category so the backend is consistent
    const payload: Partial<ProfileRequest> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      bio: formData.bio,
      category,
    };

    if (category === "STUDENT") {
      payload.major = formData.major;
      payload.educationLevel = formData.educationLevel;
      payload.institutionName = formData.institutionName;
      payload.faculty = formData.faculty;
      payload.subject = formData.subject;
      payload.yearOfGraduation = formData.yearOfGraduation;
    } else if (category === "EMPLOYEE") {
      payload.companyName = formData.companyName;
      payload.position = formData.position;
      payload.department = formData.department;
      payload.employmentType = formData.employmentType;
      payload.yearsOfExperience = formData.yearsOfExperience;
    } else if (category === "OWNER") {
      payload.businessName = formData.businessName;
      payload.businessType = formData.businessType;
      payload.registrationNumber = formData.registrationNumber;
      payload.industry = formData.industry;
    }

    // Debug: log what's being sent (remove after confirming fix)
    console.log("[EditProfilePage] Submitting payload:", JSON.stringify(payload, null, 2));

    setIsSaving(true);
    try {
      const result = await updateProfile(userId, payload);
      if (result.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.message ?? "Failed to update profile.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!passwordFields.currentPassword || !passwordFields.newPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const result = await changePassword(
        userId,
        passwordFields.currentPassword,
        passwordFields.newPassword
      );
      if (result.success) {
        toast.success("Password updated successfully!");
        setPasswordFields({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(result.message ?? "Failed to update password.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-600 text-lg animate-pulse">Loading…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="h-[70vh] overflow-auto rounded-md shadow-md bg-gray-100">
      <Toaster
        position="top-center"
        toastOptions={{
          success: { style: { background: "#10B981", color: "white" }, duration: 3000 },
          error: { style: { background: "#EF4444", color: "white" }, duration: 4000 },
        }}
      />

      <main className="flex items-center justify-center py-4">
        <div className="w-full max-w-4xl bg-white rounded-lg p-6 space-y-10">
          <h1 className="text-2xl font-bold text-center">Edit Your Profile</h1>

          {/* ── Profile form ──────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName ?? ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </Field>

                <Field label="Last Name">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName ?? ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </Field>

                <Field label="Phone Number">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber ?? ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </Field>

                <Field label="Address">
                  <input
                    type="text"
                    name="address"
                    value={formData.address ?? ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Bio (optional)">
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg resize-none"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Category — read-only after profile creation */}
            <section>
              <h2 className="text-xl font-semibold mb-4">User Category</h2>
              <Field label="Category">
                <div className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700 flex items-center justify-between">
                  <span>
                    {formData.category === "STUDENT" && "Student"}
                    {formData.category === "EMPLOYEE" && "Employee"}
                    {formData.category === "OWNER" && "Business Owner"}
                  </span>
                  <span className="text-xs text-gray-500 italic">
                    Category cannot be changed after creation
                  </span>
                </div>
              </Field>
            </section>

            {/* STUDENT fields */}
            {formData.category === "STUDENT" && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Student Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Education Level">
                    <select
                      name="educationLevel"
                      value={formData.educationLevel ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select Education Level</option>
                      <option value="HIGH_SCHOOL">High School</option>
                      <option value="UNDERGRADUATE">Diploma</option>
                      <option value="BACHELORS">Bachelor's</option>
                      <option value="MASTERS">Master's</option>
                      <option value="DOCTORATE">PhD</option>
                    </select>
                  </Field>

                  <Field label="Institution Name">
                    <input
                      type="text"
                      name="institutionName"
                      value={formData.institutionName ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Faculty">
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Major / Subject">
                    <input
                      type="text"
                      name="major"
                      value={formData.major ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Graduation Year">
                    <input
                      type="text"
                      name="yearOfGraduation"
                      value={formData.yearOfGraduation ?? ""}
                      onChange={handleChange}
                      placeholder="e.g. 2026"
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>
                </div>
              </section>
            )}

            {/* EMPLOYEE fields */}
            {formData.category === "EMPLOYEE" && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Employee Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Name">
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Position">
                    <input
                      type="text"
                      name="position"
                      value={formData.position ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Department">
                    <input
                      type="text"
                      name="department"
                      value={formData.department ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Employment Type">
                    <select
                      name="employmentType"
                      value={formData.employmentType ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </Field>

                  <Field label="Years of Experience">
                    <input
                      type="text"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience ?? ""}
                      onChange={handleChange}
                      placeholder="e.g. 3"
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>
                </div>
              </section>
            )}

            {/* OWNER fields */}
            {formData.category === "OWNER" && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Business Name">
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Business Type">
                    <input
                      type="text"
                      name="businessType"
                      value={formData.businessType ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Registration Number">
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>

                  <Field label="Industry">
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry ?? ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                    />
                  </Field>
                </div>
              </section>
            )}

            <div className="flex justify-center pt-2 pb-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-[#5AC35A] to-[#00AE76] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>

          {/* ── Password change form ───────────────────────────────────────────── */}
          <section className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <Field label="Current Password">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordFields.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                  autoComplete="current-password"
                />
              </Field>

              <Field label="New Password">
                <input
                  type="password"
                  name="newPassword"
                  value={passwordFields.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded-lg"
                  autoComplete="new-password"
                />
              </Field>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChangingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
