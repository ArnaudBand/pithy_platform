export default function ModuleTabs({
  activeTab,
  setActiveTab,
  moduleData,
  progress,
}: {
  activeTab: string,
  setActiveTab: (tab: "summary" | "question") => void,
  progress?: {
    completed?: boolean;
    currentTime?: number;
  };
  moduleData: {
    module_description: string;
    video?: boolean;
  };
}) {
  // Parse the description to extract title and content
  const parseDescription = (description: string) => {
    const lines = description.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return { title: null, content: description };
    }

    const firstLine = lines[0].trim();

    // Check if first line looks like a title (shorter, no period at end, or ends with colon)
    const looksLikeTitle =
      firstLine.length < 100 &&
      (firstLine.endsWith(':') || !firstLine.endsWith('.') || lines.length > 1);

    if (looksLikeTitle && lines.length > 1) {
      return {
        title: firstLine.replace(/:$/, ''), // Remove trailing colon if present
        content: lines.slice(1).join('\n')
      };
    }

    return { title: null, content: description };
  };

  const { title, content } = parseDescription(moduleData.module_description);

  return (
    <div className="mt-6 sm:mt-8">
      <div className="flex border-b-2 border-gray-200">
        <button
          className={`px-3 py-2 sm:px-6 sm:py-3 text-sm font-semibold transition-all duration-300 ease-in-out ${activeTab === "summary"
              ? "border-b-4 border-green-600 text-green-600"
              : "text-gray-600 hover:text-green-600"
            }`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={`px-3 py-2 sm:px-6 sm:py-3 text-sm font-semibold transition-all duration-300 ease-in-out ${activeTab === "question"
              ? "border-b-4 border-green-600 text-green-600"
              : "text-gray-600 hover:text-green-600"
            }`}
          onClick={() => setActiveTab("question")}
        >
          Question & Answers
        </button>
      </div>

      {/* Conditionally render content based on active tab */}
      <div className="mt-4 sm:mt-6 text-sm text-gray-700 space-y-4">
        {activeTab === "summary" ? (
          <div className="space-y-4">
            {/* Module Title (extracted from description) */}
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {title}
              </h2>
            )}

            {/* Summary Content */}
            <div className="leading-relaxed">
              {content.split('\n').map((paragraph, idx) => (
                paragraph.trim() && (
                  <p key={idx} className="mb-3">
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            {/* Show video progress indicator */}
            {moduleData.video && progress && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Your Progress</h3>
                <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: progress?.completed ?
                        '100%' :
                        progress?.currentTime ?
                          `${Math.min((progress?.currentTime || 0) / (60 * 10) * 100, 99)}%` :
                          '0%'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {progress?.completed ? '✓ Completed' : 'In progress'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Question & Answers content */}
            <p className="text-gray-700">
              Questions and answers related to this module will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}