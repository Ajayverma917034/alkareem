import { createContext, useContext, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Rehydrate from localStorage on reload
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("auth_user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    // Login
    const login = (userData) => {
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("auth_user");
        setUser(null);
    };

    // Sync latest user from backend
    const syncUser = async () => {
        try {
            const res = await api.get("/auth/me"); // change API route if needed
            const latestUser = res.data?.user;

            if (!latestUser) return null;

            const oldUser = localStorage.getItem("auth_user");
            const oldParsed = oldUser ? JSON.parse(oldUser) : null;

            // Update only if changed
            if (JSON.stringify(oldParsed) !== JSON.stringify(latestUser)) {
                localStorage.setItem("auth_user", JSON.stringify(latestUser));
                setUser(latestUser);
            }

            return latestUser;
        } catch (error) {
            console.error("Sync user failed:", error);

            // Optional: auto logout on unauthorized
            if (error.response?.status === 401) {
                logout();
            }

            return null;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                syncUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);