import axios from "axios";

// ─── Base Instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 10000,
    // withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach any extra headers here if needed (e.g. CSRF token)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Normalise every response so callers always get { success, message, data }
// and handle global errors (401 → redirect to login, 500 → generic message).
axiosInstance.interceptors.response.use(
    (response) => response,           // pass through successful responses as-is
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Something went wrong";

        if (status === 401) {
            // Token expired / unauthorised — clear any local state and go to login
            window.dispatchEvent(new CustomEvent("auth:unauthorised"));
        }

        if (status === 500) {
            console.error("[API 500]", error.response?.data);
        }

        // Reject with a clean error shape so context/components can read it easily
        return Promise.reject({ status, message, raw: error });
    }
);

export default axiosInstance;