class CompaniesService {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";
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
      console.error('Erro ao buscar empresas:', error);
      
      // Retornar dados mock em caso de erro
      return {
        success: false,
        companies: [
          { id: 1, name: 'Agroskills', corporate_name: 'AGSK' },
          { id: 2, name: 'FAEG', corporate_name: 'Federação de Agricultura de Goiás' },
          { id: 3, name: 'Senar Goiás', corporate_name: 'Senar GO' },
          { id: 4, name: 'LinkAgroTech', corporate_name: 'LinkAgroTech Ltda' },
          { id: 5, name: 'Campo Nutrição Animal', corporate_name: 'Campo Nutrição' }
        ],
        message: 'Erro na conexão, usando dados locais',
        error: error.message
      };
    }
  }

  async getAllCompanies() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/companies`, {
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
      console.error('Erro ao buscar todas as empresas:', error);
      
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
      const response = await fetch(`${this.API_BASE_URL}/companies/${id}`, {
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
      console.error('Erro ao buscar empresa por ID:', error);
      
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
      const response = await fetch(`${this.API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar empresa: ${response.status}`);
      }

      const company = await response.json();
      
      return {
        success: true,
        company: company,
        message: 'Empresa criada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      
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
      const response = await fetch(`${this.API_BASE_URL}/companies/count`, {
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
      console.error('Erro ao buscar contagem de empresas:', error);
      
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

