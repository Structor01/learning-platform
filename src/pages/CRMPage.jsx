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
import Navbar from '../components/ui/Navbar';
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
  X,
  TextSearch
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
      case 'Hot Lead': return 'bg-red-500 ';
      case 'Warm Lead': return 'bg-orange-500 ';
      case 'Cold Lead': return 'bg-blue-500 ';
      case 'Customer': return 'bg-green-500 ';
      default: return 'bg-gray-500 ';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 ';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 ';
      case 'Low': return 'bg-green-100 text-green-800 ';
      default: return 'bg-gray-100 text-gray-800 ';
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
        <div className="min-h-screen  bg-gray-900  p-4  pt-20  flex items-center justify-center ">
          <div className="text-white  text-xl ">Carregando dados do CRM da API...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen  bg-gray-900  text-white  p-4  pt-20 ">
        <div className="max-w-7xl  mx-auto ">
          {/* Header */}
          <div className="mb-8 ">
            <h1 className="text-3xl  font-bold  text-white  mb-2 ">
              CRM - Gestão de Leads
            </h1>
            <p className="text-gray-400 ">
              Dados em tempo real da tabela users via API NestJS
            </p>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4  gap-6  mb-8 ">
              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Total de Leads
                  </CardTitle>
                  <Users className="h-4 w-4  text-blue-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalLeads}
                  </div>
                  <p className="text-xs  text-green-400 ">
                    Usuários da plataforma
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Taxa de Conversão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4  text-green-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    15%
                  </div>
                  <p className="text-xs  text-green-400 ">
                    Estimativa baseada em dados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Leads Qualificados
                  </CardTitle>
                  <Target className="h-4 w-4  text-orange-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {pipeline?.qualified || 0}
                  </div>
                  <p className="text-xs  text-orange-400 ">
                    Prontos para proposta
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Receita Potencial
                  </CardTitle>
                  <DollarSign className="h-4 w-4  text-green-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    R$ {(analytics.totalLeads * 15).toFixed(1)}K
                  </div>
                  <p className="text-xs  text-green-400 ">
                    Pipeline estimado
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pipeline */}
          {pipeline && (
            <Card className="bg-gray-800  border-gray-700  mb-8 ">
              <CardHeader>
                <CardTitle className="text-white ">Pipeline de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:!grid-cols-3 lg:!grid-cols-6  gap-4 ">
                  <div className="text-center ">
                    <div className="text-2xl  font-bold  text-blue-400 ">
                      {pipeline.new}
                    </div>
                    <div className="text-sm  text-gray-400 ">Novos</div>
                  </div>
                  <div className="text-center ">
                    <div className="text-2xl  font-bold  text-yellow-400 ">
                      {pipeline.contacted}
                    </div>
                    <div className="text-sm  text-gray-400 ">Contatados</div>
                  </div>
                  <div className="text-center ">
                    <div className="text-2xl  font-bold  text-orange-400 ">
                      {pipeline.qualified}
                    </div>
                    <div className="text-sm  text-gray-400 ">Qualificados</div>
                  </div>
                  <div className="text-center ">
                    <div className="text-2xl  font-bold  text-purple-400 ">
                      {pipeline.proposal}
                    </div>
                    <div className="text-sm  text-gray-400 ">Proposta</div>
                  </div>
                  <div className="text-center ">
                    <div className="text-2xl  font-bold  text-green-400 ">
                      {pipeline.closed_won}
                    </div>
                    <div className="text-sm  text-gray-400 ">Fechados</div>
                  </div>
                  <div className="text-center ">
                    <div className="text-2xl  font-bold  text-red-400 ">
                      {pipeline.closed_lost}
                    </div>
                    <div className="text-sm  text-gray-400 ">Perdidos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtros e Busca */}
          <Card className="bg-gray-800  border-gray-700  mb-6 ">
            <CardContent className="pt-6 ">
              <div className="space-y-4 ">
                {/* Busca */}
                <div className="relative ">
                  <Search className="absolute left-3 top-1/2  transform -translate-y-1/2  text-gray-400  h-4 w-4 " />
                  <Input
                    placeholder="Buscar por nome, email, empresa, área de atuação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10  bg-gray-700  border-gray-600  text-white  placeholder-gray-400 "
                  />
                </div>
                
                {/* Filtros */}
                <div className="flex flex-wrap  gap-4 ">
                  {/* Filtro por Classificação */}
                  <div className="flex gap-2  flex-wrap ">
                    <span className="text-sm  text-gray-400  self-center ">Classificação:</span>
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                      className="bg-blue-600 hover:bg-blue-700  text-white  border-blue-600 "
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filterStatus === 'Hot Lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Hot Lead')}
                      className="bg-red-600 hover:bg-red-700  text-white  border-red-600 "
                    >
                      Hot
                    </Button>
                    <Button
                      variant={filterStatus === 'Warm Lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Warm Lead')}
                      className="bg-orange-600 hover:bg-orange-700  text-white  border-orange-600 "
                    >
                      Warm
                    </Button>
                    <Button
                      variant={filterStatus === 'Cold Lead' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Cold Lead')}
                      className="bg-blue-600 hover:bg-blue-700  text-white  border-blue-600 "
                    >
                      Cold
                    </Button>
                    <Button
                      variant={filterStatus === 'Customer' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('Customer')}
                      className="bg-green-600 hover:bg-green-700  text-white  border-green-600 "
                    >
                      Customer
                    </Button>
                  </div>

                  {/* Filtro por Área */}
                  {uniqueAreas.length > 0 && (
                    <div className="flex gap-2  flex-wrap ">
                      <span className="text-sm  text-gray-400  self-center ">Área:</span>
                      <select
                        value={filterArea}
                        onChange={(e) => setFilterArea(e.target.value)}
                        className="bg-gray-700  border-gray-600  text-white  rounded px-3 py-1  text-sm "
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
                    <div className="flex gap-2  flex-wrap ">
                      <span className="text-sm  text-gray-400  self-center ">Educação:</span>
                      <select
                        value={filterEducation}
                        onChange={(e) => setFilterEducation(e.target.value)}
                        className="bg-gray-700  border-gray-600  text-white  rounded px-3 py-1  text-sm "
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
                    <div className="flex gap-2  flex-wrap ">
                      <span className="text-sm  text-gray-400  self-center ">DISC:</span>
                      <select
                        value={filterDisc}
                        onChange={(e) => setFilterDisc(e.target.value)}
                        className="bg-gray-700  border-gray-600  text-white  rounded px-3 py-1  text-sm "
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
                    <div className="flex gap-2  flex-wrap ">
                      <span className="text-sm  text-gray-400  self-center ">Liderança:</span>
                      <select
                        value={filterLideranca}
                        onChange={(e) => setFilterLideranca(e.target.value)}
                        className="bg-gray-700  border-gray-600  text-white  rounded px-3 py-1  text-sm "
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
                    className="border-gray-600  text-gray-300  hover:bg-gray-700 "
                  >
                    <X className="h-4 w-4  mr-1 " />
                    Limpar
                  </Button>
                </div>

                {/* Controles de Paginação e Itens por Página */}
                <div className="flex flex-col sm:flex-row  justify-between  items-center  gap-4 ">
                  <div className="flex items-center  gap-2 ">
                    <span className="text-sm  text-gray-400 ">Itens por página:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-gray-700  border-gray-600  text-white  rounded px-2 py-1  text-sm "
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="text-sm  text-gray-400 ">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, totalFilteredLeads)} de {totalFilteredLeads} leads
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Leads */}
          <Card className="bg-gray-800  border-gray-700 ">
            <CardHeader>
              <CardTitle className="text-white ">
                Leads ({totalFilteredLeads})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 ">
              <div className="overflow-x-auto ">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 ">
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Nome
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Email
                          {sortField === 'email' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 ">Telefone</TableHead>
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('current_company')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Empresa
                          {sortField === 'current_company' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('acting_area')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Área
                          {sortField === 'acting_area' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('educational_background')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Educação
                          {sortField === 'educational_background' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 ">DISC</TableHead>
                      <TableHead className="text-gray-300 ">Liderança</TableHead>
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('classification')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Status
                          {sortField === 'classification' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300  cursor-pointer  hover:text-white "
                        onClick={() => handleSort('engagement_level')}
                      >
                        <div className="flex items-center  gap-1 ">
                          Engajamento
                          {sortField === 'engagement_level' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 " /> : <ArrowDown className="h-3 w-3 " />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 " />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 ">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead) => (
                      <TableRow key={lead.id} className="border-gray-700  hover:bg-gray-750 ">
                        <TableCell className="text-white  font-medium ">
                          <div className="flex items-center  gap-2 ">
                            <User className="h-4 w-4  text-gray-400 " />
                            {lead.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 ">
                          <div className="flex items-center  gap-2 ">
                            <Mail className="h-4 w-4  text-gray-400 " />
                            <span className="truncate  max-w-[200px] ">{lead.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 ">
                          {lead.phone ? (
                            <div className="flex items-center  gap-2 ">
                              <Phone className="h-4 w-4  text-gray-400 " />
                              <span>{lead.phone}</span>
                              <a
                                href={formatWhatsAppLink(lead.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400  hover:text-green-300 "
                              >
                                <MessageCircle className="h-4 w-4 " />
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-500 ">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 ">
                          <div className="flex items-center  gap-2 ">
                            <Building className="h-4 w-4  text-gray-400 " />
                            <span className="truncate  max-w-[150px] ">
                              {lead.current_company || lead.company || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 ">
                          <div className="flex items-center  gap-2 ">
                            <Briefcase className="h-4 w-4  text-gray-400 " />
                            <span className="truncate  max-w-[120px] ">
                              {lead.acting_area || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 ">
                          <div className="flex items-center  gap-2 ">
                            <GraduationCap className="h-4 w-4  text-gray-400 " />
                            <span className="truncate  max-w-[120px] ">
                              {lead.educational_background || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-purple-300  border-purple-500 ">
                            {lead.perfil_disc || lead.disc_profile || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-blue-300  border-blue-500 ">
                            {lead.perfil_lideranca || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1  flex-wrap ">
                            <Badge className={`${getClassificationColor(lead.classification)} text-white  text-xs `}>
                              {lead.classification}
                            </Badge>
                            <Badge variant="outline" className={`${getPriorityColor(lead.priority)} text-xs `}>
                              {lead.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 ">
                          <div className="flex items-center  gap-2 ">
                            <div className="w-16  bg-gray-700  rounded-full  h-2 ">
                              <div 
                                className="bg-blue-500  h-2  rounded-full "
                                style={{ width: `${lead.engagement_level}%` }}
                              ></div>
                            </div>
                            <span className="text-xs ">{lead.engagement_level}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 ">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600  text-gray-300  hover:bg-gray-700  p-1 "
                            >
                              <Mail className="h-3 w-3 " />
                            </Button>
                            {lead.phone && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600  text-gray-300  hover:bg-gray-700  p-1 "
                                onClick={() => window.open(formatWhatsAppLink(lead.phone), '_blank')}
                              >
                                <MessageCircle className="h-3 w-3 " />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600  text-gray-300  hover:bg-gray-700  p-1 "
                            >
                              <MoreVertical className="h-3 w-3 " />
                            </Button>
                            {/* Botao que vai ver os dados da entrevista do chatbot */}
                             <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-600  text-gray-300  hover:bg-gray-700  p-1 "
                            >
                              <TextSearch className="h-3 w-3 " />
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
                <div className="flex flex-col sm:flex-row  justify-between  items-center  gap-4  p-4  border-t  border-gray-700 ">
                  <div className="text-sm  text-gray-400 ">
                    Página {currentPage} de {totalPages}
                  </div>
                  
                  <div className="flex items-center  gap-2 ">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="border-gray-600  text-gray-300  hover:bg-gray-700  disabled:opacity-50 "
                    >
                      <ChevronsLeft className="h-4 w-4 " />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="border-gray-600  text-gray-300  hover:bg-gray-700  disabled:opacity-50 "
                    >
                      <ChevronLeft className="h-4 w-4 " />
                    </Button>
                    
                    {/* Números das páginas */}
                    <div className="flex items-center  gap-1 ">
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
                              ? "bg-blue-600  text-white "
                              : "border-gray-600  text-gray-300  hover:bg-gray-700 "
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
                      className="border-gray-600  text-gray-300  hover:bg-gray-700  disabled:opacity-50 "
                    >
                      <ChevronRight className="h-4 w-4 " />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="border-gray-600  text-gray-300  hover:bg-gray-700  disabled:opacity-50 "
                    >
                      <ChevronsRight className="h-4 w-4 " />
                    </Button>
                  </div>
                </div>
              )}

              {paginatedLeads.length === 0 && (
                <div className="text-center  py-12 ">
                  <Users className="h-12 w-12  text-gray-400  mx-auto  mb-4 " />
                  <h3 className="text-lg  font-medium  text-white  mb-2 ">
                    {leads.length === 0 ? 'Nenhum dado encontrado na API' : 'Nenhum lead encontrado'}
                  </h3>
                  <p className="text-gray-400 ">
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

