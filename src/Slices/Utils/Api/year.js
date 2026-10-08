import { makeRequest } from "../makeRequest";

export const getYearsApi = async ({ search, per_page, page, all, is_active } = {}) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (per_page) params.append("per_page", per_page);
    if (page) params.append("page", page);
    if (all) params.append("all", all);
    if (is_active) params.append("is_active", is_active);

    const queryString = params.toString();
    return makeRequest("get", queryString ? `years?${queryString}` : "years");
};

export const getSingleYearApi = async (id) => {
    return makeRequest("get", `years/${id}`);
};

export const createYearApi = async (yearData) => {
    return makeRequest("post", "years", yearData);
};

export const updateYearApi = async (id, yearData) => {
    return makeRequest("put", `years/${id}`, yearData);
};

export const deleteYearApi = async (id) => {
    return makeRequest("delete", `years/${id}`);
};
