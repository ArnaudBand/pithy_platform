// This route is no longer used — payment-callback lives at
// /human-services/payment-callback (outside the dashboard layout).
// Redirect anyone who lands here to the correct location.
import { redirect } from "next/navigation";

export default function OldPaymentCallbackPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const qs = new URLSearchParams(searchParams).toString();
  redirect(`/human-services/payment-callback${qs ? `?${qs}` : ""}`);
}
