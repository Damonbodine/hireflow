"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  const stats = useQuery(api.dashboard.getStats);
  const pipeline = useQuery(api.dashboard.getPipelineStats);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <Tabs defaultValue="funnel">
        <TabsList>
          <TabsTrigger value="funnel">Pipeline Funnel</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="funnel" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Pipeline Funnel</CardTitle></CardHeader>
            <CardContent>
              {pipeline && (
                <div className="space-y-3">
                  {Object.entries(pipeline).map(([stage, count]: [string, any]) => (
                    <div key={stage} className="flex items-center gap-4">
                      <span className="w-32 text-sm text-muted-foreground">{stage}</span>
                      <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.max(5, (Number(count) / Math.max(...Object.values(pipeline).map(Number))) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Open Positions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.openPositions ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Active Candidates</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.activeCandidates ?? 0}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Avg Time to Fill</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.avgTimeToFill ?? 0} days</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Pending Evaluations</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.pendingEvaluations ?? 0}</div></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
