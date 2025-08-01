// Serviço para integração com Coresignal API
class CoresignalService {
  constructor() {
    this.apiKey = 'G6HG4KYGzuuCYTRJrWDN9uP0jH24e8Yf';
    this.baseUrl = 'https://api.coresignal.com/cdapi/v1';
    this.backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://learning-platform-backend-2x39.onrender.com'
      : 'https://learning-platform-backend-2x39.onrender.com';
  }

  // Salvar busca no backend
  async saveSearchToBackend(jobId, searchData) {
    try {
      const response = await fetch(`${this.backendUrl}/api/candidates/searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: jobId,
          search_provider: 'coresignal',
          search_filters: searchData.filters,
          search_status: searchData.status,
          total_results: searchData.totalResults || 0,
          error_message: searchData.error || null
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar busca: ${response.status}`);
      }

      const result = await response.json();
      return result.id; // Retorna o ID da busca salva
    } catch (error) {
      console.error('Erro ao salvar busca no backend:', error);
      return null;
    }
  }

  // Salvar candidatos no backend
  async saveCandidatesToBackend(searchId, candidates) {
    try {
      const candidatesData = candidates.map(candidate => ({
        search_id: searchId,
        external_id: candidate.coresignal_id,
        name: candidate.name,
        title: candidate.title,
        company: candidate.company,
        location: candidate.location,
        profile_url: candidate.profileUrl,
        image_url: candidate.imageUrl,
        industry: candidate.industry,
        experience_years: candidate.experience,
        skills: candidate.skills,
        education: candidate.education,
        summary: candidate.summary,
        connections_count: candidate.connections,
        premium: candidate.premium,
        confidence_score: candidate.confidence_score,
        last_updated: candidate.last_updated,
        raw_data: candidate
      }));

      const response = await fetch(`${this.backendUrl}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ candidates: candidatesData })
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar candidatos: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao salvar candidatos no backend:', error);
      return null;
    }
  }

  // Buscar candidatos salvos no backend
  async getCandidatesFromBackend(jobId) {
    try {
      const response = await fetch(`${this.backendUrl}/api/candidates/job/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, candidates: [], searches: [] };
        }
        throw new Error(`Erro ao buscar candidatos: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        candidates: result.candidates || [],
        searches: result.searches || []
      };
    } catch (error) {
      console.error('Erro ao buscar candidatos do backend:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se já existe busca recente no backend
  async hasRecentSearchInBackend(jobId) {
    try {
      const result = await this.getCandidatesFromBackend(jobId);
      if (!result.success) return false;

      const recentSearches = result.searches.filter(search => {
        const searchTime = new Date(search.search_time);
        const now = new Date();
        const hoursDiff = (now - searchTime) / (1000 * 60 * 60);
        return hoursDiff < 24 && search.search_status === 'completed';
      });

      return recentSearches.length > 0;
    } catch (error) {
      console.error('Erro ao verificar busca recente:', error);
      return false;
    }
  }

  // Testar se a API Key está funcionando
  async testApiKey() {
    try {
      const response = await fetch(`${this.baseUrl}/linkedin/person/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'engineer',
          limit: 1
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API Key inválida ou erro na API: ${response.status}`,
          status: response.status
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: `API Key válida. Teste realizado com sucesso.`,
        sampleData: result
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Erro ao conectar com a API Coresignal'
      };
    }
  }

  // Extrair keywords relevantes da vaga
  extractKeywords(job) {
    const keywords = [];
    
    // Adicionar título da vaga
    if (job.title) {
      keywords.push(job.title);
    }
    
    // Adicionar empresa
    if (job.company) {
      keywords.push(job.company);
    }
    
    // Extrair palavras-chave da descrição
    if (job.description) {
      const relevantTerms = this.extractRelevantTermsFromDescription(job.description);
      keywords.push(...relevantTerms);
    }
    
    return keywords;
  }

  // Verificar se é vaga do agronegócio
  isAgroJob(job) {
    const agroTerms = ['agro', 'agricultura', 'fazenda', 'rural', 'pecuária', 'plantio', 'colheita'];
    const text = `${job.title} ${job.description} ${job.company}`.toLowerCase();
    return agroTerms.some(term => text.includes(term));
  }

  // Extrair termos relevantes da descrição
  extractRelevantTermsFromDescription(description) {
    const relevantTerms = [];
    const text = description.toLowerCase();
    
    // Tecnologias e habilidades comuns
    const techTerms = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'docker'];
    const skillTerms = ['engenheiro', 'desenvolvedor', 'analista', 'gerente', 'coordenador', 'especialista'];
    
    techTerms.forEach(term => {
      if (text.includes(term)) relevantTerms.push(term);
    });
    
    skillTerms.forEach(term => {
      if (text.includes(term)) relevantTerms.push(term);
    });
    
    return relevantTerms.slice(0, 5); // Limitar a 5 termos
  }

  // Construir filtros de busca baseados na vaga
  buildSearchFilters(job) {
    const keywords = this.extractKeywords(job);
    const isAgro = this.isAgroJob(job);
    
    const filters = {
      // Título/posição baseado na vaga
      title: job.title || '',
      
      // Keywords combinadas
      keywords: keywords.join(' '),
      
      // Localização (Brasil)
      country: 'Brazil',
      
      // Limitar resultados
      limit: 50,
      
      // Ordenar por relevância
      order_by: 'relevance'
    };

    // Adicionar filtros específicos do agronegócio
    if (isAgro) {
      filters.industry = 'Agriculture';
      filters.keywords += ' agronegócio agricultura rural fazenda';
    }

    // Adicionar empresa se especificada
    if (job.company) {
      filters.company = job.company;
    }

    return filters;
  }

  // Buscar pessoas no LinkedIn via Coresignal
  async searchLinkedInPeople(job) {
    try {
      // Primeiro verificar se já existe busca recente no backend
      const hasRecent = await this.hasRecentSearchInBackend(job.id);
      if (hasRecent) {
        const backendData = await this.getCandidatesFromBackend(job.id);
        if (backendData.success && backendData.candidates.length > 0) {
          return {
            success: true,
            profiles: backendData.candidates,
            total: backendData.candidates.length,
            status: 'completed',
            message: `Encontrados ${backendData.candidates.length} perfis salvos (busca recente)`,
            fromCache: true
          };
        }
      }

      const filters = this.buildSearchFilters(job);
      
      console.log('Iniciando busca Coresignal:', {
        jobId: job.id,
        filters
      });

      // Salvar busca como "pending" no backend
      const searchId = await this.saveSearchToBackend(job.id, {
        filters,
        status: 'pending',
        totalResults: 0
      });

      const response = await fetch(`${this.baseUrl}/linkedin/person/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Atualizar busca como erro no backend
        if (searchId) {
          await this.saveSearchToBackend(job.id, {
            filters,
            status: 'error',
            error: `API Error: ${response.status} - ${errorText}`,
            totalResults: 0
          });
        }
        
        throw new Error(`Erro na API Coresignal: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Processar e formatar resultados
      const profiles = this.processSearchResults(result);
      
      // Salvar busca como concluída no backend
      const finalSearchId = await this.saveSearchToBackend(job.id, {
        filters,
        status: 'completed',
        totalResults: profiles.length
      });

      // Salvar candidatos no backend
      if (finalSearchId && profiles.length > 0) {
        await this.saveCandidatesToBackend(finalSearchId, profiles);
      }

      // Também salvar no localStorage como backup
      this.saveSearchInfo(job.id, {
        searchId: finalSearchId || `coresignal_${Date.now()}`,
        filters,
        status: 'completed',
        results: profiles,
        searchTime: new Date().toISOString(),
        totalResults: profiles.length,
        savedToBackend: !!finalSearchId
      });

      return {
        success: true,
        profiles,
        total: profiles.length,
        status: 'completed',
        message: `Encontrados ${profiles.length} perfis relevantes`,
        searchId: finalSearchId,
        savedToBackend: !!finalSearchId
      };

    } catch (error) {
      console.error('Erro ao buscar no Coresignal:', error);
      
      // Salvar erro no localStorage
      this.saveSearchInfo(job.id, {
        searchId: `coresignal_error_${Date.now()}`,
        status: 'error',
        error: error.message,
        searchTime: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        message: 'Erro ao buscar perfis no LinkedIn'
      };
    }
  }

  // Processar resultados da busca
  processSearchResults(apiResult) {
    if (!apiResult || !apiResult.data) {
      return [];
    }

    return apiResult.data.map(person => ({
      id: person.id || `person_${Date.now()}_${Math.random()}`,
      name: person.name || 'Nome não disponível',
      title: person.title || 'Título não disponível',
      company: person.company?.name || 'Empresa não disponível',
      location: person.location || 'Localização não disponível',
      profileUrl: person.linkedin_url || '',
      imageUrl: person.profile_pic_url || '',
      industry: person.industry || '',
      experience: person.experience_years || 0,
      skills: person.skills || [],
      education: person.education || [],
      summary: person.summary || '',
      connections: person.connections_count || 0,
      premium: person.premium || false,
      // Campos específicos do Coresignal
      coresignal_id: person.id,
      last_updated: person.last_updated,
      confidence_score: person.confidence_score || 0
    }));
  }

  // Salvar informações da busca no localStorage
  saveSearchInfo(jobId, searchInfo) {
    const searches = this.getStoredSearches();
    searches[jobId] = searchInfo;
    localStorage.setItem('coresignalSearches', JSON.stringify(searches));
  }

  // Recuperar informações de buscas salvas
  getStoredSearches() {
    const stored = localStorage.getItem('coresignalSearches');
    return stored ? JSON.parse(stored) : {};
  }

  // Verificar se já existe busca para uma vaga (priorizar backend)
  async hasExistingSearch(jobId) {
    // Primeiro verificar no backend
    const hasBackend = await this.hasRecentSearchInBackend(jobId);
    if (hasBackend) return true;

    // Fallback para localStorage
    const searches = this.getStoredSearches();
    const search = searches[jobId];
    
    if (!search) return false;
    
    // Verificar se a busca é recente (menos de 24 horas)
    const searchTime = new Date(search.searchTime);
    const now = new Date();
    const hoursDiff = (now - searchTime) / (1000 * 60 * 60);
    
    return hoursDiff < 24 && search.status === 'completed';
  }

  // Obter informações da busca existente (priorizar backend)
  async getExistingSearch(jobId) {
    // Primeiro tentar do backend
    try {
      const backendData = await this.getCandidatesFromBackend(jobId);
      if (backendData.success && backendData.searches.length > 0) {
        const recentSearch = backendData.searches
          .filter(search => {
            const searchTime = new Date(search.search_time);
            const now = new Date();
            const hoursDiff = (now - searchTime) / (1000 * 60 * 60);
            return hoursDiff < 24 && search.search_status === 'completed';
          })
          .sort((a, b) => new Date(b.search_time) - new Date(a.search_time))[0];

        if (recentSearch) {
          return {
            status: recentSearch.search_status,
            searchId: recentSearch.id,
            searchTime: recentSearch.search_time,
            totalResults: recentSearch.total_results,
            results: backendData.candidates,
            fromBackend: true
          };
        }
      }
    } catch (error) {
      console.error('Erro ao buscar do backend, usando localStorage:', error);
    }

    // Fallback para localStorage
    const searches = this.getStoredSearches();
    return searches[jobId] || null;
  }

  // Buscar perfil específico por ID
  async getPersonProfile(personId) {
    try {
      const response = await fetch(`${this.baseUrl}/linkedin/person/collect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: personId
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar perfil: ${response.status}`);
      }

      const profile = await response.json();
      return {
        success: true,
        profile: this.processSearchResults({ data: [profile] })[0]
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar empresa por nome
  async searchCompany(companyName) {
    try {
      const response = await fetch(`${this.baseUrl}/linkedin/company/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: companyName,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresa: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        companies: result.data || []
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Limpar buscas antigas (mais de 7 dias)
  cleanOldSearches() {
    const searches = this.getStoredSearches();
    const now = new Date();
    const cleanedSearches = {};

    Object.keys(searches).forEach(jobId => {
      const search = searches[jobId];
      const searchTime = new Date(search.searchTime);
      const daysDiff = (now - searchTime) / (1000 * 60 * 60 * 24);

      if (daysDiff < 7) {
        cleanedSearches[jobId] = search;
      }
    });

    localStorage.setItem('coresignalSearches', JSON.stringify(cleanedSearches));
  }
}

export default new CoresignalService();

