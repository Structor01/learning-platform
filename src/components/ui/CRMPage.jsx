import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const CRMPage = () => {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');

  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
  }, []);

  const fetchLeads = async () => {
    try {
      // Simular dados de leads para demonstração
      const mockLeads = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao.silva@fazenda.com',
          phone: '+55 11 99999-1234',
          company: 'Fazenda São João',
          position: 'Proprietário Rural',
          disc_profile: 'D',
          classification: 'Hot Lead',
          priority: 'High',
          engagement_level: 85,
          lead_source: 'Website',
          lead_status: 'qualified',
          created_at: '2025-07-15T10:30:00Z',
          last_login: '2025-07-19T14:20:00Z'
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria.santos@agro.com',
          phone: '+55 11 98888-5678',
          company: 'AgroTech Solutions',
          position: 'Gerente de Vendas',
          disc_profile: 'I',
          classification: 'Customer',
          priority: 'High',
          engagement_level: 95,
          lead_source: 'LinkedIn',
          lead_status: 'closed_won',
          created_at: '2025-07-10T08:15:00Z',
          last_login: '2025-07-20T09:45:00Z'
        },
        {
          id: 3,
          name: 'Carlos Oliveira',
          email: 'carlos.oliveira@rural.com',
          phone: '+55 11 97777-9012',
          company: 'Cooperativa Rural',
          position: 'Coordenador Técnico',
          disc_profile: 'S',
          classification: 'Warm Lead',
          priority: 'Medium',
          engagement_level: 65,
          lead_source: 'Referral',
          lead_status: 'contacted',
          created_at: '2025-07-18T16:45:00Z',
          last_login: '2025-07-18T17:30:00Z'
        }
      ];
      setLeads(mockLeads);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Simular dados de analytics
      const mockAnalytics = {
        leadsByStatus: [
          { status: 'Customer', count: 45 },
          { status: 'Hot Lead', count: 23 },
          { status: 'Warm Lead', count: 67 },
          { status: 'Cold Lead', count: 89 }
        ],
        leadsBySource: [
          { source: 'Website', count: 78 },
          { source: 'LinkedIn', count: 56 },
          { source: 'Referral', count: 34 },
          { source: 'Email', count: 23 },
          { source: 'Unknown', count: 33 }
        ],
        conversionTrend: [
          { month: '2025-01-01', total_leads: 45, converted: 12 },
          { month: '2025-02-01', total_leads: 52, converted: 15 },
          { month: '2025-03-01', total_leads: 48, converted: 18 },
          { month: '2025-04-01', total_leads: 61, converted: 22 },
          { month: '2025-05-01', total_leads: 58, converted: 25 },
          { month: '2025-06-01', total_leads: 67, converted: 28 },
          { month: '2025-07-01', total_leads: 73, converted: 31 }
        ]
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Customer': return 'bg-green-500';
      case 'Hot Lead': return 'bg-red-500';
      case 'Warm Lead': return 'bg-orange-500';
      case 'Cold Lead': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-orange-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-white">Carregando dados do CRM...</p>
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
              CRM - Gestão de Leads e Clientes
            </h1>
            <p className="text-gray-400">
              Gerencie seus leads, acompanhe conversões e analise performance de vendas
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            {[
              { id: 'leads', label: 'Leads', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'pipeline', label: 'Pipeline', icon: '🔄' }
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

          {/* Leads Tab */}
          {activeTab === 'leads' && (
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
                      <p className="text-gray-400 text-sm">Total de Leads</p>
                      <p className="text-2xl font-bold text-white">224</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Clientes Ativos</p>
                      <p className="text-2xl font-bold text-white">45</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-lg">
                      <span className="text-white text-xl">✅</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa Conversão</p>
                      <p className="text-2xl font-bold text-white">20.1%</p>
                    </div>
                    <div className="bg-orange-500 p-3 rounded-lg">
                      <span className="text-white text-xl">📈</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Receita Mensal</p>
                      <p className="text-2xl font-bold text-white">R$ 1.345</p>
                    </div>
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <span className="text-white text-xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                  <h3 className="text-xl font-semibold text-white">Lista de Leads</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Empresa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Classificação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Prioridade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Engajamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Último Acesso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {lead.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {lead.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {lead.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{lead.company}</div>
                            <div className="text-sm text-gray-400">{lead.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getClassificationColor(lead.classification)}`}>
                              {lead.classification}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                              {lead.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${lead.engagement_level}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-400">{lead.engagement_level}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(lead.last_login)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowLeadModal(true);
                              }}
                              className="text-green-400 hover:text-green-300 mr-3"
                            >
                              Ver Detalhes
                            </button>
                            <button className="text-blue-400 hover:text-blue-300">
                              Editar
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
          {activeTab === 'analytics' && analytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads por Status */}
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Leads por Status</h3>
                  <div className="space-y-3">
                    {analytics.leadsByStatus.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${getClassificationColor(item.status)}`}></div>
                          <span className="text-gray-300">{item.status}</span>
                        </div>
                        <span className="text-white font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leads por Fonte */}
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">Leads por Fonte</h3>
                  <div className="space-y-3">
                    {analytics.leadsBySource.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300">{item.source}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(item.count / 100) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tendência de Conversão */}
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Tendência de Conversão (2025)</h3>
                <div className="grid grid-cols-7 gap-4">
                  {analytics.conversionTrend.map((item, index) => {
                    const month = new Date(item.month).toLocaleDateString('pt-BR', { month: 'short' });
                    const conversionRate = ((item.converted / item.total_leads) * 100).toFixed(1);
                    
                    return (
                      <div key={index} className="text-center">
                        <div className="bg-gray-800 p-4 rounded-lg mb-2">
                          <div className="text-2xl font-bold text-white">{item.converted}</div>
                          <div className="text-sm text-gray-400">de {item.total_leads}</div>
                        </div>
                        <div className="text-sm text-green-400 font-medium">{conversionRate}%</div>
                        <div className="text-xs text-gray-500 uppercase">{month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Pipeline Tab */}
          {activeTab === 'pipeline' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-6">Pipeline de Vendas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { stage: 'Novos Leads', count: 89, color: 'bg-blue-500' },
                    { stage: 'Qualificados', count: 45, color: 'bg-orange-500' },
                    { stage: 'Proposta', count: 23, color: 'bg-purple-500' },
                    { stage: 'Fechados', count: 12, color: 'bg-green-500' }
                  ].map((stage, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className={`w-12 h-12 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <span className="text-white font-bold">{stage.count}</span>
                      </div>
                      <h4 className="text-white font-medium">{stage.stage}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {index < 3 ? `${((stage.count / 89) * 100).toFixed(1)}%` : 'Taxa final'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Lead Detail Modal */}
        {showLeadModal && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Detalhes do Lead</h3>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Nome</label>
                    <p className="text-white font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white font-medium">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Telefone</label>
                    <p className="text-white font-medium">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Empresa</label>
                    <p className="text-white font-medium">{selectedLead.company}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cargo</label>
                    <p className="text-white font-medium">{selectedLead.position}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Perfil DISC</label>
                    <p className="text-white font-medium">{selectedLead.disc_profile}</p>
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Enviar Email
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Agendar Ligação
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    Adicionar Nota
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default CRMPage;

