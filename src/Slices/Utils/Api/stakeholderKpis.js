import axios from "../axiosInstance";

// Get all stakeholder KPIs for an objective
export const getStakeholderKpisApi = async (params) => {
  try {
    const response = await axios.get(
      `/stakeholder-srap-kpis/objective/${params.stakeholder_srap_objective_id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create stakeholder KPI
export const createStakeholderKpiApi = async (payload) => {
  try {
    const response = await axios.post(`/stakeholder-srap-kpis`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update stakeholder KPI
export const updateStakeholderKpiApi = async (id, payload) => {
  try {
    const response = await axios.put(`/stakeholder-srap-kpis/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete stakeholder KPI
export const deleteStakeholderKpiApi = async (id) => {
  try {
    const response = await axios.delete(`/stakeholder-srap-kpis/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
