"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatEnum } from "@/lib/utils";

export default function OffersPage() {
  const offers = useQuery(api.offers.list);
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Offers</h1>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Offer Date</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(offers ?? []).map((offer) => (
              <TableRow key={offer._id} className="cursor-pointer" onClick={() => router.push(`/offers/${offer._id}`)}>
                <TableCell className="font-medium">{offer.candidateName}</TableCell>
                <TableCell>{offer.jobTitle}</TableCell>
                <TableCell>{offer.proposedTitle}</TableCell>
                <TableCell>${offer.proposedSalary.toLocaleString()} ({formatEnum(offer.salaryType)})</TableCell>
                <TableCell><Badge variant={offer.status === "Accepted" ? "default" : "outline"}>{offer.status}</Badge></TableCell>
                <TableCell>{new Date(offer.offerDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(offer.expirationDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {(!offers || offers.length === 0) && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No offers yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
