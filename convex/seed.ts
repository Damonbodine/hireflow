import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("departments").take(1);
    if (existing.length > 0) return;

    const now = Date.now();
    const day = 86400000;

    // Departments
    const programs = await ctx.db.insert("departments", { name: "Programs", description: "Direct service programs and community outreach", status: "Active" as const, createdAt: now });
    const development = await ctx.db.insert("departments", { name: "Development", description: "Fundraising, grant writing, and donor relations", status: "Active" as const, createdAt: now });
    const socialServices = await ctx.db.insert("departments", { name: "Social Services", description: "Case management and client support", status: "Active" as const, createdAt: now });
    const operations = await ctx.db.insert("departments", { name: "Operations", description: "HR, finance, and administrative functions", status: "Active" as const, createdAt: now });

    // Users
    const maria = await ctx.db.insert("users", { clerkId: "clerk_admin_1", email: "maria@hireflow.org", name: "Maria Garcia", role: "HiringAdmin" as const, departmentId: operations, isActive: true, createdAt: now });
    const david = await ctx.db.insert("users", { clerkId: "clerk_manager_1", email: "david@hireflow.org", name: "David Kim", role: "HiringManager" as const, departmentId: programs, isActive: true, createdAt: now });
    const sarah = await ctx.db.insert("users", { clerkId: "clerk_recruiter_1", email: "sarah.j@hireflow.org", name: "Sarah Johnson", role: "Recruiter" as const, departmentId: operations, isActive: true, createdAt: now });
    const james = await ctx.db.insert("users", { clerkId: "clerk_interviewer_1", email: "james@hireflow.org", name: "James Wilson", role: "Interviewer" as const, departmentId: programs, isActive: true, createdAt: now });
    const linda = await ctx.db.insert("users", { clerkId: "clerk_manager_2", email: "linda@hireflow.org", name: "Linda Chen", role: "HiringManager" as const, departmentId: development, isActive: true, createdAt: now });

    // Set department heads
    await ctx.db.patch(programs, { headId: david });
    await ctx.db.patch(development, { headId: linda });

    // Job Postings
    const job1 = await ctx.db.insert("jobPostings", { title: "Program Director", departmentId: programs, createdById: david, employmentType: "FullTime" as const, locationType: "OnSite" as const, location: "Austin, TX", salaryRangeMin: 65000, salaryRangeMax: 80000, salaryType: "Annual" as const, description: "Lead program development and community partnerships for our flagship initiative.", qualifications: "MSW or related degree, 5+ years nonprofit management experience.", status: "Open" as const, openDate: now - 15 * day, createdAt: now - 15 * day });
    const job2 = await ctx.db.insert("jobPostings", { title: "Case Manager", departmentId: socialServices, createdById: maria, employmentType: "FullTime" as const, locationType: "Hybrid" as const, location: "Austin, TX", salaryRangeMin: 42000, salaryRangeMax: 52000, salaryType: "Annual" as const, description: "Provide direct case management services to program participants.", qualifications: "Bachelor degree in social work, 2+ years experience.", status: "Open" as const, openDate: now - 10 * day, createdAt: now - 10 * day });
    const job3 = await ctx.db.insert("jobPostings", { title: "Grant Writer", departmentId: development, createdById: linda, employmentType: "Contract" as const, locationType: "Remote" as const, salaryRangeMin: 45, salaryRangeMax: 65, salaryType: "Hourly" as const, description: "Research and write grant proposals for federal and foundation funding.", qualifications: "Proven track record of successful grant applications.", status: "Draft" as const, createdAt: now - 5 * day });
    const job4 = await ctx.db.insert("jobPostings", { title: "AmeriCorps VISTA Member", departmentId: programs, createdById: david, employmentType: "AmeriCorps" as const, locationType: "OnSite" as const, location: "Austin, TX", salaryType: "Stipend" as const, description: "Capacity building for volunteer management program.", qualifications: "BA/BS degree, passion for service.", status: "Open" as const, openDate: now - 20 * day, createdAt: now - 20 * day });

    // Candidates
    const cand1 = await ctx.db.insert("candidates", { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@email.com", phone: "(512) 555-0142", source: "DirectApplication" as const, tags: ["bilingual", "MSW", "grant-writing"], currentTitle: "Senior Program Manager", currentOrganization: "United Way", createdAt: now - 12 * day });
    const cand2 = await ctx.db.insert("candidates", { firstName: "Michael", lastName: "Torres", email: "mtorres@email.com", phone: "(512) 555-0198", source: "Referral" as const, referredById: sarah, tags: ["veteran", "LCSW"], currentTitle: "Clinical Social Worker", createdAt: now - 10 * day });
    const cand3 = await ctx.db.insert("candidates", { firstName: "Lisa", lastName: "Park", email: "lisa.park@email.com", phone: "(737) 555-0176", source: "LinkedIn" as const, tags: ["fundraising", "data-analysis"], currentTitle: "Development Associate", currentOrganization: "Habitat for Humanity", createdAt: now - 8 * day });
    const cand4 = await ctx.db.insert("candidates", { firstName: "James", lastName: "Brown", email: "jbrown@email.com", phone: "(512) 555-0234", source: "Idealist" as const, tags: ["community-organizing"], currentTitle: "Community Outreach Coordinator", createdAt: now - 6 * day });
    const cand5 = await ctx.db.insert("candidates", { firstName: "Emma", lastName: "Davis", email: "emma.davis@email.com", phone: "(512) 555-0311", source: "IndeedNonprofit" as const, tags: ["grant-writing", "research"], currentTitle: "Grant Specialist", currentOrganization: "City of Austin", createdAt: now - 4 * day });

    // Applications
    const app1 = await ctx.db.insert("applications", { candidateId: cand1, jobPostingId: job1, appliedDate: now - 12 * day, stage: "Interview" as const, stageChangedDate: now - 3 * day, isStarred: true, createdAt: now - 12 * day });
    const app2 = await ctx.db.insert("applications", { candidateId: cand2, jobPostingId: job2, appliedDate: now - 9 * day, stage: "Screening" as const, stageChangedDate: now - 7 * day, isStarred: false, createdAt: now - 9 * day });
    const app3 = await ctx.db.insert("applications", { candidateId: cand3, jobPostingId: job1, appliedDate: now - 7 * day, stage: "PhoneScreen" as const, stageChangedDate: now - 4 * day, isStarred: false, createdAt: now - 7 * day });
    const app4 = await ctx.db.insert("applications", { candidateId: cand4, jobPostingId: job4, appliedDate: now - 3 * day, stage: "New" as const, stageChangedDate: now - 3 * day, isStarred: false, createdAt: now - 3 * day });
    const app5 = await ctx.db.insert("applications", { candidateId: cand5, jobPostingId: job1, appliedDate: now - 14 * day, stage: "Reference" as const, stageChangedDate: now - 1 * day, isStarred: true, createdAt: now - 14 * day });

    // Interviews
    const int1 = await ctx.db.insert("interviews", { applicationId: app1, scheduledDate: now + 1 * day, scheduledTime: "2:00 PM", durationMinutes: 60, interviewType: "Video" as const, location: "Zoom link", interviewerIds: [david, james], status: "Scheduled" as const, createdAt: now - 2 * day });
    const int2 = await ctx.db.insert("interviews", { applicationId: app5, scheduledDate: now - 2 * day, scheduledTime: "10:00 AM", durationMinutes: 45, interviewType: "InPerson" as const, location: "Conference Room A", interviewerIds: [david, linda], status: "Completed" as const, createdAt: now - 5 * day });

    // Evaluations for completed interview
    await ctx.db.insert("evaluations", { interviewId: int2, evaluatorId: david, overallRating: 4, technicalSkills: 4, communication: 5, cultureFit: 4, missionAlignment: 5, strengths: "Excellent grant writing portfolio, strong mission alignment", concerns: "Limited nonprofit management experience", recommendation: "Hire" as const, submittedDate: now - 1 * day, createdAt: now - 1 * day });
    await ctx.db.insert("evaluations", { interviewId: int2, evaluatorId: linda, overallRating: 5, technicalSkills: 5, communication: 4, cultureFit: 5, missionAlignment: 5, strengths: "Outstanding technical skills and research ability", concerns: "None significant", recommendation: "StrongHire" as const, submittedDate: now - 1 * day, createdAt: now - 1 * day });
  },
});