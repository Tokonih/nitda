import { makeRequest } from "../makeRequest";

export const submitFeedback = async (data) =>
  makeRequest("post", "feedback", data);

export const getFeedbackList = async ({ status, category, per_page = 15, page = 1, search } = {}) => {
  const params = new URLSearchParams();
  if (status)   params.append("status",   status);
  if (category) params.append("category", category);
  if (per_page) params.append("per_page", per_page);
  if (page)     params.append("page",     page);
  if (search)   params.append("search",   search);
  return makeRequest("get", `feedback?${params.toString()}`);
};

export const getFeedbackById = async (id) =>
  makeRequest("get", `feedback/${id}`);

export const updateFeedbackStatus = async (id, status) =>
  makeRequest("patch", `feedback/${id}`, { status });
