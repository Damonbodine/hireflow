import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts PascalCase enum values to human-readable strings.
 * "DirectApplication" -> "Direct Application"
 * "FullTime" -> "Full Time"
 * "IndeedNonprofit" -> "Indeed Nonprofit"
 * "InPerson" -> "In Person"
 * "PhoneScreen" -> "Phone Screen"
 * "OnSite" -> "On Site"
 * "NoHire" -> "No Hire"
 * "StrongNoHire" -> "Strong No Hire"
 * "SecondInterview" -> "Second Interview"
 */
export function formatEnum(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
