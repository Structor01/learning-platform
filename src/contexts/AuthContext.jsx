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

  const isAuthenticated = !!user && !!accessToken;

  // ✅ CORRIGIDO: Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('🔄 Inicializando AuthContext...');

        // ✅ MUDANÇA: localStorage em vez de sessionStorage
        const savedUser = localStorage.getItem("user");
        const savedAccessToken = localStorage.getItem("accessToken");

        console.log('🔍 Dados salvos:', {
          hasUser: !!savedUser,
          hasToken: !!savedAccessToken
        });

        // Se não tiver token, forçamos user para null
        if (savedUser && savedAccessToken) {
          setUser(JSON.parse(savedUser));
          setAccessToken(savedAccessToken);
          console.log('✅ Usuário restaurado:', JSON.parse(savedUser).name);
        } else {
          console.log('🧹 Limpando dados incompletos...');
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar auth:', error);
        // Limpar dados corrompidos
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
        console.log('✅ AuthContext inicializado');
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔐 Tentando login para:", email);
      console.log("🌐 API URL:", API_URL);

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
      console.log('✅ Login bem-sucedido:', data.user.name);

      setUser(data.user);
      setAccessToken(data.access_token);

      // ✅ MUDANÇA: localStorage em vez de sessionStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      return data.user;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      console.log("📝 Tentando cadastro para:", email);

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
      console.log('✅ Cadastro bem-sucedido:', data.user.name);

      setUser(data.user);
      setAccessToken(data.access_token);

      // ✅ MUDANÇA: localStorage em vez de sessionStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      return data.user;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Fazendo logout...');
    setUser(null);
    setAccessToken(null);

    // ✅ MUDANÇA: localStorage em vez de sessionStorage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    console.log('✅ Logout concluído');
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

      // ✅ MUDANÇA: localStorage em vez de sessionStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};