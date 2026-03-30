"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

const statusColor = (status: string) => {
  switch (status) {
    case "Open": return "default";
    case "Draft": return "secondary";
    case "OnHold": return "outline";
    case "Closed": return "destructive";
    case "Filled": return "default";
    default: return "outline";
  }
};

export function JobPostingsTable() {
  const jobs = useQuery(api.jobPostings.list, {});
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Link href="/jobs/new" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90"><Plus className="h-4 w-4" />New Job Posting</Link>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Applicants</TableHead>
              <TableHead>Open Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(jobs ?? []).map((job) => (
              <TableRow key={job._id} className="cursor-pointer" onClick={() => router.push("/jobs/" + job._id)}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.departmentName}</TableCell>
                <TableCell><Badge variant={statusColor(job.status)}>{job.status}</Badge></TableCell>
                <TableCell>{job.employmentType}</TableCell>
                <TableCell>{job.locationType}{job.location ? " — " + job.location : ""}</TableCell>
                <TableCell className="text-right">{job.applicantCount}</TableCell>
                <TableCell>{job.openDate ? new Date(job.openDate).toLocaleDateString() : "—"}</TableCell>
              </TableRow>
            ))}
            {(!jobs || jobs.length === 0) && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No job postings yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}