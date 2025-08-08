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
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TestService] Erro ${response.status}:`, errorText);
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[TestService] Resposta:`, data);
    return data;
  }

  // ===== TESTE PSICOLÓGICO UNIFICADO =====

  async createPsychologicalTest(userId, testType = 'unified') {
    return this.makeRequest('/psychological', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, test_type: testType })
    });
  }

  async getUserPsychologicalTests(userId, status = null, limit = 10) {
    let endpoint = `/psychological/user/${userId}`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
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

  async completePsychologicalTest(testId) {
    return this.makeRequest(`/psychological/${testId}/complete`, { method: 'POST' });
  }

  async getPsychologicalTestReport(testId) {
    return this.makeRequest(`/psychological/${testId}/report`);
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
    if (!['A','B','C','D'].includes(selectedOption)) {
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
}

const testService = new TestService();
export default testService;
