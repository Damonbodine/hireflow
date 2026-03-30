import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  departments: defineTable({
    name: v.string(),
    description: v.string(),
    headId: v.optional(v.id("users")),
    status: v.union(v.literal("Active"), v.literal("Inactive")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("HiringAdmin"),
      v.literal("HiringManager"),
      v.literal("Interviewer"),
      v.literal("Recruiter"),
    ),
    departmentId: v.optional(v.id("departments")),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_departmentId", ["departmentId"]),

  jobPostings: defineTable({
    title: v.string(),
    departmentId: v.id("departments"),
    createdById: v.id("users"),
    employmentType: v.union(
      v.literal("FullTime"),
      v.literal("PartTime"),
      v.literal("Contract"),
      v.literal("Temporary"),
      v.literal("Internship"),
      v.literal("AmeriCorps"),
    ),
    locationType: v.union(
      v.literal("OnSite"),
      v.literal("Remote"),
      v.literal("Hybrid"),
    ),
    location: v.optional(v.string()),
    salaryRangeMin: v.optional(v.number()),
    salaryRangeMax: v.optional(v.number()),
    salaryType: v.union(
      v.literal("Hourly"),
      v.literal("Annual"),
      v.literal("Stipend"),
    ),
    description: v.string(),
    qualifications: v.string(),
    applicationDeadline: v.optional(v.number()),
    status: v.union(
      v.literal("Draft"),
      v.literal("Open"),
      v.literal("OnHold"),
      v.literal("Closed"),
      v.literal("Filled"),
    ),
    openDate: v.optional(v.number()),
    closeDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_departmentId", ["departmentId"])
    .index("by_status", ["status"])
    .index("by_createdById", ["createdById"]),

  candidates: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    linkedInUrl: v.optional(v.string()),
    currentTitle: v.optional(v.string()),
    currentOrganization: v.optional(v.string()),
    resumeFileName: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    source: v.union(
      v.literal("DirectApplication"),
      v.literal("Referral"),
      v.literal("LinkedIn"),
      v.literal("IndeedNonprofit"),
      v.literal("Idealist"),
      v.literal("JobBoard"),
      v.literal("Internal"),
      v.literal("Other"),
    ),
    referredById: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_source", ["source"]),

  applications: defineTable({
    candidateId: v.id("candidates"),
    jobPostingId: v.id("jobPostings"),
    appliedDate: v.number(),
    stage: v.union(
      v.literal("New"),
      v.literal("Screening"),
      v.literal("PhoneScreen"),
      v.literal("Interview"),
      v.literal("SecondInterview"),
      v.literal("Reference"),
      v.literal("Offer"),
      v.literal("Hired"),
      v.literal("Rejected"),
      v.literal("Withdrawn"),
    ),
    stageChangedDate: v.number(),
    coverLetterText: v.optional(v.string()),
    screeningNotes: v.optional(v.string()),
    rejectionReason: v.optional(
      v.union(
        v.literal("NotQualified"),
        v.literal("PositionFilled"),
        v.literal("CultureFit"),
        v.literal("SalaryMismatch"),
        v.literal("WithdrewApplication"),
        v.literal("NoResponse"),
        v.literal("Other"),
      ),
    ),
    rejectionNotes: v.optional(v.string()),
    isStarred: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_candidateId", ["candidateId"])
    .index("by_jobPostingId", ["jobPostingId"])
    .index("by_stage", ["stage"])
    .index("by_jobPosting_stage", ["jobPostingId", "stage"]),

  interviews: defineTable({
    applicationId: v.id("applications"),
    scheduledDate: v.number(),
    scheduledTime: v.string(),
    durationMinutes: v.number(),
    interviewType: v.union(
      v.literal("Phone"),
      v.literal("Video"),
      v.literal("InPerson"),
      v.literal("Panel"),
    ),
    location: v.optional(v.string()),
    interviewerIds: v.array(v.id("users")),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Cancelled"),
      v.literal("NoShow"),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_status", ["status"])
    .index("by_scheduledDate", ["scheduledDate"]),

  evaluations: defineTable({
    interviewId: v.id("interviews"),
    evaluatorId: v.id("users"),
    overallRating: v.number(),
    technicalSkills: v.number(),
    communication: v.number(),
    cultureFit: v.number(),
    missionAlignment: v.number(),
    strengths: v.string(),
    concerns: v.string(),
    recommendation: v.union(
      v.literal("StrongHire"),
      v.literal("Hire"),
      v.literal("Neutral"),
      v.literal("NoHire"),
      v.literal("StrongNoHire"),
    ),
    submittedDate: v.number(),
    createdAt: v.number(),
  })
    .index("by_interviewId", ["interviewId"])
    .index("by_evaluatorId", ["evaluatorId"])
    .index("by_interview_evaluator", ["interviewId", "evaluatorId"]),

  offers: defineTable({
    applicationId: v.id("applications"),
    proposedTitle: v.string(),
    proposedSalary: v.number(),
    salaryType: v.union(
      v.literal("Hourly"),
      v.literal("Annual"),
      v.literal("Stipend"),
    ),
    startDate: v.number(),
    offerDate: v.number(),
    expirationDate: v.number(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Extended"),
      v.literal("Accepted"),
      v.literal("Declined"),
      v.literal("Expired"),
      v.literal("Rescinded"),
    ),
    benefits: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdById: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_status", ["status"])
    .index("by_createdById", ["createdById"]),
});