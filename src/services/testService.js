const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";

class TestService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/tests`;
  }

  // Método auxiliar para fazer requisições
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      console.log(`[TestService] ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TestService] Erro ${response.status}:`, errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[TestService] Resposta:`, data);
      return data;
    } catch (error) {
      console.error('[TestService] Erro na requisição:', error);
      throw error;
    }
  }

  // ===== TESTE PSICOLÓGICO UNIFICADO =====

  // Criar novo teste psicológico
  async createPsychologicalTest(userId, testType = 'unified') {
    return await this.makeRequest('/psychological', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        test_type: testType // unified, disc_only, big_five_only, leadership_only
      })
    });
  }

  // Listar testes psicológicos do usuário
  async getUserPsychologicalTests(userId, status = null, limit = 10) {
    let endpoint = `/psychological/user/${userId}?limit=${limit}`;
    if (status) {
      endpoint += `&status=${status}`;
    }
    return await this.makeRequest(endpoint);
  }

  // Obter teste psicológico específico
  async getPsychologicalTest(testId) {
    return await this.makeRequest(`/psychological/${testId}`);
  }

  // Obter perguntas do teste psicológico
  async getPsychologicalTestQuestions(testId) {
    return await this.makeRequest(`/psychological/${testId}/questions`);
  }

  // Submeter resposta do teste psicológico
  async submitPsychologicalTestResponse(testId, responseData) {
    return await this.makeRequest(`/psychological/${testId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
  }

  // Finalizar teste psicológico
  async completePsychologicalTest(testId) {
    return await this.makeRequest(`/psychological/${testId}/complete`, {
      method: 'POST'
    });
  }

  // Obter relatório do teste psicológico
  async getPsychologicalTestReport(testId) {
    return await this.makeRequest(`/psychological/${testId}/report`);
  }

  // ===== SISTEMA ANTIGO (COMPATIBILIDADE) =====

  // Buscar tipos de testes disponíveis
  async getTestTypes() {
    return await this.makeRequest('/types');
  }

  // Salvar resultado de teste (sistema antigo)
  async saveTestResult(testResultData) {
    return await this.makeRequest('/results', {
      method: 'POST',
      body: JSON.stringify(testResultData)
    });
  }

  // Buscar resultados de testes de um usuário
  async getUserTestResults(userId) {
    return await this.makeRequest(`/results/user/${userId}`);
  }

  // Verificar se usuário completou teste DISC
  async checkDISCCompletion(userId) {
    return await this.makeRequest(`/check-disc/${userId}`);
  }

  // Buscar resultado DISC do usuário
  async getUserDISCResult(userId) {
    return await this.makeRequest(`/disc-result/${userId}`);
  }

  // Buscar estatísticas de testes do usuário
  async getUserTestStats(userId) {
    return await this.makeRequest(`/stats/${userId}`);
  }

  // ===== MÉTODOS AUXILIARES =====

  // Calcular scores DISC a partir das respostas
  calculateDISCScores(answers, questions) {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      if (answer && answer.type) {
        scores[answer.type]++;
      }
    });

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentages = {
      D: total > 0 ? Math.round((scores.D / total) * 100) : 0,
      I: total > 0 ? Math.round((scores.I / total) * 100) : 0,
      S: total > 0 ? Math.round((scores.S / total) * 100) : 0,
      C: total > 0 ? Math.round((scores.C / total) * 100) : 0
    };

    // Determinar perfil dominante
    const dominantType = Object.keys(percentages).reduce((a, b) => 
      percentages[a] > percentages[b] ? a : b
    );

    return {
      scores,
      percentages,
      dominantType
    };
  }

  // Obter descrição do perfil DISC
  getDISCProfileDescription(type) {
    const profiles = {
      D: {
        name: "Dominância",
        description: "Orientado para resultados, direto e determinado",
        characteristics: [
          "Foco em resultados e metas",
          "Tomada de decisão rápida",
          "Liderança natural",
          "Gosta de desafios",
          "Comunicação direta"
        ],
        strengths: [
          "Liderança eficaz",
          "Orientação para resultados",
          "Decisões rápidas",
          "Aceita desafios"
        ],
        developmentAreas: [
          "Paciência com detalhes",
          "Consideração pelos outros",
          "Flexibilidade",
          "Escuta ativa"
        ],
        color: "from-red-500 to-red-600"
      },
      I: {
        name: "Influência",
        description: "Sociável, otimista e persuasivo",
        characteristics: [
          "Comunicação expressiva",
          "Entusiasmo contagiante",
          "Orientação para pessoas",
          "Criatividade e inovação",
          "Networking natural"
        ],
        strengths: [
          "Comunicação persuasiva",
          "Motivação de equipes",
          "Criatividade",
          "Relacionamento interpessoal"
        ],
        developmentAreas: [
          "Foco em detalhes",
          "Organização",
          "Seguimento de processos",
          "Análise crítica"
        ],
        color: "from-yellow-500 to-yellow-600"
      },
      S: {
        name: "Estabilidade",
        description: "Cooperativo, confiável e paciente",
        characteristics: [
          "Trabalho em equipe",
          "Lealdade e confiabilidade",
          "Paciência e persistência",
          "Busca por harmonia",
          "Apoio aos colegas"
        ],
        strengths: [
          "Colaboração eficaz",
          "Confiabilidade",
          "Paciência",
          "Mediação de conflitos"
        ],
        developmentAreas: [
          "Assertividade",
          "Adaptação a mudanças",
          "Tomada de iniciativa",
          "Autoconfiança"
        ],
        color: "from-green-500 to-green-600"
      },
      C: {
        name: "Conformidade",
        description: "Analítico, preciso e sistemático",
        characteristics: [
          "Atenção aos detalhes",
          "Análise sistemática",
          "Busca por precisão",
          "Planejamento cuidadoso",
          "Qualidade no trabalho"
        ],
        strengths: [
          "Análise detalhada",
          "Qualidade e precisão",
          "Planejamento sistemático",
          "Pensamento crítico"
        ],
        developmentAreas: [
          "Flexibilidade",
          "Tomada de decisão rápida",
          "Comunicação interpessoal",
          "Tolerância a riscos"
        ],
        color: "from-blue-500 to-blue-600"
      }
    };

    return profiles[type] || profiles.D;
  }

  // Formatar tempo em mm:ss
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Formatar data para exibição
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Validar resposta antes de submeter
  validateResponse(questionId, selectedOption) {
    if (!questionId || questionId <= 0) {
      throw new Error('ID da pergunta inválido');
    }

    if (!selectedOption || !['A', 'B', 'C', 'D'].includes(selectedOption)) {
      throw new Error('Opção selecionada inválida');
    }

    return true;
  }

  // Gerar dados para relatório
  generateReportData(testResult, responses) {
    return {
      testInfo: {
        id: testResult.id,
        type: testResult.test_type,
        completedAt: this.formatDate(testResult.completed_at),
        duration: this.formatTime(Math.floor((new Date(testResult.completed_at) - new Date(testResult.created_at)) / 1000))
      },
      scores: {
        disc: testResult.disc_scores,
        bigFive: testResult.big_five_scores,
        leadership: testResult.leadership_scores
      },
      analysis: testResult.overall_analysis,
      recommendations: testResult.recommendations,
      responses: responses
    };
  }
}

// Exportar instância única do serviço
const testService = new TestService();
export default testService;


  // Buscar testes psicológicos do usuário
  async getUserPsychologicalTests(userId, status = null, limit = 10) {
    let endpoint = `/psychological/user/${userId}`;
    const params = new URLSearchParams();
    
    if (status) {
      params.append('status', status);
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.makeRequest(endpoint);
  }


}

// Criar instância única do serviço
const testService = new TestService();

export default testService;

