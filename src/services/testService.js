const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";

class TestService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/tests`;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    console.log(`[TestService] ${config.method || 'GET'} ${url}`);

    try {
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
      console.error(`[TestService] Erro na requisição para ${url}:`, error);
      throw error;
    }
  }

  // ===== TESTE PSICOLÓGICO UNIFICADO =====

  async createPsychologicalTest(testData) {
    console.log('🔍 TestService - Criando teste psicológico:', testData);

    return this.makeRequest('/psychological', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  async getUserPsychologicalTests(userId, status = null, limit = 10) {
    let endpoint = `/psychological/user/${userId}`;
    const params = new URLSearchParams();

    if (status) {
      // Se status é um objeto, precisamos serializar corretamente
      if (typeof status === 'object') {
        params.append('status', JSON.stringify(status));
      } else {
        params.append('status', status);
      }
    }

    if (limit) params.append('limit', limit.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;

    return this.makeRequest(endpoint);
  }

  async getPsychologicalTest(testId) {
    return this.makeRequest(`/psychological/${testId}`);
  }

  async getPsychologicalTestQuestions(testId) {
    return this.makeRequest(`/psychological/${testId}/questions`);
  }

  async submitPsychologicalTestResponse(testId, responseData) {
    return this.makeRequest(`/psychological/${testId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
  }

  async saveTestResponses(testId, responses) {
    console.log('🔍 TestService - Salvando respostas para teste:', testId);
    console.log('🔍 TestService - Dados das respostas:', responses);

    // Validar e formatar dados antes de enviar
    const formattedResponses = responses.map((response, index) => ({
      question_id: parseInt(response.question_id) || (index + 1), // Garantir que seja número
      question_number: parseInt(response.question_number) || (index + 1), // Garantir que seja número
      selected_option: String(response.selected_option || ''), // Garantir que seja string
      response_text: response.response_text || '' // Opcional
    }));

    console.log('🔍 TestService - Respostas formatadas:', formattedResponses);

    return this.makeRequest(`/psychological/${testId}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        responses: formattedResponses
      })
    });
  }

  async updateTestStatus(testId, status) {
    console.log('🔍 TestService - Atualizando status do teste:', testId, 'para:', status);

    return this.makeRequest(`/psychological/${testId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: status
      })
    });
  }

  async completePsychologicalTest(testId) {
    return this.makeRequest(`/psychological/${testId}/complete`, { method: 'POST' });
  }

  async getPsychologicalTestReport(testId) {
    return this.makeRequest(`/psychological/${testId}/report`);
  }

  async getPsychologicalTestResult(testId) {
    console.log('🔍 TestService - Buscando resultado do teste:', testId);
    return this.makeRequest(`/psychological/${testId}`);
  }

  // ===== DISC API METHODS =====

  async getAdjectives() {
    return this.makeRequest('/adjectives');
  }

  async submitDiscTest(userId, selectedAdjectives) {
    return this.makeRequest('/disc-test', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        selected_adjectives: selectedAdjectives
      })
    });
  }

  // ===== SISTEMA ANTIGO (COMPATIBILIDADE) =====

  async getTestTypes() {
    return this.makeRequest('/types');
  }

  async saveTestResult(testResultData) {
    return this.makeRequest('/results', {
      method: 'POST',
      body: JSON.stringify(testResultData)
    });
  }

  async getUserTestResults(userId) {
    return this.makeRequest(`/results/user/${userId}`);
  }

  async checkDISCCompletion(userId) {
    return this.makeRequest(`/check-disc/${userId}`);
  }

  async getUserDISCResult(userId) {
    return this.makeRequest(`/disc-result/${userId}`);
  }

  async getUserTestStats(userId) {
    return this.makeRequest(`/stats/${userId}`);
  }

  // ===== MÉTODOS AUXILIARES =====

  calculateDISCScores(answers, questions) {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    Object.values(answers).forEach(answer => {
      if (answer.type && scores.hasOwnProperty(answer.type)) {
        scores[answer.type]++;
      }
    });

    const total = Object.values(scores).reduce((sum, v) => sum + v, 0) || 1;
    const percentages = {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100)
    };

    const dominantType = Object.keys(percentages).reduce((a, b) =>
      percentages[a] > percentages[b] ? a : b
    );

    return { scores, percentages, dominantType };
  }

  getDISCProfileDescription(type) {
    const profiles = {
      D: { name: "Dominância", color: "from-red-500 to-red-600" },
      I: { name: "Influência", color: "from-yellow-500 to-yellow-600" },
      S: { name: "Estabilidade", color: "from-green-500 to-green-600" },
      C: { name: "Conformidade", color: "from-blue-500 to-blue-600" }
    };
    return profiles[type] || profiles.D;
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  validateResponse(questionId, selectedOption) {
    if (!questionId || questionId <= 0) {
      throw new Error('ID da pergunta inválido');
    }
    if (!['A', 'B', 'C', 'D'].includes(selectedOption)) {
      throw new Error('Opção selecionada inválida');
    }
    return true;
  }

  generateReportData(testResult, responses) {
    return {
      testInfo: {
        id: testResult.id,
        type: testResult.test_type,
        completedAt: this.formatDate(testResult.completed_at),
        duration: this.formatTime(
          Math.floor((new Date(testResult.completed_at).getTime() -
            new Date(testResult.created_at).getTime()) / 1000)
        )
      },
      scores: {
        disc: testResult.disc_scores,
        bigFive: testResult.big_five_scores,
        leadership: testResult.leadership_scores
      },
      analysis: testResult.overall_analysis,
      recommendations: testResult.recommendations,
      responses
    };
  }

  // ===== MÉTODOS PARA DEBUG =====

  logTestState(testId, state, additionalData = {}) {
    console.log(`[TestService] Estado do teste ${testId}:`, state, additionalData);
  }

  validateTestData(testData) {
    const required = ['user_id', 'test_type'];
    const missing = required.filter(field => !testData[field]);

    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }

    return true;
  }

  validateResponseData(responses) {
    if (!Array.isArray(responses)) {
      throw new Error('Responses deve ser um array');
    }

    responses.forEach((response, index) => {
      if (typeof response.question_id !== 'number') {
        console.warn(`Response ${index}: question_id não é um número:`, response.question_id);
      }
      if (typeof response.question_number !== 'number') {
        console.warn(`Response ${index}: question_number não é um número:`, response.question_number);
      }
      if (typeof response.selected_option !== 'string') {
        console.warn(`Response ${index}: selected_option não é uma string:`, response.selected_option);
      }
    });

    return true;
  }
}

const testService = new TestService();
export default testService;