import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { openPositions: 0, activeCandidates: 0, avgTimeToFill: 0, pendingEvaluations: 0 };
    const jobs = await ctx.db.query("jobPostings").withIndex("by_status", (q) => q.eq("status", "Open")).take(100);
    const apps = await ctx.db.query("applications").take(100);
    const activeApps = apps.filter((a) => !["Rejected", "Withdrawn", "Hired"].includes(a.stage));
    const filledJobs = await ctx.db.query("jobPostings").withIndex("by_status", (q) => q.eq("status", "Filled")).take(100);
    const avgDays = filledJobs.length > 0
      ? Math.round(filledJobs.reduce((sum, j) => sum + ((j.closeDate ?? 0) - (j.openDate ?? 0)) / 86400000, 0) / filledJobs.length)
      : 0;
    const interviews = await ctx.db.query("interviews").withIndex("by_status", (q) => q.eq("status", "Completed")).take(100);
    let pendingEvals = 0;
    for (const interview of interviews) {
      const evals = await ctx.db.query("evaluations").withIndex("by_interviewId", (q) => q.eq("interviewId", interview._id)).take(100);
      if (evals.length < interview.interviewerIds.length) pendingEvals += interview.interviewerIds.length - evals.length;
    }
    return { openPositions: jobs.length, activeCandidates: activeApps.length, avgTimeToFill: avgDays, pendingEvaluations: pendingEvals };
  },
});

export const getRecentApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const apps = await ctx.db.query("applications").order("desc").take(100);
    const recent = apps.filter((a) => a.appliedDate >= cutoff);
    const results = [];
    for (const app of recent) {
      const candidate = await ctx.db.get(app.candidateId);
      const job = await ctx.db.get(app.jobPostingId);
      results.push({ ...app, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown", jobTitle: job?.title ?? "Unknown" });
    }
    return results;
  },
});

export const getUpcomingInterviews = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    const interviews = await ctx.db.query("interviews").withIndex("by_scheduledDate").order("asc").take(100);
    const upcoming = interviews.filter((i) => i.scheduledDate >= now && i.scheduledDate <= weekFromNow && i.status === "Scheduled");
    const results = [];
    for (const interview of upcoming) {
      const app = await ctx.db.get(interview.applicationId);
      if (!app) continue;
      const candidate = await ctx.db.get(app.candidateId);
      const job = await ctx.db.get(app.jobPostingId);
      results.push({ ...interview, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown", jobTitle: job?.title ?? "Unknown" });
    }
    return results;
  },
});

export const getPipelineStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { New: 0, Screening: 0, PhoneScreen: 0, Interview: 0, SecondInterview: 0, Reference: 0, Offer: 0 };
    const apps = await ctx.db.query("applications").take(100);
    const stages = ["New", "Screening", "PhoneScreen", "Interview", "SecondInterview", "Reference", "Offer"];
    const stats: Record<string, number> = {};
    for (const s of stages) stats[s] = apps.filter((a) => a.stage === s).length;
    return stats;
  },
});