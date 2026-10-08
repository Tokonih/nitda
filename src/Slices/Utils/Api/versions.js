import { makeRequest } from "../makeRequest";

export const getVersionsApi = async () => {
    return makeRequest("get", "versions");
};
