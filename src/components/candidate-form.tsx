"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CandidateForm() {
  const router = useRouter();
  const createCandidate = useMutation(api.candidates.create);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const tagsStr = form.get("tags") as string;
      await createCandidate({
        firstName: form.get("firstName") as string,
        lastName: form.get("lastName") as string,
        email: form.get("email") as string,
        phone: form.get("phone") as string,
        source: form.get("source") as any,
        linkedInUrl: (form.get("linkedInUrl") as string) || undefined,
        currentTitle: (form.get("currentTitle") as string) || undefined,
        currentOrganization: (form.get("currentOrganization") as string) || undefined,
        tags: tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [],
        notes: (form.get("notes") as string) || undefined,
      });
      router.push("/candidates");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add candidate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Add Candidate</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" required /></div>
            <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" required /></div>
          </div>
          <div><Label htmlFor="source">Source</Label><select name="source" id="source" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="DirectApplication">Direct Application</option><option value="Referral">Referral</option><option value="LinkedIn">LinkedIn</option><option value="IndeedNonprofit">Indeed Nonprofit</option><option value="Idealist">Idealist</option><option value="JobBoard">Job Board</option><option value="Internal">Internal</option><option value="Other">Other</option></select></div>
          <div><Label htmlFor="currentTitle">Current Title</Label><Input id="currentTitle" name="currentTitle" /></div>
          <div><Label htmlFor="currentOrganization">Current Organization</Label><Input id="currentOrganization" name="currentOrganization" /></div>
          <div><Label htmlFor="linkedInUrl">LinkedIn URL</Label><Input id="linkedInUrl" name="linkedInUrl" type="url" /></div>
          <div><Label htmlFor="tags">Tags (comma-separated)</Label><Input id="tags" name="tags" placeholder="bilingual, MSW, grant-writing" /></div>
          <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} /></div>
          <div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Candidate"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}