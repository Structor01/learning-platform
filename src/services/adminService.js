const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class AdminService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/admin`;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      (`AdminService: ${config.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('AdminService Error:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.makeRequest('/dashboard/stats');
  }

  // Interviews Management
  async getInterviewsList(filters = {}) {
    try {
      let allInterviews = [];

      // Buscar TODAS as entrevistas via endpoint geral primeiro
      try {
        ('📊 Buscando todas as entrevistas via endpoint geral...');
        const generalResponse = await fetch(`${API_BASE_URL}/api/interviews`);
        if (generalResponse.ok) {
          const generalData = await generalResponse.json();
          const generalInterviews = Array.isArray(generalData.interviews) ? generalData.interviews :
            Array.isArray(generalData) ? generalData : [];

          (`📊 Encontradas ${generalInterviews.length} entrevistas no endpoint geral`);
          allInterviews = [...generalInterviews];
        }
      } catch (error) {
        console.warn('Erro ao buscar entrevistas gerais:', error);
      }

      // Tentar buscar entrevistas via endpoint administrativo se disponível
      try {
        ('📊 Tentando buscar via endpoint administrativo...');
        const adminResponse = await fetch(`${API_BASE_URL}/api/admin/interviews`);
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          const adminInterviews = Array.isArray(adminData.interviews) ? adminData.interviews :
            Array.isArray(adminData) ? adminData : [];

          (`📊 Encontradas ${adminInterviews.length} entrevistas via admin`);

          // Adicionar entrevistas que não estão na lista geral
          adminInterviews.forEach(interview => {
            if (!allInterviews.find(existing => existing.id === interview.id)) {
              allInterviews.push(interview);
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao buscar via endpoint administrativo:', error);
      }

      // Se ainda não temos entrevistas suficientes, buscar por usuários específicos
      if (allInterviews.length === 0) {
        ('📊 Nenhuma entrevista encontrada via endpoints gerais, buscando por usuários específicos...');
        const knownUserIds = [1921]; // Adicione outros IDs conforme necessário

        for (const userId of knownUserIds) {
          try {
            const userResponse = await fetch(`${API_BASE_URL}/api/interviews/user/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (Array.isArray(userData)) {
                (`📊 Encontradas ${userData.length} entrevistas do usuário ${userId}`);
                allInterviews.push(...userData);
              }
            }
          } catch (error) {
            console.warn(`Erro ao buscar entrevistas do usuário ${userId}:`, error);
          }
        }
      }

      // Log detalhado das entrevistas encontradas
      (`📊 Total de entrevistas encontradas: ${allInterviews.length}`);
      (`📋 IDs das entrevistas:`, allInterviews.map(i => i.id).sort((a, b) => parseInt(b) - parseInt(a)));

      if (allInterviews.length > 0) {
        (`📋 Detalhes das entrevistas:`, allInterviews.map(i => ({
          id: i.id,
          candidateName: i.name || i.candidate_name,
          candidateEmail: i.candidate_email,
          status: i.status,
          created_at: i.created_at,
          user_id: i.user_id,
          candidatura_id: i.candidatura_id
        })));
      } else {
        console.warn('⚠️ Nenhuma entrevista foi encontrada nos endpoints disponíveis!');
        ('🔍 Endpoints testados:');
        ('  - /api/interviews (geral)');
        ('  - /api/admin/interviews (administrativo)');
        ('  - /api/interviews/user/[id] (usuário específico)');
      }

      // Aplicar filtros se necessário
      let filteredInterviews = allInterviews;

      if (filters.candidateName) {
        filteredInterviews = filteredInterviews.filter(interview =>
          interview.name && interview.name.toLowerCase().includes(filters.candidateName.toLowerCase())
        );
      }

      if (filters.status) {
        filteredInterviews = filteredInterviews.filter(interview =>
          interview.status === filters.status
        );
      }

      // Sorting - ordenar por ID (mais recente primeiro) por padrão
      filteredInterviews.sort((a, b) => {
        if (filters.sortBy) {
          let aVal = a[filters.sortBy];
          let bVal = b[filters.sortBy];

          if (filters.sortOrder === 'ASC') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        } else {
          // Ordenar por ID decrescente (mais recente primeiro)
          return parseInt(b.id) - parseInt(a.id);
        }
      });

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedInterviews.map(interview => ({
          id: interview.id,
          candidateName: interview.name,
          candidateEmail: interview.user?.email || 'N/A',
          status: interview.status || 'in_progress',
          totalQuestions: interview.questions?.length || 0,
          answeredQuestions: interview.questions?.filter(q => q.answers?.length > 0).length || 0,
          completionPercentage: interview.questions?.length > 0
            ? Math.round((interview.questions.filter(q => q.answers?.length > 0).length / interview.questions.length) * 100)
            : 0,
          overallScore: 0, // Calcular se necessário
          createdAt: interview.created_at,
          completedAt: interview.updated_at,
          facialDataPoints: 0,
          user: interview.user
        })),
        pagination: {
          page,
          limit,
          total: filteredInterviews.length,
          totalPages: Math.ceil(filteredInterviews.length / limit)
        }
      };

    } catch (error) {
      console.error('AdminService Error getting interviews:', error);
      throw error;
    }
  }

  async getInterviewDetails(id) {
    try {
      // Usar endpoint direto em vez do admin endpoint
      const url = `${API_BASE_URL}/api/interviews/${id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      (`AdminService: Detalhes da entrevista ${id}:`, data);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error(`AdminService Error getting interview ${id} details:`, error);
      throw error;
    }
  }

  async deleteInterview(id) {
    return this.makeRequest(`/interviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistics
  async getStatsByPeriod(period) {
    return this.makeRequest(`/stats/period/${period}`);
  }

  async getStatusSummary() {
    return this.makeRequest('/stats/status-summary');
  }

  async getTopCandidates(limit = 10) {
    return this.makeRequest(`/stats/top-candidates?limit=${limit}`);
  }

  async getRecentInterviews(limit = 5) {
    return this.makeRequest(`/stats/recent-interviews?limit=${limit}`);
  }

  // Health Check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  // Utility methods
  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatScore(score) {
    if (typeof score !== 'number') return 'N/A';
    return score.toFixed(1);
  }

  formatPercentage(value) {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(1)}%`;
  }

  getStatusLabel(status) {
    const statusMap = {
      'completed': 'Concluída',
      'in_progress': 'Em Andamento',
      'pending': 'Pendente'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status) {
    const colorMap = {
      'completed': '#10B981', // green
      'in_progress': '#F59E0B', // yellow
      'pending': '#6B7280' // gray
    };
    return colorMap[status] || '#6B7280';
  }
}

export default new AdminService();

