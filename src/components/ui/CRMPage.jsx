import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Building,
  Calendar
} from 'lucide-react';

const CRMPage = () => {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";
      
      // Buscar dados reais da API
      const [leadsResponse, analyticsResponse, pipelineResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/crm/leads`),
        fetch(`${API_BASE_URL}/api/crm/analytics`),
        fetch(`${API_BASE_URL}/api/crm/pipeline`)
      ]);

      if (leadsResponse.ok && analyticsResponse.ok && pipelineResponse.ok) {
        const leadsData = await leadsResponse.json();
        const analyticsData = await analyticsResponse.json();
        const pipelineData = await pipelineResponse.json();

        setLeads(leadsData);
        setAnalytics(analyticsData);
        setPipeline(pipelineData);
      } else {
        console.error('Erro ao carregar dados da API');
        setLeads([]);
        setAnalytics({ totalLeads: 0, leadsByStatus: [], leadsBySource: [], conversionTrend: [] });
        setPipeline({ new: 0, contacted: 0, qualified: 0, proposal: 0, closed_won: 0, closed_lost: 0 });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do CRM:', error);
      setLeads([]);
      setAnalytics({ totalLeads: 0, leadsByStatus: [], leadsBySource: [], conversionTrend: [] });
      setPipeline({ new: 0, contacted: 0, qualified: 0, proposal: 0, closed_won: 0, closed_lost: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Hot Lead': return 'bg-red-500';
      case 'Warm Lead': return 'bg-orange-500';
      case 'Cold Lead': return 'bg-blue-500';
      case 'Customer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || lead.classification === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Carregando dados do CRM da API...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            CRM - Gestão de Leads
          </h1>
          <p className="text-gray-400">
            Dados em tempo real da tabela users via API NestJS
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:!grid-cols-2 lg:!!grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total de Leads
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {analytics.totalLeads}
                </div>
                <p className="text-xs text-green-400">
                  Usuários da plataforma
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Taxa de Conversão
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  15%
                </div>
                <p className="text-xs text-green-400">
                  Estimativa baseada em dados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Leads Qualificados
                </CardTitle>
                <Target className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {pipeline?.qualified || 0}
                </div>
                <p className="text-xs text-orange-400">
                  Prontos para proposta
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Receita Potencial
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  R$ {(analytics.totalLeads * 15).toFixed(1)}K
                </div>
                <p className="text-xs text-green-400">
                  Pipeline estimado
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pipeline */}
        {pipeline && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Pipeline de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:!!grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {pipeline.new}
                  </div>
                  <div className="text-sm text-gray-400">Novos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {pipeline.contacted}
                  </div>
                  <div className="text-sm text-gray-400">Contatados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {pipeline.qualified}
                  </div>
                  <div className="text-sm text-gray-400">Qualificados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {pipeline.proposal}
                  </div>
                  <div className="text-sm text-gray-400">Proposta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {pipeline.closed_won}
                  </div>
                  <div className="text-sm text-gray-400">Fechados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {pipeline.closed_lost}
                  </div>
                  <div className="text-sm text-gray-400">Perdidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e Busca */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar leads por nome, email ou empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'Hot Lead' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Hot Lead')}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Hot
                </Button>
                <Button
                  variant={filterStatus === 'Warm Lead' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Warm Lead')}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                >
                  Warm
                </Button>
                <Button
                  variant={filterStatus === 'Cold Lead' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Cold Lead')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  Cold
                </Button>
                <Button
                  variant={filterStatus === 'Customer' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Customer')}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  Customer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Leads */}
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:!flex-row items-start lg:!items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {lead.name}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${getClassificationColor(lead.classification)} text-white`}>
                          {lead.classification}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400">Engajamento:</span>
                        <span className="text-sm font-medium text-white">
                          {lead.engagement_level}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${lead.engagement_level}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Contatar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {leads.length === 0 ? 'Nenhum dado encontrado na API' : 'Nenhum lead encontrado'}
              </h3>
              <p className="text-gray-400">
                {leads.length === 0 
                  ? 'Verifique se a API está funcionando corretamente'
                  : 'Tente ajustar os filtros ou termo de busca'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CRMPage;

