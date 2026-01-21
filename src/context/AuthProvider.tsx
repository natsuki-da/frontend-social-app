import { ReactNode, useState } from "react";
import api from "../api/api";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
  }

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userId, setUserId] = useState<number | null>(() => {
        const stored = localStorage.getItem("userId");
        return stored ? Number(stored) : null;
    });
    const [role, setRole] = useState<"ADMIN" | "USER" | null>(() => {
        const storedRole = localStorage.getItem("role");
        return storedRole === "ADMIN" || storedRole === "USER" ? storedRole : null;
      });
      const [hasAccount, setHasAccount] = useState<boolean>(false);

    const login = async (username: string, password: string) => {
        try{
            const response = await api.post("/request-token", {username, password});
            const token = response.data.token;
            const userId = Number(response.data.userId);
            const userRole = response.data.userRole;
            console.log(response.data);
            localStorage.setItem("token", token);
            localStorage.setItem("userId", String(userId));
            localStorage.setItem("userRole", userRole)
            setToken(token);
            setUserId(userId);
            setRole(userRole);
        } catch(error){
            console.error("Login failed!", error)
        }
    };

    const logout = () => {
        setToken(null);
        setUserId(null);

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
    };

    const checkHasAccount = () => {
        setHasAccount(true);
    };

    return (
        <AuthContext.Provider value={{token, userId, role, hasAccount, login, logout, checkHasAccount}}>
            {children}
        </AuthContext.Provider>
    )
}