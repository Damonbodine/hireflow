import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./authHelpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const interviews = await ctx.db.query("interviews").withIndex("by_scheduledDate").order("desc").take(50);
    const results = [];
    for (const interview of interviews) {
      const app = await ctx.db.get(interview.applicationId);
      if (!app) continue;
      const candidate = await ctx.db.get(app.candidateId);
      const job = await ctx.db.get(app.jobPostingId);
      const interviewerNames = [];
      for (const uid of interview.interviewerIds) {
        const u = await ctx.db.get(uid);
        if (u) interviewerNames.push(u.name);
      }
      results.push({ ...interview, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown", jobTitle: job?.title ?? "Unknown", interviewerNames });
    }
    return results;
  },
});

export const listByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const interviews = await ctx.db.query("interviews").withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId)).order("desc").take(100);
    const results = [];
    for (const interview of interviews) {
      const interviewerNames = [];
      for (const uid of interview.interviewerIds) {
        const u = await ctx.db.get(uid);
        if (u) interviewerNames.push(u.name);
      }
      results.push({ ...interview, interviewerNames });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    applicationId: v.id("applications"),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    durationMinutes: v.number(),
    interviewType: v.union(v.literal("Phone"), v.literal("Video"), v.literal("InPerson"), v.literal("Panel")),
    location: v.optional(v.string()),
    interviewerIds: v.array(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["HiringManager", "Recruiter", "HiringAdmin"]);
    return await ctx.db.insert("interviews", {
      ...args,
      status: "Scheduled" as const,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.union(v.literal("Scheduled"), v.literal("Completed"), v.literal("Cancelled"), v.literal("NoShow")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["HiringManager", "Recruiter", "HiringAdmin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Interview not found");
    await ctx.db.patch(args.id, { status: args.status });
  },
});
