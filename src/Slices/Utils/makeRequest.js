import { BASE_URL } from "./variables";
import axiosInstance from "./axiosInstance";


export const makeRequest = async function (method, endpoint, data, queryParams) {
  try {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await axiosInstance[method](url, {
      ...data,
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const makeRequestFormData = async (
  method,
  endpoint,
  data = {},
  onUploadProgress
) => {
  try {
    const url = `${BASE_URL}/${endpoint}`;
    const config = {
      onUploadProgress,
      headers: { "Content-Type": "multipart/form-data" },
    };

    let response;
    if (method === "get") {
      response = await axiosInstance.get(url, config);
    } else {
      response = await axiosInstance[method](url, data, config);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
