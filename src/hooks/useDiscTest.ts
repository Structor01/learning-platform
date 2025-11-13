// src/hooks/useDiscTest.ts
import { useState, useCallback } from 'react';
import discApiService from '@/services/testDiscService/discApi';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';


export interface DiscQuestion {
  id: number;
  question_number: number;
  question_text: string;
  question_type: string;
  dimension: string;
  options: Record<string, string>;
  scoring_weights: Record<string, Record<string, number>>;
  is_active: boolean;
  created_at: string;
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

      const response = await api("api/tests/questions");

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perguntas';
      console.error('❌ Erro ao carregar perguntas:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const saveTestAnswers = useCallback(async (testResultData: any) => {
    try {
      setLoading(true);
      setError(null);

      ('🔍 Salvando resultado completo do teste:', testResultData);

      const response = await api("api/tests/results", {
        method: 'POST',
        body: JSON.stringify(testResultData),
      });

      ('✅ Resultado salvo com sucesso:', response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar resultado';
      console.error('❌ Erro ao salvar resultado:', err);
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

      ('🔍 Enviando teste DISC para usuário:', user.id);
      ('🔍 Respostas formatadas:', answers);

      const result = await discApiService.submitDiscTest(user.id, answers);
      ('✅ Teste DISC enviado com sucesso:', result);

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
      ('✅ Resultado do usuário carregado:', result);

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

      ('✅ Status de conclusão verificado:', { completed, hasResult: completed });

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
    saveTestAnswers,
    getUserResult,
    checkCompletion,
    loading,
    error,
    clearError: () => setError(null)
  };
};