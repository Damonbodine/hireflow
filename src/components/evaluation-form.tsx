"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

type Recommendation = "StrongHire" | "Hire" | "Neutral" | "NoHire" | "StrongNoHire";

export function EvaluationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interviewId") as Id<"interviews">;
  const createEval = useMutation(api.evaluations.create);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!interviewId) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await createEval({
        interviewId,
        overallRating: Number(form.get("overallRating")),
        technicalSkills: Number(form.get("technicalSkills")),
        communication: Number(form.get("communication")),
        cultureFit: Number(form.get("cultureFit")),
        missionAlignment: Number(form.get("missionAlignment")),
        strengths: form.get("strengths") as string,
        concerns: form.get("concerns") as string,
        recommendation: form.get("recommendation") as string as Recommendation,
      });
      router.back();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingSelect = (name: string, label: string) => (
    <div><Label htmlFor={name}>{label}</Label><select name={name} id={name} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="1">1 — Poor</option><option value="2">2 — Below Average</option><option value="3">3 — Average</option><option value="4">4 — Strong</option><option value="5">5 — Exceptional</option></select></div>
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Interview Evaluation</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {ratingSelect("overallRating", "Overall Rating")}
          <div className="grid grid-cols-2 gap-4">
            {ratingSelect("technicalSkills", "Technical Skills")}
            {ratingSelect("communication", "Communication")}
            {ratingSelect("cultureFit", "Culture Fit")}
            {ratingSelect("missionAlignment", "Mission Alignment")}
          </div>
          <div><Label htmlFor="strengths">Strengths</Label><Textarea id="strengths" name="strengths" required rows={3} placeholder="What stood out positively?" /></div>
          <div><Label htmlFor="concerns">Concerns</Label><Textarea id="concerns" name="concerns" required rows={3} placeholder="Any areas of concern?" /></div>
          <div><Label htmlFor="recommendation">Recommendation</Label><select name="recommendation" id="recommendation" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="StrongHire">Strong Hire</option><option value="Hire">Hire</option><option value="Neutral">Neutral</option><option value="NoHire">No Hire</option><option value="StrongNoHire">Strong No Hire</option></select></div>
          <div className="flex gap-2"><Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Evaluation"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
