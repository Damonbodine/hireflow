import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const offers = await ctx.db.query("offers").order("desc").collect();
    const results = [];
    for (const offer of offers) {
      const app = await ctx.db.get(offer.applicationId);
      if (!app) continue;
      const candidate = await ctx.db.get(app.candidateId);
      const job = await ctx.db.get(app.jobPostingId);
      results.push({ ...offer, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown", jobTitle: job?.title ?? "Unknown" });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const offer = await ctx.db.get(args.id);
    if (!offer) return null;
    const app = await ctx.db.get(offer.applicationId);
    const candidate = app ? await ctx.db.get(app.candidateId) : null;
    const job = app ? await ctx.db.get(app.jobPostingId) : null;
    return { ...offer, candidateName: candidate ? candidate.firstName + " " + candidate.lastName : "Unknown", jobTitle: job?.title ?? "Unknown" };
  },
});

export const getByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const offers = await ctx.db.query("offers").withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId)).collect();
    return offers[0] ?? null;
  },
});

export const create = mutation({
  args: {
    applicationId: v.id("applications"),
    proposedTitle: v.string(),
    proposedSalary: v.number(),
    salaryType: v.union(v.literal("Hourly"), v.literal("Annual"), v.literal("Stipend")),
    startDate: v.number(),
    expirationDate: v.number(),
    benefits: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const users = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).collect();
    const user = users[0];
    if (!user) throw new Error("User not found");
    const now = Date.now();
    return await ctx.db.insert("offers", {
      ...args,
      offerDate: now,
      status: "Draft" as const,
      createdById: user._id,
      createdAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("offers"),
    status: v.union(v.literal("Draft"), v.literal("Extended"), v.literal("Accepted"), v.literal("Declined"), v.literal("Expired"), v.literal("Rescinded")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const offer = await ctx.db.get(args.id);
    if (!offer) throw new Error("Offer not found");
    await ctx.db.patch(args.id, { status: args.status });
    if (args.status === "Accepted") {
      await ctx.db.patch(offer.applicationId, { stage: "Hired" as const, stageChangedDate: Date.now() });
    }
  },
});
export const expireOffers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const extendedOffers = await ctx.db
      .query("offers")
      .withIndex("by_status", (q) => q.eq("status", "Extended"))
      .collect();
    for (const offer of extendedOffers) {
      if (offer.expirationDate < now) {
        await ctx.db.patch(offer._id, { status: "Expired" as const });
      }
    }
  },
});
