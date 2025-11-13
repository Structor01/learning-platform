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

  const initializeAuth = async () => {
    try {
      const savedAccessToken = localStorage.getItem("accessToken");
      const savedUserId = localStorage.getItem("userId");

      if (savedAccessToken && savedUserId) {
        setAccessToken(savedAccessToken);

        // ✅ Busca dados do usuário da API
        try {
          const userResponse = await fetch(`${API_URL}/api/profile`, {
            headers: {
              'Authorization': `Bearer ${savedAccessToken}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser({
              id: parseInt(savedUserId),
              name: userData.name,
              email: userData.email || '',
              role: userData.role,
              location: userData.location,
              profile_image: userData.profile_image,
              banner_image: userData.banner_image,
              userType: 'candidate', // Ajusta conforme necessário
            });
          } else {
            clearAuthData();
          }
        } catch (apiError) {
          console.error("Erro ao carregar usuário:", apiError);
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
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
  };

  const saveAuthData = (userData, accessToken, refreshToken) => {

    setUser(userData);
    setAccessToken(accessToken);

    // ✅ localStorage: APENAS tokens e ID
    localStorage.setItem("userId", userData.id);
    localStorage.setItem("accessToken", accessToken);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

  };

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      ("🌐 URL de login:", `${API_URL}/api/auth/login`);
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

      // ✅ Buscar perfil
      try {
        const profileResponse = await fetch(`${API_URL}/api/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          // Merge profile com user
          data.user.profile_image = profileData.profile_image;
          data.user.banner_image = profileData.banner_image;
        }
      } catch (profileError) {
        console.warn('⚠️ Erro ao buscar perfil:', profileError);
      }

      saveAuthData(data.user, data.access_token, data.refresh_token);

      // Verificar vídeo de boas-vindas
      const hasSeenWelcomeVideo = localStorage.getItem(`welcomeVideo_${data.user.id}`);
      const neverShowAgain = localStorage.getItem('welcomeVideo_neverShow');

      if (!hasSeenWelcomeVideo && !neverShowAgain) {
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
      ("🔍 Dados sendo enviados para signup:", signupData);

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
      const newUserData = {
        ...user,
        ...updateData,
      };

      // Atualizar estado local E localStorage
      setUser(newUserData);

      // Esses dados são enviados via patchProfile no ProfilePage
      const isProfileData =
        updateData.experiences ||
        updateData.education ||
        updateData.skills ||
        updateData.about ||
        updateData.profile_image ||
        updateData.banner_image;

      if (isProfileData) {
        ("✅ Dados de perfil salvos APENAS no localStorage (backend via patchProfile)");
        return { success: true };
      }

      // ✅ Atualiza APENAS o estado React, SEM tocar no localStorage
      const setUserData = (data) => {
        setUser(prev => ({ ...prev, ...data }));
      };



      // Apenas para dados de usuário básico (name, role, linkedin, curriculoUrl)
      const cleanData = Object.fromEntries(
        Object.entries({
          name: updateData.name,
          role: updateData.role,
          linkedin: updateData.linkedin,
          curriculoUrl: updateData.curriculoUrl,
        }).filter(([_, value]) => value !== undefined)
      );

      // Se não há dados para enviar, retorna
      if (Object.keys(cleanData).length === 0) {
        return { success: true };
      }

      // Tentar sincronizar com backend
      try {
        const response = await fetch(`${API_URL}/api/profile/basic-info`, { // ← /users/profile
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(cleanData),
        });

        if (response.ok) {
          const backendResponse = await response.json();

          // ✅ VALIDAÇÃO DE SEGURANÇA
          if (backendResponse && Object.keys(backendResponse).length > 0) {

            // ⚠️ CRÍTICO: Verifica se o backend retornou o usuário CORRETO
            if (backendResponse.id !== newUserData.id) {


              // NÃO mescla! Mantém apenas os dados locais
              return { success: true, warning: "Dados salvos localmente, mas backend retornou erro" };
            }

            // ✅ Se o ID está correto, agora sim pode mesclar
            const mergedData = {
              ...newUserData,
              ...backendResponse,
            };
            setUser(mergedData);
            localStorage.setItem("user", JSON.stringify({
              id: mergedData.id,
              name: mergedData.name,
              email: mergedData.email,
              profile_image: mergedData.profile_image,
              banner_image: mergedData.banner_image,
              userType: mergedData.userType,
              subscription: mergedData.subscription,
            }));
          }
        } else {
          console.warn("⚠️ Backend retornou erro:", response.status);
        }
      } catch (backendError) {
        console.warn("⚠️ Erro ao sincronizar com backend:", backendError.message);
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Erro em updateUser:", error);
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
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('profile_')) {
        sessionStorage.removeItem(key);
      }
    });
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
      ("🔍 PREMIUM CHECK - Sem userId no localStorage");
      return false;
    }

    try {
      ("🔍 PREMIUM CHECK - Verificando userId:", userId);
      const response = await fetch(`${API_URL}/api/subscriptions/verify/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken || localStorage.getItem("accessToken")}`
        }
      });

      if (!response.ok) {
        ("❌ PREMIUM CHECK - Erro na API:", response.status);
        return false;
      }

      const data = await response.json();
      ("✅ PREMIUM CHECK - Resposta da API:", data);
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

  const setUserData = (data) => {

    const sanitized = {
      name: typeof data.name === 'string' ? data.name.slice(0, 100) : undefined,
      role: typeof data.role === 'string' ? data.role.slice(0, 200) : undefined,
      location: typeof data.location === 'string' ? data.location.slice(0, 100) : undefined,
    };
    setUser(prev => ({ ...prev, ...data }));
  };

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
    setUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};