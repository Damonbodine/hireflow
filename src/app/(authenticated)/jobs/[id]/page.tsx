"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatEnum } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const job = useQuery(api.jobPostings.getById, { id: params.id as Id<"jobPostings"> });
  const updateStatus = useMutation(api.jobPostings.updateStatus);

  if (job === undefined) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-1/3 mb-4" /><div className="h-64 bg-muted rounded" /></div>;
  if (job === null) return <div className="text-center py-12 text-muted-foreground">Job posting not found</div>;

  const handleStatusChange = async (status: "Open" | "OnHold" | "Closed" | "Filled") => {
    try {
      await updateStatus({ id: job._id, status });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">{job.departmentName} · {formatEnum(job.employmentType)} · {formatEnum(job.locationType)}{job.location ? ` — ${job.location}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={job.status === "Open" ? "default" : "secondary"}>{job.status}</Badge>
          <Link href={`/jobs/${job._id}/pipeline`} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">Pipeline Board</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{job.description}</p></CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {job.salaryRangeMin && <div><span className="text-muted-foreground">Salary:</span> ${job.salaryRangeMin.toLocaleString()} - ${job.salaryRangeMax?.toLocaleString()} ({formatEnum(job.salaryType)})</div>}
              <div><span className="text-muted-foreground">Applicants:</span> {job.applicantCount}</div>
              {job.openDate && <div><span className="text-muted-foreground">Opened:</span> {new Date(job.openDate).toLocaleDateString()}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Qualifications</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap text-sm">{job.qualifications}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {job.status === "Draft" && <Button className="w-full" onClick={() => handleStatusChange("Open")}>Open Position</Button>}
              {job.status === "Open" && <Button variant="outline" className="w-full" onClick={() => handleStatusChange("OnHold")}>Put On Hold</Button>}
              {job.status === "OnHold" && <Button className="w-full" onClick={() => handleStatusChange("Open")}>Reopen</Button>}
              {(job.status === "Open" || job.status === "OnHold") && <Button variant="destructive" className="w-full" onClick={() => handleStatusChange("Filled")}>Mark as Filled</Button>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
