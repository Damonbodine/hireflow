"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OfferDetailPage() {
  const params = useParams();
  const offer = useQuery(api.offers.getById, { id: params.id as Id<"offers"> });
  const updateStatus = useMutation(api.offers.updateStatus);

  if (offer === undefined) return <div className="animate-pulse"><div className="h-8 bg-muted rounded w-1/3 mb-4" /></div>;
  if (offer === null) return <div className="text-center py-12 text-muted-foreground">Offer not found</div>;

  const handleStatus = async (status: "Extended" | "Accepted" | "Declined" | "Rescinded") => {
    try { await updateStatus({ id: offer._id, status }); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offer — {offer.candidateName}</h1>
        <Badge variant={offer.status === "Accepted" ? "default" : "outline"}>{offer.status}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Offer Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Position:</span> {offer.jobTitle}</div>
          <div><span className="text-muted-foreground">Proposed Title:</span> {offer.proposedTitle}</div>
          <div><span className="text-muted-foreground">Salary:</span> ${offer.proposedSalary.toLocaleString()} ({offer.salaryType})</div>
          <div><span className="text-muted-foreground">Start Date:</span> {new Date(offer.startDate).toLocaleDateString()}</div>
          <div><span className="text-muted-foreground">Expires:</span> {new Date(offer.expirationDate).toLocaleDateString()}</div>
          {offer.benefits && <div><span className="text-muted-foreground">Benefits:</span> {offer.benefits}</div>}
          {offer.notes && <div><span className="text-muted-foreground">Notes:</span> {offer.notes}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {offer.status === "Draft" && <Button onClick={() => handleStatus("Extended")}>Extend Offer</Button>}
          {offer.status === "Extended" && <>
            <Button onClick={() => handleStatus("Accepted")}>Mark Accepted</Button>
            <Button variant="outline" onClick={() => handleStatus("Declined")}>Mark Declined</Button>
          </>}
          {(offer.status === "Draft" || offer.status === "Extended") && <Button variant="destructive" onClick={() => handleStatus("Rescinded")}>Rescind</Button>}
        </CardContent>
      </Card>
    </div>
  );
}
