import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import {
    registerAPI,
    loginAPI,
    logoutAPI,
    sendOtpAPI,
    verifyOtpAPI,
    resetPasswordOtpAPI,
    resetPasswordAPI,
} from "../utils/authapi";

// ─── State Shape 
const initialState = {
    user: null,
    isAuthenticated: false,
    isVerified: false,
    loading: true,
    error: null,
};

// ─── Reducer 
const AUTH_ACTIONS = {
    REQUEST: "REQUEST",
    SUCCESS: "SUCCESS",
    LOGOUT: "LOGOUT",
    SET_VERIFIED: "SET_VERIFIED",
    SET_ERROR: "SET_ERROR",
    CLEAR_ERROR: "CLEAR_ERROR",
};

function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.REQUEST:
            return { ...state, loading: true, error: null };

        case AUTH_ACTIONS.SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                isAuthenticated: true,
                user: action.payload,
            };

        case AUTH_ACTIONS.SET_VERIFIED:
            return { ...state, isVerified: true };

        case AUTH_ACTIONS.LOGOUT:
            return { ...initialState, loading: false };

        case AUTH_ACTIONS.SET_ERROR:
            return { ...state, loading: false, error: action.payload };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
}

// ─── Context
const AuthContext = createContext(null);

// ─── Provider
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Listen for 401 events fired by the axios interceptor
    useEffect(() => {
        const handle = () => dispatch({ type: AUTH_ACTIONS.LOGOUT });
        window.addEventListener("auth:unauthorised", handle);
        return () => window.removeEventListener("auth:unauthorised", handle);
    }, []);

    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (user && token) {
            dispatch({
                type: AUTH_ACTIONS.SUCCESS,
                payload: JSON.parse(user),
            });
        } else {
            dispatch({
                type: AUTH_ACTIONS.LOGOUT,
            });
        }
    }, []);

    // ── Register ───────────────────────────────────────────────────────────────
    const register = useCallback(async ({ name, email, password }) => {
        dispatch({ type: AUTH_ACTIONS.REQUEST });
        try {
            const data = await registerAPI({ name, email, password });
            if (data.success) {
                dispatch({ type: AUTH_ACTIONS.SUCCESS, payload: { name: data.user, email: data.email } });
                return { success: true, message: data.message };
            }
            const msg = data.errors?.[0] || data.message || "Registration failed";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: msg });
            return { success: false, message: msg };
        } catch (err) {
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: err.message });
            return { success: false, message: err.message };
        }
    }, []);

    // ── Login 
    const login = useCallback(async ({ email, password }) => {
        dispatch({ type: AUTH_ACTIONS.REQUEST });
        try {
            const data = await loginAPI({ email, password });
            if (data.success) {
                const userData = {
                    name: data.user,
                    email: data.email,
                };

                // ✅ store token
                localStorage.setItem("token", data.user.token);

                // ✅ store user
                localStorage.setItem("user", JSON.stringify(userData));

                dispatch({
                    type: AUTH_ACTIONS.SUCCESS,
                    payload: userData,
                });

                return { success: true, message: data.message };
            }
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: data.message });


            return { success: false, message: data.message };
        } catch (err) {
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: err.message });
            return { success: false, message: err.message };
        }
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await logoutAPI();
        } finally {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }, []);

    // ── Send Verification OTP ──────────────────────────────────────────────────
    const sendOtp = useCallback(async () => {
        try {
            const data = await sendOtpAPI();
            return { success: data.success, message: data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }, []);

    // ── Verify OTP ─────────────────────────────────────────────────────────────
    const verifyOtp = useCallback(async (otp) => {
        try {
            const data = await verifyOtpAPI({ otp });
            if (data.success) {
                dispatch({ type: AUTH_ACTIONS.SET_VERIFIED });
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }, []);

    // ── Send Reset-Password OTP ────────────────────────────────────────────────
    const sendResetOtp = useCallback(async (email) => {
        try {
            const data = await resetPasswordOtpAPI({ email });
            return { success: data.success, message: data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }, []);

    // ── Reset Password ─────────────────────────────────────────────────────────
    const resetPassword = useCallback(async ({ email, otp, newPassword }) => {
        try {
            const data = await resetPasswordAPI({ email, otp, newPassword });
            return { success: data.success, message: data.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }, []);

    // ── Clear Error ────────────────────────────────────────────────────────────
    const clearError = useCallback(() => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }, []);

    const value = {
        // State
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
        loading: state.loading,
        error: state.error,
        // Actions
        register,
        login,
        logout,
        sendOtp,
        verifyOtp,
        sendResetOtp,
        resetPassword,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook 
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};

