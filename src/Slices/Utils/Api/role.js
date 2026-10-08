import { makeRequest } from "../makeRequest";

// export const getRolesApi = async () => {
//   return makeRequest("get", "roles?per_page=15");
// }

export const getRolesApi = async ({ page = 1, per_page = 15, search } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("per_page", per_page);
  if (search) params.append("search", search);

  return makeRequest("get", `roles?${params.toString()}`);
};


export const createRoleApi = async (roleData) => {
  return makeRequest("post", "roles", roleData);
}

export const getSingleRoleApi = async (roleId) => {
  return makeRequest("get", `roles/${roleId}`);
} 

export const updateRoleApi = async (roleId, roleData) => {
  return makeRequest("put", `roles/${roleId}`, roleData);
}

export const deleteRoleApi = async (roleId) => {
  return makeRequest("delete", `roles/${roleId}`);
}