import { makeRequest } from "../makeRequest";

export const getPillarsApi = async ({ visible_to_stakeholders, per_page = 15 } = {}) => {
  let url = `pillars?per_page=${per_page}`;
  if (visible_to_stakeholders !== undefined) {
    url += `&visible_to_stakeholders=${visible_to_stakeholders}`;
  }
  return makeRequest("get", url);
};


export const createPillarApi = async (pillarData) => {
  return makeRequest("post", "pillars", pillarData);
};

export const getSinglePillarApi = async (pillarId) => {
  return makeRequest("get", `pillars/${pillarId}`);
};

export const updatePillarApi = async (pillarId, pillarData) => {
  return makeRequest("put", `pillars/${pillarId}`, pillarData);
};

export const deletePillarApi = async (pillarId) => {
  return makeRequest("delete", `pillars/${pillarId}`);
};

export const getPillarEntityCountsApi = async ({ pillarId, year, department_id, visible_to_stakeholders_only }) => {
  let url = `pillars/entity-counts?year=${year}`;
  if (pillarId) {
    url += `&pillar_id=${pillarId}`;
  }
  if (department_id) {
    url += `&department_id=${department_id}`;
  }
  if (visible_to_stakeholders_only) {
    url += `&visible_to_stakeholders_only=true`;
  }
  return makeRequest("get", url);
};

export const getPillarInitiativesProgressApi = async ({
  pillar_id,
  year,
  department_id,
  quarter,
  period_type,
  use_approvals,
} = {}) => {
  const params = new URLSearchParams();
  if (pillar_id) params.append("pillar_id", pillar_id);
  if (year) params.append("year", year);
  if (department_id) params.append("department_id", department_id);
  if (quarter) params.append("quarter", quarter);
  if (period_type) params.append("period_type", period_type);
  if (use_approvals !== undefined) params.append("use_approvals", use_approvals);
  return makeRequest("get", `pillars/initiatives-progress?${params.toString()}`);
};
