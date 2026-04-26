import { Suspense } from "react";
import VerifyEmailPending from "@/components/VerifyEmailPending";

export default function VerifyEmailPendingPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailPending />
        </Suspense>
    );
}