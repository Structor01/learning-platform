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
      const filters = {};

      if (searchTerm) {
        filters.name = searchTerm;
      }

      if (statusFilter) {
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

  const getStatusIcon = (isActive) => {
    return isActive
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Ativa' : 'Inativa';
  };

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar currentView="empresas" />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin mx-auto mb-8"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Carregando empresas</h3>
              <p className="text-gray-400">Buscando informações...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar currentView="empresas" />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestão de Empresas</h1>
              <p className="text-gray-400">Gerencie empresas parceiras da plataforma</p>
            </div>

            <button
              onClick={handleCreateCompany}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Nova Empresa
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="">Todos os status</option>
                  <option value="true">Ativas</option>
                  <option value="false">Inativas</option>
                </select>

                <button
                  onClick={handleSearch}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filtrar
                </button>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    loadCompanies();
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Empresas */}
          {companies.length > 0 ? (
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 hover:bg-gray-800/80 transition-all duration-300 hover:border-gray-700"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {company.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(company.is_active)}
                              <span className="text-sm text-gray-400">
                                {getStatusText(company.is_active)}
                              </span>
                            </div>
                          </div>

                          {company.corporate_name && (
                            <p className="text-gray-400 mb-2">
                              {company.corporate_name}
                            </p>
                          )}

                          {company.cpnj && (
                            <p className="text-gray-500 text-sm font-mono">
                              CNPJ: {formatCNPJ(company.cpnj)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

                      {company.obs && (
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {company.obs}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex xl:flex-col gap-2">
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCompany(company)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Excluir</span>
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
