# 🔍 INTEGRAÇÃO CORESIGNAL - BUSCA INTELIGENTE DE CANDIDATOS

## 📊 VISÃO GERAL
Sistema integrado para busca automática de candidatos no LinkedIn usando a API Coresignal, iniciado na página de Recrutamento com parâmetros gerados pelo ChatGPT.

---

## 🎯 FLUXO PRINCIPAL

### **1. Trigger da Busca:**
```
Página Recrutamento → Lista de Vagas → Botão "Buscar no LinkedIn" → Integração ChatGPT + Coresignal
```

### **2. Processamento Automático:**
```
Dados da Vaga → ChatGPT (gerar parâmetros) → Query Coresignal → Resultados → Análise IA → Ranking
```

### **3. Apresentação dos Resultados:**
```
Modal/Página de Resultados → Lista Rankeada → Ações (Convidar/Importar/Salvar)
```

---

## 🔧 ESPECIFICAÇÕES TÉCNICAS

### **RF080: Botão "Buscar no LinkedIn" na Lista de Vagas**
- **Localização:** Página de Recrutamento, em cada card/linha de vaga
- **Posicionamento:** Junto aos botões "Ver Detalhes" e "Editar"
- **Estados:** Normal, Loading (processando), Success (concluído), Error
- **Permissões:** Apenas usuários com role "Recruiter" ou "Admin"
- **Visual:** Ícone LinkedIn + texto "Buscar no LinkedIn"

### **Interface da Página Recrutamento:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 RECRUTAMENTO - GESTÃO DE VAGAS                              │
├─────────────────────────────────────────────────────────────────┤
│ [+ Nova Vaga] [Filtros] [Buscar]                               │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💼 Desenvolvedor Frontend Senior                           │ │
│ │ 🏢 TechCorp | 📍 São Paulo, SP | 💰 R$ 8.000-12.000       │ │
│ │ 📅 Publicada há 3 dias | 👥 12 candidatos                  │ │
│ │ [Ver Detalhes] [Editar] [🔍 Buscar no LinkedIn]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💼 Analista de Marketing Digital                           │ │
│ │ 🏢 StartupXYZ | 📍 Rio de Janeiro, RJ | 💰 R$ 4.000-6.000 │ │
│ │ 📅 Publicada há 1 semana | 👥 8 candidatos                 │ │
│ │ [Ver Detalhes] [Editar] [🔍 Buscar no LinkedIn]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **RF081: Integração ChatGPT para Geração de Parâmetros**
```javascript
// Fluxo ao clicar "Buscar no LinkedIn"
const handleLinkedInSearch = async (job) => {
  try {
    // 1. Mostrar loading
    setSearchLoading(job.id, true);
    
    // 2. Usar ChatGPT para gerar parâmetros de busca
    const searchParams = await chatgptService.generateCoresignalParams(job);
    
    // 3. Executar busca na Coresignal
    const candidates = await coresignalService.searchCandidates(searchParams);
    
    // 4. Analisar adequação com IA
    const rankedCandidates = await analyzeAndRankCandidates(candidates, job);
    
    // 5. Exibir resultados
    showSearchResults(job, rankedCandidates);
    
  } catch (error) {
    showError('Erro na busca de candidatos', error);
  } finally {
    setSearchLoading(job.id, false);
  }
};
```

