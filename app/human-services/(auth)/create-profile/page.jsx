"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveLeft, User, Briefcase, Building2, GraduationCap } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ProfileCreationForm = () => {
    const [userId, setUserId] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        bio: "",
        category: "",
        major: "",
        educationLevel: "",
        institutionName: "",
        faculty: "",
        subject: "",
        yearOfGraduation: "",
        companyName: "",
        position: "",
        department: "",
        employmentType: "",
        yearsOfExperience: "",
        businessName: "",
        businessType: "",
        registrationNumber: "",
        industry: "",
    });
    const [formErrors, setFormErrors] = useState({});

    const router = useRouter();

    useEffect(() => {
        // Get user data from localStorage
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!user || !token) {
            toast.error("Please log in first");
            router.push("/signIn");
            return;
        }

        const userData = JSON.parse(user);
        setUserId(userData.id);
    }, [router]);

    const handleChange = (e) => {
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

    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
        setFormData((prev) => ({ ...prev, category: selectedCategory }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim()) errors.lastName = "Last name is required";
        if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
        if (!formData.address.trim()) errors.address = "Address is required";
        if (!category) errors.category = "Please select a category";

        if (category === "STUDENT") {
            if (!formData.major.trim()) errors.major = "Major is required";
            if (!formData.educationLevel) errors.educationLevel = "Education level is required";
            if (!formData.institutionName.trim()) errors.institutionName = "Institution name is required";
        }

        if (category === "EMPLOYEE") {
            if (!formData.companyName.trim()) errors.companyName = "Company name is required";
            if (!formData.position.trim()) errors.position = "Position is required";
        }

        if (category === "OWNER") {
            if (!formData.businessName.trim()) errors.businessName = "Business name is required";
            if (!formData.businessType.trim()) errors.businessType = "Business type is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/profiles/register/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Profile creation failed");
            }

            const data = await response.json();

            // Store the profile data in localStorage
            localStorage.setItem("profile", JSON.stringify(data));

            // Update user data in localStorage to include profile info
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = {
                ...currentUser,
                hasProfile: true,
                profileId: data.id || data.profileId,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast.success("Profile created successfully!");

            // Stop loading state BEFORE redirect
            setIsLoading(false);

            // Use replace instead of push to prevent back navigation issues
            setTimeout(() => {
                router.replace("/dashboard");
            }, 1000);

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Profile creation failed. Please try again.";
            toast.error(errorMessage);
            console.error("Profile creation error:", error);
            setIsLoading(false);
        }
    };

    // Prevent navigation during loading
    useEffect(() => {
        if (isLoading) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = "";
            };
            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [isLoading]);

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
                        CREATING PROFILE<span className="animate-ping">...</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen mx-auto p-4 sm:p-6 bg-gradient-to-br from-green-50 to-white flex justify-center items-center flex-col relative">
            <Button
                onClick={() => router.push("/dashboard")}
                className="absolute top-4 right-4 bg-transparent text-gray-800 hover:text-zinc-200 hover:bg-green-500"
            >
                <MoveLeft className="mr-2" />
                Skip for Now
            </Button>

            <Toaster position="top-center" />

            <div className="w-full max-w-4xl space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-600">
                        Tell us a bit about yourself to get started
                    </p>
                </div>

                {/* Category Selection */}
                {!category && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 text-center">
                            Select Your Category
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleCategorySelect("STUDENT")}
                                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all group"
                            >
                                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-lg">Student</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Currently pursuing education
                                </p>
                            </button>

                            <button
                                onClick={() => handleCategorySelect("EMPLOYEE")}
                                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all group"
                            >
                                <Briefcase className="w-12 h-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-lg">Employee</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Working at a company
                                </p>
                            </button>

                            <button
                                onClick={() => handleCategorySelect("OWNER")}
                                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all group"
                            >
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-lg">Business Owner</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Own or run a business
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Form - Rest of the form remains the same */}
                {category && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        {/* ... All form fields remain the same ... */}

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                            >
                                Skip for Now
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating Profile..." : "Create Profile"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileCreationForm;