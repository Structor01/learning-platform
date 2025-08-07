import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    candidateName: '',
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({});
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else if (activeTab === 'interviews') {
      loadInterviews();
    }
  }, [activeTab, filters]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats();
      setDashboardStats(response.data);
    } catch (err) {
      setError('Erro ao carregar estatísticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getInterviewsList(filters);
      setInterviews(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erro ao carregar entrevistas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDeleteInterview = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta entrevista?')) {
      return;
    }

    try {
      await adminService.deleteInterview(id);
      loadInterviews(); // Reload list
      alert('Entrevista excluída com sucesso!');
    } catch (err) {
      alert('Erro ao excluir entrevista: ' + err.message);
    }
  };

  const handleViewDetails = async (interview) => {
    try {
      setLoading(true);
      const response = await adminService.getInterviewDetails(interview.id);
      setSelectedInterview(response.data);
      setShowDetails(true);
    } catch (err) {
      alert('Erro ao carregar detalhes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>Dashboard Administrativo</h2>
      
      {loading && <div className="loading">Carregando estatísticas...</div>}
      {error && <div className="error">{error}</div>}
      
      {dashboardStats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total de Entrevistas</h3>
              <div className="stat-value">{dashboardStats.totalInterviews}</div>
            </div>
            
            <div className="stat-card">
              <h3>Entrevistas Concluídas</h3>
              <div className="stat-value">{dashboardStats.completedInterviews}</div>
              <div className="stat-subtitle">
                {dashboardStats.totalInterviews > 0 
                  ? `${((dashboardStats.completedInterviews / dashboardStats.totalInterviews) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Em Andamento</h3>
              <div className="stat-value">{dashboardStats.inProgressInterviews}</div>
            </div>
            
            <div className="stat-card">
              <h3>Pontuação Média</h3>
              <div className="stat-value">{adminService.formatScore(dashboardStats.averageScore)}</div>
              <div className="stat-subtitle">de 10.0</div>
            </div>
            
            <div className="stat-card">
              <h3>Taxa de Conclusão</h3>
              <div className="stat-value">{adminService.formatPercentage(dashboardStats.averageCompletionRate)}</div>
            </div>
            
            <div className="stat-card">
              <h3>Hoje</h3>
              <div className="stat-value">{dashboardStats.interviewsToday}</div>
              <div className="stat-subtitle">entrevistas</div>
            </div>
            
            <div className="stat-card">
              <h3>Esta Semana</h3>
              <div className="stat-value">{dashboardStats.interviewsThisWeek}</div>
              <div className="stat-subtitle">entrevistas</div>
            </div>
            
            <div className="stat-card">
              <h3>Este Mês</h3>
              <div className="stat-value">{dashboardStats.interviewsThisMonth}</div>
              <div className="stat-subtitle">entrevistas</div>
            </div>
          </div>
          
          <div className="dashboard-summary">
            <h3>Resumo Geral</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total de Perguntas:</span>
                <span className="summary-value">{dashboardStats.totalQuestions}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total de Respostas:</span>
                <span className="summary-value">{dashboardStats.totalResponses}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInterviews = () => (
    <div className="admin-interviews">
      <div className="interviews-header">
        <h2>Gerenciar Entrevistas</h2>
        
        <div className="filters">
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="completed">Concluídas</option>
            <option value="in_progress">Em Andamento</option>
            <option value="pending">Pendentes</option>
          </select>
          
          <input
            type="text"
            placeholder="Nome do candidato..."
            value={filters.candidateName}
            onChange={(e) => handleFilterChange('candidateName', e.target.value)}
          />
          
          <select 
            value={filters.sortBy} 
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="created_at">Data de Criação</option>
            <option value="name">Nome do Candidato</option>
            <option value="overall_score">Pontuação</option>
            <option value="answered_questions">Perguntas Respondidas</option>
          </select>
          
          <select 
            value={filters.sortOrder} 
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="DESC">Decrescente</option>
            <option value="ASC">Crescente</option>
          </select>
        </div>
      </div>
      
      {loading && <div className="loading">Carregando entrevistas...</div>}
      {error && <div className="error">{error}</div>}
      
      {interviews.length > 0 && (
        <>
          <div className="interviews-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Candidato</th>
                  <th>Status</th>
                  <th>Progresso</th>
                  <th>Pontuação</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map(interview => (
                  <tr key={interview.id}>
                    <td>{interview.id}</td>
                    <td>
                      <div className="candidate-info">
                        <div className="candidate-name">{interview.candidateName}</div>
                        <div className="candidate-email">{interview.candidateEmail}</div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: adminService.getStatusColor(interview.status) }}
                      >
                        {adminService.getStatusLabel(interview.status)}
                      </span>
                    </td>
                    <td>
                      <div className="progress-info">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${interview.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {interview.answeredQuestions}/{interview.totalQuestions} 
                          ({adminService.formatPercentage(interview.completionPercentage)})
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="score">{adminService.formatScore(interview.overallScore)}/10</span>
                    </td>
                    <td>{adminService.formatDate(interview.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn-view"
                          onClick={() => handleViewDetails(interview)}
                        >
                          Ver Detalhes
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteInterview(interview.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Anterior
              </button>
              
              <span className="page-info">
                Página {pagination.page} de {pagination.totalPages} 
                ({pagination.total} entrevistas)
              </span>
              
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
      
      {interviews.length === 0 && !loading && (
        <div className="no-data">Nenhuma entrevista encontrada.</div>
      )}
    </div>
  );

  const renderInterviewDetails = () => {
    if (!selectedInterview) return null;

    const { interview, questions, stats } = selectedInterview;

    return (
      <div className="interview-details-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Detalhes da Entrevista #{interview.id}</h2>
            <button 
              className="close-btn"
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="details-grid">
              <div className="detail-section">
                <h3>Informações do Candidato</h3>
                <div className="detail-item">
                  <span className="label">Nome:</span>
                  <span className="value">{interview.candidate_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{interview.candidate_email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className="value">{adminService.getStatusLabel(interview.status)}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Estatísticas</h3>
                <div className="detail-item">
                  <span className="label">Pontuação Geral:</span>
                  <span className="value">{adminService.formatScore(interview.overall_score)}/10</span>
                </div>
                <div className="detail-item">
                  <span className="label">Progresso:</span>
                  <span className="value">
                    {interview.answered_questions}/{interview.total_questions} perguntas
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Taxa de Conclusão:</span>
                  <span className="value">{adminService.formatPercentage(stats.completionRate)}</span>
                </div>
              </div>
            </div>
            
            <div className="questions-section">
              <h3>Perguntas e Respostas</h3>
              <div className="questions-list">
                {questions.map(question => (
                  <div key={question.id} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Pergunta {question.order}</span>
                      <span className={`question-status ${question.answered ? 'answered' : 'unanswered'}`}>
                        {question.answered ? 'Respondida' : 'Não Respondida'}
                      </span>
                    </div>
                    <div className="question-text">{question.title}</div>
                    {question.answered && question.answer && (
                      <div className="answer-section">
                        <div className="answer-text">{question.answer.text}</div>
                        <div className="answer-meta">
                          Respondida em: {adminService.formatDate(question.answer.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Administração de Entrevistas</h1>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'interviews' ? 'active' : ''}
            onClick={() => setActiveTab('interviews')}
          >
            Entrevistas
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'interviews' && renderInterviews()}
      </div>
      
      {showDetails && renderInterviewDetails()}
    </div>
  );
};

export default AdminPage;

