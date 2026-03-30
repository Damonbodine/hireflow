"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Clock, ClipboardCheck } from "lucide-react";

export function DashboardStats() {
  const stats = useQuery(api.dashboard.getStats);

  if (!stats) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Card key={i} className="animate-pulse"><CardContent className="pt-6"><div className="h-8 bg-muted rounded" /></CardContent></Card>)}</div>;

  const items = [
    { label: "Open Positions", value: stats.openPositions, icon: Briefcase, color: "text-primary" },
    { label: "Active Candidates", value: stats.activeCandidates, icon: Users, color: "text-chart-2" },
    { label: "Avg Time to Fill", value: stats.avgTimeToFill + " days", icon: Clock, color: "text-chart-3" },
    { label: "Pending Evaluations", value: stats.pendingEvaluations, icon: ClipboardCheck, color: "text-chart-4" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className={"h-4 w-4 " + item.color} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}