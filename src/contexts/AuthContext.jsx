// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { USER_TYPES, validateUserType } from "../types/userTypes";

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

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://learning-platform-backend-2x39.onrender.com";

  const isAuthenticated = !!user && !!accessToken;

  // Helper para limpar dados grandes antes de salvar no sessionStorage
  const cleanUserForStorage = (userData) => {
    return {
      ...userData,
      // Converter Buffers/objetos grandes em booleans (mantém informação de existência)
      curriculo_url: userData?.curriculo_url ? true : null,
      curriculoUrl: userData?.curriculoUrl ? true : null,
      // Manter campos string pequenos importantes
      linkedin: userData?.linkedin || null,
      // Remover outros campos grandes se existirem
      password: undefined, // Nunca salvar senha
      resetToken: undefined, // Nunca salvar tokens de reset
    };
  };

  // Carrega usuário do sessionStorage ao iniciar
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedAccessToken = localStorage.getItem("accessToken");

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setAccessToken(savedAccessToken);
        } catch (parseError) {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      clearAuthData();
    }
    setIsLoading(false);
  };

  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const saveAuthData = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setAccessToken(accessToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao fazer login");
      }

      const data = await response.json();
      console.log("🔍 Resposta do login:", data);
      console.log("🔍 User retornado:", data.user);

      saveAuthData(data.user, data.access_token, data.refresh_token);

      return data.user;
    } catch (error) {
      const errorMessage = error.message || "Erro inesperado no login";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData) => {
    setIsLoading(true);

    try {
      console.log("🔍 Dados sendo enviados para signup:", signupData);

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao criar conta");
      }

      const data = await response.json();

      saveAuthData(data.user, data.access_token, data.refresh_token);

      return data.user;
    } catch (error) {
      throw new Error(error.message || "Erro inesperado no cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updateData) => {
    if (!accessToken) {
      throw new Error("Usuário não autenticado");
    }

    try {
      // Atualizar imediatamente o estado local se profile_image estiver presente
      if (updateData.profile_image) {
        const immediateUpdate = {
          ...user,
          profile_image: updateData.profile_image,
        };
        setUser(immediateUpdate);
        localStorage.setItem("user", JSON.stringify(immediateUpdate));
      }

      const cleanData = Object.fromEntries(
        Object.entries({
          name: updateData.name,
          role: updateData.role,
          linkedin: updateData.linkedin,
          curriculoUrl: updateData.curriculoUrl,
          profile_image: updateData.profile_image,
        }).filter(([_, value]) => value !== undefined)
      );

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const updatedUser = await response.json();
      const newUserData = {
        ...user,
        ...updatedUser,
        curriculo_url: updatedUser.curriculoUrl,
      };

      setUser(newUserData);
      localStorage.setItem("user", JSON.stringify(newUserData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Erro ao atualizar perfil",
      };
    }
  };

  const updateSubscription = (subscriptionData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      subscription: subscriptionData,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };


  const logout = () => {
    clearAuthData();
  };

  const hasActiveSubscription = () => user?.subscription?.status === "active";
  const canAccessContent = () => hasActiveSubscription();

  const getUserType = () => user?.userType || user?.type || null;
  const isCompany = () => getUserType() === USER_TYPES.COMPANY;
  const isCandidate = () => getUserType() === USER_TYPES.CANDIDATE;

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    updateSubscription,
    hasActiveSubscription,
    canAccessContent,
    getUserType,
    isCompany,
    isCandidate,
    USER_TYPES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};