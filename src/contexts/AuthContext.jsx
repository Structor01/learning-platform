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
  const [isLoading, setIsLoading] = useState(true);

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Função de login usando API NestJS
  const login = async (email, password) => {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao fazer login");
    }

    // Armazena user e tokens
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);

    return data.user;
  };

  // Função de signup usando API NestJS
  const signup = async ({ name, email, password }) => {
    const response = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao criar conta");
    }

    // Opcional: já logar após cadastro
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);

    return data.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const hasActiveSubscription = () => {
    return user?.subscription?.status === "active";
  };

  const canAccessContent = () => hasActiveSubscription();

  const value = {
    user,
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
