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
  hasAccount: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkHasAccount: () => Promise<void> | void;
};

export interface Post {
  id: number;
  text: string;
  created: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface PostContent {
  id: number;
  text: string;
  created: string;
  userId: string;
  username: string;
  displayName: string;
}

export interface PostResponse {
  content: PostContent[];
}

export interface DefaultUser {
  username: string;
  email: string;
  password: string;
  role: string;
  displayName: string;
  bio: string;
  profileImagePath: string;
}

export interface LoginProps {
  onSwitchToSignup: () => void;
}

export interface SignupProps {
  onSwitchToLogin: () => void;
}