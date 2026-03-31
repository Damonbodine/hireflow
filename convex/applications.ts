import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole, requireUser } from "./authHelpers";

export const listByJobPosting = query({
  args: { jobPostingId: v.id("jobPostings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const apps = await ctx.db.query("applications").withIndex("by_jobPostingId", (q) => q.eq("jobPostingId", args.jobPostingId)).order("desc").take(100);
    const results = [];
    for (const app of apps) {
      const candidate = await ctx.db.get(app.candidateId);
      results.push({ ...app, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown" });
    }
    return results;
  },
});

export const listByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const apps = await ctx.db.query("applications").withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId)).order("desc").take(100);
    const results = [];
    for (const app of apps) {
      const job = await ctx.db.get(app.jobPostingId);
      results.push({ ...app, jobTitle: job?.title ?? "Unknown" });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const app = await ctx.db.get(args.id);
    if (!app) return null;
    const candidate = await ctx.db.get(app.candidateId);
    const job = await ctx.db.get(app.jobPostingId);
    return { ...app, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown", jobTitle: job?.title ?? "Unknown" };
  },
});

export const create = mutation({
  args: {
    candidateId: v.id("candidates"),
    jobPostingId: v.id("jobPostings"),
    coverLetterText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Recruiter", "HiringAdmin"]);
    const existing = await ctx.db.query("applications").withIndex("by_jobPosting_stage", (q) => q.eq("jobPostingId", args.jobPostingId)).take(100);
    const activeApp = existing.find((a) => a.candidateId === args.candidateId && a.stage !== "Rejected" && a.stage !== "Withdrawn");
    if (activeApp) throw new Error("This candidate already has an active application for this position");
    const now = Date.now();
    return await ctx.db.insert("applications", {
      ...args,
      appliedDate: now,
      stage: "New" as const,
      stageChangedDate: now,
      isStarred: false,
      createdAt: now,
    });
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("applications"),
    stage: v.union(v.literal("New"), v.literal("Screening"), v.literal("PhoneScreen"), v.literal("Interview"), v.literal("SecondInterview"), v.literal("Reference"), v.literal("Offer"), v.literal("Hired"), v.literal("Rejected"), v.literal("Withdrawn")),
    rejectionReason: v.optional(v.union(v.literal("NotQualified"), v.literal("PositionFilled"), v.literal("CultureFit"), v.literal("SalaryMismatch"), v.literal("WithdrewApplication"), v.literal("NoResponse"), v.literal("Other"))),
    rejectionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["HiringManager", "HiringAdmin"]);
    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("Application not found");

    if (args.stage === "Interview" || args.stage === "SecondInterview") {
      const interviews = await ctx.db.query("interviews").withIndex("by_applicationId", (q) => q.eq("applicationId", args.id)).take(100);
      if (interviews.length === 0) throw new Error("At least one interview must be scheduled before moving to Interview stage");
    }

    if (args.stage === "Offer") {
      const interviews = await ctx.db.query("interviews").withIndex("by_applicationId", (q) => q.eq("applicationId", args.id)).take(100);
      let hasEval = false;
      for (const interview of interviews) {
        const evals = await ctx.db.query("evaluations").withIndex("by_interviewId", (q) => q.eq("interviewId", interview._id)).take(100);
        if (evals.length > 0) { hasEval = true; break; }
      }
      if (!hasEval) throw new Error("At least one evaluation must be submitted before moving to Offer stage");
    }

    const updates: Record<string, unknown> = { stage: args.stage, stageChangedDate: Date.now() };
    if (args.rejectionReason) updates.rejectionReason = args.rejectionReason;
    if (args.rejectionNotes) updates.rejectionNotes = args.rejectionNotes;
    await ctx.db.patch(args.id, updates);
  },
});

export const toggleStar = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("Application not found");
    await ctx.db.patch(args.id, { isStarred: !app.isStarred });
  },
});

export const updateScreeningNotes = mutation({
  args: { id: v.id("applications"), screeningNotes: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Recruiter", "HiringManager", "HiringAdmin"]);
    const app = await ctx.db.get(args.id);
    if (!app) throw new Error("Application not found");
    await ctx.db.patch(args.id, { screeningNotes: args.screeningNotes });
  },
});
