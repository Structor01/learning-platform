class InterviewService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
 * Buscar entrevistas de um usuário específico
 */
  async getUserInterviews(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/user/${userId}`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        interviews: result
      };

    } catch (error) {
      console.error('Erro ao buscar entrevistas do usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  /**
 * Buscar entrevistas de uma candidatura específica
 */
  async getCandidaturaInterviews(candidaturaId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/candidatura/${candidaturaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        interviews: result || []
      };

    } catch (error) {
      console.error('Erro ao buscar entrevistas da candidatura:', error);
      return {
        success: false,
        error: error.message,
        interviews: []
      };
    }
  }

  /**
 * Criar nova entrevista com candidatura_id (MÉTODO ATUALIZADO)
 */
  async createInterview(jobId, candidateName, candidateEmail, userId = null, candidaturaId = null) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: jobId,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          user_id: userId,
          candidatura_id: candidaturaId, // NOVO CAMPO
          status: 'in_progress'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        interview: result
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
   * Upload de vídeo com processamento completo no backend
   */
  async uploadVideoResponse(interviewId, questionNumber, videoBlob, faceAnalysisData = []) {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, `interview_${interviewId}_q${questionNumber}.webm`);
      formData.append('questionNumber', questionNumber.toString());
      formData.append('faceAnalysisData', JSON.stringify(faceAnalysisData));

      const response = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/responses/upload-video`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();


      return {
        success: true,
        responseId: result.data.responseId,
        videoUrl: result.data.videoUrl,
        streamUrl: result.data.streamUrl,
        thumbnailUrl: result.data.thumbnailUrl,
        processingStatus: result.data.processingStatus,
        faceDataPoints: result.data.faceDataPoints,
        message: result.message
      };

    } catch (error) {
      console.error('Erro no upload de vídeo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar status do processamento de uma resposta
   */
  async getResponseProcessingStatus(interviewId, responseId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/responses/${responseId}/status`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        responseId: result.responseId,
        processingStatus: result.processingStatus,
        transcription: result.transcription,
        analysisScore: result.analysisScore,
        aiAnalysis: result.aiAnalysis,
        errorMessage: result.errorMessage
      };

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aguardar conclusão do processamento com polling
   */
  async waitForProcessingCompletion(interviewId, responseId, maxAttempts = 30, intervalMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const status = await this.getResponseProcessingStatus(interviewId, responseId);

      if (!status.success) {
        throw new Error(`Erro ao verificar status: ${status.error}`);
      }


      if (status.processingStatus === 'completed') {
        return {
          success: true,
          transcription: status.transcription,
          analysisScore: status.analysisScore,
          aiAnalysis: status.aiAnalysis
        };
      }

      if (status.processingStatus === 'failed') {
        throw new Error(`Processamento falhou: ${status.errorMessage}`);
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Timeout: Processamento não concluído no tempo esperado');
  }

  /**
   * Criar nova entrevista
   */
  async createInterview(jobId, candidateName, candidateEmail, userId = null) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: jobId,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          user_id: userId,
          status: 'in_progress'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        interview: result
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
   * Obter entrevista por ID
   */
  async getInterview(interviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/${interviewId}`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        interview: result
      };

    } catch (error) {
      console.error('Erro ao obter entrevista:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Finalizar entrevista e gerar relatório
   */
  /**
 * Finalizar entrevista e gerar relatório - VERSÃO CORRIGIDA
 */
  async finishInterview(interviewId) {
    try {
      console.log(`🏁 Finalizando entrevista ${interviewId}...`);

      // ✅ CORREÇÃO: Usar o endpoint correto do backend
      const completeResponse = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/complete`, {
        method: 'POST', // ✅ POST em vez de PATCH
        headers: {
          'Content-Type': 'application/json'
        }
        // ✅ Sem body - o backend não espera parâmetros
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(`Erro ao finalizar entrevista: ${completeResponse.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const result = await completeResponse.json();
      console.log(`✅ Entrevista ${interviewId} finalizada com sucesso!`);

      // ✅ Opcional: Também gerar relatório se o backend suportar
      try {
        const reportResponse = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/report`);

        if (reportResponse.ok) {
          const contentType = reportResponse.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const report = await reportResponse.json();
            console.log(`📊 Relatório gerado com sucesso!`);

            return {
              success: true,
              interview: result,
              report: report,
              message: 'Entrevista finalizada e relatório gerado com sucesso'
            };
          } else {
            // Se não for JSON, tente ler como texto
            const textResponse = await reportResponse.text();
            console.warn('⚠️ Resposta do relatório não é JSON:', textResponse);

            return {
              success: true,
              interview: result,
              report: null,
              message: 'Entrevista finalizada com sucesso'
            };
          }
        } else {
          console.warn('⚠️ Entrevista finalizada, mas relatório não pôde ser gerado');

          return {
            success: true,
            interview: result,
            report: null,
            message: 'Entrevista finalizada com sucesso'
          };
        }
      } catch (reportError) {
        console.warn('⚠️ Erro ao gerar relatório:', reportError.message);

        return {
          success: true,
          interview: result,
          report: null,
          message: 'Entrevista finalizada com sucesso'
        };
      }

    } catch (error) {
      console.error('❌ Erro ao finalizar entrevista:', error);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar e baixar PDF do relatório
   */
  async generateReportPDF(interviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/report/pdf`);

      if (!response.ok) {
        throw new Error(`Erro ao gerar PDF: ${response.status}`);
      }

      const blob = await response.blob();

      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_entrevista_${interviewId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);


      return {
        success: true,
        message: 'PDF gerado e baixado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter respostas da entrevista
   */
  async getInterviewResponses(interviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/responses`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        responses: result
      };

    } catch (error) {
      console.error('Erro ao obter respostas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas da entrevista
   */
  async getInterviewStats(interviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews/${interviewId}/stats`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        stats: result
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Método auxiliar para aguardar com timeout
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verificar se o backend está disponível
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/interviews`, {
        method: 'GET'
      });

      return response.ok;
    } catch (error) {
      console.warn('Backend não disponível:', error.message);
      return false;
    }
  }
}

// Exportar instância singleton
const interviewService = new InterviewService();
export default interviewService;

