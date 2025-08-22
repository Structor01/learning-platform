import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNotification } from './Notification';
import companiesService from '../../services/companiesService';
import { CompanyStatus, formatCNPJ } from '../../types/company';
import CompanyFormModal from './CompanyFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Navbar from './Navbar';

const EmpresasPage = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

      // Use frontend filtering for now
      const response = await companiesService.getAllCompanies();

      if (response.success) {
        let filteredCompanies = response.companies;

        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredCompanies = filteredCompanies.filter(company =>
            company.name?.toLowerCase().includes(term) ||
            company.corporate_name?.toLowerCase().includes(term) ||
            company.cnpj?.includes(term)
          );
        }

        // Filter by status
        if (statusFilter) {
          const isActive = statusFilter === 'true';
          filteredCompanies = filteredCompanies.filter(company =>
            company.is_active === isActive
          );
        }

        setCompanies(filteredCompanies);
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
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro inesperado na busca',
        duration: 3000
      });
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
      // Even with error, allow deletion
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
        setIsEditing(false);
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

  const getStatusIcon = (isActive) => {
    return isActive
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Ativa' : 'Inativa';
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar currentView="empresas" />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                Gestão de Empresas
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Gerencie empresas parceiras da plataforma
              </p>
            </div>

            <button
              onClick={handleCreateCompany}
              type="button"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nova Empresa</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Campo de busca */}
              <div className="flex-1 lg:max-w-lg xl:max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, razão social ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 lg:py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors text-sm sm:text-base"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Filtros e ações */}
              <div className="flex flex-col sm:flex-row lg:flex-row gap-3 lg:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 lg:py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors min-w-[140px] sm:min-w-[160px] text-sm sm:text-base"
                >
                  <option value="">Todos os status</option>
                  <option value="true">Ativas</option>
                  <option value="false">Inativas</option>
                </select>

                <div className="flex gap-3 lg:gap-4">
                  <button
                    onClick={handleSearch}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial text-sm sm:text-base font-medium"
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Filtrar</span>
                  </button>

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      loadCompanies();
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-3.5 rounded-xl transition-colors flex-1 sm:flex-initial text-sm sm:text-base font-medium"
                  >
                    <span className="hidden sm:inline">Limpar</span>
                    <span className="sm:hidden text-white">✕</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Empresas */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin mx-auto mb-8"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Carregando empresas</h3>
              <p className="text-gray-400">Buscando informações...</p>
            </div>
          ) : companies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-gray-800/80 transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-gray-900/20"
                >
                  <div className="flex flex-col h-full">
                    {/* Header da empresa */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                            <h3 className="text-lg font-bold text-white truncate">
                              {company.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(company.is_active)}
                              <span className="text-sm text-gray-400 font-medium">
                                {getStatusText(company.is_active)}
                              </span>
                            </div>
                          </div>

                          {company.corporate_name && (
                            <p className="text-gray-400 mb-2 text-sm">
                              {company.corporate_name}
                            </p>
                          )}

                          {company.cnpj && (
                            <p className="text-gray-500 text-xs font-mono mb-3">
                              CNPJ: {formatCNPJ(company.cnpj)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Informações de contato */}
                      <div className="space-y-2 mb-4">
                        {company.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <span className="truncate">{company.address}</span>
                          </div>
                        )}

                        {company.responsible_email && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="truncate">{company.responsible_email}</span>
                          </div>
                        )}

                        {company.responsible && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{company.responsible}</span>
                          </div>
                        )}
                      </div>

                      {/* Observações */}
                      {company.obs && (
                        <div className="border-t border-gray-800 pt-3 mb-4">
                          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                            {company.obs}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ações - Sempre na parte inferior */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleEditCompany(company)}
                        type="button"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCompany(company)}
                        type="button"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-1 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                {searchTerm || statusFilter
                  ? 'Tente ajustar os filtros de busca ou cadastre uma nova empresa.'
                  : 'Comece cadastrando sua primeira empresa parceira.'
                }
              </p>
              <button
                onClick={handleCreateCompany}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Empresa
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCompany(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${selectedCompany?.name}"? Esta ação não pode ser desfeita.`}
      />

      {NotificationComponent}
    </div>
  );
};

export default EmpresasPage;