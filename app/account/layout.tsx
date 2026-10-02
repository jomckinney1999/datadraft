import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your account — DataDraft",
  description: "Sign in with a link by email, and your progress follows you from device to device.",
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
