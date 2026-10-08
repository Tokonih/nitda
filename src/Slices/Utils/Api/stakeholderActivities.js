import { makeRequest, makeRequestFormData } from "../makeRequest";


export const getStakeholderActivitiesApi = async ({
  stakeholder_srap_objective_id,
  department_id,
  frequency,
  year,
  quarter,
  planned_measurement,
  timeline,
  per_page = 15,
  page,
  approved,
} = {}) => {
  const params = new URLSearchParams();

  if (stakeholder_srap_objective_id)
    params.append(
      "stakeholder_srap_objective_id",
      stakeholder_srap_objective_id
    );
  if (department_id) params.append("department_id", department_id);
  if (frequency) params.append("frequency", frequency);
  if (year) params.append("year", year);
  if (quarter && quarter !== "all") params.append("quarter", quarter);
  if (planned_measurement)
    params.append("planned_measurement", planned_measurement);
  if (timeline) params.append("timeline", timeline);
  if (per_page) params.append("per_page", per_page);
  if (page) params.append("page", page);
  // if (approved !== undefined) params.append("approved", approved);

  return makeRequest("get", `stakeholder-activity-values?${params.toString()}`);
};

export const createStakeholderActivityApi = async (data) => {
  return makeRequest("post", "stakeholder-activities", data);
};

export const getSingleStakeholderActivityApi = async (id) => {
  return makeRequest("get", `stakeholder-activities/${id}`);
};

export const updateStakeholderActivityApi = async (id, data) => {
  return makeRequest("put", `stakeholder-activities/${id}`, data);
};

export const deleteStakeholderActivityApi = async (id) => {
  return makeRequest("delete", `stakeholder-activities/${id}`);
};

// API for fetching stakeholder activity VALUES (submitted tracker data)
export const getStakeholderActivityValuesApi = async ({
  stakeholder_activity_id,
  department_id,
  pillar_id,
  verified,
  year,
  quarter,
  page,
  per_page = 15,
} = {}) => {
  const params = new URLSearchParams();

  if (stakeholder_activity_id)
    params.append("stakeholder_activity_id", stakeholder_activity_id);
  if (department_id) params.append("department_id", department_id);
  if (pillar_id) params.append("pillar_id", pillar_id);
  if (verified !== undefined) params.append("verified", verified);
  if (year) params.append("year", year);
  if (quarter && quarter !== "all") params.append("quarter", quarter);
  if (page) params.append("page", page);
  if (per_page) params.append("per_page", per_page);

  return makeRequest("get", `stakeholder-activity-values?${params.toString()}`);
};

export const getSingleStakeholderActivityValueApi = async (id) => {
  return makeRequest("get", `stakeholder-activity-values/${id}`);
};

export const approveStakeholderActivityValueApi = async (id, data) => {
  return makeRequest("post", `stakeholder-activity-values/${id}/approve-month`, data);
};

export const disapproveStakeholderActivityValueApi = async (id, data) => {
  return makeRequest("post", `stakeholder-activity-values/${id}/disapprove-month`, data);
};
export const createStakeholderActivityValueApi = async (data) => {
  return makeRequest("post", "stakeholder-activity-values", data);
};

export const createStakeholderActivityValueUploadMonthApi = async (formData) => {
  return makeRequestFormData("post", "stakeholder-activity-values/upload-reporting-period", formData);
};

export const updateStakeholderActivityValueApi = async (id, data) => {
  return makeRequestFormData("post", `stakeholder-activity-values/${id}/upload-reporting-period`, data);
};

export const deleteStakeholderActivityValueApi = async (id) => {
  return makeRequest("delete", `stakeholder-activity-values/${id}`);
};

export const getStakeholderActivityDashboardApi = async ({ department_id, year, quarter } = {}) => {
  const params = new URLSearchParams();
  if (department_id) params.append("department_id", department_id);
  if (year) params.append("year", year);
  if (quarter && quarter !== "all") params.append("quarter", quarter);

  return makeRequest("get", `stakeholder-activities/dashboard?${params.toString()}`);
};

