"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function InterviewsPage() {
  const interviews = useQuery(api.interviews.list);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Interviews</h1>
        <Link href="/interviews/new" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90"><Plus className="h-4 w-4" />Schedule Interview</Link>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interviewers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(interviews ?? []).map((int) => (
              <TableRow key={int._id}>
                <TableCell className="font-medium">{int.candidateName}</TableCell>
                <TableCell>{int.jobTitle}</TableCell>
                <TableCell>{new Date(int.scheduledDate).toLocaleDateString()}</TableCell>
                <TableCell>{int.scheduledTime}</TableCell>
                <TableCell><Badge variant="outline">{int.interviewType}</Badge></TableCell>
                <TableCell><Badge variant={int.status === "Scheduled" ? "default" : "secondary"}>{int.status}</Badge></TableCell>
                <TableCell>{int.interviewerNames.join(", ")}</TableCell>
              </TableRow>
            ))}
            {(!interviews || interviews.length === 0) && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No interviews scheduled</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
