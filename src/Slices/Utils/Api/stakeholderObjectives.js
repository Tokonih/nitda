import { makeRequest } from "../makeRequest";
import axios from "../axiosInstance";

// Get all stakeholder objectives
export const getStakeholderObjectivesApi = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });

  return makeRequest("get", `srap-objectives/stakeholders?${queryParams.toString()}`);
};

// Create stakeholder objective
export const createStakeholderObjectivesApi = async (payload) => {
  try {
    const response = await axios.post(`/srap-objectives/stakeholders`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update stakeholder objective
export const updateStakeholderObjectiveApi = async (id, payload) => {
  try {
    const response = await axios.put(
      `/srap-objectives/stakeholders/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete stakeholder objective
export const deleteStakeholderObjectiveApi = async (id) => {
  try {
    const response = await axios.delete(`/srap-objectives/stakeholders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

