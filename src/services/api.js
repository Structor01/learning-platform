// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "https://app.agroskills.com.br/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

const initialToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

if (initialToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
    }
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const isWrongCredentials =
                error.response?.data?.error === "Usuário ou senha incorretos";
            if (!isWrongCredentials) {
                setAuthToken(null);
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;