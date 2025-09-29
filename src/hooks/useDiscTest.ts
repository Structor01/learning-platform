// src/hooks/useDiscTest.ts
import { useState, useCallback } from 'react';
import discApiService from '@/services/discApi';
import { useAuth } from '@/contexts/AuthContext';

export interface DiscQuestion {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
}

export interface DiscAnswer {
  questionId: number;
  optionId: string;
}

export const useDiscTest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuestions = useCallback(async (): Promise<DiscQuestion[]> => {
    try {
      setLoading(true);
      setError(null);

      const questions = await discApiService.getQuestions();
      console.log('✅ Perguntas do DISC carregadas:', questions);

      return questions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perguntas';
      console.error('❌ Erro ao carregar perguntas:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitTest = useCallback(async (answers: DiscAnswer[]) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Enviando teste DISC para usuário:', user.id);
      console.log('🔍 Respostas formatadas:', answers);

      const result = await discApiService.submitDiscTest(user.id, answers);
      console.log('✅ Teste DISC enviado com sucesso:', result);

      // Disparar evento personalizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('discTestCompleted', {
        detail: { userId: user.id, result }
      }));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar teste';
      console.error('❌ Erro ao enviar teste:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getUserResult = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await discApiService.getUserDiscResult(user.id);
      console.log('✅ Resultado do usuário carregado:', result);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar resultado';
      console.error('❌ Erro ao carregar resultado:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const checkCompletion = useCallback(async () => {
    if (!user?.id) {
      return { completed: false, hasResult: false };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await discApiService.getUserDiscResult(user.id);
      const completed = !!result;

      console.log('✅ Status de conclusão verificado:', { completed, hasResult: completed });

      return { completed, hasResult: completed };
    } catch (err) {
      console.error('❌ Erro ao verificar conclusão:', err);
      return { completed: false, hasResult: false };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    getQuestions,
    submitTest,
    getUserResult,
    checkCompletion,
    loading,
    error,
    clearError: () => setError(null)
  };
};