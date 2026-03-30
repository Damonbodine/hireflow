import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const all = await ctx.db.query("candidates").order("desc").collect();
    if (!args.search) return all;
    const s = args.search.toLowerCase();
    return all.filter((c) =>
      c.firstName.toLowerCase().includes(s) ||
      c.lastName.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.tags.some((t) => t.toLowerCase().includes(s))
    );
  },
});

export const getById = query({
  args: { id: v.id("candidates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    source: v.union(v.literal("DirectApplication"), v.literal("Referral"), v.literal("LinkedIn"), v.literal("IndeedNonprofit"), v.literal("Idealist"), v.literal("JobBoard"), v.literal("Internal"), v.literal("Other")),
    linkedInUrl: v.optional(v.string()),
    currentTitle: v.optional(v.string()),
    currentOrganization: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("candidates", {
      ...args,
      tags: args.tags ?? [],
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("candidates"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    currentTitle: v.optional(v.string()),
    currentOrganization: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Candidate not found");
    await ctx.db.patch(id, updates);
  },
});