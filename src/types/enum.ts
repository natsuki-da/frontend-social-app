export enum Paths {
    HOME = "/",
    SIGNUP = "/signup",
    LOGIN = "/login",
    FEED = "/feed"
}

export interface AuthContextType {
    token: string | null;
    userId: string | null;
    role: "ADMIN" | "USER" | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
  }