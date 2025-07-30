// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

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

  const API_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";

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

  const login = async (email, password) => {
    console.log(">>> [DEBUG] Tentando conectar à API em:", API_URL);
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
      } catch { }
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
      } catch { }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
