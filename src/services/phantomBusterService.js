// Serviço para integração com Phantom Buster API
class PhantomBusterService {
  constructor() {
    this.apiKey = 'ZtBTfSmy6HCfxTxHkAkFFeWOfIyF78flj6vBNb9N3Pc';
    this.baseUrl = 'https://api.phantombuster.com/api/v2';
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
    
    // Adicionar termos específicos do agronegócio se aplicável
    if (this.isAgroJob(job)) {
      keywords.push('agronegócio', 'agricultura', 'agro', 'fazenda', 'rural');
    }
    
    return keywords.join(' ').substring(0, 100); // Limitar tamanho
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

  // Construir URL de busca do LinkedIn
  buildLinkedInSearchUrl(keywords) {
    const baseUrl = 'https://www.linkedin.com/search/results/people/';
    const params = new URLSearchParams({
      geoUrn: '["106887151"]', // Brasil
      keywords: keywords,
      origin: 'FACETED_SEARCH',
      sid: 'btX'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Iniciar busca no Phantom Buster
  async startLinkedInSearch(job) {
    try {
      const keywords = this.extractKeywords(job);
      const searchUrl = this.buildLinkedInSearchUrl(keywords);
      
      console.log('Iniciando busca Phantom Buster:', {
        jobId: job.id,
        keywords,
        searchUrl
      });

      const response = await fetch(`${this.baseUrl}/phantoms/launch`, {
        method: 'POST',
        headers: {
          'X-Phantombuster-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'linkedin-search-export', // ID do phantom LinkedIn Search Export
          argument: {
            searchUrl: searchUrl,
            numberOfProfiles: 50, // Limitar a 50 perfis
            csvName: `linkedin_search_job_${job.id}_${Date.now()}`,
            hunterApiKey: '', // Opcional para emails
            dropcontactApiKey: '' // Opcional para emails
          },
          bonusArgument: {
            jobId: job.id,
            keywords: keywords,
            searchDate: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Phantom Buster: ${response.status}`);
      }

      const result = await response.json();
      
      // Salvar informações da busca localmente
      this.saveSearchInfo(job.id, {
        phantomId: result.id,
        keywords,
        searchUrl,
        status: 'started',
        startTime: new Date().toISOString()
      });

      return {
        success: true,
        phantomId: result.id,
        status: 'started',
        message: 'Busca iniciada no Phantom Buster'
      };

    } catch (error) {
      console.error('Erro ao iniciar busca Phantom Buster:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erro ao iniciar busca no Phantom Buster'
      };
    }
  }

  // Verificar status da busca
  async checkSearchStatus(phantomId) {
    try {
      const response = await fetch(`${this.baseUrl}/phantoms/fetch-output?id=${phantomId}`, {
        headers: {
          'X-Phantombuster-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return { error: error.message };
    }
  }

  // Salvar informações da busca no localStorage
  saveSearchInfo(jobId, searchInfo) {
    const searches = this.getStoredSearches();
    searches[jobId] = searchInfo;
    localStorage.setItem('phantomBusterSearches', JSON.stringify(searches));
  }

  // Recuperar informações de buscas salvas
  getStoredSearches() {
    const stored = localStorage.getItem('phantomBusterSearches');
    return stored ? JSON.parse(stored) : {};
  }

  // Verificar se já existe busca para uma vaga
  hasExistingSearch(jobId) {
    const searches = this.getStoredSearches();
    return searches[jobId] && searches[jobId].status !== 'error';
  }

  // Obter informações da busca existente
  getExistingSearch(jobId) {
    const searches = this.getStoredSearches();
    return searches[jobId] || null;
  }

  // Processar resultados da busca
  async processSearchResults(phantomId) {
    try {
      const status = await this.checkSearchStatus(phantomId);
      
      if (status.status === 'finished' && status.output) {
        // Processar dados dos perfis encontrados
        const profiles = status.output.map(profile => ({
          name: profile.name || 'Nome não disponível',
          title: profile.title || 'Título não disponível',
          company: profile.company || 'Empresa não disponível',
          location: profile.location || 'Localização não disponível',
          profileUrl: profile.profileUrl || '',
          imageUrl: profile.imageUrl || '',
          connectionDegree: profile.connectionDegree || '',
          premium: profile.premium || false,
          openLink: profile.openLink || false
        }));

        return {
          success: true,
          profiles,
          total: profiles.length,
          status: 'completed'
        };
      }

      return {
        success: false,
        status: status.status || 'unknown',
        message: 'Busca ainda em andamento ou erro'
      };

    } catch (error) {
      console.error('Erro ao processar resultados:', error);
      return {
        success: false,
        error: error.message,
        status: 'error'
      };
    }
  }
}

export default new PhantomBusterService();

