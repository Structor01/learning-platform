import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Navbar from './Navbar';
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
  Calendar,
  MessageCircle,
  GraduationCap,
  Briefcase,
  User
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
      
      // Configurar URLs da API
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://learning-platform-backend-2x39.onrender.com'
        : 'https://3001-i0i34mly27zw354o7dxo5-f4ac7591.manusvm.computer';
      
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
      case 'Hot Lead': return 'bg-red-500 !important';
      case 'Warm Lead': return 'bg-orange-500 !important';
      case 'Cold Lead': return 'bg-blue-500 !important';
      case 'Customer': return 'bg-green-500 !important';
      default: return 'bg-gray-500 !important';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 !important';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 !important';
      case 'Low': return 'bg-green-100 text-green-800 !important';
      default: return 'bg-gray-100 text-gray-800 !important';
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
      <div className="min-h-screen !important bg-gray-900 !important p-4 !important flex items-center justify-center !important">
        <div className="text-white !important text-xl !important">Carregando dados do CRM da API...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen !important bg-gray-900 !important text-white !important p-4 !important pt-20 !important">
        <div className="max-w-7xl !important mx-auto !important">
          {/* Header */}
          <div className="mb-8 !important">
            <h1 className="text-3xl !important font-bold !important text-white !important mb-2 !important">
              CRM - Gestão de Leads
            </h1>
            <p className="text-gray-400 !important">
              Dados em tempo real da tabela users via API NestJS
            </p>
          </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 !important gap-6 !important mb-8 !important">
            <Card className="bg-gray-800 !important border-gray-700 !important">
              <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                  Total de Leads
                </CardTitle>
                <Users className="h-4 w-4 !important text-blue-400 !important" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl !important font-bold !important text-white !important">
                  {analytics.totalLeads}
                </div>
                <p className="text-xs !important text-green-400 !important">
                  Usuários da plataforma
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 !important border-gray-700 !important">
              <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                  Taxa de Conversão
                </CardTitle>
                <TrendingUp className="h-4 w-4 !important text-green-400 !important" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl !important font-bold !important text-white !important">
                  15%
                </div>
                <p className="text-xs !important text-green-400 !important">
                  Estimativa baseada em dados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 !important border-gray-700 !important">
              <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                  Leads Qualificados
                </CardTitle>
                <Target className="h-4 w-4 !important text-orange-400 !important" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl !important font-bold !important text-white !important">
                  {pipeline?.qualified || 0}
                </div>
                <p className="text-xs !important text-orange-400 !important">
                  Prontos para proposta
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 !important border-gray-700 !important">
              <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                  Receita Potencial
                </CardTitle>
                <DollarSign className="h-4 w-4 !important text-green-400 !important" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl !important font-bold !important text-white !important">
                  R$ {(analytics.totalLeads * 15).toFixed(1)}K
                </div>
                <p className="text-xs !important text-green-400 !important">
                  Pipeline estimado
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pipeline */}
        {pipeline && (
          <Card className="bg-gray-800 !important border-gray-700 !important mb-8 !important">
            <CardHeader>
              <CardTitle className="text-white !important">Pipeline de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 !important gap-4 !important">
                <div className="text-center !important">
                  <div className="text-2xl !important font-bold !important text-blue-400 !important">
                    {pipeline.new}
                  </div>
                  <div className="text-sm !important text-gray-400 !important">Novos</div>
                </div>
                <div className="text-center !important">
                  <div className="text-2xl !important font-bold !important text-yellow-400 !important">
                    {pipeline.contacted}
                  </div>
                  <div className="text-sm !important text-gray-400 !important">Contatados</div>
                </div>
                <div className="text-center !important">
                  <div className="text-2xl !important font-bold !important text-orange-400 !important">
                    {pipeline.qualified}
                  </div>
                  <div className="text-sm !important text-gray-400 !important">Qualificados</div>
                </div>
                <div className="text-center !important">
                  <div className="text-2xl !important font-bold !important text-purple-400 !important">
                    {pipeline.proposal}
                  </div>
                  <div className="text-sm !important text-gray-400 !important">Proposta</div>
                </div>
                <div className="text-center !important">
                  <div className="text-2xl !important font-bold !important text-green-400 !important">
                    {pipeline.closed_won}
                  </div>
                  <div className="text-sm !important text-gray-400 !important">Fechados</div>
                </div>
                <div className="text-center !important">
                  <div className="text-2xl !important font-bold !important text-red-400 !important">
                    {pipeline.closed_lost}
                  </div>
                  <div className="text-sm !important text-gray-400 !important">Perdidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e Busca */}
        <Card className="bg-gray-800 !important border-gray-700 !important mb-6 !important">
          <CardContent className="pt-6 !important">
            <div className="flex flex-col md:flex-row !important gap-4 !important">
              <div className="flex-1 !important">
                <div className="relative !important">
                  <Search className="absolute left-3 top-1/2 !important transform -translate-y-1/2 !important text-gray-400 !important h-4 w-4 !important" />
                  <Input
                    placeholder="Buscar leads por nome, email ou empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 !important bg-gray-700 !important border-gray-600 !important text-white !important placeholder-gray-400 !important"
                  />
                </div>
              </div>
              <div className="flex gap-2 !important flex-wrap !important">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="bg-blue-600 hover:bg-blue-700 !important text-white !important border-blue-600 !important"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'Hot Lead' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Hot Lead')}
                  className="bg-red-600 hover:bg-red-700 !important text-white !important border-red-600 !important"
                >
                  Hot
                </Button>
                <Button
                  variant={filterStatus === 'Warm Lead' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Warm Lead')}
                  className="bg-orange-600 hover:bg-orange-700 !important text-white !important border-orange-600 !important"
                >
                  Warm
                </Button>
                <Button
                  variant={filterStatus === 'Cold Lead' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Cold Lead')}
                  className="bg-blue-600 hover:bg-blue-700 !important text-white !important border-blue-600 !important"
                >
                  Cold
                </Button>
                <Button
                  variant={filterStatus === 'Customer' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('Customer')}
                  className="bg-green-600 hover:bg-green-700 !important text-white !important border-green-600 !important"
                >
                  Customer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Leads */}
        <div className="grid gap-4 !important">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="bg-gray-800 !important border-gray-700 !important hover:bg-gray-750 !important transition-colors !important">
              <CardContent className="p-6 !important">
                <div className="flex flex-col lg:flex-row !important items-start lg:items-center !important justify-between !important gap-4 !important">
                  <div className="flex-1 !important">
                    <div className="flex flex-col sm:flex-row !important items-start sm:items-center !important gap-3 !important mb-3 !important">
                      <h3 className="text-lg !important font-semibold !important text-white !important">
                        {lead.name}
                      </h3>
                      <div className="flex gap-2 !important flex-wrap !important">
                        <Badge className={`${getClassificationColor(lead.classification)} text-white !important`}>
                          {lead.classification}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 !important gap-3 !important text-sm !important text-gray-400 !important">
                      <div className="flex items-center !important gap-2 !important">
                        <Mail className="h-4 w-4 !important flex-shrink-0 !important" />
                        <span className="truncate !important">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center !important gap-2 !important">
                          <Phone className="h-4 w-4 !important flex-shrink-0 !important" />
                          <span className="truncate !important">{lead.phone}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center !important gap-2 !important">
                          <Building className="h-4 w-4 !important flex-shrink-0 !important" />
                          <span className="truncate !important">{lead.company}</span>
                        </div>
                      )}
                      <div className="flex items-center !important gap-2 !important">
                        <Calendar className="h-4 w-4 !important flex-shrink-0 !important" />
                        <span className="truncate !important">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 !important">
                      <div className="flex items-center !important gap-2 !important mb-1 !important">
                        <span className="text-sm !important text-gray-400 !important">Engajamento:</span>
                        <span className="text-sm !important font-medium !important text-white !important">
                          {lead.engagement_level}%
                        </span>
                      </div>
                      <div className="w-full !important bg-gray-700 !important rounded-full !important h-2 !important">
                        <div 
                          className="bg-blue-500 !important h-2 !important rounded-full !important transition-all !important"
                          style={{ width: `${lead.engagement_level}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 !important flex-wrap !important">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 !important text-white !important"
                    >
                      Contatar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important"
                    >
                      <MoreVertical className="h-4 w-4 !important" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <Card className="bg-gray-800 !important border-gray-700 !important">
            <CardContent className="text-center !important py-12 !important">
              <Users className="h-12 w-12 !important text-gray-400 !important mx-auto !important mb-4 !important" />
              <h3 className="text-lg !important font-medium !important text-white !important mb-2 !important">
                {leads.length === 0 ? 'Nenhum dado encontrado na API' : 'Nenhum lead encontrado'}
              </h3>
              <p className="text-gray-400 !important">
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
    </>
  );
};

export default CRMPage;

