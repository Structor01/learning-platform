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
import CompanyFormModal from './CompanyFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useNotification } from './Notification';
import companiesService from '@/services/companiesService';
import { formatCNPJ } from '@/types/company';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Mail,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building,
  Users,
  TrendingUp,
  Target
} from 'lucide-react';

const EmpresasPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Estados dos modais
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { showNotification, NotificationComponent } = useNotification();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesService.getAllCompanies();

      if (response.success) {
        setCompanies(response.companies);
      } else {
        showNotification({
          type: 'error',
          title: 'Erro ao carregar empresas',
          message: response.message,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro inesperado ao carregar empresas',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (searchTerm) {
        filters.name = searchTerm;
      }

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await companiesService.searchCompanies(filters);

      if (response.success) {
        setCompanies(response.companies);
      } else {
        showNotification({
          type: 'error',
          title: 'Erro na busca',
          message: response.message,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDeleteCompany = async (company) => {
    try {
      const dependenciesResponse = await companiesService.checkDependencies(company.id);

      if (dependenciesResponse.hasDependencies) {
        showNotification({
          type: 'warning',
          title: 'Não é possível excluir',
          message: `Esta empresa possui ${dependenciesResponse.dependencies.jobs} vagas vinculadas`,
          duration: 5000
        });
        return;
      }

      setSelectedCompany(company);
      setShowDeleteModal(true);
    } catch (error) {
      console.error('Erro ao verificar dependências:', error);
      setSelectedCompany(company);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await companiesService.deleteCompany(selectedCompany.id);

      if (response.success) {
        setCompanies(companies.filter(c => c.id !== selectedCompany.id));
        showNotification({
          type: 'success',
          title: 'Empresa excluída',
          message: response.message,
          duration: 3000
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Erro ao excluir',
          message: response.message,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro inesperado ao excluir empresa',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setSelectedCompany(null);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;

      if (isEditing) {
        response = await companiesService.updateCompany(selectedCompany.id, formData);
      } else {
        response = await companiesService.createCompany(formData);
      }

      if (response.success) {
        if (isEditing) {
          setCompanies(companies.map(c =>
            c.id === selectedCompany.id ? response.company : c
          ));
        } else {
          setCompanies([response.company, ...companies]);
        }

        showNotification({
          type: 'success',
          title: isEditing ? 'Empresa atualizada' : 'Empresa cadastrada',
          message: response.message,
          duration: 3000
        });

        setShowFormModal(false);
        setSelectedCompany(null);
      } else {
        showNotification({
          type: 'error',
          title: 'Erro ao salvar',
          message: response.message,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro inesperado ao salvar empresa',
        duration: 5000
      });
    }
  };

  // Filtros
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.corporate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj?.includes(searchTerm) ||
      company.responsible_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'true' && company.is_active) ||
      (statusFilter === 'false' && !company.is_active);

    return matchesSearch && matchesStatus;
  });

  // Ordenação
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';

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
  const totalFilteredCompanies = sortedCompanies.length;
  const totalPagesCalculated = Math.ceil(totalFilteredCompanies / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = sortedCompanies.slice(startIndex, endIndex);

  // Atualizar total de páginas quando filtros mudarem
  useEffect(() => {
    setTotalPages(totalPagesCalculated);
    if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
      setCurrentPage(1);
    }
  }, [totalPagesCalculated, currentPage]);

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
    setStatusFilter('all');
    setCurrentPage(1);
    loadCompanies();
  };

  const getStatusIcon = (isActive) => {
    return isActive
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Ativa' : 'Inativa';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-500' : 'bg-red-500';
  };

  if (loading && companies.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 p-4 pt-20 flex items-center justify-center">
          <div className="text-white text-xl">Carregando empresas...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Gestão de Empresas
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  Gerencie empresas parceiras da plataforma
                </p>
              </div>

              {/* Botão Nova Empresa */}
              <Button
                onClick={handleCreateCompany}
                size="default"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-2 border-orange-400 hover:border-orange-300 self-start sm:self-center"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold">Nova Empresa</span>
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 leading-tight">
                  <span className="hidden sm:inline">Total de</span> Empresas
                </CardTitle>
                <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {companies.length}
                </div>
                <p className="text-xs text-green-400 leading-tight">
                  <span className="hidden sm:inline">Empresas </span>cadastradas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 leading-tight">
                  <span className="hidden sm:inline">Empresas </span>Ativas
                </CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {companies.filter(c => c.is_active).length}
                </div>
                <p className="text-xs text-green-400 leading-tight">
                  <span className="hidden sm:inline">Empresas </span>operacionais
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 leading-tight">
                  <span className="hidden sm:inline">Empresas </span>Inativas
                </CardTitle>
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {companies.filter(c => !c.is_active).length}
                </div>
                <p className="text-xs text-red-400 leading-tight">
                  <span className="hidden sm:inline">Empresas </span>suspensas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4 lg:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 leading-tight">
                  Taxa <span className="hidden sm:inline">de Atividade</span>
                </CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 flex-shrink-0" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {companies.length > 0 ? Math.round((companies.filter(c => c.is_active).length / companies.length) * 100) : 0}%
                </div>
                <p className="text-xs text-orange-400 leading-tight">
                  <span className="hidden sm:inline">Empresas </span>ativas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <Card className="bg-gray-800 border-gray-700 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, razão social, CNPJ ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                  {/* Filtro por Status */}
                  <div className="flex gap-1 sm:gap-2 flex-wrap items-center">
                    <span className="text-xs sm:text-sm text-gray-400">Status:</span>
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      Todas
                    </Button>
                    <Button
                      variant={statusFilter === 'true' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('true')}
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      Ativas
                    </Button>
                    <Button
                      variant={statusFilter === 'false' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('false')}
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                    >
                      Inativas
                    </Button>
                  </div>


                  {/* Botão Buscar */}
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Filtrar</span>
                    <span className="sm:hidden">▼</span>
                  </Button>

                  {/* Botão Limpar Filtros */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Limpar</span>
                    <span className="sm:hidden">✕</span>
                  </Button>
                </div>

                {/* Controles de Paginação e Itens por Página */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400">Itens por página:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-right">
                    <span className="hidden sm:inline">Mostrando </span>{startIndex + 1}-{Math.min(endIndex, totalFilteredCompanies)} de {totalFilteredCompanies}<span className="hidden sm:inline"> empresas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Empresas */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg text-white">
                Empresas ({totalFilteredCompanies})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead
                        className="text-gray-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Nome
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-gray-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('cnpj')}
                      >
                        <div className="flex items-center gap-1">
                          CNPJ
                          {sortField === 'cnpj' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 hidden md:table-cell">Razão Social</TableHead>
                      <TableHead className="text-gray-300 hidden lg:table-cell">Responsável</TableHead>
                      <TableHead className="text-gray-300 hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-gray-300 hidden xl:table-cell">Endereço</TableHead>
                      <TableHead
                        className="text-gray-300 cursor-pointer hover:text-white"
                        onClick={() => handleSort('is_active')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortField === 'is_active' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCompanies.map((company) => (
                      <TableRow key={company.id} className="border-gray-700 hover:bg-gray-750">
                        <TableCell className="text-white font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">{company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {company.cnpj ? (
                            <span className="font-mono text-sm">{formatCNPJ(company.cnpj)}</span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 hidden md:table-cell">
                          <span className="truncate max-w-[200px]">
                            {company.corporate_name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="truncate max-w-[150px]">
                              {company.responsible || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">
                              {company.responsible_email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 hidden xl:table-cell">
                          {company.address ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="truncate max-w-[200px]">
                                {company.address}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(company.is_active)} text-white text-xs`}>
                            {getStatusText(company.is_active)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 p-1"
                              onClick={() => handleEditCompany(company)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 p-1"
                              onClick={() => handleDeleteCompany(company)}
                            >
                              <Trash2 className="h-3 w-3" />
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 p-3 sm:p-4 border-t border-gray-700">
                  <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 p-1 sm:p-2"
                    >
                      <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 p-1 sm:p-2"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    {/* Números das páginas */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
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
                            className={`text-xs sm:text-sm p-1 sm:p-2 ${currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                              }`}
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
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 p-1 sm:p-2"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 p-1 sm:p-2"
                    >
                      <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {paginatedCompanies.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {companies.length === 0 ? 'Nenhuma empresa cadastrada' : 'Nenhuma empresa encontrada'}
                  </h3>
                  <p className="text-gray-400">
                    {companies.length === 0
                      ? 'Cadastre a primeira empresa clicando no botão "Nova Empresa"'
                      : 'Tente ajustar os filtros ou termo de busca'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais */}
      <CompanyFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedCompany(null);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
        company={selectedCompany}
        isEditing={isEditing}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${selectedCompany?.name}"? Esta ação não pode ser desfeita.`}
      />

      {NotificationComponent}
    </>
  );
};

export default EmpresasPage;