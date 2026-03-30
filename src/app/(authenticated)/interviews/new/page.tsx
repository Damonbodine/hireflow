"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

export default function NewInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") as Id<"applications"> | null;
  const users = useQuery(api.users.list);
  const createInterview = useMutation(api.interviews.create);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applicationId || selectedInterviewers.length === 0) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await createInterview({
        applicationId,
        scheduledDate: new Date(form.get("scheduledDate") as string).getTime(),
        scheduledTime: form.get("scheduledTime") as string,
        durationMinutes: Number(form.get("durationMinutes")),
        interviewType: form.get("interviewType") as "Phone" | "Video" | "InPerson" | "Panel",
        location: (form.get("location") as string) || undefined,
        interviewerIds: selectedInterviewers as Id<"users">[],
        notes: (form.get("notes") as string) || undefined,
      });
      router.back();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule interview");
    } finally {
      setSubmitting(false);
    }
  };

  const interviewers = (users ?? []).filter((u: any) => u.role === "Interviewer" || u.role === "HiringManager");

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Schedule Interview</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="scheduledDate">Date</Label><Input id="scheduledDate" name="scheduledDate" type="date" required /></div>
            <div><Label htmlFor="scheduledTime">Time</Label><Input id="scheduledTime" name="scheduledTime" placeholder="2:00 PM" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="durationMinutes">Duration (min)</Label>
              <select name="durationMinutes" id="durationMinutes" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option>
              </select>
            </div>
            <div><Label htmlFor="interviewType">Type</Label>
              <select name="interviewType" id="interviewType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="Phone">Phone</option><option value="Video">Video</option><option value="InPerson">In-Person</option><option value="Panel">Panel</option>
              </select>
            </div>
          </div>
          <div><Label htmlFor="location">Location / Video Link</Label><Input id="location" name="location" placeholder="Conference Room A or Zoom link" /></div>
          <div>
            <Label>Interviewers</Label>
            <div className="space-y-2 mt-2">
              {interviewers.map((u) => (
                <label key={u._id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedInterviewers.includes(u._id)} onChange={(e) => {
                    if (e.target.checked) setSelectedInterviewers([...selectedInterviewers, u._id]);
                    else setSelectedInterviewers(selectedInterviewers.filter((id) => id !== u._id));
                  }} />
                  {u.name} ({u.role})
                </label>
              ))}
            </div>
          </div>
          <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={2} /></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || !applicationId || selectedInterviewers.length === 0}>{submitting ? "Scheduling..." : "Schedule Interview"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
