import { Suspense } from "react";
import PaymentCallbackClient from "@/components/PaymentCallbackClient";
import { Loader2 } from "lucide-react";

/**
 * /human-services/payment-callback
 *
 * Landing page after Flutterwave redirects the user back.
 * IMPORTANT: this page is intentionally placed OUTSIDE the (dashboard)
 * layout group so it is never subject to the auth/profile-check redirects
 * that would fire before PaymentCallbackClient mounts.
 *
 * Flutterwave appends:  ?transaction_id=X&status=Y&tx_ref=Z
 * We also include:       &courseId=<uuid>  (set when building the redirect_url)
 *
 * The Suspense boundary is required in Next.js 15 because PaymentCallbackClient
 * uses useSearchParams(), which must be wrapped in Suspense during SSR.
 */
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <PaymentCallbackClient />
    </Suspense>
  );
}
