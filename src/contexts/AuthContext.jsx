// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { USER_TYPES, validateUserType } from "../types/userTypes";
import { API_URL } from "@/components/utils/api";

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
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);

  // Usar o API_URL importado de @/components/utils/api, não redefini-lo
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
    console.log("💾 SALVANDO AUTH DATA - userData:", userData);

    setUser(userData);
    setAccessToken(accessToken);

    // Salvar apenas dados essenciais no localStorage
    localStorage.setItem("userId", userData.id);
    localStorage.setItem("user", JSON.stringify(userData)); // Manter por compatibilidade
    localStorage.setItem("accessToken", accessToken);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    console.log("💾 SALVO - userId:", userData.id);
  };

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      console.log("🌐 URL de login:", `${API_URL}/api/auth/login`);
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
      console.log("🔍 Subscription do backend:", data.user?.subscription);

      saveAuthData(data.user, data.access_token, data.refresh_token);

      // Verificar se é o primeiro login do usuário
      const hasSeenWelcomeVideo = localStorage.getItem(`welcomeVideo_${data.user.id}`);
      const neverShowAgain = localStorage.getItem('welcomeVideo_neverShow');
      console.log('🎥 AuthContext - userId:', data.user.id, 'hasSeenWelcomeVideo:', hasSeenWelcomeVideo, 'neverShowAgain:', neverShowAgain);

      if (!hasSeenWelcomeVideo && !neverShowAgain) {
        console.log('🎥 AuthContext - Mostrando vídeo de boas-vindas');
        setShowWelcomeVideo(true);
      }

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

  // Funções para controlar o vídeo de boas-vindas
  const closeWelcomeVideo = () => {
    if (user?.id) {
      localStorage.setItem(`welcomeVideo_${user.id}`, 'seen');
    }
    setShowWelcomeVideo(false);
  };

  const resetWelcomeVideo = () => {
    if (user?.id) {
      localStorage.removeItem(`welcomeVideo_${user.id}`);
      setShowWelcomeVideo(true);
    }
  };
  // Verificação de acesso premium via API em tempo real
  const canAccessPremium = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.log("🔍 PREMIUM CHECK - Sem userId no localStorage");
      return false;
    }

    try {
      console.log("🔍 PREMIUM CHECK - Verificando userId:", userId);
      const response = await fetch(`${API_URL}/api/subscriptions/verify/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken || localStorage.getItem("accessToken")}`
        }
      });

      if (!response.ok) {
        console.log("❌ PREMIUM CHECK - Erro na API:", response.status);
        return false;
      }

      const data = await response.json();
      console.log("✅ PREMIUM CHECK - Resposta da API:", data);
      return data.hasAccess;
    } catch (error) {
      console.error("❌ PREMIUM CHECK - Erro:", error);
      return false;
    }
  };

  // Versão síncrona (fallback) - verifica cache local
  const hasActiveSubscription = () => {
    // Retorna true temporariamente para não quebrar componentes síncronos
    // Use canAccessPremium() para verificação real
    return user?.subscription?.status === "active";
  };

  const canAccessContent = () => hasActiveSubscription();

  const getUserType = () => user?.userType || user?.type || null;
  const isCompany = () => getUserType() === USER_TYPES.COMPANY;
  const isCandidate = () => getUserType() === USER_TYPES.CANDIDATE;

  // Definição de features gratuitas e pagas
  const FREE_FEATURES = {
    VAGAS_BRASIL: 'vagas_brasil',
    NOTICIAS_AGRO: 'noticias_agro',
    CARTAO_VIRTUAL: 'cartao_virtual',
    PODCASTS: 'podcasts',
    RESPONDE_IZA: 'responde_iza',
    TESTE_PERFIL: 'teste_perfil', // Pode fazer o teste mas não ver relatório
  };

  const PREMIUM_FEATURES = {
    TRILHAS: 'trilhas',
    CURSOS: 'cursos',
    CERTIFICADOS: 'certificados',
    DISC_RELATORIO: 'disc_relatorio', // Ver relatório completo do DISC
    ENTREVISTA_SIMULADA: 'entrevista_simulada',
    VIDEO_PITCH: 'video_pitch',
    AGENDA_EVENTOS: 'agenda_eventos',
  };

  const FEATURES = { ...FREE_FEATURES, ...PREMIUM_FEATURES };

  // Verificar se usuário tem acesso a uma feature específica (versão async)
  const canAccessFeatureAsync = async (featureName) => {
    // Features gratuitas são sempre acessíveis
    if (Object.values(FREE_FEATURES).includes(featureName)) {
      return true;
    }

    // Features premium requerem verificação via API
    if (Object.values(PREMIUM_FEATURES).includes(featureName)) {
      return await canAccessPremium();
    }

    // Por padrão, se não estiver na lista, requer verificação via API
    return await canAccessPremium();
  };

  // Verificar se usuário tem acesso a uma feature específica (versão síncrona - DEPRECATED)
  const canAccessFeature = (featureName) => {
    // Features gratuitas são sempre acessíveis
    if (Object.values(FREE_FEATURES).includes(featureName)) {
      return true;
    }

    // Features premium - usar canAccessFeatureAsync para verificação real
    // Esta função retorna fallback baseado em cache
    if (Object.values(PREMIUM_FEATURES).includes(featureName)) {
      return hasActiveSubscription();
    }

    return hasActiveSubscription();
  };

  // Verificar se é acesso limitado (ex: pode fazer teste mas não ver resultado)
  const isLimitedAccess = (featureName) => {
    if (featureName === FREE_FEATURES.TESTE_PERFIL) {
      return !hasActiveSubscription();
    }
    return false;
  };

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
    canAccessFeature, // Versão síncrona (fallback)
    canAccessFeatureAsync, // Versão async com verificação via API
    canAccessPremium, // Nova função para verificação via API
    isLimitedAccess,
    FREE_FEATURES,
    PREMIUM_FEATURES,
    FEATURES,
    getUserType,
    showWelcomeVideo,
    closeWelcomeVideo,
    resetWelcomeVideo,
    isCompany,
    isCandidate,
    USER_TYPES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};