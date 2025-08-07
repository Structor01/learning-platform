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

      console.log(`AdminService: ${config.method || 'GET'} ${url}`);
      
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
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/interviews?${queryString}` : '/interviews';
    
    return this.makeRequest(endpoint);
  }

  async getInterviewDetails(id) {
    return this.makeRequest(`/interviews/${id}`);
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

