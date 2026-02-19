import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Flowryd",
  description: "Admin dashboard for managing flows, deals, and Jump Cut templates",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}