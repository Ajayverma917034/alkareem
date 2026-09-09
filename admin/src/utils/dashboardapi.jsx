import axiosInstance from "./axiosInstance";

/**
 * Fetch all aggregated dashboard statistics from the backend.
 * Returns { stats, charts, recent } — see dashboardController.js for the shape.
 */
export const getDashboardStatsAPI = async () => {
    const { data } = await axiosInstance.get("/dashboard");
    return data; // { success, data: { stats, charts, recent } }
};