/* eslint-disable @typescript-eslint/no-unused-vars */
import { Lock, CheckCircle, Circle, Play } from "lucide-react";

interface Module {
  module_id: string;
  module_title: string;
}

export default function ModuleSidebar({
  modules,
  activeModuleIndex,
  handleModuleChange,
  progressPercentage,
  getProgress
}: {
  modules: Module[];
  activeModuleIndex: number;
  handleModuleChange: (index: number) => void;
  progressPercentage: number;
  getProgress: (moduleId: string) => { completed?: boolean; currentTime?: number } | undefined;
}) {
  // Find the last completed module index
  const lastCompletedIndex = modules.reduce((lastIdx, mod, idx) => {
    const prog = getProgress(mod.module_id);
    return prog?.completed ? idx : lastIdx;
  }, -1);

  return (
    <div className="w-full xl:w-80 mt-6 xl:mt-0">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <h2 className="text-lg font-bold leading-tight mb-3">
            Entrepreneurship in East Africa
          </h2>
          <p className="text-sm text-green-50 opacity-90">Case Study UG</p>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Course Progress</span>
              <span className="font-bold">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
              </div>
            </div>
            <p className="text-xs text-green-50 opacity-75">
              {modules.filter((m, i) => getProgress(m.module_id)?.completed).length} of {modules.length} modules completed
            </p>
          </div>
        </div>

        {/* Modules List */}
        <div className="p-4 max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {modules.map((module, index) => {
              const progress = getProgress(module.module_id);
              const isCompleted = progress?.completed;
              const isInProgress = (progress?.currentTime ?? 0) > 0 && !isCompleted;
              const isUnlocked = index <= lastCompletedIndex + 1;
              const isActive = index === activeModuleIndex;

              return (
                <div
                  key={module.module_id}
                  onClick={() => isUnlocked && handleModuleChange(index)}
                  className={`
                    group relative rounded-xl transition-all duration-300 ease-out
                    ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                    ${isActive
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 shadow-md scale-[1.02] border-2 border-green-500'
                      : isUnlocked
                        ? 'bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-green-300'
                        : 'bg-gray-50 border border-gray-200 opacity-60'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-green-500 to-emerald-500 rounded-r-full"></div>
                  )}

                  <div className="flex items-start gap-3 p-4 pl-5">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="relative">
                          <CheckCircle className="w-6 h-6 text-green-600 drop-shadow-sm" />
                          <div className="absolute inset-0 animate-ping opacity-0 group-hover:opacity-20">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      ) : isUnlocked ? (
                        <div className="relative">
                          {isInProgress ? (
                            <div className="relative">
                              <Circle className="w-6 h-6 text-green-600" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-green-600 rounded-full group-hover:border-green-700 transition-colors flex items-center justify-center">
                              <Play className="w-3 h-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <Lock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Module Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`
                            text-sm font-medium leading-snug transition-colors
                            ${isActive
                              ? 'text-green-700 font-semibold'
                              : isUnlocked
                                ? 'text-gray-900 group-hover:text-green-700'
                                : 'text-gray-400'
                            }
                          `}>
                            {module.module_title}
                          </p>

                          {/* Status Badge */}
                          {isInProgress && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-green-700">In Progress</span>
                              </div>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                Completed
                              </span>
                            </div>
                          )}

                          {!isUnlocked && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                                Complete previous modules to unlock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Module Number */}
                        <span className={`
                          flex-shrink-0 text-xs font-bold
                          ${isActive
                            ? 'text-green-600'
                            : isUnlocked
                              ? 'text-gray-400 group-hover:text-green-600'
                              : 'text-gray-300'
                          }
                        `}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  {isUnlocked && !isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-600/0 to-emerald-600/0 group-hover:from-green-600/5 group-hover:to-emerald-600/5 transition-all duration-300 pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Next module unlocks on completion
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}