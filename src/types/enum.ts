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
    username: string;
    displayName: string;
  }

  export interface PostResponse {
    content: PostContent[];
  }  