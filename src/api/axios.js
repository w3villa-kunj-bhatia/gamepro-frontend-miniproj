import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
});

/* ----------------------------------------------------
   Response Interceptor
---------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / server down
    if (!error.response) {
      console.error("Network error");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Unauthorized → session expired / logged out
    if (status === 401) {
      // Do NOT redirect here
      // Let ProtectedRoute handle redirects
      console.warn("Unauthorized request");
    }

    // Forbidden → role / permission issue
    if (status === 403) {
      console.warn("Forbidden request");
    }

    return Promise.reject(error);
  }
);

export default api;
