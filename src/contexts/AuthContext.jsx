// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const api = axios.create({
  baseURL: "https://app.agroskills.com.br/api",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

api.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        if (error.response?.data.error !== "Usuário ou senha incorretos"){
          Storage.removeApiToken();
          window.location.href = '/';
        }

      }
      return Promise.reject(error);
    }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://learning-platform-backend-2x39.onrender.com";

  const isAuthenticated = !!user && !!accessToken;

  // Carrega usuário do sessionStorage ao iniciar
  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    const accessToken = sessionStorage.getItem("accessToken");

    // Se não tiver token, forçamos user para null
    if (savedUser && accessToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(accessToken);
    } else {
      setUser(null);
      setAccessToken(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
    }

    setIsLoading(false);
  }, []);

  const updateUser = async (updateData) => {
    try {
      const mappedData = {
        name: updateData.name,
        role: updateData.role,
        linkedin: updateData.linkedin,
        curriculoUrl: updateData.curriculoUrl,
      };
      console.log("Enviando dados para atualização de perfil:", mappedData);

      // Remove campos undefined
      Object.keys(mappedData).forEach((key) => {
        if (mappedData[key] === undefined) {
          delete mappedData[key];
        }
      });

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(mappedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const updatedUser = await response.json();

      console.log("Resposta da API após atualização:", updatedUser);

      const newUser = {
        ...user,
        ...updatedUser,
        curriculo_url: updatedUser.curriculoUrl, // mapeia o campo do backend para o frontend
      };

      setUser(newUser);
      sessionStorage.setItem("user", JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return {
        success: false,
        error: error.message || "Erro ao atualizar perfil",
      };
    }
  };

  const login = async (email, password) => {
    console.log(">>> [DEBUG] Tentando conectar à API em:", API_URL);

    const token = await api.post('auth', { email, password });

    localStorage.setItem('token', token.data.data.token);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errMsg = "Erro ao fazer login";
      try {
        const errData = await response.json();
        errMsg = errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    data.user.userLegacy = token.data.data.usuario;

    setUser(data.user);
    setAccessToken(data.access_token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    sessionStorage.setItem("accessToken", data.access_token);
    sessionStorage.setItem("refreshToken", data.refresh_token);

    return data.user;
  };

  const signup = async ({ name, email, password }) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      let errMsg = "Erro ao criar conta";
      try {
        const errData = await response.json();
        errMsg = errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    setUser(data.user);
    setAccessToken(data.access_token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    sessionStorage.setItem("accessToken", data.access_token);
    sessionStorage.setItem("refreshToken", data.refresh_token);

    return data.user;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  };

  const updateSubscription = (subscriptionData) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          ...subscriptionData,
        },
      };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const hasActiveSubscription = () => user?.subscription?.status === "active";

  const canAccessContent = () => hasActiveSubscription();

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    signup,
    logout,
    updateSubscription,
    hasActiveSubscription,
    canAccessContent,
    isAuthenticated,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
