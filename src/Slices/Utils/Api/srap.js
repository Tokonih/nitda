import { makeRequest } from "../makeRequest";

export const getSrapApi = async ({
  pillar_id,
  department_id,
  search,
  sort,
  order = "desc",
  per_page = 15,
  page = 1,
} = {}) => {
  const params = new URLSearchParams();

  if (pillar_id) params.append("pillar_id", pillar_id);
  if (department_id) params.append("department_id", department_id);
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort);
  if (order) params.append("order", order);
  if (per_page) params.append("per_page", per_page);
  if (page) params.append("page", page);

  return makeRequest("get", `srap-records?${params.toString()}`);
};

export const createSrapApi = async (srapData) => {
  return makeRequest("post", "srap-records", srapData);
};

export const updateSrapApi = async (srapId, srapData) => {
  return makeRequest("put", `srap-records/${srapId}`, srapData);
};

export const getSingleSrapApi = async (srapId) => {
  return makeRequest("get", `srap-records/${srapId}`);
};

export const deleteSrapApi = async (srapId) => {
  return makeRequest("delete", `srap-records/${srapId}`);
};

// SRAP Initiatives APIs
export const getSrapInitiativesApi = async ({
  area,
  year,
  pillar_id,
  department_id,
  initiative_code,
  visible_to_stakeholders,
  per_page = 15,
} = {}) => {
  const params = new URLSearchParams();

  if (area) params.append("area", area);
  if (year) params.append("year", year);
  if (pillar_id) params.append("pillar_id", pillar_id);
  if (department_id) params.append("department_id", department_id);
  if (initiative_code) params.append("initiative_code", initiative_code);
  if (visible_to_stakeholders !== undefined)
    params.append("visible_to_stakeholders", visible_to_stakeholders);
  if (per_page) params.append("per_page", per_page);

  return makeRequest("get", `srap-initiatives?${params.toString()}`);
};

export const createSrapInitiativeApi = async (initiativeData) => {
  return makeRequest("post", "srap-initiatives", initiativeData);
};

export const updateSrapInitiativeApi = async (
  initiativeId,
  initiativeData
) => {
  return makeRequest("put", `srap-initiatives/${initiativeId}`, initiativeData);
};

export const getSingleSrapInitiativeApi = async (initiativeId) => {
  return makeRequest("get", `srap-initiatives/${initiativeId}`);
};


export const deleteSrapInitiativeApi = async (initiativeId) => {
  return makeRequest("delete", `srap-initiatives/${initiativeId}`);
};
