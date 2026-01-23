import {ReactNode, useState} from "react";
import api from "../api/api";
import {AuthContext} from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({children}: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("token")
    );

    const [userId, setUserId] = useState<number | null>(() => {
        const stored = localStorage.getItem("userId");
        return stored ? Number(stored) : null;
    });

    const [role, setRole] = useState<"ADMIN" | "USER" | null>(() => {
        const storedRole = localStorage.getItem("userRole");
        return storedRole === "ADMIN" || storedRole === "USER" ? storedRole : null;
    });

    const [hasAccount, setHasAccount] = useState<boolean>(false);

    const login = async (username: string, password: string) => {
        const response = await api.post("/request-token", {username, password});

        const token = response.data.token;
        const userId = Number(response.data.userId);

        const rawRole = response.data.userRole;
        const role =
            rawRole === "ROLE_ADMIN"
                ? "ADMIN"
                : rawRole === "ROLE_USER"
                    ? "USER"
                    : rawRole;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", String(userId));
        localStorage.setItem("userRole", role);

        setToken(token);
        setUserId(userId);
        setRole(role);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        setRole(null);

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
    };

    const checkHasAccount = () => {
        setHasAccount(true);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                userId,
                role,
                hasAccount,
                login,
                logout,
                checkHasAccount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
