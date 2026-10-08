import { makeRequest } from "../makeRequest";

export const getObjectivesApi = async ({
  srap_initiative_id,
  verified,
  objective_code,
  year,
  locked,
  department_id,
  visible_to_stakeholders,
  per_page = 15,
} = {}) => {
  const params = new URLSearchParams();

  if (srap_initiative_id)
    params.append("srap_initiative_id", srap_initiative_id);
  if (verified) params.append("verified", verified);
  if (objective_code) params.append("objective_code", objective_code);
  if (year) params.append("year", year);
  if (locked) params.append("locked", locked);
  if (department_id) params.append("department_id", department_id);
  if (visible_to_stakeholders !== undefined)
    params.append("visible_to_stakeholders", visible_to_stakeholders);
  if (per_page) params.append("per_page", per_page);

  return makeRequest("get", `srap-objectives?${params.toString()}`);
};

export const createObjectivesApi = async (data) => {
  return makeRequest("post", "srap-objectives", data);
};

export const deleteObjectiveApi = async (id) => {
  return makeRequest("delete", `srap-objectives/${id}`);
};

export const getSingleObjectiveApi = async (id) => {
  return makeRequest("get", `srap-objectives/${id}`);
};

export const updateObjectiveApi = async (id, data) => {
  return makeRequest("put", `srap-objectives/${id}`, data);
};

export const bulkUpdateObjectiveVisibilityApi = async (data) => {
  return makeRequest("post", "srap-objectives/bulk-update-visibility", data);
};


