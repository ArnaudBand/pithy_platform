import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Pithy means Africa",
    description: "Premium services for African communities",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
