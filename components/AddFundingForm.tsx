"use client";

import React, { useState, useEffect } from "react";
import {
  createFunding,
  getFunding,
  updateFunding,
  deleteFunding,
  getFundings,
} from "@/lib/actions/user.actions";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Funding, UserInfo } from "@/types/schema";
import toast, { Toaster } from "react-hot-toast";

const FundingForm = ({ editingId = "" }) => {
  // Access the user context to get user information
  const { user } = useAuthStore((state) => state as unknown as UserInfo);
  const [fundings, setFundings] = useState<Funding[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);

  // Admin controls state
  const [isAdmin] = useState(true); // You can replace this with actual admin check
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Dynamic options state
  const [focusAreas, setFocusAreas] = useState([
    "health",
    "education", 
    "environment",
    "technology",
    "other"
  ]);
  const [fundingTypes, setFundingTypes] = useState([
    "fund",
    "donation",
    "grant", 
    "scholarship",
    "fellowship",
    "award",
    "other"
  ]);

  // New option inputs
  const [newFocusArea, setNewFocusArea] = useState("");
  const [newFundingType, setNewFundingType] = useState("");
  
  // Form-level custom option inputs
  const [customFocusArea, setCustomFocusArea] = useState("");
  const [customFundingType, setCustomFundingType] = useState("");
  const [showCustomFocusInput, setShowCustomFocusInput] = useState(false);
  const [showCustomFundingInput, setShowCustomFundingInput] = useState(false);

  // Initialize the form with the user_id populated from the context
  const [formData, setFormData] = useState<Funding>({
    funding_id: "",
    user_id: user ? user?.user_id : "",
    title: "",
    donor: "",
    eligibre_countries: "",
    focus_earlier: [],
    grant_size: "",
    funding_type: [],
    closing_date: new Date().toISOString().split("T")[0],
    reference_link: "",
  });

  // Fetch all fundings on component mount
  useEffect(() => {
    loadFundings();
  }, []);

  // If editing ID is provided, load that funding
  useEffect(() => {
    if (!user) return;
    if (editingId) {
      loadFundingDetails(editingId);
      setShowForm(true);
    }
  }, [editingId, user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
        <p className="text-gray-700 text-lg">
          Please log in to create or manage funding.
        </p>
      </div>
    );
  }

  const loadFundings = async () => {
    setIsLoading(true);
    try {
      const result = await getFundings();
      if (result && Array.isArray(result.documents)) {
        toast.success("Fundings loaded successfully");
        setFundings(result.documents);
      }
    } catch (error) {
      console.error("Error loading fundings:", error);
      setMessage({ text: "Failed to load fundings", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFundingDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await getFunding(id);
      if (result) {
        setFormData({
          ...result,
          closing_date: result.closing_date
            ? result.closing_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          focus_earlier: Array.isArray(result.focus_earlier) 
            ? result.focus_earlier 
            : result.focus_earlier ? [result.focus_earlier] : [],
          funding_type: Array.isArray(result.funding_type)
            ? result.funding_type
            : result.funding_type ? [result.funding_type] : [],
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading funding details:", error);
      setMessage({ text: "Failed to load funding details", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState: Funding) => ({
      ...prevState,
      [name]:
        name === "closing_date"
          ? new Date(value).toISOString().split("T")[0]
          : value,
    }));
  };

  // Handle checkbox changes for multi-select fields
  const handleCheckboxChange = (
    fieldName: 'focus_earlier' | 'funding_type',
    value: string
  ) => {
    setFormData(prevState => {
      const currentArray = Array.isArray(prevState[fieldName]) 
        ? prevState[fieldName] as string[]
        : [];
      
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prevState,
        [fieldName]: updatedArray
      };
    });
  };

  // Admin functions to add new options
  const addFocusArea = () => {
    if (newFocusArea.trim() && !focusAreas.includes(newFocusArea.toLowerCase().trim())) {
      setFocusAreas([...focusAreas, newFocusArea.toLowerCase().trim()]);
      setNewFocusArea("");
      toast.success("Focus area added successfully!");
    } else {
      toast.error("Focus area already exists or is empty!");
    }
  };

  const addFundingType = () => {
    if (newFundingType.trim() && !fundingTypes.includes(newFundingType.toLowerCase().trim())) {
      setFundingTypes([...fundingTypes, newFundingType.toLowerCase().trim()]);
      setNewFundingType("");
      toast.success("Funding type added successfully!");
    } else {
      toast.error("Funding type already exists or is empty!");
    }
  };

  // Remove options (admin only)
  const removeFocusArea = (area: string) => {
    setFocusAreas(focusAreas.filter(item => item !== area));
    // Also remove from any selected items
    setFormData(prev => ({
      ...prev,
      focus_earlier: (prev.focus_earlier as string[]).filter(item => item !== area)
    }));
    toast.success("Focus area removed!");
  };

  const removeFundingType = (type: string) => {
    setFundingTypes(fundingTypes.filter(item => item !== type));
    // Also remove from any selected items
    setFormData(prev => ({
      ...prev,
      funding_type: (prev.funding_type as string[]).filter(item => item !== type)
    }));
    toast.success("Funding type removed!");
  };

  // Add custom option from form
  const addCustomFocusArea = () => {
    if (customFocusArea.trim() && !focusAreas.includes(customFocusArea.toLowerCase().trim())) {
      const newArea = customFocusArea.toLowerCase().trim();
      setFocusAreas([...focusAreas, newArea]);
      
      // Automatically select the new option
      setFormData(prev => ({
        ...prev,
        focus_earlier: [...(prev.focus_earlier as string[]), newArea]
      }));
      
      setCustomFocusArea("");
      setShowCustomFocusInput(false);
      toast.success("Custom focus area added and selected!");
    } else {
      toast.error("Focus area already exists or is empty!");
    }
  };

  const addCustomFundingType = () => {
    if (customFundingType.trim() && !fundingTypes.includes(customFundingType.toLowerCase().trim())) {
      const newType = customFundingType.toLowerCase().trim();
      setFundingTypes([...fundingTypes, newType]);
      
      // Automatically select the new option
      setFormData(prev => ({
        ...prev,
        funding_type: [...(prev.funding_type as string[]), newType]
      }));
      
      setCustomFundingType("");
      setShowCustomFundingInput(false);
      toast.success("Custom funding type added and selected!");
    } else {
      toast.error("Funding type already exists or is empty!");
    }
  };

  const resetForm = () => {
    setFormData({
      funding_id: "",
      user_id: user ? user?.user_id : "",
      title: "",
      donor: "",
      eligibre_countries: "",
      focus_earlier: [],
      grant_size: "",
      funding_type: [],
      closing_date: new Date().toISOString().split("T")[0],
      reference_link: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let result: Funding;
      if (isEditing) {
        // Update existing funding
        result = await updateFunding(formData.funding_id, formData);
        setMessage({ text: "Funding updated successfully!", type: "success" });
        // Update the funding in the local state
        setFundings((prevFundings) =>
          prevFundings.map((item) =>
            item.funding_id === formData.funding_id ? { ...formData } : item
          )
        );
      } else {
        // Create new funding
        result = await createFunding(formData);
        setMessage({ text: "Funding created successfully!", type: "success" });
        // Add the new funding to the local state immediately
        if (result) {
          setFundings((prevFundings) => [...prevFundings, result]);
        }
      }
      // Reset form and hide it after successful submission
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(
        isEditing ? "Error updating funding:" : "Error creating funding:",
        error
      );
      setMessage({
        text: isEditing ? "Error updating funding" : "Error creating funding",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fundingId: string) => {
    if (!window.confirm("Are you sure you want to delete this funding?")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteFunding(fundingId);
      setMessage({ text: "Funding deleted successfully!", type: "success" });
      // Remove the deleted funding from the local state immediately
      setFundings((prevFundings) =>
        prevFundings.filter((item) => item.funding_id !== fundingId)
      );
      // Reset form if we're editing the deleted funding
      if (isEditing && formData.funding_id === fundingId) {
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error deleting funding:", error);
      setMessage({ text: "Error deleting funding", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (funding: Funding) => {
    setFormData({
      ...funding,
      closing_date: funding.closing_date
        ? funding.closing_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      focus_earlier: Array.isArray(funding.focus_earlier) 
        ? funding.focus_earlier 
        : funding.focus_earlier ? [funding.focus_earlier] : [],
      funding_type: Array.isArray(funding.funding_type)
        ? funding.funding_type
        : funding.funding_type ? [funding.funding_type] : [],
    });
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 p-4 w-full bg-white">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Admin Panel */}
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Admin Panel</span>
          </button>

          {showAdminPanel && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Options</h3>
              
              {/* Focus Areas Management */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Focus Areas</h4>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newFocusArea}
                    onChange={(e) => setNewFocusArea(e.target.value)}
                    placeholder="Add new focus area"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={addFocusArea}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <div key={area} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <span className="capitalize">{area}</span>
                      <button
                        onClick={() => removeFocusArea(area)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funding Types Management */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Funding Types</h4>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newFundingType}
                    onChange={(e) => setNewFundingType(e.target.value)}
                    placeholder="Add new funding type"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={addFundingType}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fundingTypes.map((type) => (
                    <div key={type} className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      <span className="capitalize">{type}</span>
                      <button
                        onClick={() => removeFundingType(type)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-3 rounded-md shadow-md ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Call to Action when form is hidden */}
      {!showForm ? (
        <div className="flex flex-col items-center justify-center p-8 my-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Funding Opportunities
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Unlock new possibilities for your projects by exploring and managing
            funding opportunities. Add new funding sources, track applications,
            and stay organized in one place.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="py-3 px-6 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-all duration-300 shadow-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Funding
          </button>
        </div>
      ) : (
        /* Form Section */
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 rounded-lg bg-white border border-gray-200 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-700">
              {isEditing ? "Edit Funding" : "Create Funding"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div className="form-group">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Donor Name */}
          <div className="form-group">
            <label
              htmlFor="donor"
              className="block text-sm font-medium text-gray-700"
            >
              Donor Name
            </label>
            <input
              type="text"
              id="donor"
              name="donor"
              value={formData.donor || ""}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Eligible Countries */}
          <div className="form-group">
            <label
              htmlFor="eligibre_countries"
              className="block text-sm font-medium text-gray-700"
            >
              Eligible Countries
            </label>
            <input
              type="text"
              id="eligibre_countries"
              name="eligibre_countries"
              value={formData.eligibre_countries || ""}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Grid for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Focus Area - Now with checkboxes */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas (Select multiple)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {focusAreas.map((area) => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.focus_earlier as string[])?.includes(area) || false}
                      onChange={() => handleCheckboxChange('focus_earlier', area)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm capitalize text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
              
              {/* Add custom focus area option */}
              <div className="mt-2">
                {!showCustomFocusInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomFocusInput(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    + Add custom focus area
                  </button>
                ) : (
                  <div className="flex space-x-2 mt-2">
                    <input
                      type="text"
                      value={customFocusArea}
                      onChange={(e) => setCustomFocusArea(e.target.value)}
                      placeholder="Enter custom focus area"
                      className="flex-1 text-sm p-2 border border-gray-300 rounded-md"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomFocusArea();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomFocusArea}
                      className="px-2 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomFocusInput(false);
                        setCustomFocusArea("");
                      }}
                      className="px-2 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Grant Size */}
            <div className="form-group">
              <label
                htmlFor="grant_size"
                className="block text-sm font-medium text-gray-700"
              >
                Grant Size
              </label>
              <select
                name="grant_size"
                id="grant_size"
                onChange={handleChange}
                value={formData.grant_size || ""}
                className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">Select Grant Size</option>
                <option value="Up to $1000">Up to $1000</option>
                <option value="$1000 - $10000">$1000 - $10000</option>
                <option value="$10000 - $100000">$10000 - $100000</option>
                <option value="More than $100000">More than $100000</option>
              </select>
            </div>

            {/* Funding Type - Now with checkboxes */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Types (Select multiple)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {fundingTypes.map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.funding_type as string[])?.includes(type) || false}
                      onChange={() => handleCheckboxChange('funding_type', type)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm capitalize text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
              
              {/* Add custom funding type option */}
              <div className="mt-2">
                {!showCustomFundingInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomFundingInput(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    + Add custom funding type
                  </button>
                ) : (
                  <div className="flex space-x-2 mt-2">
                    <input
                      type="text"
                      value={customFundingType}
                      onChange={(e) => setCustomFundingType(e.target.value)}
                      placeholder="Enter custom funding type"
                      className="flex-1 text-sm p-2 border border-gray-300 rounded-md"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomFundingType();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomFundingType}
                      className="px-2 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomFundingInput(false);
                        setCustomFundingType("");
                      }}
                      className="px-2 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Closing Date */}
            <div className="form-group">
              <label
                htmlFor="closing_date"
                className="block text-sm font-medium text-gray-700"
              >
                Closing Date
              </label>
              <input
                type="date"
                id="closing_date"
                name="closing_date"
                value={
                  formData.closing_date
                    ? formData.closing_date.split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Reference Link */}
          <div className="form-group">
            <label
              htmlFor="reference_link"
              className="block text-sm font-medium text-gray-700"
            >
              Reference Link
            </label>
            <input
              type="url"
              id="reference_link"
              name="reference_link"
              value={formData.reference_link || ""}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Form Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className={`py-2 px-4 rounded-md ${
                isEditing ? "bg-blue-500" : "bg-green-600"
              } text-white hover:bg-opacity-90 transition-all`}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isEditing
                  ? "Update Funding"
                  : "Submit Funding"}
            </button>

            {isEditing && (
              <button
                type="button"
                className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-opacity-90 transition-all"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Fundings List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Your Fundings
        </h2>
        {isLoading && (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {!isLoading && fundings.length === 0 && (
          <p className="text-gray-600">
            No fundings found. Create your first one using the button above!
          </p>
        )}

        {!isLoading && fundings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundings.map((funding) => (
              <div
                key={funding.funding_id}
                className="p-6 rounded-lg bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {funding.title}
                </h3>
                <div className="my-3 flex flex-wrap gap-1">
                  {Array.isArray(funding.funding_type) 
                    ? funding.funding_type.map((type) => (
                        <span key={type} className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full capitalize">
                          {type}
                        </span>
                      ))
                    : funding.funding_type && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full capitalize">
                          {funding.funding_type}
                        </span>
                      )
                  }
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Donor: {funding.donor}
                </p>
                <p className="text-sm text-gray-600">
                  Grant Size: {funding.grant_size}
                </p>
                <p className="text-sm text-gray-600">
                  Focus Areas: {Array.isArray(funding.focus_earlier) 
                    ? funding.focus_earlier.join(", ")
                    : funding.focus_earlier || "N/A"
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Closing Date:{" "}
                  {funding.closing_date
                    ? new Date(funding.closing_date).toLocaleDateString()
                    : "N/A"}
                </p>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(funding)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(funding.funding_id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingForm;