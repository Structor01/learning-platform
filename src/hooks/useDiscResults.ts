// src/hooks/useDiscResults.ts
import { useState, useCallback, useEffect } from 'react';
import discApiService from '@/services/testDiscService/discApi';
import { useAuth } from '@/contexts/AuthContext';

export interface DiscProfile {
  type: string;
  name: string;
  description: string;
  percentage: number;
  characteristics: string[];
  strengths: string[];
  improvements: string[];
}

export const useDiscResults = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DiscProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      ('🔍 Carregando perfil DISC para usuário:', user.id);

      const result = await discApiService.getUserDiscResult(user.id);

      if (result) {
        const convertedProfile = discApiService.convertApiDataToProfile(result);
        ('✅ Perfil DISC carregado:', convertedProfile);
        setProfile(convertedProfile);
      } else {
        ('ℹ️ Nenhum perfil DISC encontrado para o usuário');
        setProfile(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil';
      console.error('❌ Erro ao carregar perfil DISC:', err);
      setError(errorMessage);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const hasCompletedTest = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const result = await discApiService.getUserDiscResult(user.id);
      return !!result;
    } catch (err) {
      console.error('❌ Erro ao verificar conclusão do teste:', err);
      return false;
    }
  }, [user?.id]);

  const getProfilePercentage = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const result = await discApiService.getProfilePercentage(user.id);
      return result.percentage;
    } catch (err) {
      console.error('❌ Erro ao buscar porcentagem do perfil:', err);
      return 0;
    }
  }, [user?.id]);

  // Carregar perfil automaticamente quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id, loadProfile]);

  // Listener para atualizar o perfil quando um teste é completado
  useEffect(() => {
    const handleTestCompleted = () => {
      if (user?.id) {
        ('🔄 Teste DISC completado, recarregando perfil...');
        loadProfile();
      }
    };

    window.addEventListener('discTestCompleted', handleTestCompleted);

    return () => {
      window.removeEventListener('discTestCompleted', handleTestCompleted);
    };
  }, [user?.id, loadProfile]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    hasCompletedTest,
    getProfilePercentage,
    clearError: () => setError(null),
    hasProfile: !!profile
  };
};

