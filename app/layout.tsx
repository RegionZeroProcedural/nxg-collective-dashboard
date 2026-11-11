import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import "./refinements.css";
import "./viewport.css";

export const metadata: Metadata = {
  title: "Referrals & Rewards | NXG Collective",
  description:
    "Your NXG Collective partner dashboard. Track referrals, grow your network, and earn rewards.",
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
