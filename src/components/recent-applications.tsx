"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/utils";

const stageBadgeVariant = (stage: string) => {
  switch (stage) {
    case "New": return "default";
    case "Screening": return "secondary";
    case "Interview": return "default";
    case "Offer": return "default";
    default: return "outline";
  }
};

export function RecentApplications() {
  const apps = useQuery(api.dashboard.getRecentApplications);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(apps ?? []).slice(0, 5).map((app) => (
              <TableRow key={app._id}>
                <TableCell className="font-medium">{app.candidateName}</TableCell>
                <TableCell>{app.jobTitle}</TableCell>
                <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                <TableCell><Badge variant={stageBadgeVariant(app.stage)}>{formatEnum(app.stage)}</Badge></TableCell>
              </TableRow>
            ))}
            {(!apps || apps.length === 0) && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No recent applications</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}