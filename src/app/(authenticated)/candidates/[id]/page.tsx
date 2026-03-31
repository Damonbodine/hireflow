"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatEnum } from "@/lib/utils";

export default function CandidateProfilePage() {
  const params = useParams();
  const candidateId = params.id as Id<"candidates">;
  const candidate = useQuery(api.candidates.getById, { id: candidateId });
  const applications = useQuery(api.applications.listByCandidate, { candidateId });

  if (candidate === undefined) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-1/3 mb-4" /></div>;
  if (candidate === null) return <div className="text-center py-12 text-muted-foreground">Candidate not found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{candidate.firstName} {candidate.lastName}</h1>
              {candidate.currentTitle && <p className="text-muted-foreground">{candidate.currentTitle}{candidate.currentOrganization ? ` at ${candidate.currentOrganization}` : ""}</p>}
              <div className="flex gap-4 mt-2 text-sm">
                <span>{candidate.email}</span>
                <span>{candidate.phone}</span>
                {candidate.linkedInUrl && <a href={candidate.linkedInUrl} className="text-primary">LinkedIn</a>}
              </div>
              <div className="flex gap-2 mt-3">
                {candidate.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            </div>
            <Badge variant="outline">{formatEnum(candidate.source)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Starred</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(applications ?? []).map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">{app.jobTitle}</TableCell>
                  <TableCell><Badge variant="outline">{formatEnum(app.stage)}</Badge></TableCell>
                  <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{app.isStarred ? "\u2B50" : "\u2014"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {candidate.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{candidate.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
