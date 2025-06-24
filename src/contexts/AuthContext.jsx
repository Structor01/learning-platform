import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular dados do usuário com informações de assinatura
  useEffect(() => {
    // Simular carregamento inicial
    setTimeout(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = (email, password) => {
    // Simular login
    const userData = {
      id: '1',
      name: 'Maria Gabriela',
      email: email,
      discProfile: {
        dominante: 23,
        influente: 13,
        estavel: 27,
        conforme: 38,
        predominant: 'conforme'
      },
      subscription: {
        status: 'free', // 'free', 'active', 'canceled', 'past_due'
        plan: null, // 'basic', 'professional', 'corporate'
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      progress: {
        coursesCompleted: 3,
        certifications: 1,
        totalHours: 24,
        currentProgress: 78
      }
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateSubscription = (subscriptionData) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          ...subscriptionData
        }
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const hasActiveSubscription = () => {
    return user?.subscription?.status === 'active';
  };

  const canAccessContent = () => {
    return hasActiveSubscription();
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateSubscription,
    hasActiveSubscription,
    canAccessContent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

