import { makeRequest } from "../makeRequest";

export const getVersionsApi = async ({ search, per_page, page } = {}) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (per_page) params.append("per_page", per_page);
    if (page) params.append("page", page);

    const queryString = params.toString();
    return makeRequest("get", queryString ? `versions?${queryString}` : "versions");
};

export const getSingleVersionApi = async (id) => {
    return makeRequest("get", `versions/${id}`);
};

export const createVersionApi = async (versionData) => {
    return makeRequest("post", "versions", versionData);
};

export const updateVersionApi = async (id, versionData) => {
    return makeRequest("put", `versions/${id}`, versionData);
};

export const deleteVersionApi = async (id) => {
    return makeRequest("delete", `versions/${id}`);
};
