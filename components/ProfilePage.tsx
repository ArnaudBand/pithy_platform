"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getProfile, ProfileResponse } from "@/lib/actions/profile.actions";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("Not authenticated.");
          setIsLoading(false);
          return;
        }
        setEmail(user.email);

        const result = await getProfile(user.id);
        if (!result.success || !result.profile) {
          setError(result.message ?? "Could not load profile.");
        } else {
          setProfile(result.profile);
        }
      } catch {
        setError("Something went wrong loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-600 text-lg animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-red-500 text-lg">{error ?? "Profile not found."}</p>
      </div>
    );
  }

  const initials =
    (profile.firstName?.[0] ?? "") + (profile.lastName?.[0] ?? "") || "?";

  return (
    <main className="flex items-center justify-center">
      <div className="w-full bg-white shadow-lg rounded-3xl p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 flex items-center justify-center rounded-full shadow-md bg-green-100 mb-4 text-green-700 text-2xl font-bold">
            {initials.toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-gray-500">{email}</p>
          <span className="mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
            {profile.category}
          </span>
        </div>

        {/* Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-gray-700">
          <InfoCard label="Phone" value={profile.phoneNumber || "Not specified"} />
          <InfoCard label="Address" value={profile.address || "Not specified"} />
          {profile.bio && (
            <div className="md:col-span-2 p-4 border rounded-lg shadow-sm bg-gray-50">
              <p className="font-semibold text-gray-600">Bio</p>
              <p className="text-gray-800 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Category-specific details */}
        <div className="mt-8">
          {profile.category === "STUDENT" && profile.student && (
            <CategoryInfo
              title="Student Details"
              data={{
                "Education Level": profile.student.educationLevel,
                "Institution": profile.student.institutionName,
                "Faculty": profile.student.faculty,
                "Major / Subject": profile.student.major ?? profile.student.subject,
                "Graduation Year": profile.student.yearOfGraduation,
              }}
            />
          )}

          {profile.category === "EMPLOYEE" && profile.employee && (
            <CategoryInfo
              title="Employee Details"
              data={{
                "Company": profile.employee.companyName,
                "Position": profile.employee.position,
                "Department": profile.employee.department,
                "Employment Type": profile.employee.employmentType,
                "Years of Experience": profile.employee.yearsOfExperience,
              }}
            />
          )}

          {profile.category === "OWNER" && profile.owner && (
            <CategoryInfo
              title="Business Details"
              data={{
                "Business Name": profile.owner.businessName,
                "Business Type": profile.owner.businessType,
                "Registration No.": profile.owner.registrationNumber,
                "Industry": profile.owner.industry,
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
    <p className="font-semibold text-gray-600">{label}</p>
    <p className="text-gray-800">{value}</p>
  </div>
);

const CategoryInfo = ({
  title,
  data,
}: {
  title: string;
  data: Record<string, string | undefined>;
}) => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <p className="font-semibold text-gray-600">{key}</p>
          <p className="text-gray-800">{value || "Not specified"}</p>
        </div>
      ))}
    </div>
  </div>
);
