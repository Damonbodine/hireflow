import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("Draft"), v.literal("Open"), v.literal("OnHold"), v.literal("Closed"), v.literal("Filled"))),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const postings = args.status
      ? await ctx.db.query("jobPostings").withIndex("by_status", (idx) => idx.eq("status", args.status!)).order("desc").collect()
      : await ctx.db.query("jobPostings").order("desc").collect();
    const results = [];
    for (const posting of postings) {
      if (args.departmentId && posting.departmentId !== args.departmentId) continue;
      const dept = await ctx.db.get(posting.departmentId);
      const apps = await ctx.db.query("applications").withIndex("by_jobPostingId", (q) => q.eq("jobPostingId", posting._id)).collect();
      results.push({ ...posting, departmentName: dept?.name ?? "Unknown", applicantCount: apps.length });
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("jobPostings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const posting = await ctx.db.get(args.id);
    if (!posting) return null;
    const dept = await ctx.db.get(posting.departmentId);
    const apps = await ctx.db.query("applications").withIndex("by_jobPostingId", (q) => q.eq("jobPostingId", posting._id)).collect();
    return { ...posting, departmentName: dept?.name ?? "Unknown", applicantCount: apps.length };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    departmentId: v.id("departments"),
    employmentType: v.union(v.literal("FullTime"), v.literal("PartTime"), v.literal("Contract"), v.literal("Temporary"), v.literal("Internship"), v.literal("AmeriCorps")),
    locationType: v.union(v.literal("OnSite"), v.literal("Remote"), v.literal("Hybrid")),
    location: v.optional(v.string()),
    salaryRangeMin: v.optional(v.number()),
    salaryRangeMax: v.optional(v.number()),
    salaryType: v.union(v.literal("Hourly"), v.literal("Annual"), v.literal("Stipend")),
    description: v.string(),
    qualifications: v.string(),
    applicationDeadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const users = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).collect();
    const user = users[0];
    if (!user) throw new Error("User not found");
    return await ctx.db.insert("jobPostings", {
      ...args,
      createdById: user._id,
      status: "Draft" as const,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("jobPostings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    qualifications: v.optional(v.string()),
    location: v.optional(v.string()),
    salaryRangeMin: v.optional(v.number()),
    salaryRangeMax: v.optional(v.number()),
    applicationDeadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Job posting not found");
    await ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("jobPostings"),
    status: v.union(v.literal("Draft"), v.literal("Open"), v.literal("OnHold"), v.literal("Closed"), v.literal("Filled")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const posting = await ctx.db.get(args.id);
    if (!posting) throw new Error("Job posting not found");
    
    if (args.status === "Open" && (!posting.title || !posting.description || !posting.qualifications)) {
      throw new Error("Job posting must have title, description, and qualifications before opening");
    }
    
    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "Open" && !posting.openDate) updates.openDate = Date.now();
    if (args.status === "Closed" || args.status === "Filled") updates.closeDate = Date.now();
    
    await ctx.db.patch(args.id, updates);
    
    if (args.status === "Filled") {
      const apps = await ctx.db.query("applications").withIndex("by_jobPostingId", (q) => q.eq("jobPostingId", args.id)).collect();
      const preOfferStages = ["New", "Screening", "PhoneScreen", "Interview", "SecondInterview", "Reference"];
      for (const app of apps) {
        if (preOfferStages.includes(app.stage)) {
          await ctx.db.patch(app._id, {
            stage: "Rejected" as const,
            rejectionReason: "PositionFilled" as const,
            stageChangedDate: Date.now(),
          });
        }
      }
    }
  },
});