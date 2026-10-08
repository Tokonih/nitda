import { makeRequest, makeRequestFormData } from "../makeRequest";

export const getActivitiesApi = async ({
    srap_objective_id,
    department_id,
    year,
    per_page = 15,
} = {}) => {
    const params = new URLSearchParams();

    if (srap_objective_id) params.append("srap_objective_id", srap_objective_id);
    if (department_id) params.append("department_id", department_id);
    if (year) params.append("year", year);
    if (per_page) params.append("per_page", per_page);

    const queryString = params.toString();
    const url = queryString ? `stakeholder-activities?${queryString}` : `stakeholder-activities`;
    return makeRequest("get", url);
};

export const createActivityApi = async (activityData) => {
    return makeRequest("post", "stakeholder-activities", activityData);
};

export const updateActivityApi = async (activityId, activityData) => {
    return makeRequest("put", `stakeholder-activities/${activityId}`, activityData);
};

export const deleteActivityApi = async (activityId) => {
    return makeRequest("delete", `stakeholder-activities/${activityId}`);
};

export const getSingleActivityApi = async (activityId) => {
    return makeRequest("get", `stakeholder-activities/${activityId}`);
};

/**
 * POST /stakeholder-activity-values/upload-month
 * Creates a new stakeholder activity value.
 * Sends form-data with: pillar_id, month, value, reporting_period, year, remarks, evidence/evidences (files)
 */
export const uploadMonthActivityValueApi = async (formData) => {
    return makeRequestFormData(
        "post",
        `stakeholder-activity-values/upload-month`,
        formData
    );
};

/**
 * POST /stakeholder-activity-values/{stakeholder_activity_value_id}/upload-month
 * Updates an existing stakeholder activity value.
 * Sends form-data with: pillar_id, month, value, reporting_period, year, remarks, evidence/evidences (files)
 */
export const updateMonthActivityValueApi = async (stakeholderActivityValueId, formData) => {
    return makeRequestFormData(
        "post",
        `stakeholder-activity-values/${stakeholderActivityValueId}/upload-month`,
        formData
    );
};
