import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network error");
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      console.warn("Unauthorized request");
    }

    if (status === 403) {
      console.warn("Forbidden request");
    }

    return Promise.reject(error);
  },
);

export default api;
