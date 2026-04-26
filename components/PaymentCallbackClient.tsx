"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPayment } from "@/lib/actions/course.actions";
import { CheckCircle, XCircle, Loader2, BookOpen } from "lucide-react";

type State = "verifying" | "success" | "failed" | "cancelled";

export default function PaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params sent by Flutterwave after checkout
  const transactionId = searchParams.get("transaction_id");
  const txRef         = searchParams.get("tx_ref");
  const status        = searchParams.get("status");

  // Param we added to the redirect_url ourselves
  const courseId = searchParams.get("courseId");

  const [state, setState] = useState<State>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Handle explicit cancellation from Flutterwave
    if (status === "cancelled") {
      setState("cancelled");
      return;
    }

    // Guard: we need transaction_id and tx_ref to verify
    if (!transactionId || !txRef) {
      setState("failed");
      setErrorMessage(
        "Missing payment details. Please contact support if you were charged."
      );
      return;
    }

    // Call the backend to verify + enrol
    verifyPayment(transactionId, txRef).then((result) => {
      if (result.success) {
        setState("success");
        // Auto-redirect to the course page after 3 s
        setTimeout(() => {
          router.push(
            courseId
              ? `/human-services/dashboard/courses/${courseId}`
              : "/human-services/dashboard/courses"
          );
        }, 3000);
      } else {
        setState("failed");
        setErrorMessage(
          result.message ?? "Payment verification failed. Please contact support."
        );
      }
    });
    // Run once on mount — dependencies are stable URL params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  if (state === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Verifying your payment…
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your transaction with Flutterwave.
          </p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Payment successful!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            You are now enrolled. Redirecting you to the course…
          </p>
          {courseId && (
            <button
              onClick={() =>
                router.push(
                  `/human-services/dashboard/courses/${courseId}`
                )
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Go to course now
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-5">
            <XCircle className="w-9 h-9 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Payment cancelled
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            You cancelled the checkout. No charge was made.
          </p>
          <button
            onClick={() =>
              router.push(
                courseId
                  ? `/human-services/dashboard/courses/${courseId}`
                  : "/human-services/dashboard/courses"
              )
            }
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to course
          </button>
        </div>
      </div>
    );
  }

  // state === "failed"
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5">
          <XCircle className="w-9 h-9 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Payment failed
        </h2>
        <p className="text-sm text-gray-500 mb-2">{errorMessage}</p>
        <p className="text-xs text-gray-400 mb-6">
          If you were charged please contact{" "}
          <span className="font-medium text-gray-600">support@pithymeansplus.com</span>{" "}
          with your transaction reference.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() =>
              router.push(
                courseId
                  ? `/human-services/dashboard/courses/${courseId}`
                  : "/human-services/dashboard/courses"
              )
            }
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50"
          >
            Back to course
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
