class CompaniesService {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";
  }

  async getCompaniesForSelect() {
    try {
      console.log('🔍 Buscando empresas para select...');
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies/select`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies/select`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      const companies = await response.json();
      console.log('✅ Empresas carregadas:', companies);
      
      return {
        success: true,
        companies: companies || [],
        message: `${companies?.length || 0} empresas encontradas`
      };

    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      
      // Retornar dados mock em caso de erro
      const mockCompanies = [
        { id: 1, name: 'Agroskills', corporate_name: 'AGSK' },
        { id: 2, name: 'FAEG', corporate_name: 'Federação de Agricultura de Goiás' },
        { id: 3, name: 'Senar Goiás', corporate_name: 'Senar GO' },
        { id: 4, name: 'LinkAgroTech', corporate_name: 'LinkAgroTech Ltda' },
        { id: 5, name: 'Campo Nutrição Animal', corporate_name: 'Campo Nutrição' }
      ];
      
      console.log('🔄 Usando dados mock:', mockCompanies);
      
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
      console.log('🔍 Buscando todas as empresas...');
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      const companies = await response.json();
      console.log('✅ Todas as empresas carregadas:', companies);
      
      return {
        success: true,
        companies: companies || [],
        message: `${companies?.length || 0} empresas encontradas`
      };

    } catch (error) {
      console.error('❌ Erro ao buscar todas as empresas:', error);
      
      return {
        success: false,
        companies: [],
        message: 'Erro na conexão',
        error: error.message
      };
    }
  }

  async getCompanyById(id) {
    try {
      console.log('🔍 Buscando empresa por ID:', id);
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies/${id}`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresa: ${response.status}`);
      }

      const company = await response.json();
      console.log('✅ Empresa encontrada:', company);
      
      return {
        success: true,
        company: company,
        message: 'Empresa encontrada'
      };

    } catch (error) {
      console.error('❌ Erro ao buscar empresa por ID:', error);
      
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
      console.log('🔍 Criando nova empresa:', companyData);
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ao criar empresa: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
      }

      const company = await response.json();
      console.log('✅ Empresa criada:', company);
      
      return {
        success: true,
        company: company,
        message: 'Empresa criada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao criar empresa:', error);
      
      return {
        success: false,
        company: null,
        message: 'Erro ao criar empresa',
        error: error.message
      };
    }
  }

  async getCompaniesCount() {
    try {
      console.log('🔍 Buscando contagem de empresas...');
      console.log('🌐 URL:', `${this.API_BASE_URL}/api/companies/count`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/companies/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ao buscar contagem: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Contagem obtida:', result);
      
      return {
        success: true,
        count: result.count || 0,
        message: 'Contagem obtida com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao buscar contagem de empresas:', error);
      
      return {
        success: false,
        count: 0,
        message: 'Erro na conexão',
        error: error.message
      };
    }
  }
}

// Criar instância única do serviço
const companiesService = new CompaniesService();

export default companiesService;

