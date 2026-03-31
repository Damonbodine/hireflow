"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/utils";

export function UpcomingInterviews() {
  const interviews = useQuery(api.dashboard.getUpcomingInterviews);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(interviews ?? []).slice(0, 5).map((int) => (
              <TableRow key={int._id}>
                <TableCell className="font-medium">{int.candidateName}</TableCell>
                <TableCell>{int.jobTitle}</TableCell>
                <TableCell>{new Date(int.scheduledDate).toLocaleDateString()} {int.scheduledTime}</TableCell>
                <TableCell><Badge variant="outline">{formatEnum(int.interviewType)}</Badge></TableCell>
              </TableRow>
            ))}
            {(!interviews || interviews.length === 0) && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No upcoming interviews</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}