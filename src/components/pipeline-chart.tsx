"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stageColors: Record<string, string> = {
  New: "bg-chart-1",
  Screening: "bg-chart-2",
  PhoneScreen: "bg-chart-3",
  Interview: "bg-primary",
  SecondInterview: "bg-chart-4",
  Reference: "bg-chart-5",
  Offer: "bg-success",
};

export function PipelineChart() {
  const stats = useQuery(api.dashboard.getPipelineStats);
  if (!stats) return null;

  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pipeline Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {Object.entries(stats).map(([stage, count]) => {
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div key={stage} className={stageColors[stage] + " relative group"} style={{ width: pct + "%" }} title={stage + ": " + count}>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {Object.entries(stats).map(([stage, count]) => (
            <div key={stage} className="flex items-center gap-2 text-sm">
              <div className={"w-3 h-3 rounded " + stageColors[stage]} />
              <span className="text-muted-foreground">{stage}: {count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}