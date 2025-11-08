import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import testService from '@/services/testDiscService/testService';

/**
 * Hook personalizado para validar se o usuário pode realizar entrevista
 * Requisitos: Bot respondido, DISC completo, currículo anexado, LinkedIn preenchido
 */
export const useInterviewValidation = () => {
  const { user, accessToken } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  console.log('🔧 useInterviewValidation hook inicializado', {
    hasUser: !!user,
    userId: user?.id,
    hasToken: !!accessToken
  });

  /**
   * Verifica se o currículo do usuário existe
   */
  const checkCurriculoExists = useCallback(async (userId) => {
    try {
      // Buscar token de diferentes fontes
      const token = accessToken || sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ Token não encontrado para verificação de currículo');
        return false;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log(`🔍 Verificando currículo para usuário ${userId}...`);
      
      const response = await fetch(`${API_URL}/api/users/${userId}/curriculo`, {
        method: 'HEAD', // Apenas verificar se existe, sem baixar
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📄 Status da verificação de currículo: ${response.status}`);
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao verificar currículo:', error);
      return false;
    }
  }, [accessToken]);

  /**
   * Verifica se o usuário completou o teste DISC
   */
  const checkDiscCompleted = useCallback(async (userId) => {
    try {
      console.log(`🧠 Verificando teste DISC para usuário ${userId}...`);
      
      // Buscar token de diferentes fontes
      const token = accessToken || sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('⚠️ Token não encontrado para verificação de DISC');
        return false;
      }

      // Fazer requisição manual com token
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/tests/psychological/user/${userId}?status=completed&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`❌ Erro na requisição DISC: ${response.status}`);
        return false;
      }

      const discData = await response.json();
      const hasDisc = discData.tests && discData.tests.length > 0;
      console.log(`📊 DISC encontrado: ${hasDisc}`, discData);
      return hasDisc;
    } catch (error) {
      console.error('❌ Erro ao verificar DISC:', error);
      return false;
    }
  }, [accessToken]);

  /**
   * Verifica se o usuário respondeu o bot (simulamos checando se tem dados básicos preenchidos)
   * TODO: Implementar verificação real do bot quando disponível
   */
  const checkBotCompleted = useCallback(async (userData) => {
    // Por enquanto, vamos considerar que se o usuário tem role preenchido, respondeu o bot
    // Esta lógica deve ser ajustada conforme a implementação real do bot
    return !!(userData?.role && userData?.name);
  }, []);

  /**
   * Função principal de validação
   */
  const validateInterviewRequirements = useCallback(async () => {
    console.log('🔍 validateInterviewRequirements chamada');
    
    if (!user?.id) {
      console.log('❌ Usuário não identificado:', user);
      return {
        isValid: false,
        missingRequirements: ['Usuário não identificado'],
        details: {
          bot: false,
          disc: false,
          curriculo: false,
          linkedin: false
        }
      };
    }

    console.log('✅ Usuário encontrado, iniciando validação...');
    setIsValidating(true);
    
    try {
      console.log('🔍 Validando requisitos para entrevista...', {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        hasLinkedin: !!(user.linkedin?.trim()),
        hasCurriculoUrl: !!(user.curriculo_url)
      });
      
      // Executar todas as verificações em paralelo para melhor performance
      const [
        hasCurriculo,
        hasDiscTest,
        hasBotCompleted
      ] = await Promise.all([
        checkCurriculoExists(user.id),
        checkDiscCompleted(user.id),
        checkBotCompleted(user)
      ]);

      // Verificar LinkedIn (dados já estão no contexto do usuário)
      const hasLinkedin = !!(user.linkedin && user.linkedin.trim().length > 0);
      
      console.log('📊 Resultados das verificações:', {
        hasCurriculo,
        hasDiscTest, 
        hasBotCompleted,
        hasLinkedin
      });

      const details = {
        bot: hasBotCompleted,
        disc: hasDiscTest,
        curriculo: hasCurriculo,
        linkedin: hasLinkedin
      };

      // Lista de requisitos faltantes
      const missingRequirements = [];
      
      if (!hasBotCompleted) {
        missingRequirements.push('Responder questionário inicial (Bot)');
      }
      
      if (!hasDiscTest) {
        missingRequirements.push('Completar teste DISC');
      }
      
      if (!hasCurriculo) {
        missingRequirements.push('Anexar currículo');
      }
      
      if (!hasLinkedin) {
        missingRequirements.push('Preencher perfil do LinkedIn');
      }

      const isValid = missingRequirements.length === 0;

      const result = {
        isValid,
        missingRequirements,
        details
      };

      setValidationResult(result);
      
      console.log('✅ Validação concluída:', {
        isValid,
        missing: missingRequirements.length,
        details
      });

      return result;

    } catch (error) {
      console.error('❌ Erro na validação dos requisitos:', error);
      
      const errorResult = {
        isValid: false,
        missingRequirements: ['Erro ao validar requisitos. Tente novamente.'],
        details: {
          bot: false,
          disc: false,
          curriculo: false,
          linkedin: false
        },
        error: error.message
      };

      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [user, checkCurriculoExists, checkDiscCompleted, checkBotCompleted]);

  /**
   * Validação rápida baseada apenas nos dados já carregados (sem fazer requisições)
   * Útil para UI responsiva
   */
  const quickValidation = useCallback(() => {
    if (!user?.id) {
      return {
        isValid: false,
        missingRequirements: ['Usuário não identificado'],
        details: {
          bot: false,
          disc: false,
          curriculo: false,
          linkedin: false
        }
      };
    }

    const hasLinkedin = !!(user.linkedin && user.linkedin.trim().length > 0);
    // curriculoUrl pode ser um Buffer/objeto no backend
    const hasCurriculo = !!(
      user.curriculo_url && 
      (typeof user.curriculo_url === 'string' || typeof user.curriculo_url === 'object')
    );
    const hasBotCompleted = !!(user.role && user.name);
    // Para DISC, precisaríamos de uma verificação assíncrona

    const details = {
      bot: hasBotCompleted,
      disc: null, // Não podemos verificar sincronamente
      curriculo: hasCurriculo,
      linkedin: hasLinkedin
    };

    const missingRequirements = [];
    
    if (!hasBotCompleted) {
      missingRequirements.push('Responder questionário inicial (Bot)');
    }
    
    if (!hasCurriculo) {
      missingRequirements.push('Anexar currículo');
    }
    
    if (!hasLinkedin) {
      missingRequirements.push('Preencher perfil do LinkedIn');
    }

    return {
      isValid: missingRequirements.length === 0 && details.disc !== false,
      missingRequirements,
      details,
      isQuickValidation: true
    };
  }, [user]);

  return {
    validateInterviewRequirements,
    quickValidation,
    isValidating,
    validationResult,
    setValidationResult
  };
};