"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function JobPostingForm() {
  const router = useRouter();
  const departments = useQuery(api.departments.list);
  const createJob = useMutation(api.jobPostings.create);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await createJob({
        title: form.get("title") as string,
        departmentId: form.get("departmentId") as any,
        employmentType: form.get("employmentType") as any,
        locationType: form.get("locationType") as any,
        location: (form.get("location") as string) || undefined,
        salaryRangeMin: form.get("salaryRangeMin") ? Number(form.get("salaryRangeMin")) : undefined,
        salaryRangeMax: form.get("salaryRangeMax") ? Number(form.get("salaryRangeMax")) : undefined,
        salaryType: form.get("salaryType") as any,
        description: form.get("description") as string,
        qualifications: form.get("qualifications") as string,
      });
      router.push("/jobs");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create job posting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>New Job Posting</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <div><Label htmlFor="departmentId">Department</Label><select name="departmentId" id="departmentId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{(departments ?? []).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="employmentType">Employment Type</Label><select name="employmentType" id="employmentType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="FullTime">Full-Time</option><option value="PartTime">Part-Time</option><option value="Contract">Contract</option><option value="Temporary">Temporary</option><option value="Internship">Internship</option><option value="AmeriCorps">AmeriCorps</option></select></div>
            <div><Label htmlFor="locationType">Location Type</Label><select name="locationType" id="locationType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="OnSite">On-Site</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option></select></div>
          </div>
          <div><Label htmlFor="location">Location (city, state)</Label><Input id="location" name="location" placeholder="Austin, TX" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="salaryRangeMin">Min Salary</Label><Input id="salaryRangeMin" name="salaryRangeMin" type="number" /></div>
            <div><Label htmlFor="salaryRangeMax">Max Salary</Label><Input id="salaryRangeMax" name="salaryRangeMax" type="number" /></div>
            <div><Label htmlFor="salaryType">Salary Type</Label><select name="salaryType" id="salaryType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="Annual">Annual</option><option value="Hourly">Hourly</option><option value="Stipend">Stipend</option></select></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required rows={4} /></div>
          <div><Label htmlFor="qualifications">Qualifications</Label><Textarea id="qualifications" name="qualifications" required rows={3} /></div>
          <div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Job Posting"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}