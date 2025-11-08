/**
 * Serviço para gerar relatórios DISC personalizados usando IA
 */

class AIReportService {
  constructor() {
    this.apiUrl = 'https://aurora.foxgraos.com.br/agroskills/generic/send-message';
    this.apiKey = 'foxchatbot';
  }

  /**
   * Gera um relatório DISC detalhado usando IA
   * @param {Object} testResults - Resultados do teste DISC
   * @param {Object} userInfo - Informações do usuário
   * @returns {Promise<Object>} Relatório detalhado
   */
  async generateDetailedReport(testResults, userInfo = {}) {
    try {
      const prompt = this.buildPrompt(testResults, userInfo);
      
      // Gerar sessionId único
      const sessionId = `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId,
          message: prompt,
          prompt: "Você é um psicólogo especialista em análise comportamental DISC com 15 anos de experiência. Analise os dados do teste fornecidos e gere um relatório COMPLETAMENTE PERSONALIZADO e profissional."
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = data.response || data.message || data.content || '';

      if (!aiContent) {
        throw new Error('Resposta vazia da IA');
      }

      return this.parseAIResponse(aiContent, testResults);
    } catch (error) {
      console.error('Erro ao gerar relatório com IA:', error);
      // Fallback para relatório básico
      return this.generateBasicReport(testResults);
    }
  }

  /**
   * Constrói o prompt para a IA com base nos resultados do teste
   */
  buildPrompt(testResults, userInfo) {
    const { dominantProfile, detailedResults } = testResults;
    const discScores = detailedResults?.disc?.percentages || {};
    const bigFiveScores = detailedResults?.bigFive?.scores || {};
    const ieScores = detailedResults?.ie?.scores || {};

    return `
Você é um psicólogo especialista em análise comportamental DISC com 15 anos de experiência. Analise os resultados abaixo e gere um relatório COMPLETAMENTE PERSONALIZADO baseado nas pontuações específicas desta pessoa.

DADOS DO TESTE:
${userInfo.name ? `Nome: ${userInfo.name}` : ''}
${userInfo.profession ? `Profissão: ${userInfo.profession}` : ''}

PONTUAÇÕES DISC (use EXATAMENTE estes valores para personalizar):
- D (Dominância): ${discScores.D || testResults.discDPercentage}%
- I (Influência): ${discScores.I || testResults.discIPercentage}%  
- S (Estabilidade): ${discScores.S || testResults.discSPercentage}%
- C (Conformidade): ${discScores.C || testResults.discCPercentage}%
- Perfil Dominante: ${dominantProfile}

BIG FIVE (analise cada dimensão):
- Abertura à Experiência: ${bigFiveScores.O}%
- Conscienciosidade: ${bigFiveScores.C}%
- Extroversão: ${bigFiveScores.E}%
- Amabilidade: ${bigFiveScores.A}%
- Neuroticismo: ${bigFiveScores.N}%

INTELIGÊNCIA EMOCIONAL:
- Autoconsciência: ${ieScores.autoconsciencia}%
- Autorregulação: ${ieScores.autorregulacao}%
- Automotivação: ${ieScores.automotivacao}%
- Empatia: ${ieScores.empatia}%
- Habilidade Social: ${ieScores.habilidade_social}%

INSTRUÇÃO CRÍTICA: Gere um relatório 100% personalizado baseado nestas pontuações específicas. NÃO use templates genéricos. Considere:

- Se D for alto (>60%), enfatize liderança e tomada de decisão
- Se I for alto (>60%), foque em comunicação e relacionamentos
- Se S for alto (>60%), destaque estabilidade e cooperação  
- Se C for alto (>60%), ressalte análise e qualidade
- Combine múltiplos perfis altos para análises híbridas
- Use as pontuações Big Five para nuançar o perfil DISC
- Integre a Inteligência Emocional para insights interpessoais

Gere as seções no formato EXATO abaixo:

===CARACTERÍSTICAS GERAIS===
[Descrição de 150-200 palavras sobre o perfil único desta pessoa, mencionando as pontuações específicas e como elas se combinam. Seja específico sobre como os percentuais se manifestam comportamentalmente.]

===PONTOS FORTES DETALHADOS===
HABILIDADES DE LIDERANÇA:
• [4 pontos específicos baseados nas pontuações D, I, E do Big Five]

CARACTERÍSTICAS PROFISSIONAIS: 
• [4 pontos baseados no perfil dominante + conscienciosidade + IE]

===ÁREAS DE DESENVOLVIMENTO===
• ÁREA 1: [Nome] - [Descrição específica baseada nas pontuações baixas]
• ÁREA 2: [Nome] - [Descrição específica] 
• ÁREA 3: [Nome] - [Descrição específica]
• ÁREA 4: [Nome] - [Descrição específica]

===ESTILO DE COMUNICAÇÃO===
COMO VOCÊ SE COMUNICA:
• [Estilo 1]: [Descrição baseada em I + E + habilidade social]
• [Estilo 2]: [Descrição baseada no perfil dominante]
• [Estilo 3]: [Descrição baseada em amabilidade + empatia]
• [Estilo 4]: [Descrição integrando múltiplas dimensões]

COMO OUTROS DEVEM SE COMUNICAR COM VOCÊ:
• [5 dicas específicas baseadas no perfil único]

===AMBIENTE DE TRABALHO IDEAL===
CONDIÇÕES IDEAIS:
• [6 condições específicas baseadas no perfil + big five]

AMBIENTES A EVITAR:
• [6 situações a evitar baseadas nas pontuações baixas]

===RECOMENDAÇÕES DE CARREIRA===
ÁREA 1 - [Nome da área baseada no perfil]:
• [4 cargos específicos]

ÁREA 2 - [Nome da área]:  
• [4 cargos específicos]

ÁREA 3 - [Nome da área]:
• [4 cargos específicos]

ÁREA 4 - [Nome da área]:
• [4 cargos específicos]

Seja EXTREMAMENTE específico e personalize cada seção baseada nas pontuações únicas fornecidas.
    `.trim();
  }

  /**
   * Processa a resposta da IA e estrutura o conteúdo
   */
  parseAIResponse(aiContent, testResults) {
    // Extrai todas as seções geradas pela IA
    const sections = {
      caracteristicasGerais: this.extractSection(aiContent, 'CARACTERÍSTICAS GERAIS'),
      pontosFortes: this.extractSection(aiContent, 'PONTOS FORTES DETALHADOS'),
      areasDesenvolvimento: this.extractSection(aiContent, 'ÁREAS DE DESENVOLVIMENTO'),
      estiloComunicacao: this.extractSection(aiContent, 'ESTILO DE COMUNICAÇÃO'),
      ambienteTrabalho: this.extractSection(aiContent, 'AMBIENTE DE TRABALHO IDEAL'),
      recomendacoesCarreira: this.extractSection(aiContent, 'RECOMENDAÇÕES DE CARREIRA'),
      // Seções adicionais do relatório IA
      analiseComportamental: this.extractSection(aiContent, 'ANÁLISE COMPORTAMENTAL|ANÁLISE DETALHADA'),
      estrategiasComunicacao: this.extractSection(aiContent, 'ESTRATÉGIAS DE COMUNICAÇÃO'),
      dicasLideranca: this.extractSection(aiContent, 'DICAS PARA LIDERANÇA|LIDERANÇA'),
      planoDesenvolvimento: this.extractSection(aiContent, 'PLANO DE DESENVOLVIMENTO|DESENVOLVIMENTO PESSOAL')
    };

    // Parse estruturado dos pontos fortes
    const pontosFortes = this.parsePontosFortes(sections.pontosFortes);
    
    // Parse das áreas de desenvolvimento
    const areasDesenvolvimento = this.parseAreasDesenvolvimento(sections.areasDesenvolvimento);
    
    // Parse do estilo de comunicação
    const comunicacao = this.parseComunicacao(sections.estiloComunicacao);
    
    // Parse do ambiente de trabalho
    const ambiente = this.parseAmbienteTrabalho(sections.ambienteTrabalho);
    
    // Parse das recomendações de carreira
    const carreira = this.parseRecomendacoesCarreira(sections.recomendacoesCarreira);

    return {
      isAIGenerated: true,
      sections,
      structuredData: {
        caracteristicasGerais: sections.caracteristicasGerais,
        pontosFortes,
        areasDesenvolvimento,
        comunicacao,
        ambiente,
        carreira
      },
      fullContent: aiContent,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Extrai uma seção específica do conteúdo da IA
   */
  extractSection(content, sectionPattern) {
    const regex = new RegExp(`===${sectionPattern}===([\\s\\S]*?)(?=====[A-Z]|$)`, 'i');
    const match = content.match(regex);
    if (match) return match[1].trim();
    
    // Fallback para padrão antigo
    const fallbackRegex = new RegExp(`(${sectionPattern})[^\\n]*\\n([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z]{3,}|$)`, 'i');
    const fallbackMatch = content.match(fallbackRegex);
    return fallbackMatch ? fallbackMatch[2].trim() : '';
  }

  /**
   * Parse estruturado dos pontos fortes
   */
  parsePontosFortes(content) {
    if (!content) return [];
    
    const categories = [];
    const lines = content.split('\n');
    let currentCategory = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('HABILIDADES') || trimmed.includes('CARACTERÍSTICAS')) {
        if (currentCategory) categories.push(currentCategory);
        currentCategory = {
          title: trimmed.replace(':', ''),
          items: []
        };
      } else if (trimmed.startsWith('•') && currentCategory) {
        currentCategory.items.push(trimmed.substring(1).trim());
      }
    }
    
    if (currentCategory) categories.push(currentCategory);
    return categories;
  }

  /**
   * Parse das áreas de desenvolvimento
   */
  parseAreasDesenvolvimento(content) {
    if (!content) return [];
    
    const areas = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
        const text = trimmed.replace(/^[•\d\.]\s*/, '');
        const [area, ...descParts] = text.split(' - ');
        const description = descParts.join(' - ');
        
        if (area && description) {
          areas.push({ area: area.trim(), description: description.trim() });
        }
      }
    }
    
    return areas;
  }

  /**
   * Parse do estilo de comunicação
   */
  parseComunicacao(content) {
    if (!content) return { howYouCommunicate: [], howOthersShouldCommunicate: [] };
    
    const result = { howYouCommunicate: [], howOthersShouldCommunicate: [] };
    const lines = content.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('COMO VOCÊ SE COMUNICA')) {
        currentSection = 'you';
      } else if (trimmed.includes('COMO OUTROS DEVEM')) {
        currentSection = 'others';
      } else if (trimmed.startsWith('•') && currentSection) {
        const text = trimmed.substring(1).trim();
        if (currentSection === 'you') {
          const [style, ...descParts] = text.split(': ');
          const description = descParts.join(': ');
          result.howYouCommunicate.push({ style, description });
        } else if (currentSection === 'others') {
          result.howOthersShouldCommunicate.push(text);
        }
      }
    }
    
    return result;
  }

  /**
   * Parse do ambiente de trabalho
   */
  parseAmbienteTrabalho(content) {
    if (!content) return { ideal: [], avoid: [] };
    
    const result = { ideal: [], avoid: [] };
    const lines = content.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('CONDIÇÕES IDEAIS')) {
        currentSection = 'ideal';
      } else if (trimmed.includes('AMBIENTES A EVITAR') || trimmed.includes('EVITAR')) {
        currentSection = 'avoid';
      } else if (trimmed.startsWith('•') && currentSection) {
        const text = trimmed.substring(1).trim();
        result[currentSection].push(text);
      }
    }
    
    return result;
  }

  /**
   * Parse das recomendações de carreira
   */
  parseRecomendacoesCarreira(content) {
    if (!content) return [];
    
    const recommendations = [];
    const lines = content.split('\n');
    let currentCategory = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^ÁREA \d+/)) {
        if (currentCategory) recommendations.push(currentCategory);
        const categoryName = trimmed.split(' - ')[1] || 'Área Profissional';
        currentCategory = {
          category: categoryName,
          color: this.getRandomColor(),
          positions: []
        };
      } else if (trimmed.startsWith('•') && currentCategory) {
        currentCategory.positions.push(trimmed.substring(1).trim());
      }
    }
    
    if (currentCategory) recommendations.push(currentCategory);
    return recommendations;
  }

  /**
   * Retorna cor aleatória para categorias de carreira
   */
  getRandomColor() {
    const colors = ['blue', 'green', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Gera relatório básico sem IA (fallback)
   */
  generateBasicReport(testResults) {
    const { dominantProfile, detailedResults } = testResults;
    
    // Templates básicos baseados no perfil dominante
    const templates = {
      D: {
        analiseComportamental: "Pessoas com perfil Dominante são orientadas para resultados, diretas e assertivas. Demonstram liderança natural e foco na eficiência.",
        pontosFortesEspecificos: "Tomada de decisão rápida, liderança natural, orientação para resultados, assertividade, aceitação de desafios.",
        areasDesenvolvimento: "Desenvolver paciência, melhorar habilidades de escuta, considerar mais as opiniões da equipe.",
        recomendacoesCarreira: "Cargos de liderança, gestão, empreendedorismo, vendas, consultoria estratégica."
      },
      I: {
        analiseComportamental: "Pessoas com perfil Influente são sociáveis, otimistas e persuasivas. Excel em comunicação e motivação de equipes.",
        pontosFortesEspecificos: "Excelente comunicação, carisma natural, capacidade de motivar outros, adaptabilidade, networking.",
        areasDesenvolvimento: "Melhorar foco em detalhes, desenvolver disciplina para tarefas repetitivas, gestão do tempo.",
        recomendacoesCarreira: "Vendas, marketing, recursos humanos, comunicação, educação, relações públicas."
      },
      S: {
        analiseComportamental: "Pessoas com perfil Estável são cooperativas, confiáveis e valorizam harmonia. São excelentes em trabalho em equipe.",
        pontosFortesEspecificos: "Cooperação, confiabilidade, paciência, lealdade, estabilidade emocional, trabalho em equipe.",
        areasDesenvolvimento: "Desenvolver assertividade, acelerar tomada de decisões, aceitar mudanças mais facilmente.",
        recomendacoesCarreira: "Recursos humanos, atendimento ao cliente, educação, saúde, serviços sociais."
      },
      C: {
        analiseComportamental: "Pessoas com perfil Consciencioso são analíticas, precisas e orientadas por qualidade. Valorizam dados e processos.",
        pontosFortesEspecificos: "Análise detalhada, precisão, organização, pensamento crítico, qualidade no trabalho.",
        areasDesenvolvimento: "Acelerar tomada de decisões, desenvolver flexibilidade, melhorar habilidades interpessoais.",
        recomendacoesCarreira: "Análise de dados, contabilidade, engenharia, pesquisa, auditoria, controle de qualidade."
      }
    };

    const template = templates[dominantProfile] || templates.I;

    return {
      isAIGenerated: false,
      sections: {
        analiseComportamental: template.analiseComportamental,
        pontosFortesEspecificos: template.pontosFortesEspecificos,
        areasDesenvolvimento: template.areasDesenvolvimento,
        recomendacoesCarreira: template.recomendacoesCarreira,
        estrategiasComunicacao: "Adapte sua comunicação ao perfil da pessoa com quem está interagindo.",
        dicasLideranca: "Desenvolva um estilo de liderança que aproveite seus pontos fortes naturais.",
        planoDesenvolvimento: "Foque no desenvolvimento das áreas identificadas como oportunidades de melhoria."
      },
      fullContent: Object.values(template).join('\n\n'),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Gera insights específicos para desenvolvimento profissional
   */
  async generateDevelopmentPlan(testResults, currentRole = '', careerGoals = '') {
    const report = await this.generateDetailedReport(testResults, { profession: currentRole });
    
    return {
      currentStrengths: report.sections.pontosFortesEspecificos,
      developmentAreas: report.sections.areasDesenvolvimento,
      actionPlan: report.sections.planoDesenvolvimento,
      timeframe: '3-6 meses',
      recommendedTraining: this.getRecommendedTraining(testResults.dominantProfile),
      careerPathSuggestions: report.sections.recomendacoesCarreira
    };
  }

  /**
   * Sugere treinamentos baseados no perfil
   */
  getRecommendedTraining(profile) {
    const training = {
      D: ['Liderança Situacional', 'Gestão de Conflitos', 'Delegação Eficaz'],
      I: ['Gestão do Tempo', 'Foco e Concentração', 'Análise de Dados'],
      S: ['Assertividade', 'Gestão de Mudanças', 'Tomada de Decisão'],
      C: ['Comunicação Interpessoal', 'Flexibilidade', 'Trabalho em Equipe']
    };

    return training[profile] || training.I;
  }
}

// Instância singleton
const aiReportService = new AIReportService();

export default aiReportService;