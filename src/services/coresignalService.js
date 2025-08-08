class CoresignalService {
  constructor() {
    // API Key da Coresignal
    this.apiKey = 'G6HG4KYGzuuCYTRJrWDN9uP0jH24e8Yf';
    this.baseUrl = 'https://api.coresignal.com/cdapi/v2';
    
    // Configurar URL do backend baseado no ambiente
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    if (!this.apiKey) {
      console.warn('⚠️ API Key Coresignal não configurada. Funcionalidades de busca limitadas.');
    }
  }

  async searchPeople(keywords, filters = {}) {
    if (!this.apiKey) {
      console.warn('API Key Coresignal não configurada');
      return this.getMockResults(keywords);
    }

    try {
      const searchParams = new URLSearchParams({
        api_key: this.apiKey,
        title: keywords,
        country: 'Brazil',
        limit: '20',
        ...filters
      });

      console.log('🔍 Iniciando busca Coresignal:', keywords);

      const response = await fetch(`${this.baseUrl}/search/filter/person?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API Coresignal: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Busca Coresignal concluída:', data.length || 0, 'resultados');

      return this.formatResults(data, keywords);
    } catch (error) {
      console.error('❌ Erro na busca Coresignal:', error);
      return this.getMockResults(keywords);
    }
  }

  formatResults(data, keywords) {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((person, index) => ({
      id: person.id || `coresignal_${index}`,
      name: person.name || 'Nome não disponível',
      title: person.title || 'Cargo não informado',
      company: person.company?.name || 'Empresa não informada',
      location: person.location || 'Brasil',
      experience: person.experience_summary || 'Experiência não informada',
      skills: person.skills || [],
      education: person.education || [],
      profileUrl: person.linkedin_url || '',
      imageUrl: person.profile_image_url || '',
      summary: person.summary || '',
      confidence: this.calculateConfidence(person, keywords),
      source: 'coresignal',
      searchKeywords: keywords,
      rawData: person
    }));
  }

  calculateConfidence(person, keywords) {
    let confidence = 0.5; // Base confidence

    // Aumentar confiança baseado em matches
    const searchTerms = keywords.toLowerCase().split(' ');
    const personText = `${person.name} ${person.title} ${person.company?.name} ${person.summary}`.toLowerCase();

    searchTerms.forEach(term => {
      if (personText.includes(term)) {
        confidence += 0.1;
      }
    });

    // Aumentar confiança se tem informações completas
    if (person.linkedin_url) confidence += 0.1;
    if (person.company?.name) confidence += 0.1;
    if (person.skills && person.skills.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  getMockResults(keywords) {
    console.log('🎭 Usando resultados mock para:', keywords);
    
    return [
      {
        id: 'mock_1',
        name: 'João Silva',
        title: 'Engenheiro Agrônomo',
        company: 'AgroTech Solutions',
        location: 'São Paulo, SP',
        experience: '5+ anos em agricultura de precisão',
        skills: ['Agricultura', 'Gestão Rural', 'Tecnologia Agrícola'],
        education: ['Engenharia Agronômica - USP'],
        profileUrl: 'https://linkedin.com/in/joao-silva-agro',
        imageUrl: '',
        summary: 'Especialista em agricultura sustentável com foco em tecnologia.',
        confidence: 0.85,
        source: 'mock',
        searchKeywords: keywords,
        rawData: {}
      },
      {
        id: 'mock_2',
        name: 'Maria Santos',
        title: 'Analista de Agronegócio',
        company: 'Rural Consultoria',
        location: 'Ribeirão Preto, SP',
        experience: '3+ anos em análise de mercado agrícola',
        skills: ['Análise de Dados', 'Mercado Agrícola', 'Excel Avançado'],
        education: ['Administração - FGV'],
        profileUrl: 'https://linkedin.com/in/maria-santos-agro',
        imageUrl: '',
        summary: 'Analista especializada em mercado de commodities agrícolas.',
        confidence: 0.78,
        source: 'mock',
        searchKeywords: keywords,
        rawData: {}
      }
    ];
  }

  // Funções para integração com backend
  async saveCandidatesSearch(jobId, keywords, candidates) {
    try {
      const response = await fetch(`${this.backendUrl}/candidates/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          keywords,
          candidates,
          source: 'coresignal',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Busca salva no backend:', result.id);
        return result;
      } else {
        console.warn('⚠️ Erro ao salvar no backend:', response.status);
        return null;
      }
    } catch (error) {
      console.warn('⚠️ Backend não disponível, salvando localmente:', error.message);
      return null;
    }
  }

  async getCandidatesFromBackend(jobId) {
      return [];
  }

  async saveInterviewResult(jobId, candidateId, interviewData) {
    try {
      const response = await fetch(`${this.backendUrl}/candidates/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId,
          candidateId,
          interviewData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resultado da entrevista salvo:', result.id);
        return result;
      } else {
        console.warn('⚠️ Erro ao salvar entrevista:', response.status);
        return null;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar entrevista:', error.message);
      return null;
    }
  }

  // Funções para localStorage (fallback)
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log('💾 Dados salvos no localStorage:', key);
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  }

  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erro ao ler do localStorage:', error);
      return null;
    }
  }

  // Função  // Função principal para buscar candidatos no LinkedIn (com ChatGPT + Coresignal)
  async searchLinkedInPeople(job) {
    console.log('🔍 Iniciando busca LinkedIn para vaga:', job.title);

    try {
      // 1. Verificar se já existe busca recente
      const existingSearch = await this.getExistingSearch(job.id);
      if (existingSearch.status === 'completed') {
        console.log('✅ Usando busca existente do', existingSearch.source);
        return {
          success: true,
          profiles: existingSearch.candidates,
          total: existingSearch.candidates.length,
          fromCache: true,
          message: `Resultados do ${existingSearch.source}`,
          searchId: `cached_${job.id}`,
          savedToBackend: existingSearch.source === 'backend'
        };
      }

      // 2. Usar ChatGPT para gerar parâmetros de busca otimizados
      console.log('🤖 Gerando parâmetros de busca com ChatGPT...');
      const searchParams = await this.generateSearchParamsWithChatGPT(job);
      
      // 3. Executar busca na Coresignal com parâmetros otimizados
      console.log('🔍 Executando busca na Coresignal...');
      const profiles = await this.searchPeopleWithParams(searchParams);

      // 4. Analisar adequação dos candidatos com IA
      console.log('🧠 Analisando adequação dos candidatos...');
      const rankedProfiles = await this.rankCandidatesWithAI(profiles, job);

      // 5. Salvar resultados
      const searchData = {
        jobId: job.id,
        searchParams,
        profiles: rankedProfiles,
        timestamp: new Date().toISOString(),
        total: rankedProfiles.length
      };

      // Tentar salvar no backend
      const savedToBackend = await this.saveCandidatesSearch(job.id, searchParams, rankedProfiles);

      // Salvar no localStorage como backup
      this.saveToLocalStorage(`candidates_${job.id}`, searchData);

      console.log('✅ Busca LinkedIn concluída:', rankedProfiles.length, 'candidatos encontrados');
      
      return {
        success: true,
        profiles: rankedProfiles,
        total: rankedProfiles.length,
        fromCache: false,
        message: 'Nova busca realizada com sucesso',
        searchId: `search_${Date.now()}`,
        savedToBackend
      };

    } catch (error) {
      console.error('❌ Erro na busca LinkedIn:', error);
      
      // Fallback para resultados mock
      const mockProfiles = this.getMockResults(job.title);
      return {
        success: true,
        profiles: mockProfiles,
        total: mockProfiles.length,
        fromCache: false,
        message: 'Usando resultados simulados (erro na API)',
        searchId: `mock_${Date.now()}`,
        savedToBackend: false
      };
    }
  }

  // Gerar parâmetros de busca usando ChatGPT
  async generateSearchParamsWithChatGPT(job) {
    try {
      const prompt = `
        Analise esta vaga e gere parâmetros otimizados para busca no LinkedIn via Coresignal:
        
        DADOS DA VAGA:
        - Título: ${job.title}
        - Empresa: ${job.company}
        - Área: ${job.area}
        - Localização: ${job.location}
        - Descrição: ${job.description}
        - Requisitos: ${job.requirements}
        - Nível: ${job.experience_level}
        - Salário: ${job.salary_range}
        
        Retorne APENAS um JSON válido com os parâmetros de busca no formato:
        {
          "title_keywords": ["palavra1", "palavra2"],
          "skills": ["skill1", "skill2", "skill3"],
          "experience_level": "senior|mid|junior",
          "location": "cidade, estado",
          "industry": "setor",
          "company_size": "startup|small|medium|large",
          "exclude_companies": ["concorrente1", "concorrente2"],
          "additional_filters": {
            "education_level": "bachelor|master|phd",
            "languages": ["português", "inglês"],
            "certifications": ["cert1", "cert2"]
          }
        }
        
        Seja específico e use termos que realmente aparecem em perfis LinkedIn brasileiros.
      `;

      // Importar chatgptService dinamicamente para evitar dependência circular
      const { default: chatgptService } = await import('./chatgptService.js');
      const response = await chatgptService.generateText(prompt);
      
      // Tentar fazer parse do JSON retornado
      let searchParams;
      try {
        // Limpar resposta e extrair apenas o JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          searchParams = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      } catch (parseError) {
        console.warn('⚠️ Erro ao fazer parse da resposta ChatGPT, usando fallback');
        searchParams = this.generateFallbackParams(job);
      }

      console.log('✅ Parâmetros gerados pelo ChatGPT:', searchParams);
      return searchParams;

    } catch (error) {
      console.warn('⚠️ Erro ao gerar parâmetros com ChatGPT, usando fallback:', error);
      return this.generateFallbackParams(job);
    }
  }

  // Gerar parâmetros de fallback se ChatGPT falhar
  generateFallbackParams(job) {
    return {
      title_keywords: [job.title.split(' ')[0], job.area || 'profissional'],
      skills: this.extractSkillsFromDescription(job.description + ' ' + job.requirements),
      experience_level: job.experience_level || 'mid',
      location: job.location || 'Brasil',
      industry: this.inferIndustry(job.area),
      company_size: 'medium',
      exclude_companies: [],
      additional_filters: {
        education_level: 'bachelor',
        languages: ['português'],
        certifications: []
      }
    };
  }

  // Extrair skills da descrição
  extractSkillsFromDescription(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Excel', 
      'PowerBI', 'Tableau', 'Salesforce', 'SAP', 'AWS', 'Azure', 'Docker',
      'Kubernetes', 'Git', 'Agile', 'Scrum', 'Marketing', 'Vendas'
    ];
    
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills.slice(0, 5); // Máximo 5 skills
  }

  // Inferir indústria baseada na área
  inferIndustry(area) {
    if (!area) return 'tecnologia';
    
    const areaLower = area.toLowerCase();
    if (areaLower.includes('agro')) return 'agricultura';
    if (areaLower.includes('tech') || areaLower.includes('ti')) return 'tecnologia';
    if (areaLower.includes('marketing')) return 'marketing';
    if (areaLower.includes('vendas')) return 'vendas';
    if (areaLower.includes('financ')) return 'financeiro';
    
    return 'geral';
  }

  // Buscar pessoas com parâmetros específicos usando nova API v2
  async searchPeopleWithParams(searchParams) {
    if (!this.apiKey) {
      console.warn('API Key Coresignal não configurada, usando resultados mock');
      return this.getMockResults(searchParams.title_keywords.join(' '));
    }

    try {
      // 1. Primeiro fazer busca para obter IDs
      const searchQuery = {
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query: searchParams.title_keywords.join(' OR '),
                  fields: [
                    "job_title",
                    "description", 
                    "job_description"
                  ],
                  default_operator: "OR"
                }
              },
              {
                query_string: {
                  query: searchParams.location || "Brasil",
                  fields: [
                    "location_raw_address",
                    "location_regions"
                  ],
                  default_operator: "OR"
                }
              }
            ]
          }
        }
      };

      console.log('🔍 Executando busca Coresignal v2 para obter IDs...');

      const searchResponse = await fetch(`${this.baseUrl}/employee_clean/search/es_dsl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify(searchQuery)
      });

      if (!searchResponse.ok) {
        throw new Error(`Erro na busca Coresignal: ${searchResponse.status}`);
      }

      const employeeIds = await searchResponse.json();
      console.log('✅ IDs encontrados:', employeeIds.length);

      if (!employeeIds || employeeIds.length === 0) {
        console.log('⚠️ Nenhum ID encontrado, usando resultados mock');
        return this.getMockResults(searchParams.title_keywords.join(' '));
      }

      // 2. Buscar detalhes dos top 5 candidatos
      const topIds = employeeIds.slice(0, 5);
      const profiles = [];

      for (const id of topIds) {
        try {
          console.log(`📋 Buscando detalhes do candidato ID: ${id}`);
          
          const detailResponse = await fetch(`${this.baseUrl}/employee_clean/collect/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.apiKey
            }
          });

          if (detailResponse.ok) {
            const candidateData = await detailResponse.json();
            const formattedProfile = this.formatCoresignalProfile(candidateData);
            profiles.push(formattedProfile);
            console.log(`✅ Candidato adicionado: ${formattedProfile.name}`);
          } else {
            console.warn(`⚠️ Erro ao buscar detalhes do ID ${id}: ${detailResponse.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao processar candidato ${id}:`, error);
        }
      }

      console.log('✅ Busca Coresignal v2 concluída:', profiles.length, 'perfis detalhados');
      return profiles;

    } catch (error) {
      console.error('❌ Erro na busca Coresignal v2:', error);
      return this.getMockResults(searchParams.title_keywords.join(' '));
    }
  }

  // Formatar perfil da nova API Coresignal
  formatCoresignalProfile(data) {
    return {
      id: `coresignal_${data.id}`,
      name: data.full_name || 'Nome não disponível',
      title: data.job_title || data.headline || 'Cargo não informado',
      company: data.experience?.[0]?.company_name || 'Empresa não informada',
      location: data.location_raw_address || 'Brasil',
      experience: this.formatExperience(data.experience),
      skills: this.extractSkillsFromProfile(data),
      education: this.formatEducation(data.education),
      profileUrl: data.websites_linkedin || '',
      imageUrl: data.picture_url || '',
      summary: data.description || data.generated_headline || '',
      confidence: this.calculateProfileConfidence(data),
      source: 'coresignal_v2',
      searchKeywords: '',
      rawData: data,
      // Campos adicionais específicos da nova API
      connections: data.connections_count || 0,
      followers: data.follower_count || 0,
      totalExperience: data.total_experience_duration || '',
      isWorking: data.is_working === 1,
      managementLevel: data.management_level || '',
      department: data.department || ''
    };
  }

  // Formatar experiência profissional
  formatExperience(experience) {
    if (!experience || !Array.isArray(experience)) {
      return 'Experiência não informada';
    }

    const currentJob = experience[0];
    if (currentJob) {
      const duration = currentJob.duration || '';
      const company = currentJob.company_name || '';
      const title = currentJob.title || '';
      return `${title} na ${company} (${duration})`;
    }

    return 'Experiência não informada';
  }

  // Extrair skills do perfil
  extractSkillsFromProfile(data) {
    const skills = [];
    
    // Extrair de diferentes campos
    const text = `${data.description || ''} ${data.job_title || ''} ${data.headline || ''}`.toLowerCase();
    
    // Skills comuns para buscar
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Excel', 
      'PowerBI', 'Tableau', 'Salesforce', 'SAP', 'AWS', 'Azure', 'Docker',
      'Kubernetes', 'Git', 'Agile', 'Scrum', 'Marketing', 'Vendas', 'Gestão',
      'Liderança', 'Agricultura', 'Agronegócio', 'Engenharia', 'Análise'
    ];
    
    commonSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
    
    return skills.slice(0, 8); // Máximo 8 skills
  }

  // Formatar educação
  formatEducation(education) {
    if (!education || !Array.isArray(education)) {
      return [];
    }

    return education.map(edu => ({
      institution: edu.school || 'Instituição não informada',
      degree: edu.degree || 'Curso não informado',
      field: edu.field_of_study || '',
      year: edu.date_to_year || ''
    }));
  }

  // Calcular confiança do perfil
  calculateProfileConfidence(data) {
    let confidence = 0.5; // Base

    // Aumentar baseado em completude do perfil
    if (data.full_name) confidence += 0.1;
    if (data.job_title) confidence += 0.1;
    if (data.description) confidence += 0.1;
    if (data.websites_linkedin) confidence += 0.1;
    if (data.experience && data.experience.length > 0) confidence += 0.1;
    if (data.connections_count > 100) confidence += 0.05;
    if (data.is_working === 1) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  // Rankear candidatos usando IA
  async rankCandidatesWithAI(profiles, job) {
    try {
      console.log('🧠 Analisando adequação de', profiles.length, 'candidatos...');
      
      // Para cada candidato, calcular score de adequação
      const rankedProfiles = await Promise.all(
        profiles.map(async (profile, index) => {
          try {
            // Simular análise de adequação (pode ser substituído por IA real)
            const adequacyScore = this.calculateAdequacyScore(profile, job);
            
            return {
              ...profile,
              adequacy_score: adequacyScore,
              rank: index + 1
            };
          } catch (error) {
            console.warn('⚠️ Erro ao analisar candidato:', error);
            return {
              ...profile,
              adequacy_score: 5.0, // Score neutro
              rank: index + 1
            };
          }
        })
      );

      // Ordenar por score de adequação (maior para menor)
      rankedProfiles.sort((a, b) => b.adequacy_score - a.adequacy_score);

      // Atualizar ranks após ordenação
      rankedProfiles.forEach((profile, index) => {
        profile.rank = index + 1;
      });

      console.log('✅ Candidatos rankeados por adequação');
      return rankedProfiles;

    } catch (error) {
      console.error('❌ Erro ao rankear candidatos:', error);
      return profiles.map((profile, index) => ({
        ...profile,
        adequacy_score: 5.0,
        rank: index + 1
      }));
    }
  }

  // Calcular score de adequação simples
  calculateAdequacyScore(profile, job) {
    let score = 5.0; // Score base

    // Verificar match de título
    if (profile.current_position && job.title) {
      const titleSimilarity = this.calculateStringSimilarity(
        profile.current_position.toLowerCase(),
        job.title.toLowerCase()
      );
      score += titleSimilarity * 2; // Peso 2 para título
    }

    // Verificar localização
    if (profile.location && job.location) {
      const locationMatch = profile.location.toLowerCase().includes(job.location.toLowerCase());
      if (locationMatch) score += 1;
    }

    // Verificar experiência (simulado)
    if (profile.experience_years) {
      const expLevel = job.experience_level?.toLowerCase();
      if (expLevel === 'junior' && profile.experience_years <= 3) score += 1;
      if (expLevel === 'pleno' && profile.experience_years >= 3 && profile.experience_years <= 7) score += 1;
      if (expLevel === 'senior' && profile.experience_years >= 5) score += 1;
    }

    // Adicionar variação aleatória para simular análise mais complexa
    score += (Math.random() - 0.5) * 2;

    // Garantir que o score está entre 1 e 10
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }

  // Calcular similaridade entre strings
  calculateStringSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let matches = 0;
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
        }
      });
    });
    
    return matches / Math.max(words1.length, words2.length);
  }

  // Verificar se existe busca recente
  async hasExistingSearch(jobId) {
    const existingSearch = await this.getExistingSearch(jobId);
    return existingSearch.status === 'completed';
  }

  extractKeywords(jobData) {
    const keywords = [];
    
    // Extrair do título
    if (jobData.title) {
      keywords.push(jobData.title);
    }
    
    // Extrair da empresa
    if (jobData.company) {
      keywords.push(jobData.company);
    }
    
    // Extrair termos relevantes da descrição
    if (jobData.description) {
      const relevantTerms = this.extractRelevantTerms(jobData.description);
      keywords.push(...relevantTerms);
    }
    
    // Adicionar termos específicos do agronegócio se aplicável
    if (jobData.area && jobData.area.toLowerCase().includes('agro')) {
      keywords.push('agronegócio', 'agricultura', 'agro');
    }
    
    return keywords.join(' ').substring(0, 100); // Limitar tamanho
  }

  extractRelevantTerms(description) {
    const terms = [];
    const text = description.toLowerCase();
    
    // Termos técnicos comuns
    const techTerms = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'excel', 'powerbi'];
    techTerms.forEach(term => {
      if (text.includes(term)) terms.push(term);
    });
    
    // Cargos e habilidades
    const skillTerms = ['engenheiro', 'analista', 'gerente', 'coordenador', 'especialista', 'consultor'];
    skillTerms.forEach(term => {
      if (text.includes(term)) terms.push(term);
    });
    
    // Termos do agronegócio
    const agroTerms = ['agricultura', 'fazenda', 'rural', 'plantio', 'colheita', 'pecuária', 'irrigação'];
    agroTerms.forEach(term => {
      if (text.includes(term)) terms.push(term);
    });
    
    return terms.slice(0, 5); // Máximo 5 termos
  }

  isRecentSearch(timestamp) {
    if (!timestamp) return false;
    
    const searchTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - searchTime) / (1000 * 60 * 60);
    
    return hoursDiff < 24; // Considerar recente se menos de 24 horas
  }

  // Função para verificar status da busca
  async getExistingSearch(jobId) {
    // Verificar backend primeiro
    const backendCandidates = await this.getCandidatesFromBackend(jobId);
    if (backendCandidates && backendCandidates.length > 0) {
      return {
        status: 'completed',
        candidates: backendCandidates,
        source: 'backend'
      };
    }

    // Verificar localStorage
    const localKey = `candidates_${jobId}`;
    const localData = this.getFromLocalStorage(localKey);
    if (localData && this.isRecentSearch(localData.timestamp)) {
      return {
        status: 'completed',
        candidates: localData.candidates,
        source: 'localStorage'
      };
    }

    return {
      status: 'not_found',
      candidates: [],
      source: 'none'
    };
  }

  // Método para testar a API
  async testAPI() {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'API Key não configurada'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/search/filter/person?api_key=${this.apiKey}&limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return {
          success: true,
          message: 'API Coresignal funcionando corretamente'
        };
      } else {
        return {
          success: false,
          message: `Erro na API: ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão: ${error.message}`
      };
    }
  }
}

// Exportar instância única
const coresignalService = new CoresignalService();
export default coresignalService;

