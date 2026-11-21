import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";
    const isAuthCall =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/registration");

    if (status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshRequest =
        refreshRequest ||
        axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
          refreshToken,
        });
      const { data } = await refreshRequest;
      refreshRequest = null;
      const accessToken = data?.data?.accessToken;
      if (!accessToken) {
        throw new Error("Missing access token");
      }
      localStorage.setItem("accessToken", accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      refreshRequest = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      return Promise.reject(refreshError);
    }
  },
);

export function getErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
