import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "expire offers",
  { hours: 1 },
  internal.offers.expireOffers,
);

export default crons;