### **RF082: ChatGPT - Geração de Parâmetros de Busca**
```javascript
// Serviço ChatGPT para gerar parâmetros
class ChatGPTService {
  async generateCoresignalParams(job) {
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
      
      Retorne um JSON com os parâmetros de busca no formato:
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
      
      Seja específico e use termos que realmente aparecem em perfis LinkedIn.
    `;
    
    const response = await this.callChatGPT(prompt);
    return JSON.parse(response.content);
  }
}
```

### **RF083: Mapeamento para API Coresignal**
```javascript
// Converter parâmetros ChatGPT para formato Coresignal
const mapToCoresignalQuery = (chatgptParams, job) => {
  return {
    // Parâmetros principais
    title: chatgptParams.title_keywords.join(' OR '),
    skills: chatgptParams.skills,
    experience_level: mapExperienceLevel(chatgptParams.experience_level),
    location: parseLocation(chatgptParams.location),
    
    // Filtros avançados
    industry: chatgptParams.industry,
    company_size: chatgptParams.company_size,
    exclude_companies: chatgptParams.exclude_companies,
    
    // Filtros adicionais
    education: chatgptParams.additional_filters.education_level,
    languages: chatgptParams.additional_filters.languages,
    
    // Configurações da busca
    limit: 100, // máximo de resultados
    offset: 0,
    sort_by: 'relevance'
  };
};
```

### **RF083: Filtros Inteligentes**
- **Localização:** Raio configurável (10km, 25km, 50km, remoto)
- **Experiência:** Junior (0-2), Pleno (3-5), Senior (6-10), Especialista (10+)
- **Skills:** Extração automática dos requisitos + skills opcionais
- **Empresa:** Excluir concorrentes diretos (configurável)
- **Disponibilidade:** Filtrar por sinais de busca ativa

### **RF084: Interface de Resultados**
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Resultados da Busca LinkedIn - Desenvolvedor Frontend │
├─────────────────────────────────────────────────────────┤
│ 📊 127 candidatos encontrados | 💰 Custo: $12.70        │
├─────────────────────────────────────────────────────────┤
│ [Filtros] [Ordenar por] [Exportar] [Nova Busca]        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 João Silva                    Score: 9.2/10 🟢  │ │
│ │ Senior Frontend Developer @ TechCorp               │ │
│ │ 📍 São Paulo, SP | 💼 6 anos exp | 🎯 95% match    │ │
│ │ Skills: React, TypeScript, Node.js, AWS           │ │
│ │ [Ver LinkedIn] [Convidar] [Importar] [Salvar]     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 Maria Santos                  Score: 8.8/10 🟡  │ │
│ │ Frontend Developer @ StartupXYZ                    │ │
│ │ 📍 Rio de Janeiro, RJ | 💼 4 anos | 🎯 87% match   │ │
│ │ Skills: Vue.js, JavaScript, CSS, Git              │ │
│ │ [Ver LinkedIn] [Convidar] [Importar] [Salvar]     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **RF085: Importação de Candidatos**
- **Seleção múltipla:** Checkbox para importar vários candidatos
- **Dados importados:** Nome, posição atual, empresa, localização, skills, educação
- **Criação automática:** Perfil básico na plataforma
- **Status inicial:** "Prospectado via LinkedIn"
- **Vinculação:** Automática com a vaga que originou a busca

### **RF086: Sistema de Convites Automatizados**
- **Templates personalizáveis:** Por vaga, por nível, por área
- **Variáveis dinâmicas:** Nome, empresa atual, vaga específica
- **Canais:** LinkedIn InMail, email (se disponível), WhatsApp Business
- **Agendamento:** Envio imediato ou programado
- **Tracking:** Status de entrega, abertura, resposta

### **RF087: Tracking de Campanhas**
```
📊 Dashboard de Campanha - Desenvolvedor Frontend
├─ 📤 Enviados: 45 convites
├─ 👀 Visualizados: 32 (71%)
├─ 💬 Respostas: 12 (27%)
├─ ✅ Interessados: 8 (18%)
├─ 📅 Entrevistas agendadas: 3
└─ 💰 Custo total: $67.50
```

### **RF088: Cache Inteligente**
- **Duração:** 7 dias para mesma query
- **Invalidação:** Mudanças significativas na vaga
- **Economia:** Evitar custos desnecessários da API
- **Atualização:** Novos candidatos desde última busca

### **RF089: Análise de Adequação com IA**
```javascript
// Algoritmo de scoring
const calculateAdequacyScore = async (candidate, job) => {
  const factors = {
    skillsMatch: calculateSkillsMatch(candidate.skills, job.required_skills),
    experienceLevel: matchExperienceLevel(candidate.experience, job.level),
    locationFit: calculateLocationScore(candidate.location, job.location),
    industryExperience: matchIndustry(candidate.companies, job.industry),
    careerProgression: analyzeCareerPath(candidate.positions),
    educationFit: matchEducation(candidate.education, job.education_requirements)
  };
  
  return await aiService.calculateWeightedScore(factors, job.priority_weights);
};
```

### **RF090: Sistema de Scoring e Ranking**
- **Score 0-10:** Baseado em múltiplos fatores
- **Cores visuais:** Verde (9-10), Amarelo (7-8.9), Laranja (5-6.9), Vermelho (<5)
- **Ordenação padrão:** Por score decrescente
- **Filtros de score:** Mostrar apenas acima de X pontos
- **Explicação:** Tooltip mostrando como o score foi calculado

---

## 🔧 REQUISITOS TÉCNICOS DETALHADOS

### **RT027: Integração Robusta com API Coresignal**
```javascript
class CoresignalService {
  constructor() {
    this.apiKey = process.env.CORESIGNAL_API_KEY;
    this.baseUrl = 'https://api.coresignal.com/cdapi/v1';
    this.rateLimiter = new RateLimiter(100, 'hour'); // 100 requests/hour
  }

