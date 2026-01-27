import axios, {
    AxiosHeaders,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
// sparar tokens in memory
let accessToken: string | null = null;

export const tokenStore = {
    get: () => accessToken ?? localStorage.getItem("token"),
    set: (token: string | null) => {
        accessToken = token;
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    },
    getRefresh: () => localStorage.getItem("refreshToken"),
    setRefresh: (token: string | null) => {
        if (token) localStorage.setItem("refreshToken", token);
        else localStorage.removeItem("refreshToken");
    },
    clear: () => {
        accessToken = null;
        localStorage.removeItem("token");
    },
};

class ApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private refreshQueue: {
        resolve: (token: string) => void;
        reject: (err: any) => void;
    } [] = [];

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL as string,
            withCredentials: true,
        });

        this.client.interceptors.request.use(this.attachAuthToken);
        this.client.interceptors.response.use(
            (res) => res,
            this.handleAuthError
        );
    }

    private attachAuthToken = (config: InternalAxiosRequestConfig) => {
        const token = tokenStore.get();

        // In Axios v1, headers iss AxiosHeaders-like. Ensure it's an AxiosHeaders instance:
        if (!(config.headers instanceof AxiosHeaders)) {
            config.headers = new AxiosHeaders(config.headers);
        }

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        } else {
            config.headers.delete("Authorization");
        }

        return config;
    };

    private handleAuthError = async (error: any) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            // Vänta om refresh redan pågår
            if (this.isRefreshing) {
                return new Promise((resolve, reject) => {
                    this.refreshQueue.push({resolve, reject});
                }).then((token) => {
                    if (!(originalRequest.headers instanceof AxiosHeaders)) {
                        originalRequest.headers = new AxiosHeaders(originalRequest.headers);
                    }
                    originalRequest.headers.set("Authorization", `Bearer ${token}`)
                    return this.client(originalRequest);
                });
            }

            this.isRefreshing = true;

            try {
                const refreshToken = tokenStore.getRefresh();
                if (!refreshToken) throw new Error("No refresh token found.");

                const res = await this.client.post("/request-token/refresh", {
                    refreshToken: refreshToken,
                });
                const newToken = res.data.token;
                const newRefreshToken = res.data.refreshToken;

                tokenStore.set(newToken);
                tokenStore.setRefresh(newRefreshToken);

                // Släpp alla väntande requests
                this.refreshQueue.forEach(p => p.resolve(newToken));
                this.refreshQueue = [];

                if (!(originalRequest.headers instanceof AxiosHeaders)) {
                    originalRequest.headers = new AxiosHeaders(originalRequest.headers);
                }
                originalRequest.headers.set("Authorization", `Bearer ${newToken}`);

                return this.client(originalRequest);
            } catch (err) {
                this.refreshQueue.forEach(p => p.reject(err));
                this.refreshQueue = [];
                tokenStore.clear();
                return Promise.reject(err);
            } finally {
                this.isRefreshing = false;
            }
        }

        return Promise.reject(error);
    };

    // ---- HTTP helpers ----
    public get<T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.client.get<T>(url, config);
    }

    public post<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.client.post<T>(url, data, config);
    }

    public put<T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.client.put<T>(url, data, config);
    }

    public delete<T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.client.delete<T>(url, config);
    }
}

export default new ApiClient();
