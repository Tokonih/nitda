import { makeRequest } from "../makeRequest";
import { makeRequestFormData } from "../makeRequest";

export const getKpisApi = async ({
  srap_objective_id,
  srap_initiative_id,
  department_id,
  frequency,
  year,
  planned_measurement,
  timeline,
  page,
  approved,
  per_page,
} = {}) => {
  const params = new URLSearchParams();

  if (srap_objective_id) params.append("srap_objective_id", srap_objective_id);
  if (srap_initiative_id)
    params.append("srap_initiative_id", srap_initiative_id);
  if (department_id) params.append("department_id", department_id);
  if (frequency) params.append("frequency", frequency);
  if (year) params.append("year", year);
  if (planned_measurement)
    params.append("planned_measurement", planned_measurement);
  if (timeline) params.append("timeline", timeline);
  if (approved !== undefined) params.append("approved", approved);
  if (per_page) params.append("per_page", per_page);

  const queryString = params.toString();
  const url = queryString ? `kpis?${queryString}&page=${page}` : `kpis?page=${page}`;
  return makeRequest("get", url);
};

export const createKpiApi = async (kpiData) => {
  return makeRequest("post", "kpis", kpiData);
};

export const updateKpiApi = async (kpiId, kpiData) => {
  return makeRequest("put", `kpis/${kpiId}`, kpiData);
};

export const getSingleKpiApi = async (kpiId) => {
  return makeRequest("get", `kpis/${kpiId}`);
};


export const deleteKpiApi = async (kpiId) => {
  return makeRequest("delete", `kpis/${kpiId}`);
};

export const createKpiValueApi = async (kpiData) => {
  return makeRequest("post", "kpi-values", kpiData);
};

export const createKpiValueUploadMonthApi = async (formData) => {
  return makeRequestFormData("post", "kpi-values/upload-month", formData);
};

export const updateKpiValueApi = async (kpiValueId, formData) => {
  return makeRequestFormData("post", `kpi-values/${kpiValueId}/upload-month`, formData);
};

export const getKpiValuesApi = async ({
  kpi_id,
  year,
  quarter,
  department_id,
  verified,
  approval_status,
  per_page = 50,
} = {}) => {
  const params = new URLSearchParams();

  if (kpi_id) params.append("kpi_id", kpi_id);
  if (year) params.append("year", year);
  if (quarter) params.append("quarter", quarter);
  if (department_id) params.append("department_id", department_id);
  if (approval_status) params.append("approval_status", approval_status);
  if (per_page) params.append("per_page", per_page);
  if (verified !== undefined && verified !== null) params.append("verified", verified);

  return makeRequest("get", `kpi-values?${params.toString()}`);
};

export const getKpiOpenPeriodApi = async ({ year, period_type } = {}) => {
  const params = new URLSearchParams();

  if (year) params.append("year", year);
  if (period_type) params.append("period_type", period_type);
  return makeRequest(
    "get",
    `kpis/open-periods?${params.toString()}`
  );
};

export const bulkCloseKpiPeriodsApi = async (data) => {
  return makeRequest("post", "kpis/open-periods/bulk-close", data);
};

export const bulkOpenKpiPeriodsApi = async (data) => {
  return makeRequest("post", "kpis/open-periods/bulk-open", data);
};

export const openKpiPeriodApi = async (kpiId, data) => {
  return makeRequest("post", `kpis/${kpiId}/open-periods/open`, data);
};

export const approveKpiValueApi = async (kpiValueId, data) => {
  return makeRequest("post", `kpi-values/${kpiValueId}/approve-month`, data);
};

export const rejectKpiValueApi = async (kpiValueId, data) => {
  return makeRequest("post", `kpi-values/${kpiValueId}/disapprove-month`, data);
};

export const approveKpiApi = async (kpiId, data) => {
  return makeRequest("post", `kpis/${kpiId}/approve`, data);
};

export const disapproveKpiApi = async (kpiId, data) => {
  return makeRequest("post", `kpis/${kpiId}/disapprove`, data);
};

export const getKpiProgressApi = async ({
  year,
  quarter,
  period_type,
  department_id,
  pillar_id,
} = {}) => {
  const params = new URLSearchParams();

  if (year) params.append("year", year);
  if (quarter) params.append("quarter", quarter);
  if (period_type) params.append("period_type", period_type);
  if (department_id) params.append("department_id", department_id);
  if (pillar_id) params.append("pillar_id", pillar_id);

  return makeRequest("get", `kpis/progress-list?${params.toString()}`);
};

export const getKpiMonthStatusesApi = async ({
  year,
  quarter,
  status,
  kpi_id,
  kpi_value_id,
  department_id,
  page,
  per_page = 15,
} = {}) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year);
  if (quarter) params.append("quarter", quarter);
  if (status && status !== "all") params.append("status", status);
  if (kpi_id) params.append("kpi_id", kpi_id);
  if (kpi_value_id) params.append("kpi_value_id", kpi_value_id);
  if (department_id) params.append("department_id", department_id);
  if (page) params.append("page", page);
  if (per_page) params.append("per_page", per_page);
  return makeRequest("get", `kpi-values/month-statuses?${params.toString()}`);
};

export const updateKpiValueDirectApi = async (kpiValueId, data) => {
  return makeRequestFormData("post", `kpi-values/${kpiValueId}/upload-month-simple`, data);
};

export const bulkApproveKpiMonthsApi = async (data) => {
  return makeRequest("post", "kpi-values/approve-months-bulk", data);
};

export const bulkApproveKpiDefinitionsApi = async (data) => {
  return makeRequest("post", "kpis/approve-bulk", data);
};

export const bulkDisapproveKpiDefinitionsApi = async (data) => {
  return makeRequest("post", "kpis/disapprove-bulk", data);
};
