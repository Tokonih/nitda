import { makeRequest } from "../makeRequest";

export const getDepartmentApi = async ({ search, per_page = 200, type } = {}) => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (per_page) params.append("per_page", per_page);
  if (type) params.append("type", type);

  return makeRequest("get", `departments?${params.toString()}`);
};

export const createDepartmentApi = async (departmentData) => {  
  return makeRequest("post", "departments", departmentData);
}

export const updateDepartmentApi = async (departmentId, departmentData) => {
  return makeRequest("put", `departments/${departmentId}`, departmentData);
}

export const deleteDepartmentApi = async (departmentId) => {
  return makeRequest("delete", `departments/${departmentId}`);
}   
export const getSingleDepartmentApi = async (departmentId) => {
  return makeRequest("get", `departments/${departmentId}`);
} 