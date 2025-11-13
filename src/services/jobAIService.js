// Serviço para integração com API de criação de vagas com IA
class JobAIService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";
  }

  // Gerar vaga com IA
  async generateJobWithAI(promptData) {
    try {
      ('🤖 Gerando vaga com IA...', promptData);

      const response = await fetch(`${this.apiBaseUrl}/api/recruitment/jobs/generate-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      ('✅ Vaga gerada com sucesso:', result);

      return {
        success: true,
        data: result,
        job: result.job,
        aiGenerated: result.ai_generated,
        generationDetails: result.generation_details,
        customQuestions: result.custom_questions,
        suggestions: result.suggestions
      };

    } catch (error) {
      console.error('❌ Erro ao gerar vaga com IA:', error);

      // Fallback local para demonstração
      return this.generateJobFallback(promptData);
    }
  }

  // Sugerir melhorias para vaga existente
  async suggestJobImprovements(jobId, options = {}) {
    try {
      (`🔍 Sugerindo melhorias para vaga ${jobId}...`);

      const response = await fetch(`${this.apiBaseUrl}/api/recruitment/jobs/${jobId}/suggest-improvements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      ('✅ Melhorias sugeridas:', result);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ Erro ao sugerir melhorias:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar perguntas customizadas para vaga
  async generateJobQuestions(jobId) {
    try {
      (`❓ Gerando perguntas para vaga ${jobId}...`);

      const response = await fetch(`${this.apiBaseUrl}/api/recruitment/jobs/${jobId}/questions`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      ('✅ Perguntas geradas:', result);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ Erro ao gerar perguntas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analisar adequação candidato-vaga
  async analyzeCandidateFit(jobId, candidateData) {
    try {
      (`🎯 Analisando adequação candidato-vaga ${jobId}...`);

      const response = await fetch(`${this.apiBaseUrl}/api/recruitment/jobs/${jobId}/analyze-candidate-fit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      ('✅ Análise de adequação concluída:', result);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ Erro ao analisar adequação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Otimizar descrição da vaga
  async optimizeJobDescription(jobId, options = {}) {
    try {
      (`📝 Otimizando descrição da vaga ${jobId}...`);

      const response = await fetch(`${this.apiBaseUrl}/api/recruitment/jobs/${jobId}/optimize-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      ('✅ Descrição otimizada:', result);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ Erro ao otimizar descrição:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fallback local quando API não está disponível
  generateJobFallback(promptData) {
    ('⚠️ Usando fallback local para geração de vaga');

    const keywords = this.extractKeywords(promptData.prompt);
    const title = this.generateTitleFromPrompt(promptData.prompt);

    const fallbackJob = {
      id: Date.now(),
      title: title,
      company: promptData.company_name || 'Empresa Inovadora',
      location: promptData.location || 'São Paulo, SP',
      job_type: promptData.job_type || 'full-time',
      experience_level: promptData.experience_level || 'mid',
      salary_range: 'A combinar',
      description: this.generateDescriptionFromPrompt(promptData.prompt, promptData),
      requirements: keywords.join(', '),
      benefits: promptData.include_benefits ? this.generateBenefits() : '',
      status: 'active',
      created_at: new Date().toISOString(),
      applications_count: 0,
      views_count: 0,
      created_via_ai: true
    };

    const customQuestions = promptData.generate_questions ? this.generateFallbackQuestions(title) : [];

    return {
      success: true,
      data: {
        job: fallbackJob,
        ai_generated: false,
        fallback_used: true,
        generation_details: {
          prompt_used: promptData.prompt,
          tone: promptData.tone || 'professional',
          generated_at: new Date().toISOString(),
          processing_time_ms: 500
        },
        custom_questions: customQuestions,
        suggestions: {
          optimization_tips: [
            'Considere adicionar informações sobre cultura da empresa',
            'Inclua detalhes sobre oportunidades de crescimento',
            'Especifique tecnologias ou ferramentas utilizadas'
          ],
          market_insights: [
            'Vagas similares oferecem salários 10-15% maiores na região',
            'Benefícios flexíveis são altamente valorizados no mercado atual',
            'Modalidade híbrida aumenta atratividade em 40%'
          ]
        }
      },
      job: fallbackJob,
      aiGenerated: false,
      fallbackUsed: true
    };
  }

  // Métodos auxiliares
  extractKeywords(text) {
    const commonWords = ['para', 'com', 'em', 'de', 'da', 'do', 'na', 'no', 'a', 'o', 'e', 'que', 'se'];
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  }

  generateTitleFromPrompt(prompt) {
    const keywords = this.extractKeywords(prompt);
    if (keywords.length > 0) {
      return `${keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1)} Specialist`;
    }
    return 'Profissional Especializado';
  }

  generateDescriptionFromPrompt(prompt, data) {
    return `
Estamos buscando um profissional para ${prompt}.

Responsabilidades:
- Executar atividades relacionadas à ${prompt}
- Colaborar com equipe multidisciplinar
- Contribuir para o crescimento da empresa
- Manter-se atualizado com as melhores práticas do mercado

Ambiente de trabalho:
- Modalidade: ${data.work_model || 'Híbrida'}
- Localização: ${data.location || 'São Paulo, SP'}
- Tipo: ${data.job_type || 'Tempo integral'}

Junte-se à nossa equipe e faça parte de uma empresa inovadora!
    `.trim();
  }

  generateBenefits() {
    return [
      'Vale refeição',
      'Vale transporte',
      'Plano de saúde',
      'Plano odontológico',
      'Participação nos lucros',
      'Oportunidades de crescimento',
      'Ambiente colaborativo'
    ].join('; ');
  }

  generateFallbackQuestions(title) {
    return [
      `Conte-me sobre sua experiência como ${title}`,
      'Quais são seus principais pontos fortes para esta posição?',
      'Como você se mantém atualizado na sua área?',
      'Descreva um projeto desafiador que você trabalhou',
      'Onde você se vê profissionalmente em 5 anos?'
    ];
  }

  // Validar dados de entrada
  validatePromptData(data) {
    const errors = [];

    if (!data.prompt || data.prompt.trim().length < 10) {
      errors.push('Prompt deve ter pelo menos 10 caracteres');
    }

    if (data.company_name && data.company_name.length > 100) {
      errors.push('Nome da empresa deve ter no máximo 100 caracteres');
    }

    if (data.location && data.location.length > 100) {
      errors.push('Localização deve ter no máximo 100 caracteres');
    }

    const validJobTypes = ['full-time', 'part-time', 'contract', 'freelance'];
    if (data.job_type && !validJobTypes.includes(data.job_type)) {
      errors.push('Tipo de trabalho inválido');
    }

    const validExperienceLevels = ['entry', 'mid', 'senior', 'executive'];
    if (data.experience_level && !validExperienceLevels.includes(data.experience_level)) {
      errors.push('Nível de experiência inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatar dados para envio
  formatPromptData(formData) {
    return {
      prompt: formData.prompt.trim(),
      company_name: formData.company_name?.trim() || '',
      location: formData.location?.trim() || 'São Paulo, SP',
      job_type: formData.job_type || 'full-time',
      experience_level: formData.experience_level || 'mid',
      work_model: formData.work_model || 'hybrid',
      include_benefits: Boolean(formData.include_benefits),
      generate_questions: Boolean(formData.generate_questions),
      tone: formData.tone || 'professional',
      created_by: 1 // ID do usuário logado
    };
  }
}

// Instância singleton
const jobAIService = new JobAIService();

export default jobAIService;

