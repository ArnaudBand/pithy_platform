"use client";

import { useCallback, useEffect, useState } from "react";
import { Modules } from "@/types/schema";
import toast, { Toaster } from "react-hot-toast";
import { useVideoProgressStore } from "@/lib/store/useVideoProgressStore";

// Extracted Components
import ModuleTabs from "./ModuleTabs";
import ModuleSidebar from "./ModuleSidebar";
import LoadingSpinner from "./LoadingSpinner";
import QuestionModal from "./QuestionModal";
import VideoPlayer from "./VideoPlayer";

export default function ModulesPage() {
  const [modules, setModules] = useState<Modules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"summary" | "question">("summary");
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Get the store methods
  const { getProgress } = useVideoProgressStore();

  const totalModules = modules.length;
  const progressPercentage =
    totalModules > 0 ? ((activeModuleIndex + 1) / totalModules) * 100 : 0;

  const fetchModules = useCallback(async () => {
    try {
      const response = await fetch(`/api/get-modules`, { method: "GET" });
      if (!response.ok) {
        toast.error("Error fetching modules, please try again later.");
        throw new Error("Failed to fetch modules");
      }
      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        toast.success("Successfully fetched modules.");
        setModules(result.data);

        // Check if any module was in progress to auto-select it
        if (result.data.length > 0) {
          // Find the first incomplete module
          const firstIncompleteIndex = result.data.findIndex(
            (module: { module_id: string; completed?: boolean }) => {
              const progress = getProgress(module.module_id);
              return !progress || !progress.completed;
            }
          );

          // If found, set it as active
          if (firstIncompleteIndex !== -1) {
            setActiveModuleIndex(firstIncompleteIndex);
          }
        }
      } else {
        toast.error("Error fetching modules, please try again later.");
        setError("Error fetching modules, please try again later.");
        console.error("Error fetching modules:", result);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching modules:", err);
    } finally {
      setLoading(false);
    }
  }, [getProgress]);

  useEffect(() => {
    fetchModules();
  }, [getProgress, fetchModules]);

  const handleModuleChange = (index: number) => {
    // Find the last completed module index
    const lastCompletedIndex = modules.reduce((lastIndex, module, idx) => {
      const progress = getProgress(module.module_id);
      return progress?.completed ? idx : lastIndex;
    }, -1);

    // Allow access to completed modules and the next one
    if (index <= lastCompletedIndex + 1) {
      setActiveModuleIndex(index);
    } else {
      toast.error("Complete the current module to unlock this one.");
    }
  };

  const handleVideoComplete = () => {
    // Check if this is the last module
    if (activeModuleIndex === modules.length - 1) {
      setShowQuestionModal(true);
      toast.success("Congratulations! You've completed all modules. Please take the assessment.");
    } else {
      toast.success("Module completed! You can now proceed to the next one.");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 text-xl font-bold mb-2">Error Loading Modules</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row w-full p-2 sm:p-4 md:p-6 lg:p-12">
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: "rgba(22, 163, 74, 0.95)",
                color: "#ffffff",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                boxShadow: "0 10px 25px rgba(22, 163, 74, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                fontWeight: "500",
              },
              success: {
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#16a34a",
                },
              },
              error: {
                style: {
                  background: "rgba(220, 38, 38, 0.95)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                },
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#dc2626",
                },
              },
            }}
          />

          <div className="flex flex-col xl:flex-row gap-6 lg:gap-12 w-full">
            {modules[activeModuleIndex] && (
              <div className="w-full xl:flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 leading-tight">
                      {modules[activeModuleIndex].module_title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        Module {activeModuleIndex + 1} of {modules.length}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>Course Overview</span>
                    </div>
                  </div>

                  {getProgress(modules[activeModuleIndex].module_id)?.completed && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium shadow-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </div>
                    </div>
                  )}
                </div>

                {modules[activeModuleIndex].video ? (
                  <div className="relative mt-6 w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
                    <VideoPlayer
                      moduleData={modules[activeModuleIndex]}
                      onComplete={handleVideoComplete}
                      onNext={() => activeModuleIndex < modules.length - 1 && handleModuleChange(activeModuleIndex + 1)}
                      onPrevious={() => activeModuleIndex > 0 && handleModuleChange(activeModuleIndex - 1)}
                      isFirstModule={activeModuleIndex === 0}
                      isLastModule={activeModuleIndex === modules.length - 1}
                      isModuleCompleted={!!getProgress(modules[activeModuleIndex].module_id)?.completed}
                    />
                  </div>
                ) : (
                  <div className="mt-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">
                      No video available for this module
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Please check the module description for alternative content
                    </p>
                  </div>
                )}

                <ModuleTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  moduleData={{
                    ...modules[activeModuleIndex],
                    module_description: modules[activeModuleIndex].module_description || "No description available",
                    video: !!modules[activeModuleIndex].video,
                  }}
                  progress={getProgress(modules[activeModuleIndex].module_id)}
                />
              </div>
            )}

            <ModuleSidebar
              modules={modules.map((module) => ({
                ...module,
                module_title: module.module_title || "Untitled Module",
              }))}
              activeModuleIndex={activeModuleIndex}
              handleModuleChange={handleModuleChange}
              progressPercentage={progressPercentage}
              getProgress={getProgress}
            />
          </div>
        </div>
      </div>

      {/* Question Modal - Portal-style with maximum z-index */}
      {showQuestionModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          <QuestionModal
            isOpen={showQuestionModal}
            onClose={() => setShowQuestionModal(false)}
          />
        </div>
      )}
    </>
  );
}