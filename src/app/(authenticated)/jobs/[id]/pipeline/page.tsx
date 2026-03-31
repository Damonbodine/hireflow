"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatEnum } from "@/lib/utils";

const STAGES = ["New", "Screening", "PhoneScreen", "Interview", "SecondInterview", "Reference", "Offer"] as const;

export default function PipelinePage() {
  const params = useParams();
  const jobId = params.id as Id<"jobPostings">;
  const job = useQuery(api.jobPostings.getById, { id: jobId });
  const applications = useQuery(api.applications.listByJobPosting, { jobPostingId: jobId });
  const updateStage = useMutation(api.applications.updateStage);
  const toggleStar = useMutation(api.applications.toggleStar);

  if (!job || !applications) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-1/3 mb-4" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{job.title} — Pipeline</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.stage === stage);
          return (
            <div key={stage} className="min-w-[240px] bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm">{formatEnum(stage)}</span>
                <Badge variant="secondary">{stageApps.length}</Badge>
              </div>
              <div className="space-y-2">
                {stageApps.map((app) => (
                  <Card key={app._id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{app.candidateName}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleStar({ id: app._id }); }} className="text-muted-foreground hover:text-yellow-400">
                        <Star className={`h-4 w-4 ${app.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.appliedDate).toLocaleDateString()}</p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
