class MockInterviewService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * 1. Listar vagas disponíveis para mock interview
   */
  async getVagasTeste() {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/vagas-teste`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('Erro ao buscar vagas de teste:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 2. Buscar candidaturas do usuário
   */
  async getUserCandidaturas(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/user/${userId}`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 3. Criar candidatura
   */
  async createCandidatura(usuarioId, vagaTesteId, mensagem = '') {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/candidatura`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId,
          vagaTesteId,
          mensagem
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar candidatura');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erro ao criar candidatura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 4. Verificar status da candidatura
   */
  async checkCandidaturaStatus(candidaturaId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/candidatura/${candidaturaId}/check`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Erro ao verificar candidatura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 5. Criar entrevista a partir da candidatura
   */
  async createInterview(candidaturaId, candidateName, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/candidatura/${candidaturaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidate_name: candidateName,
          user_id: userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar entrevista');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Erro ao criar entrevista:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 6. Iniciar entrevista
   */
  async startInterview(interviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/${interviewId}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return {
        success: true,
        message: 'Entrevista iniciada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 7. Upload de vídeo com análise facial
   */
  async uploadVideoResponse(interviewId, questionNumber, videoBlob, faceAnalysisData = []) {
    try {
      console.log(`📤 Iniciando upload - Entrevista: ${interviewId}, Pergunta: ${questionNumber}`);
      console.log(`📦 VideoBlob - Tamanho: ${videoBlob.size} bytes, Tipo: ${videoBlob.type}`);
      console.log(`🧠 Face Analysis Data: ${faceAnalysisData.length} pontos`);

      // Validações
      if (!interviewId) {
        throw new Error('InterviewId é obrigatório');
      }
      if (!questionNumber || questionNumber < 1) {
        throw new Error('QuestionNumber deve ser >= 1');
      }
      if (!videoBlob || videoBlob.size === 0) {
        throw new Error('VideoBlob está vazio ou inválido');
      }

      // Corrigir tipo do blob se necessário
      if (!videoBlob.type || !videoBlob.type.includes('video/')) {
        console.warn('⚠️ Tipo do blob não é reconhecido como vídeo, corrigindo...');
        videoBlob = new Blob([videoBlob], { type: 'video/webm' });
      }

      const formData = new FormData();

      // Determinar extensão
      let extension = '.webm';
      if (videoBlob.type.includes('mp4')) {
        extension = '.mp4';
      }

      const fileName = `interview_${interviewId}_q${questionNumber}${extension}`;

      formData.append('video', videoBlob, fileName);
      formData.append('questionNumber', questionNumber.toString());
      formData.append('faceAnalysisData', JSON.stringify(faceAnalysisData));

      console.log(`📁 Arquivo: ${fileName}`);
      console.log(`🔢 Número da pergunta: ${questionNumber}`);

      const url = `${this.baseUrl}/api/mock-interviews/${interviewId}/responses/upload-video`;
      console.log(`🌐 URL: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      console.log(`📨 Status da resposta: ${response.status}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Erro do servidor:', errorData);
        } catch (e) {
          const textError = await response.text();
          console.error('❌ Erro (texto):', textError);
          throw new Error(`Erro HTTP ${response.status}: ${textError}`);
        }
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        responseId: result.data?.responseId,
        videoUrl: result.data?.videoUrl,
        streamUrl: result.data?.streamUrl,
        thumbnailUrl: result.data?.thumbnailUrl,
        processingStatus: result.data?.processingStatus,
        faceDataPoints: result.data?.faceDataPoints,
        message: result.message
      };

    } catch (error) {
      console.error('❌ Erro no upload de vídeo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 8. Finalizar entrevista
   */
  async completeInterview(interviewId) {
    try {
      console.log(`🏁 Finalizando entrevista ${interviewId}...`);

      const response = await fetch(`${this.baseUrl}/api/mock-interviews/${interviewId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao finalizar entrevista: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      console.log(`✅ Entrevista ${interviewId} finalizada com sucesso!`);

      return {
        success: true,
        interview: result,
        message: 'Entrevista finalizada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao finalizar entrevista:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 9. Gerar relatório
   */
  async getReport(interviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/${interviewId}/report`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao gerar relatório');
      }

      const result = await response.json();

      return {
        success: true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 10. Cancelar candidatura
   */
  async cancelCandidatura(candidaturaId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/mock-interviews/candidatura/${candidaturaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao cancelar candidatura');
      }

      return {
        success: true,
        message: 'Candidatura cancelada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao cancelar candidatura:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar instância singleton
const mockInterviewService = new MockInterviewService();
export default mockInterviewService;