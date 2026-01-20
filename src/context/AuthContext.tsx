import { createContext } from "react";
import { AuthContextType } from "../types/enum";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);