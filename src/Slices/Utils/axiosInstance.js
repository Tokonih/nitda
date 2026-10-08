import axios from "axios";
import { BASE_URL } from "./variables";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

import { toast } from "sonner";

export const setupAxiosInterceptors = (store, logoutAction) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Prevent infinite loops or multiple transitions if many requests fail at once
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          if (logoutAction) {
            store.dispatch(logoutAction());
          }
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
