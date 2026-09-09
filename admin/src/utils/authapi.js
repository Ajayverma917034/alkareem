import axiosInstance from "./axiosInstance";

// ─── Auth API 

// register
export const registerAPI = async (payload) => {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
};

// login
export const loginAPI = async (payload) => {
    const { data } = await axiosInstance.post("/auth/login", payload);
    return data;
};

// logout
export const logoutAPI = async () => {
    const { data } = await axiosInstance.get("/auth/logout");
    return data;
};

// send otp
export const sendOtpAPI = async () => {
    const { data } = await axiosInstance.post("/auth/send-otp");
    return data;
};

// verify otp
export const verifyOtpAPI = async (payload) => {
    const { data } = await axiosInstance.post("/auth/verify-otp", payload);
    return data;
};

// reset password otp
export const resetPasswordOtpAPI = async (payload) => {
    const { data } = await axiosInstance.post("/auth/reset-password-otp", payload);
    return data;
};

// forget password
export const resetPasswordAPI = async (payload) => {
    const { data } = await axiosInstance.post("/auth/reset-password", payload);
    return data;
};



