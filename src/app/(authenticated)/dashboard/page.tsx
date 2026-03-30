"use client";

import { DashboardStats } from "@/components/dashboard-stats";
import { PipelineChart } from "@/components/pipeline-chart";
import { RecentApplications } from "@/components/recent-applications";
import { UpcomingInterviews } from "@/components/upcoming-interviews";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStats />
      <PipelineChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentApplications />
        <UpcomingInterviews />
      </div>
    </div>
  );
}
