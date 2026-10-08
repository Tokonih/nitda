import { makeRequest } from "../makeRequest";
import { makeRequestFormData } from "../makeRequest";

export const getPublicSummary = async ({ year, period_type, limit, offset, quarter, month } = {}) => {
  const params = new URLSearchParams();

  if (year !== undefined) params.append("year", year);
  if (limit !== undefined) params.append("limit", limit);

  return makeRequest("get", `public-landing-stats?${params.toString()}`);
};

export const getPublicLandingConfig = async () => {
  return makeRequest("get", "public-landing-config");
};

export const getPublicScorecard = async ({ year, period_type, quarter } = {}) => {
  const params = new URLSearchParams();

  if (year !== undefined) params.append("year", year);
  if (period_type !== undefined) params.append("period_type", period_type);
  if (quarter !== undefined) params.append("quarter", quarter);

  return makeRequest("get", `scorecard/stakeholders?${params.toString()}`);
};

export const getOverallPerformance = async ({ year, period_type, quarter } = {}) => {
  const params = new URLSearchParams();

  if (year !== undefined) params.append("year", year);
  if (period_type !== undefined) params.append("period_type", period_type);
  if (quarter !== undefined) params.append("quarter", quarter);

  return makeRequest("get", `pillars/overall-performance-public?${params.toString()}`);
};
