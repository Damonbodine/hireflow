import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./authHelpers";

export const listByInterview = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) return [];
    const evals = await ctx.db.query("evaluations").withIndex("by_interviewId", (q) => q.eq("interviewId", args.interviewId)).take(100);
    const currentUser = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier)).unique();
    const allSubmitted = evals.length >= interview.interviewerIds.length;
    if (allSubmitted || (currentUser && (currentUser.role === "HiringAdmin" || currentUser.role === "HiringManager"))) {
      const results = [];
      for (const ev of evals) {
        const evaluator = await ctx.db.get(ev.evaluatorId);
        results.push({ ...ev, evaluatorName: evaluator?.name ?? "Unknown" });
      }
      return results;
    }
    if (currentUser) {
      const ownEval = evals.find((e) => e.evaluatorId === currentUser._id);
      if (ownEval) {
        return [{ ...ownEval, evaluatorName: currentUser.name }];
      }
    }
    return [];
  },
});

export const create = mutation({
  args: {
    interviewId: v.id("interviews"),
    overallRating: v.number(),
    technicalSkills: v.number(),
    communication: v.number(),
    cultureFit: v.number(),
    missionAlignment: v.number(),
    strengths: v.string(),
    concerns: v.string(),
    recommendation: v.union(v.literal("StrongHire"), v.literal("Hire"), v.literal("Neutral"), v.literal("NoHire"), v.literal("StrongNoHire")),
  },
  handler: async (ctx, args) => {
    // Interviewers can create their own evaluations; HiringAdmin has full access
    const user = await requireRole(ctx, ["Interviewer", "HiringAdmin"]);
    const existing = await ctx.db.query("evaluations").withIndex("by_interview_evaluator", (q) => q.eq("interviewId", args.interviewId).eq("evaluatorId", user._id)).unique();
    if (existing) throw new Error("You have already submitted an evaluation for this interview");
    return await ctx.db.insert("evaluations", {
      ...args,
      evaluatorId: user._id,
      submittedDate: Date.now(),
      createdAt: Date.now(),
    });
  },
});
