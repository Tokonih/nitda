import { makeRequest } from "../makeRequest";

export const getPermissionApi = async () => {
  return makeRequest("get", "permissions?per_page=56");
};

export const getRolePermissionsApi = async (roleId) => {
  return makeRequest("get", `roles/${roleId}/permissions`);
};
