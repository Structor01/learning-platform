class ChatGPTService {
  constructor() {
    // Usar import.meta.env em vez de process.env para Vite
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ VITE_OPENAI_API_KEY não configurada. Funcionalidades de IA limitadas.');
    }
  }

  async generateInterviewQuestions(jobData) {
    if (!this.apiKey) {
      console.warn('API Key não configurada, usando perguntas padrão');
      return this.getDefaultQuestions(jobData);
    }

    try {
      const prompt = this.buildQuestionPrompt(jobData);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em recursos humanos e entrevistas de emprego. Gere perguntas específicas e relevantes para a vaga.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const questionsText = data.choices[0].message.content;
      
      return this.parseQuestions(questionsText, jobData);
    } catch (error) {
      console.error('Erro ao gerar perguntas:', error);
      return this.getDefaultQuestions(jobData);
    }
  }

  buildQuestionPrompt(jobData) {
    return `
Gere 3 perguntas específicas para uma entrevista de emprego baseadas nas seguintes informações da vaga:

Título: ${jobData.title || 'Não informado'}
Empresa: ${jobData.company || 'Não informado'}
Descrição: ${jobData.description || 'Não informado'}
Área: ${jobData.area || 'Não informado'}
Nível: ${jobData.level || 'Não informado'}

IMPORTANTE:
- A primeira pergunta SEMPRE deve ser: "Conte um pouco sobre sua trajetória profissional"
- Gere apenas 3 perguntas adicionais específicas para esta vaga
- Foque em competências técnicas e comportamentais relevantes
- Seja direto e objetivo
- Numere as perguntas de 2 a 4

Formato de resposta:
2. [Segunda pergunta específica]
3. [Terceira pergunta específica]  
4. [Quarta pergunta específica]
`;
  }

  parseQuestions(questionsText, jobData) {
    const questions = [
      {
        id: 1,
        question: "Conte um pouco sobre sua trajetória profissional",
        type: "standard"
      }
    ];

    // Extrair perguntas numeradas do texto
    const lines = questionsText.split('\n');
    let questionNumber = 2;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./)) {
        const questionText = trimmed.replace(/^\d+\.\s*/, '');
        if (questionText && questionNumber <= 4) {
          questions.push({
            id: questionNumber,
            question: questionText,
            type: "specific"
          });
          questionNumber++;
        }
      }
    }

    // Garantir que temos 4 perguntas
    while (questions.length < 4) {
      questions.push({
        id: questions.length + 1,
        question: this.getDefaultQuestionByIndex(questions.length, jobData),
        type: "fallback"
      });
    }

    return questions.slice(0, 4);
  }

  getDefaultQuestions(jobData) {
    return [
      {
        id: 1,
        question: "Conte um pouco sobre sua trajetória profissional",
        type: "standard"
      },
      {
        id: 2,
        question: `Quais são suas principais qualificações para a posição de ${jobData.title || 'esta vaga'}?`,
        type: "default"
      },
      {
        id: 3,
        question: "Como você lida com desafios e pressão no trabalho?",
        type: "default"
      },
      {
        id: 4,
        question: "Onde você se vê profissionalmente nos próximos 5 anos?",
        type: "default"
      }
    ];
  }

  getDefaultQuestionByIndex(index, jobData) {
    const defaultQuestions = [
      "Conte um pouco sobre sua trajetória profissional",
      `Quais são suas principais qualificações para a posição de ${jobData.title || 'esta vaga'}?`,
      "Como você lida com desafios e pressão no trabalho?",
      "Onde você se vê profissionalmente nos próximos 5 anos?",
      "Qual foi seu maior desafio profissional e como o superou?",
      "Como você se mantém atualizado em sua área de atuação?"
    ];
    
    return defaultQuestions[index] || "Fale sobre suas expectativas para esta posição.";
  }

  async transcribeVideo(videoBlob) {
    if (!this.apiKey) {
      console.warn('API Key não configurada, transcrição não disponível');
      return "Transcrição não disponível - API Key não configurada";
    }

    try {
      const formData = new FormData();
      formData.append('file', videoBlob, 'interview.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erro na transcrição: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "Transcrição vazia";
    } catch (error) {
      console.error('Erro na transcrição:', error);
      return "Erro na transcrição do áudio";
    }
  }

  async analyzeInterview(transcription, faceAnalysisData, jobData) {
    if (!this.apiKey) {
      console.warn('API Key não configurada, usando análise básica');
      return this.getBasicAnalysis(transcription, faceAnalysisData);
    }

    try {
      const prompt = this.buildAnalysisPrompt(transcription, faceAnalysisData, jobData);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de entrevistas e recursos humanos. Analise a performance do candidato de forma objetiva e construtiva.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na análise: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      return this.parseAnalysis(analysis, faceAnalysisData);
    } catch (error) {
      console.error('Erro na análise:', error);
      return this.getBasicAnalysis(transcription, faceAnalysisData);
    }
  }

  buildAnalysisPrompt(transcription, faceAnalysisData, jobData) {
    const avgConfidence = faceAnalysisData.length > 0 
      ? faceAnalysisData.reduce((sum, data) => sum + (data.confidence || 0), 0) / faceAnalysisData.length 
      : 0;

    const emotionSummary = this.summarizeEmotions(faceAnalysisData);

    return `
Analise esta entrevista de emprego e forneça um relatório detalhado:

INFORMAÇÕES DA VAGA:
- Título: ${jobData.title || 'Não informado'}
- Empresa: ${jobData.company || 'Não informado'}
- Área: ${jobData.area || 'Não informado'}
- Nível: ${jobData.level || 'Não informado'}

TRANSCRIÇÃO DAS RESPOSTAS:
${transcription}

DADOS COMPORTAMENTAIS:
- Confiança média: ${(avgConfidence * 100).toFixed(1)}%
- Análise emocional: ${emotionSummary}
- Amostras coletadas: ${faceAnalysisData.length}

Por favor, forneça uma análise estruturada com:

1. PONTOS FORTES (3-4 pontos)
2. ÁREAS DE MELHORIA (2-3 pontos)
3. ADEQUAÇÃO À VAGA (nota de 1-10 e justificativa)
4. RECOMENDAÇÃO FINAL (Contratar/Não Contratar/Entrevista Adicional)
5. OBSERVAÇÕES COMPORTAMENTAIS

Seja objetivo, construtivo e profissional.
`;
  }

  summarizeEmotions(faceAnalysisData) {
    if (!faceAnalysisData || faceAnalysisData.length === 0) {
      return "Dados não disponíveis";
    }

    const emotionCounts = {};
    faceAnalysisData.forEach(data => {
      if (data.dominantEmotion) {
        emotionCounts[data.dominantEmotion] = (emotionCounts[data.dominantEmotion] || 0) + 1;
      }
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return sortedEmotions.length > 0 
      ? sortedEmotions.map(([emotion, count]) => `${emotion} (${count}x)`).join(', ')
      : "Neutro predominante";
  }

  parseAnalysis(analysisText, faceAnalysisData) {
    // Extrair seções da análise
    const sections = {
      strengths: this.extractSection(analysisText, 'PONTOS FORTES'),
      improvements: this.extractSection(analysisText, 'ÁREAS DE MELHORIA'),
      jobFit: this.extractSection(analysisText, 'ADEQUAÇÃO À VAGA'),
      recommendation: this.extractSection(analysisText, 'RECOMENDAÇÃO FINAL'),
      behavioral: this.extractSection(analysisText, 'OBSERVAÇÕES COMPORTAMENTAIS')
    };

    // Extrair nota numérica
    const scoreMatch = analysisText.match(/nota\s*(?:de\s*)?(\d+)(?:\/10)?/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 7;

    return {
      score: Math.min(Math.max(score, 1), 10),
      recommendation: this.extractRecommendation(sections.recommendation),
      strengths: this.parseListItems(sections.strengths),
      improvements: this.parseListItems(sections.improvements),
      jobFit: sections.jobFit || "Adequação moderada à vaga",
      behavioral: sections.behavioral || "Comportamento adequado durante a entrevista",
      fullAnalysis: analysisText,
      faceAnalysisSummary: this.generateFaceAnalysisSummary(faceAnalysisData),
      timestamp: new Date().toISOString()
    };
  }

  extractSection(text, sectionName) {
    const regex = new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  extractRecommendation(recommendationText) {
    if (recommendationText.toLowerCase().includes('contratar')) {
      if (recommendationText.toLowerCase().includes('não')) {
        return 'Não Contratar';
      }
      return 'Contratar';
    }
    if (recommendationText.toLowerCase().includes('entrevista adicional')) {
      return 'Entrevista Adicional';
    }
    return 'Avaliar';
  }

  parseListItems(text) {
    if (!text) return [];
    
    const lines = text.split('\n');
    const items = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./))) {
        const cleaned = trimmed.replace(/^[-•\d.]\s*/, '');
        if (cleaned) items.push(cleaned);
      }
    }
    
    return items.length > 0 ? items : [text.trim()];
  }

  generateFaceAnalysisSummary(faceAnalysisData) {
    if (!faceAnalysisData || faceAnalysisData.length === 0) {
      return {
        confidence: 0,
        dominantEmotion: 'neutral',
        emotionDistribution: {},
        samplesCount: 0
      };
    }

    const avgConfidence = faceAnalysisData.reduce((sum, data) => sum + (data.confidence || 0), 0) / faceAnalysisData.length;
    
    const emotionCounts = {};
    faceAnalysisData.forEach(data => {
      if (data.dominantEmotion) {
        emotionCounts[data.dominantEmotion] = (emotionCounts[data.dominantEmotion] || 0) + 1;
      }
    });

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    return {
      confidence: avgConfidence,
      dominantEmotion,
      emotionDistribution: emotionCounts,
      samplesCount: faceAnalysisData.length
    };
  }

  getBasicAnalysis(transcription, faceAnalysisData) {
    const wordCount = transcription.split(' ').length;
    const avgConfidence = faceAnalysisData.length > 0 
      ? faceAnalysisData.reduce((sum, data) => sum + (data.confidence || 0), 0) / faceAnalysisData.length 
      : 0.7;

    let score = 7; // Score base
    
    // Ajustar score baseado no comprimento da resposta
    if (wordCount > 100) score += 1;
    if (wordCount > 200) score += 1;
    if (avgConfidence > 0.8) score += 1;
    
    score = Math.min(score, 10);

    return {
      score,
      recommendation: score >= 8 ? 'Contratar' : score >= 6 ? 'Entrevista Adicional' : 'Avaliar',
      strengths: [
        'Respondeu às perguntas de forma adequada',
        'Demonstrou interesse na posição',
        'Comunicação clara'
      ],
      improvements: [
        'Poderia elaborar mais as respostas',
        'Demonstrar mais exemplos práticos'
      ],
      jobFit: 'Adequação moderada à vaga baseada nas respostas fornecidas',
      behavioral: `Confiança média de ${(avgConfidence * 100).toFixed(1)}% durante a entrevista`,
      fullAnalysis: 'Análise básica - API não configurada',
      faceAnalysisSummary: this.generateFaceAnalysisSummary(faceAnalysisData),
      timestamp: new Date().toISOString()
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
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        return {
          success: true,
          message: 'API OpenAI funcionando corretamente'
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
const chatgptService = new ChatGPTService();
export default chatgptService;

