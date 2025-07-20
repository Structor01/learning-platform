import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';

const CRMPage = () => {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterEducation, setFilterEducation] = useState('all');
  const [filterDisc, setFilterDisc] = useState('all');
  const [filterLideranca, setFilterLideranca] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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

  const formatWhatsAppLink = (phone) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.acting_area?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || lead.classification === filterStatus;
    const matchesArea = filterArea === 'all' || lead.acting_area === filterArea;
    const matchesEducation = filterEducation === 'all' || lead.educational_background === filterEducation;
    const matchesDisc = filterDisc === 'all' || lead.perfil_disc === filterDisc || lead.disc_profile === filterDisc;
    const matchesLideranca = filterLideranca === 'all' || lead.perfil_lideranca === filterLideranca;
    
    return matchesSearch && matchesFilter && matchesArea && matchesEducation && matchesDisc && matchesLideranca;
  });

  // Ordenação
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    
    // Tratamento especial para campos numéricos
    if (sortField === 'engagement_level') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    // Tratamento para datas
    if (sortField === 'created_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginação
  const totalFilteredLeads = sortedLeads.length;
  const totalPagesCalculated = Math.ceil(totalFilteredLeads / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  // Atualizar total de páginas quando filtros mudarem
  useEffect(() => {
    setTotalPages(totalPagesCalculated);
    if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
      setCurrentPage(1);
    }
  }, [totalPagesCalculated, currentPage]);

  // Extrair valores únicos para filtros
  const uniqueAreas = [...new Set(leads.map(lead => lead.acting_area).filter(Boolean))];
  const uniqueEducation = [...new Set(leads.map(lead => lead.educational_background).filter(Boolean))];
  const uniqueDisc = [...new Set(leads.map(lead => lead.perfil_disc || lead.disc_profile).filter(Boolean))];
  const uniqueLideranca = [...new Set(leads.map(lead => lead.perfil_lideranca).filter(Boolean))];

  // Função para ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Funções de paginação
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterArea('all');
    setFilterEducation('all');
    setFilterDisc('all');
    setFilterLideranca('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen !important bg-gray-900 !important p-4 !important pt-20 !important flex items-center justify-center !important">
          <div className="text-white !important text-xl !important">Carregando dados do CRM da API...</div>
        </div>
      </>
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
              <div className="space-y-4 !important">
                {/* Busca */}
                <div className="relative !important">
                  <Search className="absolute left-3 top-1/2 !important transform -translate-y-1/2 !important text-gray-400 !important h-4 w-4 !important" />
                  <Input
                    placeholder="Buscar por nome, email, empresa, área de atuação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 !important bg-gray-700 !important border-gray-600 !important text-white !important placeholder-gray-400 !important"
                  />
                </div>
                
                {/* Filtros */}
                <div className="flex flex-wrap !important gap-4 !important">
                  {/* Filtro por Classificação */}
                  <div className="flex gap-2 !important flex-wrap !important">
                    <span className="text-sm !important text-gray-400 !important self-center !important">Classificação:</span>
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                      className="bg-blue-600 hover:bg-blue-700 !important text-white !important border-blue-600 !important"
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filterStatus === 'Hot Lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Hot Lead')}
                      className="bg-red-600 hover:bg-red-700 !important text-white !important border-red-600 !important"
                    >
                      Hot
                    </Button>
                    <Button
                      variant={filterStatus === 'Warm Lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Warm Lead')}
                      className="bg-orange-600 hover:bg-orange-700 !important text-white !important border-orange-600 !important"
                    >
                      Warm
                    </Button>
                    <Button
                      variant={filterStatus === 'Cold Lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Cold Lead')}
                      className="bg-blue-600 hover:bg-blue-700 !important text-white !important border-blue-600 !important"
                    >
                      Cold
                    </Button>
                    <Button
                      variant={filterStatus === 'Customer' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Customer')}
                      className="bg-green-600 hover:bg-green-700 !important text-white !important border-green-600 !important"
                    >
                      Customer
                    </Button>
                  </div>

                  {/* Filtro por Área */}
                  {uniqueAreas.length > 0 && (
                    <div className="flex gap-2 !important flex-wrap !important">
                      <span className="text-sm !important text-gray-400 !important self-center !important">Área:</span>
                      <select
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                        className="bg-gray-700 !important border-gray-600 !important text-white !important rounded px-3 py-1 !important text-sm !important"
                      >
                        <option value="all">Todas as áreas</option>
                        {uniqueAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Filtro por Educação */}
                  {uniqueEducation.length > 0 && (
                    <div className="flex gap-2 !important flex-wrap !important">
                      <span className="text-sm !important text-gray-400 !important self-center !important">Educação:</span>
                      <select
                        value={filterEducation}
                        onChange={(e) => setFilterEducation(e.target.value)}
                        className="bg-gray-700 !important border-gray-600 !important text-white !important rounded px-3 py-1 !important text-sm !important"
                      >
                        <option value="all">Todas as formações</option>
                        {uniqueEducation.map(education => (
                          <option key={education} value={education}>{education}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Filtro por DISC */}
                  {uniqueDisc.length > 0 && (
                    <div className="flex gap-2 !important flex-wrap !important">
                      <span className="text-sm !important text-gray-400 !important self-center !important">DISC:</span>
                      <select
                        value={filterDisc}
                        onChange={(e) => setFilterDisc(e.target.value)}
                        className="bg-gray-700 !important border-gray-600 !important text-white !important rounded px-3 py-1 !important text-sm !important"
                      >
                        <option value="all">Todos os perfis</option>
                        {uniqueDisc.map(disc => (
                          <option key={disc} value={disc}>{disc}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Filtro por Liderança */}
                  {uniqueLideranca.length > 0 && (
                    <div className="flex gap-2 !important flex-wrap !important">
                      <span className="text-sm !important text-gray-400 !important self-center !important">Liderança:</span>
                      <select
                        value={filterLideranca}
                        onChange={(e) => setFilterLideranca(e.target.value)}
                        className="bg-gray-700 !important border-gray-600 !important text-white !important rounded px-3 py-1 !important text-sm !important"
                      >
                        <option value="all">Todos os perfis</option>
                        {uniqueLideranca.map(lideranca => (
                          <option key={lideranca} value={lideranca}>{lideranca}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Botão Limpar Filtros */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important"
                  >
                    <X className="h-4 w-4 !important mr-1 !important" />
                    Limpar
                  </Button>
                </div>

                {/* Controles de Paginação e Itens por Página */}
                <div className="flex flex-col sm:flex-row !important justify-between !important items-center !important gap-4 !important">
                  <div className="flex items-center !important gap-2 !important">
                    <span className="text-sm !important text-gray-400 !important">Itens por página:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-gray-700 !important border-gray-600 !important text-white !important rounded px-2 py-1 !important text-sm !important"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="text-sm !important text-gray-400 !important">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, totalFilteredLeads)} de {totalFilteredLeads} leads
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Leads */}
          <Card className="bg-gray-800 !important border-gray-700 !important">
            <CardHeader>
              <CardTitle className="text-white !important">
                Leads ({totalFilteredLeads})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 !important">
              <div className="overflow-x-auto !important">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 !important">
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Nome
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Email
                          {sortField === 'email' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 !important">Telefone</TableHead>
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('current_company')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Empresa
                          {sortField === 'current_company' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('acting_area')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Área
                          {sortField === 'acting_area' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('educational_background')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Educação
                          {sortField === 'educational_background' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 !important">DISC</TableHead>
                      <TableHead className="text-gray-300 !important">Liderança</TableHead>
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('classification')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Status
                          {sortField === 'classification' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 !important cursor-pointer !important hover:text-white !important"
                        onClick={() => handleSort('engagement_level')}
                      >
                        <div className="flex items-center !important gap-1 !important">
                          Engajamento
                          {sortField === 'engagement_level' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 !important" /> : <ArrowDown className="h-3 w-3 !important" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 !important" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 !important">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead) => (
                      <TableRow key={lead.id} className="border-gray-700 !important hover:bg-gray-750 !important">
                        <TableCell className="text-white !important font-medium !important">
                          <div className="flex items-center !important gap-2 !important">
                            <User className="h-4 w-4 !important text-gray-400 !important" />
                            {lead.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 !important">
                          <div className="flex items-center !important gap-2 !important">
                            <Mail className="h-4 w-4 !important text-gray-400 !important" />
                            <span className="truncate !important max-w-[200px] !important">{lead.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 !important">
                          {lead.phone ? (
                            <div className="flex items-center !important gap-2 !important">
                              <Phone className="h-4 w-4 !important text-gray-400 !important" />
                              <span>{lead.phone}</span>
                              <a
                                href={formatWhatsAppLink(lead.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 !important hover:text-green-300 !important"
                              >
                                <MessageCircle className="h-4 w-4 !important" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-500 !important">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 !important">
                          <div className="flex items-center !important gap-2 !important">
                            <Building className="h-4 w-4 !important text-gray-400 !important" />
                            <span className="truncate !important max-w-[150px] !important">
                              {lead.current_company || lead.company || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 !important">
                          <div className="flex items-center !important gap-2 !important">
                            <Briefcase className="h-4 w-4 !important text-gray-400 !important" />
                            <span className="truncate !important max-w-[120px] !important">
                              {lead.acting_area || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 !important">
                          <div className="flex items-center !important gap-2 !important">
                            <GraduationCap className="h-4 w-4 !important text-gray-400 !important" />
                            <span className="truncate !important max-w-[120px] !important">
                              {lead.educational_background || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-purple-300 !important border-purple-500 !important">
                            {lead.perfil_disc || lead.disc_profile || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-blue-300 !important border-blue-500 !important">
                            {lead.perfil_lideranca || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 !important flex-wrap !important">
                            <Badge className={`${getClassificationColor(lead.classification)} text-white !important text-xs !important`}>
                              {lead.classification}
                            </Badge>
                            <Badge variant="outline" className={`${getPriorityColor(lead.priority)} text-xs !important`}>
                              {lead.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 !important">
                          <div className="flex items-center !important gap-2 !important">
                            <div className="w-16 !important bg-gray-700 !important rounded-full !important h-2 !important">
                              <div 
                                className="bg-blue-500 !important h-2 !important rounded-full !important"
                                style={{ width: `${lead.engagement_level}%` }}
                              ></div>
                            </div>
                            <span className="text-xs !important">{lead.engagement_level}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 !important">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important p-1 !important"
                            >
                              <Mail className="h-3 w-3 !important" />
                            </Button>
                            {lead.phone && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important p-1 !important"
                                onClick={() => window.open(formatWhatsAppLink(lead.phone), '_blank')}
                              >
                                <MessageCircle className="h-3 w-3 !important" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important p-1 !important"
                            >
                              <MoreVertical className="h-3 w-3 !important" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row !important justify-between !important items-center !important gap-4 !important p-4 !important border-t !important border-gray-700 !important">
                  <div className="text-sm !important text-gray-400 !important">
                    Página {currentPage} de {totalPages}
                  </div>
                  
                  <div className="flex items-center !important gap-2 !important">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important disabled:opacity-50 !important"
                    >
                      <ChevronsLeft className="h-4 w-4 !important" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important disabled:opacity-50 !important"
                    >
                      <ChevronLeft className="h-4 w-4 !important" />
                    </Button>
                    
                    {/* Números das páginas */}
                    <div className="flex items-center !important gap-1 !important">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={currentPage === pageNum 
                              ? "bg-blue-600 !important text-white !important"
                              : "border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important disabled:opacity-50 !important"
                    >
                      <ChevronRight className="h-4 w-4 !important" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important disabled:opacity-50 !important"
                    >
                      <ChevronsRight className="h-4 w-4 !important" />
                    </Button>
                  </div>
                </div>
              )}

              {paginatedLeads.length === 0 && (
                <div className="text-center !important py-12 !important">
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CRMPage;

