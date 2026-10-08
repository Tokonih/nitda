import { makeRequest } from "../makeRequest";

export const getScorecardConfigApi = async () => {
    return makeRequest("get", "stakeholder-scorecard-config");
};

export const updateScorecardConfigApi = async (data) => {
    return makeRequest("put", "stakeholder-scorecard-config", data);
};