  async searchCandidates(query, filters) {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.makeRequest('/search/person', {
        ...query,
        ...filters
      });
      return this.processResults(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```

### **RT028: Parser Automático de Dados da Vaga**
```javascript
const parseJobToQuery = (job) => {
  return {
    title: extractJobTitle(job.title),
    skills: extractSkills(job.requirements + ' ' + job.description),
    location: parseLocation(job.location),
    experience: mapExperienceLevel(job.experience_level),
    industry: inferIndustry(job.company, job.area),
    education: extractEducationRequirements(job.requirements)
  };
};
```

### **RT029: Cache Inteligente**
```javascript
class SearchCache {
  generateCacheKey(jobId, query, filters) {
    return `coresignal_search_${jobId}_${hashObject({query, filters})}`;
  }

  async getCachedResults(key) {
    const cached = await redis.get(key);
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.results;
    }
    return null;
  }

  async cacheResults(key, results) {
    await redis.setex(key, 7 * 24 * 3600, { // 7 dias
      results,
      timestamp: Date.now()
    });
  }
}
```

### **RT030: Rate Limiting**
- **Limite por hora:** 100 requests (configurável)
- **Limite por dia:** 1000 requests (configurável)
- **Limite por usuário:** 20 buscas/dia
- **Alertas:** Notificar quando próximo do limite
- **Fallback:** Queue de requests quando limite atingido

### **RT031: Algoritmo de Matching IA**
```javascript
class AIMatchingService {
  async calculateMatch(candidate, job) {
    const prompt = `
      Analise a adequação entre o candidato e a vaga:
      
      CANDIDATO:
      - Posição: ${candidate.current_position}
      - Empresa: ${candidate.current_company}
      - Skills: ${candidate.skills.join(', ')}
      - Experiência: ${candidate.experience_years} anos
      
      VAGA:
      - Título: ${job.title}
      - Requisitos: ${job.requirements}
      - Nível: ${job.experience_level}
      
      Retorne um score de 0-10 e justificativa.
    `;
    
    return await chatGPT.analyze(prompt);
  }
}
```

---

## 📊 MÉTRICAS E ANALYTICS

### **Métricas de Busca:**
- **Custo por busca:** Valor gasto na API Coresignal
- **Candidatos por busca:** Média de resultados encontrados
- **Taxa de adequação:** % de candidatos com score > 7
- **Tempo de processamento:** Duração da busca + análise

### **Métricas de Conversão:**
- **Taxa de resposta:** % de candidatos que respondem convites
- **Taxa de interesse:** % que demonstram interesse na vaga
- **Taxa de entrevista:** % que aceitam fazer entrevista
- **Taxa de contratação:** % que são efetivamente contratados

### **ROI da Ferramenta:**
- **Custo por candidato qualificado:** Custo API / candidatos score > 8
- **Tempo economizado:** vs busca manual no LinkedIn
- **Qualidade dos candidatos:** Score médio vs candidatos orgânicos

---

## 🎯 CASOS DE USO

### **Caso 1: Busca Básica**
1. Recrutador acessa vaga "Desenvolvedor React Senior"
2. Clica em "Buscar no LinkedIn"
3. Sistema gera query automática baseada na vaga
4. Coresignal retorna 150 candidatos
5. IA analisa e rankeia por adequação
6. Interface mostra top 50 candidatos com score > 6

### **Caso 2: Campanha de Convites**
1. Recrutador seleciona 20 candidatos top-ranked
2. Escolhe template de convite personalizado
3. Agenda envio para próxima segunda-feira
4. Sistema envia convites via LinkedIn InMail
5. Tracking mostra 15 visualizações, 6 respostas, 4 interessados

### **Caso 3: Importação e Acompanhamento**
1. Candidato responde positivamente ao convite
2. Recrutador importa perfil para a plataforma
3. Candidato recebe link para completar perfil
4. Sistema agenda entrevista simulada automaticamente
5. Após entrevista, candidato entra no pipeline da vaga

---

## 🔒 CONSIDERAÇÕES DE SEGURANÇA E COMPLIANCE

### **LGPD/GDPR:**
- **Consentimento:** Candidatos devem aceitar termos ao serem contatados
- **Direito ao esquecimento:** Opção de remover dados a qualquer momento
- **Transparência:** Informar como os dados foram obtidos
- **Minimização:** Coletar apenas dados necessários

### **LinkedIn Terms of Service:**
- **Rate limiting:** Respeitar limites da API
- **Uso apropriado:** Apenas para recrutamento legítimo
- **Não spam:** Templates personalizados e relevantes
- **Opt-out:** Facilitar descadastro de comunicações

### **Segurança de Dados:**
- **Criptografia:** Dados sensíveis criptografados em repouso
- **Acesso controlado:** Apenas usuários autorizados
- **Auditoria:** Log de todas as ações de busca e contato
- **Backup:** Backup seguro dos dados de candidatos

---

*Documento técnico para implementação da integração Coresignal*
*Versão: 1.0 | Data: 01/08/2025*

