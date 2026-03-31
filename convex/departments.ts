import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRole } from "./authHelpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("departments").order("desc").take(100);
  },
});

export const getById = query({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    headId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["HiringAdmin"]);
    return await ctx.db.insert("departments", {
      ...args,
      status: "Active" as const,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("departments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    headId: v.optional(v.id("users")),
    status: v.optional(v.union(v.literal("Active"), v.literal("Inactive"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["HiringAdmin"]);
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined)
    );
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Department not found");
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["HiringAdmin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Department not found");
    await ctx.db.delete(args.id);
  },
});
