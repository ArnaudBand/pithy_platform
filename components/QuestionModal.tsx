"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Question, UserResponse, TemperamentResult, Answer, UserInfo } from '@/types/schema';
import { calculateTemperamentTypeFromRawAnswers, getTemperamentDescription } from '@/utils/temperament';
import { fetchQuestions, saveResult } from '@/lib/actions/user.actions';
import { useAuthStore } from '@/lib/store/useAuthStore';

type QuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QuestionModal: React.FC<QuestionModalProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [result, setResult] = useState<TemperamentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);
  const { user } = useAuthStore((state) => state as unknown as UserInfo);

  // Animation and interactive elements
  const [fadeIn, setFadeIn] = useState(true);
  const [showCertificateBack, setShowCertificateBack] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect for click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchQuestions();

        const parsedData = data.map(question => ({
          ...question,
          options: Array.isArray(question.options)
            ? question.options.map((option: string | Answer) =>
              typeof option === 'string' ? JSON.parse(option) : option)
            : []
        }));

        setQuestions(parsedData);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setResponses([]);
      setResult(null);
      setShowCertificateBack(false);
      setFadeIn(true);
    }
  }, [isOpen]);

  // Confetti effect for certificate completion
  useEffect(() => {
    if (result && confettiRef.current) {
      import('canvas-confetti').then((confetti) => {
        const confettiCannon = confetti.default;

        confettiCannon({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']
        });
      }).catch(err => {
        console.error('Failed to load confetti:', err);
      });
    }
  }, [result]);

  const handleAnswer = async (answerId: string, answerIndex: number) => {
    setFadeIn(false);

    const questionId = questions[currentQuestionIndex].pre_course_question_id;

    const newResponse: UserResponse = { questionId, answerId };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    const updatedSelectedAnswers = [...selectedAnswers];
    updatedSelectedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(updatedSelectedAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const type = calculateTemperamentTypeFromRawAnswers(updatedSelectedAnswers, questions);
        const temperamentResult = getTemperamentDescription(type);
        setResult(temperamentResult);

        if (user && user.user_id) {
          try {
            setSavingResult(true);
            saveResult(user.user_id, type, updatedResponses);
          } catch (error) {
            console.error('Error saving result:', error);
          } finally {
            setSavingResult(false);
          }
        }
      }
      setFadeIn(true);
    }, 300);
  };

  const getFormattedDate = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
  };

  const handleRestart = () => {
    setResponses([]);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setResult(null);
    setShowCertificateBack(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-sm"
      style={{ zIndex: 10000 }}
    >
      <div
        ref={modalRef}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform my-8"
        style={{ maxHeight: '90vh' }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white shadow-lg">
          <h2 id="modal-title" className="text-xl font-bold">Temperament Assessment</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full h-9 w-9 flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 border-solid mx-auto mb-4"></div>
                <p className="text-green-700 font-medium">Loading questions...</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-gray-800">No questions available</h1>
                <p className="mb-6 text-gray-600">Please add questions to the database first.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : result ? (
            <div ref={confettiRef} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6">
              {showCertificateBack ? (
                <div className="bg-gradient-to-br from-green-700 to-emerald-700 text-white border-8 border-double border-green-200 rounded-2xl p-8 shadow-2xl transition-all duration-500">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-4">Career Recommendations</h2>
                    <p className="text-green-100">Based on your {result.type} temperament</p>
                    <div className="h-1 w-48 bg-white mx-auto my-4 opacity-60 rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {result.careers.map((career, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl shadow-lg text-green-800 hover:scale-105 transition duration-300 transform">
                        <div className="flex items-start">
                          <span className="flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-600 h-8 w-8 rounded-full text-white font-bold mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-lg">{career}</h3>
                            <p className="text-green-600 text-sm font-medium">Compatibility: {90 - (index * 5)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-800/50 backdrop-blur-sm p-6 rounded-xl mb-8 border border-green-600/30">
                    <h3 className="text-xl font-bold mb-3 text-white">How to Use This Information:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-green-100">
                      <li>Consider how these careers align with your current interests and skills</li>
                      <li>Research educational requirements for these fields</li>
                      <li>Explore internships or volunteer opportunities related to these areas</li>
                      <li>Connect with professionals in these fields for informational interviews</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowCertificateBack(false)}
                    className="w-full py-3 mt-4 bg-white text-green-700 rounded-xl hover:bg-green-50 transition duration-300 flex items-center justify-center font-semibold shadow-lg"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Return to Certificate
                  </button>
                </div>
              ) : (
                <div className="bg-white border-8 border-double border-green-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <svg className="w-2/3 h-2/3" viewBox="0 0 100 100">
                      <path d="M50,5 L95,50 L50,95 L5,50 Z" fill="currentColor" className="text-green-500" />
                    </svg>
                  </div>

                  <div className="text-center mb-6 relative">
                    <div className="absolute -top-2 right-0">
                      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-full h-20 w-20 flex items-center justify-center border-4 border-green-200 shadow-xl">
                        <div className="text-white text-xs font-bold leading-tight text-center">
                          OFFICIAL<br />RESULTS
                        </div>
                      </div>
                    </div>

                    <h1 className="text-4xl font-serif font-bold text-green-800 mb-2">Certificate Of Achievement</h1>
                    <div className="h-1 w-64 bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto my-4"></div>
                    <p className="text-gray-600">This certifies that</p>
                    <p className="text-3xl font-bold text-green-700 mt-2 mb-2">{user?.firstname} {user?.lastname || "Valued Participant"}</p>
                    <p className="text-gray-600">has successfully completed the</p>
                    <p className="text-xl font-bold text-green-600 mt-1">Personality Type Self Assessment</p>
                  </div>

                  <div className="mb-8 text-center">
                    <p className="text-gray-600 mb-2">and has been identified as a</p>
                    <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 my-4 font-serif">{result.type}</h2>
                    <p className="text-gray-600">personality type</p>
                  </div>

                  <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-inner border border-green-100">
                    <h3 className="text-xl font-bold text-green-800 mb-3">Temperament Profile:</h3>
                    <p className="text-gray-700 leading-relaxed">{result.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-12">
                    <div className="text-center">
                      <div className="h-px w-48 bg-gray-400"></div>
                      <p className="text-gray-600 mt-1 text-sm">Date</p>
                      <p className="font-semibold text-gray-800">{getFormattedDate()}</p>
                    </div>

                    <div className="text-center">
                      <svg className="h-12 w-32 mx-auto" viewBox="0 0 100 30">
                        <path d="M10 15 C20 5, 40 5, 50 15 C60 25, 80 25, 90 15" stroke="#16a34a" fill="none" strokeWidth="2" />
                      </svg>
                      <div className="h-px w-48 bg-gray-400 mt-2"></div>
                      <p className="text-gray-600 mt-1 text-sm">Signature</p>
                      <p className="font-semibold text-gray-800">Director of Assessment</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCertificateBack(true)}
                    className="w-full py-3 mt-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition duration-300 flex items-center justify-center font-semibold shadow-lg"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    View Career Recommendations
                  </button>
                </div>
              )}

              {savingResult && (
                <div className="text-center mt-4">
                  <p className="text-sm text-green-600 flex items-center justify-center font-medium">
                    <span className="animate-spin h-4 w-4 border-t-2 border-green-600 rounded-full mr-2"></span>
                    Saving your results...
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition duration-300 flex items-center font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake Test
                </button>
                <Link href={"/profile" as Route}
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white text-green-700 border-2 border-green-600 rounded-lg shadow-lg hover:bg-green-50 transition duration-300 flex items-center font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition duration-300 flex items-center font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg shadow hover:bg-gray-200 transition duration-300 flex items-center font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl overflow-hidden border border-green-100">
                <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-6 py-4 flex items-center justify-between shadow-lg">
                  <div className="flex items-center">
                    <span className="bg-white text-green-700 font-bold rounded-full h-9 w-9 flex items-center justify-center mr-3 shadow">
                      {currentQuestionIndex + 1}
                    </span>
                    <span className="text-white font-medium">of {questions.length} Questions</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-green-800/50 rounded-full h-2.5">
                      <div
                        className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white font-bold text-sm">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>

                {questions[currentQuestionIndex] && (
                  <div className="p-8 bg-white">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-green-800 mb-4 leading-tight">
                        {questions[currentQuestionIndex].text}
                      </h2>
                      <p className="text-gray-600 italic">Select the option that best describes you</p>
                    </div>

                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options.map((option, index) => (
                        <button
                          key={option.answer_id}
                          onClick={() => handleAnswer(option.answer_id, index)}
                          className="w-full p-4 border-2 border-green-100 rounded-xl hover:border-green-500 hover:bg-green-50 hover:shadow-md
                                 text-left text-gray-800 transition-all duration-200 flex items-center group"
                        >
                          <div className="h-6 w-6 rounded-full border-2 border-green-300 flex items-center justify-center mr-4 
                                      group-hover:border-green-500 transition-colors flex-shrink-0">
                            <div className="h-3 w-3 rounded-full group-hover:bg-green-500 transition-colors"></div>
                          </div>
                          <span className="text-base font-medium">{option.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                  <button
                    onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg flex items-center font-medium ${currentQuestionIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:bg-green-50'
                      }`}
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="text-green-700 text-sm font-bold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>

                  <button
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                      }
                    }}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`px-4 py-2 rounded-lg flex items-center font-medium ${currentQuestionIndex === questions.length - 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:bg-green-50'
                      }`}
                  >
                    Skip
                    <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-green-600 border-2 border-green-200 rounded-lg hover:bg-gray-50 transition duration-300 font-medium"
                >
                  Cancel Assessment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;