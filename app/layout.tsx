import type { Metadata, Viewport } from "next";
import { profile } from "@/lib/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name}'s Wall`,
  description: `Write something on ${profile.firstName}'s Wall.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b5998",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
