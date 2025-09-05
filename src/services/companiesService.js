import { API_URL } from '../components/utils/api.js';

class CompaniesService {
  constructor() {
    this.API_BASE_URL = API_URL;
  }

  async getCompaniesForSelect() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies/select`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      const companies = await response.json();
      
      return {
        success: true,
        companies: companies || [],
        message: `${companies?.length || 0} empresas encontradas`
      };

    } catch (error) {
      // Retornar dados mock em caso de erro
      const mockCompanies = [
        { id: 1, name: 'Agroskills', corporate_name: 'AGSK' },
        { id: 2, name: 'FAEG', corporate_name: 'Federação de Agricultura de Goiás' },
        { id: 3, name: 'Senar Goiás', corporate_name: 'Senar GO' },
        { id: 4, name: 'LinkAgroTech', corporate_name: 'LinkAgroTech Ltda' },
        { id: 5, name: 'Campo Nutrição Animal', corporate_name: 'Campo Nutrição' }
      ];
      
      return {
        success: false,
        companies: mockCompanies,
        message: 'Erro na conexão, usando dados locais',
        error: error.message
      };
    }
  }

  async getAllCompanies() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      const companies = await response.json();
      
      return {
        success: true,
        companies: companies || [],
        message: `${companies?.length || 0} empresas encontradas`
      };

    } catch (error) {
      
      return {
        success: false,
        companies: [],
        message: 'Erro na conexão com o servidor',
        error: error.message
      };
    }
  }

  async getCompanyById(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresa: ${response.status}`);
      }

      const company = await response.json();
      
      return {
        success: true,
        company: company,
        message: 'Empresa encontrada'
      };

    } catch (error) {
      
      return {
        success: false,
        company: null,
        message: 'Erro na conexão',
        error: error.message
      };
    }
  }

  async createCompany(companyData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao criar empresa: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const company = await response.json();
      
      return {
        success: true,
        company: company,
        message: 'Empresa criada com sucesso'
      };

    } catch (error) {
      
      return {
        success: false,
        company: null,
        message: 'Erro ao criar empresa',
        error: error.message
      };
    }
  }

  async updateCompany(id, companyData) {
    try {
      console.log('🔍 Atualizando empresa:', { id, companyData });
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies/${id}`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao atualizar empresa: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const company = await response.json();
      console.log('✅ Empresa atualizada:', company);
      
      return {
        success: true,
        company: company,
        message: 'Empresa atualizada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error);
      
      return {
        success: false,
        company: null,
        message: 'Erro ao atualizar empresa',
        error: error.message
      };
    }
  }

  async deleteCompany(id) {
    try {
      console.log('🔍 Excluindo empresa:', id);
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies/${id}`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao excluir empresa: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      console.log('✅ Empresa excluída com sucesso');
      
      return {
        success: true,
        message: 'Empresa excluída com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error);
      
      return {
        success: false,
        message: 'Erro ao excluir empresa',
        error: error.message
      };
    }
  }

  async searchCompanies(filters = {}) {
    try {
      console.log('🔍 Buscando empresas com filtros:', filters);
      
      const queryParams = new URLSearchParams();
      
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.cnpj) queryParams.append('cnpj', filters.cnpj);
      if (filters.status) queryParams.append('is_active', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
      
      const url = `${this.API_BASE_URL}/api/companies/search?${queryParams.toString()}`;
      console.log('🌐 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Empresas encontradas:', result);
      
      return {
        success: true,
        companies: result.companies || result || [],
        total: result.total || 0,
        message: `${result.companies?.length || 0} empresas encontradas`
      };

    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      
      return {
        success: false,
        companies: [],
        total: 0,
        message: 'Erro na conexão',
        error: error.message
      };
    }
  }

  async checkDependencies(id) {
    try {
      console.log('🔍 Verificando dependências da empresa:', id);
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies/${id}/dependencies`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${id}/dependencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ao verificar dependências: ${response.status}`);
      }

      const dependencies = await response.json();
      console.log('✅ Dependências verificadas:', dependencies);
      
      return {
        success: true,
        dependencies: dependencies,
        hasDependencies: dependencies.jobs > 0 || dependencies.users > 0,
        message: 'Dependências verificadas'
      };

    } catch (error) {
      console.error('❌ Erro ao verificar dependências:', error);
      
      return {
        success: false,
        dependencies: { jobs: 0, users: 0 },
        hasDependencies: false,
        message: 'Erro ao verificar dependências',
        error: error.message
      };
    }
  }

  async getCompaniesCount() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar contagem: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        count: result.count || 0,
        message: 'Contagem obtida com sucesso'
      };

    } catch (error) {
      
      return {
        success: false,
        count: 0,
        message: 'Erro na conexão',
        error: error.message
      };
    }
  }

  async checkDependencies(companyId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${companyId}/dependencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar dependências: ${response.status}`);
      }

      const dependencies = await response.json();
      
      const hasDeps = dependencies.jobs > 0 || dependencies.users > 0;
      
      return {
        success: true,
        hasDependencies: hasDeps,
        dependencies: dependencies || { jobs: 0, users: 0 },
        message: 'Dependências verificadas'
      };

    } catch (error) {
      
      // Retornar sem dependências em caso de erro
      return {
        success: false,
        hasDependencies: false,
        dependencies: { jobs: 0, users: 0 },
        message: 'Erro na verificação, permitindo exclusão',
        error: error.message
      };
    }
  }

  async deleteCompany(companyId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao excluir empresa: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'Empresa excluída com sucesso'
      };

    } catch (error) {
      
      return {
        success: false,
        message: 'Erro ao excluir empresa',
        error: error.message
      };
    }
  }

  async updateCompany(companyId, companyData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao atualizar empresa: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const company = await response.json();
      
      return {
        success: true,
        company: company,
        message: 'Empresa atualizada com sucesso'
      };

    } catch (error) {
      
      return {
        success: false,
        company: null,
        message: 'Erro ao atualizar empresa',
        error: error.message
      };
    }
  }
}

// Criar instância única do serviço
const companiesService = new CompaniesService();

export default companiesService;

