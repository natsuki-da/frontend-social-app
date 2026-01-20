import axios, { AxiosInstance } from "axios";

//const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const API_BASE_URL = "https://rapid-dorthea-antonstest-9c800e7b.koyeb.app";

const api: AxiosInstance = axios.create({
    baseURL : API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


api.interceptors.request.use(
    (config) => {
        const token : string | null = localStorage.getItem("token");
        if(token && config.headers){
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Error handling interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401){
            console.warn("Unauthorized. JWT might be invalid or expired.")
        }
        return Promise.reject(error);
    }
)

export default api;
