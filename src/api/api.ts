import axios, {
    AxiosHeaders,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL as string,
        });

        this.client.interceptors.request.use(this.attachAuthToken);
    }

    private attachAuthToken = (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");

        // In Axios v1, headers is AxiosHeaders-like. Ensure it's an AxiosHeaders instance:
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
