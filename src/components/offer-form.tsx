"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

type SalaryType = "Hourly" | "Annual" | "Stipend";

export function OfferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") as Id<"applications">;
  const createOffer = useMutation(api.offers.create);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applicationId) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await createOffer({
        applicationId,
        proposedTitle: form.get("proposedTitle") as string,
        proposedSalary: Number(form.get("proposedSalary")),
        salaryType: form.get("salaryType") as string as SalaryType,
        startDate: new Date(form.get("startDate") as string).getTime(),
        expirationDate: new Date(form.get("expirationDate") as string).getTime(),
        benefits: (form.get("benefits") as string) || undefined,
        notes: (form.get("notes") as string) || undefined,
      });
      router.push("/offers");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create offer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Create Offer</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="proposedTitle">Proposed Title</Label><Input id="proposedTitle" name="proposedTitle" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="proposedSalary">Proposed Salary</Label><Input id="proposedSalary" name="proposedSalary" type="number" required /></div>
            <div><Label htmlFor="salaryType">Salary Type</Label><select name="salaryType" id="salaryType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="Annual">Annual</option><option value="Hourly">Hourly</option><option value="Stipend">Stipend</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" name="startDate" type="date" required /></div>
            <div><Label htmlFor="expirationDate">Expiration Date</Label><Input id="expirationDate" name="expirationDate" type="date" required /></div>
          </div>
          <div><Label htmlFor="benefits">Benefits</Label><Textarea id="benefits" name="benefits" rows={3} placeholder="Health insurance, PTO, retirement..." /></div>
          <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={2} /></div>
          <div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Offer"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
