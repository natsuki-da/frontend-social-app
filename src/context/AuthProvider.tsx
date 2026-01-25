import {ReactNode, useMemo, useState} from "react";
import api from "../api/api";
import {AuthContext} from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

type AppRole = "ADMIN" | "USER" | null;

const normalizeRoleToken = (scope: unknown): AppRole => {
    if (typeof scope !== "string") return null;
    const s = scope.toUpperCase();

    if (s.includes("ROLE_ADMIN")) return "ADMIN";
    if (s.includes("ROLE_USER")) return "USER";
    return null;
};

const decodeJwtPayload = (token: string): any | null => {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

        const json = decodeURIComponent(
            atob(padded)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );

        return JSON.parse(json);
    } catch {
        return null;
    }
};

const getRoleFromToken = (token: string | null): AppRole => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return normalizeRoleToken(payload?.scope);
};

export const AuthProvider = ({children}: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

    const [userId, setUserId] = useState<number | null>(() => {
        const stored = localStorage.getItem("userId");
        return stored ? Number(stored) : null;
    });

    const [role, setRole] = useState<AppRole>(() => getRoleFromToken(localStorage.getItem("token")));

    const [hasAccount, setHasAccount] = useState<boolean>(false);

    const login = async (username: string, password: string) => {
        const response = await api.post("/request-token", {username, password});

        const token = response.data.token as string;
        const userId = Number(response.data.userId);

        const role = getRoleFromToken(token);

        localStorage.setItem("token", token);
        localStorage.setItem("userId", String(userId));
        if (role) localStorage.setItem("userRole", role);
        else localStorage.removeItem("userRole");

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

    const value = useMemo(
        () => ({
            token,
            userId,
            role,
            hasAccount,
            login,
            logout,
            checkHasAccount,
        }),
        [token, userId, role, hasAccount]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
