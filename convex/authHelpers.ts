import { QueryCtx, MutationCtx } from "./_generated/server";

type Role = "HiringAdmin" | "HiringManager" | "Interviewer" | "Recruiter";

/**
 * Resolves the current authenticated user from the database.
 * Throws if not authenticated or user not found.
 */
export async function requireUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Requires the current user to have one of the specified roles.
 * Returns the user record if authorized.
 */
export async function requireRole(ctx: MutationCtx | QueryCtx, allowedRoles: Role[]) {
  const user = await requireUser(ctx);
  if (!allowedRoles.includes(user.role as Role)) {
    throw new Error("Unauthorized: insufficient role");
  }
  return user;
}
