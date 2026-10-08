import { makeRequest } from "../makeRequest";

export const getScoreCardApi = async ({ year } = {}) => {
  const params = new URLSearchParams();

  if (year) params.append("year", year);

  return makeRequest("get", `scorecard/annual?${params.toString()}`);
};



export const getDgScoreCardApi = async ({ year, department_id, quarter } = {}) => {
  const params = new URLSearchParams();

  if (year) params.append("year", year);
  if (department_id) params.append("department_id", department_id);
  if (quarter && quarter !== 'all') {
    const qValue = quarter.toString().replace(/q/i, "");
    params.append("quarter", qValue);
  }

  return makeRequest("get", `scorecard/dg?${params.toString()}`);
};

export const getDgAnnualScoreCardApi = async ({ year, department_id } = {}) => {
  const params = new URLSearchParams();

  if (year) params.append("year", year);
  if (department_id) params.append("department_id", department_id);

  return makeRequest("get", `scorecard/dg-annual?${params.toString()}`);
};
