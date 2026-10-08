import { makeRequest } from "../makeRequest";

export const Login = async (credentials) => {
  return makeRequest("post", "auth/login", credentials);
}