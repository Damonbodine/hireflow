"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { UserButton } from "@clerk/nextjs";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!isAuthenticated) redirect("/sign-in");

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-end mb-6"><UserButton /></div>
        {children}
      </main>
    </div>
  );
}
