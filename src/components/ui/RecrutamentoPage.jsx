import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const RecrutamentoPage = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchSearches();
  }, []);

  const fetchJobs = async () => {
    try {
      // Simular dados de vagas
      const mockJobs = [
        {
          id: 1,
          title: 'Engenheiro Agrônomo Sênior',
          company: 'Syngenta',
          location: 'São Paulo, SP',
          job_type: 'full-time',
          experience_level: 'senior',
          salary_range: 'R$ 8.000 - R$ 12.000',
          description: 'Responsável por desenvolvimento de produtos e suporte técnico a clientes na região Sudeste.',
          requirements: 'Graduação em Agronomia, 5+ anos de experiência, conhecimento em defensivos agrícolas.',
          benefits: 'Plano de saúde, vale refeição, participação nos lucros, carro da empresa.',
          status: 'active',
          applications_count: 23,
          views_count: 156,
          created_at: '2025-07-15T10:30:00Z'
        },
        {
          id: 2,
          title: 'Analista de Mercado Agro',
          company: 'Cargill',
          location: 'Campinas, SP',
          job_type: 'full-time',
          experience_level: 'mid',
          salary_range: 'R$ 5.000 - R$ 8.000',
          description: 'Análise de mercado de commodities agrícolas e elaboração de relatórios estratégicos.',
          requirements: 'Graduação em Economia/Administração, experiência com commodities, Excel avançado.',
          benefits: 'Plano de saúde, vale alimentação, home office híbrido, seguro de vida.',
          status: 'active',
          applications_count: 18,
          views_count: 89,
          created_at: '2025-07-18T14:20:00Z'
        },
        {
          id: 3,
          title: 'Coordenador de Sustentabilidade',
          company: 'JBS',
          location: 'São Paulo, SP',
          job_type: 'full-time',
          experience_level: 'senior',
          salary_range: 'R$ 10.000 - R$ 15.000',
          description: 'Coordenar projetos de sustentabilidade e compliance ambiental da empresa.',
          requirements: 'Graduação em Engenharia Ambiental/Agronomia, experiência em sustentabilidade.',
          benefits: 'Plano de saúde premium, participação nos lucros, carro executivo.',
          status: 'active',
          applications_count: 31,
          views_count: 203,
          created_at: '2025-07-12T09:15:00Z'
        }
      ];
      setJobs(mockJobs);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  const fetchSearches = async () => {
    try {
      // Simular histórico de buscas
      const mockSearches = [
        {
          id: 1,
          job_title: 'Engenheiro Agrônomo Sênior',
          job_company: 'Syngenta',
          keywords: 'Engenheiro Agrônomo defensivos',
          location: 'São Paulo',
          experience_level: 'senior',
          candidates_found: 23,
          created_at: '2025-07-19T10:30:00Z'
        },
        {
          id: 2,
          job_title: 'Analista de Mercado Agro',
          job_company: 'Cargill',
          keywords: 'Analista mercado commodities',
          location: 'Campinas',
          experience_level: 'mid',
          candidates_found: 18,
          created_at: '2025-07-18T15:45:00Z'
        }
      ];
      setSearches(mockSearches);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSearch = async (jobId) => {
    setLoading(true);
    try {
      // Simular busca no LinkedIn
      const mockCandidates = [
        {
          id: 1,
          name: 'Ana Silva',
          title: 'Engenheira Agrônoma',
          company: 'Corteva',
          location: 'São Paulo, SP',
          experience_years: 8,
          skills: ['Agronomia', 'Defensivos Agrícolas', 'Vendas Técnicas'],
          summary: 'Engenheira Agrônoma com 8 anos de experiência em vendas técnicas.',
          profile_image: 'https://i.pravatar.cc/150?u=ana-silva',
          linkedin_url: 'https://linkedin.com/in/ana-silva-agro',
          match_score: 95,
          contact_info: {
            email: 'ana.silva@corteva.com',
            phone: '+55 11 99999-1234'
          }
        },
        {
          id: 2,
          name: 'Carlos Santos',
          title: 'Gerente Técnico Regional',
          company: 'BASF',
          location: 'Campinas, SP',
          experience_years: 12,
          skills: ['Agronomia', 'Gestão de Equipes', 'Defensivos'],
          summary: 'Gerente com 12 anos de experiência liderando equipes técnicas.',
          profile_image: 'https://i.pravatar.cc/150?u=carlos-santos',
          linkedin_url: 'https://linkedin.com/in/carlos-santos-agro',
          match_score: 92,
          contact_info: {
            email: 'carlos.santos@basf.com',
            phone: '+55 19 98888-5678'
          }
        },
        {
          id: 3,
          name: 'Maria Oliveira',
          title: 'Consultora Técnica',
          company: 'FMC',
          location: 'Ribeirão Preto, SP',
          experience_years: 6,
          skills: ['Agronomia', 'Consultoria Técnica', 'Sustentabilidade'],
          summary: 'Consultora técnica especializada em manejo integrado.',
          profile_image: 'https://i.pravatar.cc/150?u=maria-oliveira',
          linkedin_url: 'https://linkedin.com/in/maria-oliveira-agro',
          match_score: 88,
          contact_info: {
            email: 'maria.oliveira@fmc.com',
            phone: '+55 16 97777-9012'
          }
        }
      ];
      
      setSearchResults(mockCandidates);
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Erro na busca LinkedIn:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-500';
      case 'mid': return 'bg-orange-500';
      case 'senior': return 'bg-red-500';
      case 'executive': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && activeTab !== 'candidates') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-white">Carregando dados de recrutamento...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Recrutamento - LinkedIn Premium
            </h1>
            <p className="text-gray-400">
              Gerencie vagas, busque candidatos no LinkedIn e acompanhe processos seletivos
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            {[
              { id: 'jobs', label: 'Vagas', icon: '💼' },
              { id: 'candidates', label: 'Candidatos', icon: '👥' },
              { id: 'searches', label: 'Buscas', icon: '🔍' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Vagas Ativas</p>
                      <p className="text-2xl font-bold text-white">{jobs.length}</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <span className="text-white text-xl">💼</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Candidaturas</p>
                      <p className="text-2xl font-bold text-white">72</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-lg">
                      <span className="text-white text-xl">📝</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Buscas LinkedIn</p>
                      <p className="text-2xl font-bold text-white">{searches.length}</p>
                    </div>
                    <div className="bg-orange-500 p-3 rounded-lg">
                      <span className="text-white text-xl">🔍</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa Resposta</p>
                      <p className="text-2xl font-bold text-white">34%</p>
                    </div>
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <span className="text-white text-xl">📈</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Job Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowJobModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Nova Vaga
                </button>
              </div>

              {/* Jobs List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
                        <p className="text-gray-400">{job.company} • {job.location}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getExperienceColor(job.experience_level)}`}>
                        {job.experience_level}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>{job.salary_range}</span>
                      <span>{job.job_type}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>📝 {job.applications_count} candidaturas</span>
                      <span>👁️ {job.views_count} visualizações</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowSearchModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🔍 Buscar no LinkedIn
                      </button>
                      <button className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        Ver Detalhes
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Candidates Tab */}
          {activeTab === 'candidates' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {candidates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum candidato encontrado</h3>
                  <p className="text-gray-400 mb-6">Realize uma busca no LinkedIn para encontrar candidatos qualificados</p>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Ver Vagas Disponíveis
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {candidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center mb-4">
                        <img
                          src={candidate.profile_image}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                          <p className="text-gray-400 text-sm">{candidate.title}</p>
                          <p className="text-gray-500 text-xs">{candidate.company}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Match Score</span>
                          <span className="text-green-400 font-medium">{candidate.match_score}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${candidate.match_score}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Experiência</p>
                        <p className="text-white text-sm">{candidate.experience_years} anos</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          💬 Contatar
                        </button>
                        <button className="bg-gray-700 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                          👁️ Ver Perfil
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Searches Tab */}
          {activeTab === 'searches' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                  <h3 className="text-xl font-semibold text-white">Histórico de Buscas</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Vaga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Palavras-chave
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Localização
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Candidatos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {searches.map((search) => (
                        <tr key={search.id} className="hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{search.job_title}</div>
                            <div className="text-sm text-gray-400">{search.job_company}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {search.keywords}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {search.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-green-400 font-medium">{search.candidates_found}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(search.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-400 hover:text-blue-300 mr-3">
                              Ver Candidatos
                            </button>
                            <button className="text-green-400 hover:text-green-300">
                              Nova Busca
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Performance de Buscas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total de Buscas</span>
                      <span className="text-white font-bold">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Candidatos Encontrados</span>
                      <span className="text-white font-bold">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Taxa de Resposta</span>
                      <span className="text-green-400 font-bold">34%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Contratações</span>
                      <span className="text-white font-bold">8</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Vagas por Nível</h3>
                  <div className="space-y-3">
                    {[
                      { level: 'Entry', count: 5, color: 'bg-green-500' },
                      { level: 'Mid', count: 8, color: 'bg-orange-500' },
                      { level: 'Senior', count: 12, color: 'bg-red-500' },
                      { level: 'Executive', count: 3, color: 'bg-purple-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
                          <span className="text-gray-300">{item.level}</span>
                        </div>
                        <span className="text-white font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* LinkedIn Search Modal */}
        {showSearchModal && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Buscar Candidatos no LinkedIn</h3>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-gray-400 text-sm">Vaga Selecionada</label>
                  <p className="text-white font-medium">{selectedJob.title} - {selectedJob.company}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Palavras-chave</label>
                    <input
                      type="text"
                      defaultValue="Engenheiro Agrônomo"
                      className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Localização</label>
                    <input
                      type="text"
                      defaultValue="São Paulo, SP"
                      className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm">Nível de Experiência</label>
                  <select className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700">
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior" selected>Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    handleLinkedInSearch(selectedJob.id);
                    setShowSearchModal(false);
                    setActiveTab('candidates');
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
                >
                  🔍 Buscar no LinkedIn Premium
                </button>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecrutamentoPage;

