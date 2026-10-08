import { makeRequest } from "../makeRequest";

export const getUsersApi = async (page) => {
  return makeRequest("get", `users?page=${page}`);
}

export const createUserApi = async (userData) => {
  return makeRequest("post", "auth/register", userData);
};

export const deleteUserApi = async (id) => {  
  return makeRequest("delete", `users/${id}`);
}

export const getSingleUserApi = async (id) => {  
  return makeRequest("get", `users/${id}`);
}

export const updateUserApi = async (id, userData) => {
  return makeRequest("put", `users/${id}`, userData);
}

export const getTrashedUsersApi = async (page) => {
  return makeRequest("get", `users/trashed?per_page=15&page=${page}`);
}

export const restoreUserApi = async (id) => {
  return makeRequest("post", `users/${id}/restore`);
}