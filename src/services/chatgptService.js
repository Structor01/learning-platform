// Serviço para integração com ChatGPT API
class ChatGPTService {
  constructor() {
    // API Key deve ser configurada como variável de ambiente
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  // Gerar perguntas de entrevista baseadas no perfil da vaga
  async generateInterviewQuestions(job) {
    try {
      const prompt = `
Você é um especialista em recrutamento e seleção. Gere exatamente 4 perguntas para uma entrevista de emprego baseada na vaga abaixo.

IMPORTANTE: A primeira pergunta SEMPRE deve ser sobre trajetória profissional.

Vaga:
- Título: ${job.nome || job.title}
- Empresa: ${job.empresa || job.company}
- Localização: ${job.cidade || job.location}
- Descrição: ${job.descricao || job.description || 'Não informado'}
- Critérios: ${job.criterios || job.criteria || 'Não informado'}

Retorne APENAS um JSON válido no formato:
{
  "questions": [
    {
      "id": 1,
      "question": "Conte-me um pouco sobre sua trajetória profissional e como chegou até aqui.",
      "isStandard": true,
      "category": "trajetoria"
    },
    {
      "id": 2,
      "question": "Pergunta específica 1",
      "isStandard": false,
      "category": "tecnica"
    },
    {
      "id": 3,
      "question": "Pergunta específica 2",
      "isStandard": false,
      "category": "comportamental"
    },
    {
      "id": 4,
      "question": "Pergunta específica 3",
      "isStandard": false,
      "category": "situacional"
    }
  ]
}`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em RH. Responda APENAS com JSON válido, sem explicações adicionais.'
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
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      try {
        const parsed = JSON.parse(content);
        return {
          success: true,
          questions: parsed.questions
        };
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        return this.getFallbackQuestions();
      }

    } catch (error) {
      console.error('Erro ao gerar perguntas:', error);
      return this.getFallbackQuestions();
    }
  }

  // Perguntas de fallback caso a API falhe
  getFallbackQuestions() {
    return {
      success: false,
      error: 'Erro na API ChatGPT',
      questions: [
        {
          id: 1,
          question: "Conte-me um pouco sobre sua trajetória profissional e como chegou até aqui.",
          isStandard: true,
          category: "trajetoria"
        },
        {
          id: 2,
          question: "Quais são seus principais pontos fortes e como eles se aplicam a esta vaga?",
          isStandard: false,
          category: "tecnica"
        },
        {
          id: 3,
          question: "Descreva uma situação desafiadora que enfrentou no trabalho e como a resolveu.",
          isStandard: false,
          category: "comportamental"
        },
        {
          id: 4,
          question: "Por que você tem interesse em trabalhar nesta empresa e nesta posição?",
          isStandard: false,
          category: "motivacional"
        }
      ]
    };
  }

  // Transcrever vídeo usando Whisper API
  async transcribeVideo(videoBlob) {
    try {
      const formData = new FormData();
      formData.append('file', videoBlob, 'interview_response.webm');
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
      
      return {
        success: true,
        transcription: data.text
      };

    } catch (error) {
      console.error('Erro na transcrição:', error);
      return {
        success: false,
        error: error.message,
        transcription: '[Erro na transcrição automática]'
      };
    }
  }

  // Analisar resposta com dados da Face API
  async analyzeResponseWithFaceData(question, transcription, faceData, job) {
    try {
      // Calcular estatísticas dos dados faciais
      const faceStats = this.calculateFaceStatistics(faceData);
      
      const prompt = `
Analise esta resposta de entrevista considerando tanto o conteúdo verbal quanto os dados comportamentais:

PERGUNTA: ${question}

RESPOSTA TRANSCRITA: ${transcription}

DADOS COMPORTAMENTAIS:
- Emoção dominante: ${faceStats.dominantEmotion}
- Distribuição emocional: ${JSON.stringify(faceStats.emotionDistribution)}
- Idade estimada: ${faceStats.avgAge} anos
- Gênero: ${faceStats.dominantGender}
- Total de pontos coletados: ${faceStats.totalDataPoints}
- Confiança média: ${faceStats.avgConfidence}%

CONTEXTO DA VAGA:
- Título: ${job.nome || job.title}
- Empresa: ${job.empresa || job.company}

Forneça uma análise completa no formato JSON:
{
  "score": 8,
  "verbalAnalysis": "Análise do conteúdo da resposta...",
  "behavioralAnalysis": "Análise dos dados comportamentais...",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "improvements": ["Melhoria 1", "Melhoria 2"],
  "recommendation": "RECOMENDADO/NEUTRO/NÃO_RECOMENDADO",
  "confidence": 85
}`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de entrevistas. Responda APENAS com JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na análise: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      try {
        const analysis = JSON.parse(content);
        return {
          success: true,
          analysis: analysis
        };
      } catch (parseError) {
        return this.getFallbackAnalysis(transcription);
      }

    } catch (error) {
      console.error('Erro na análise:', error);
      return this.getFallbackAnalysis(transcription);
    }
  }

  // Análise simples sem dados faciais
  async analyzeResponse(question, transcription, job) {
    return this.analyzeResponseWithFaceData(question, transcription, [], job);
  }

  // Análise de fallback
  getFallbackAnalysis(transcription) {
    const wordCount = transcription.split(' ').length;
    const score = Math.min(Math.max(Math.floor(wordCount / 10), 3), 8);
    
    return {
      success: false,
      error: 'Erro na API de análise',
      analysis: {
        score: score,
        verbalAnalysis: `Resposta com ${wordCount} palavras. Análise automática indisponível.`,
        behavioralAnalysis: 'Dados comportamentais não analisados.',
        strengths: ['Respondeu à pergunta'],
        improvements: ['Análise detalhada indisponível'],
        recommendation: 'NEUTRO',
        confidence: 50
      }
    };
  }

  // Gerar relatório final da entrevista
  async generateFinalReport(job, questions, candidate) {
    try {
      const answeredQuestions = questions.filter(q => q.answered);
      const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.analysis?.score || 0), 0);
      const avgScore = answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;

      // Compilar dados comportamentais
      const allFaceData = answeredQuestions.flatMap(q => q.faceData || []);
      const faceStats = this.calculateFaceStatistics(allFaceData);

      const prompt = `
Gere um relatório final de entrevista baseado nos dados abaixo:

CANDIDATO: ${candidate.name || 'Não informado'}
VAGA: ${job.nome || job.title} - ${job.empresa || job.company}

PERGUNTAS E RESPOSTAS:
${answeredQuestions.map((q, i) => `
${i + 1}. ${q.question}
Resposta: ${q.transcription || 'Não respondida'}
Pontuação: ${q.analysis?.score || 0}/10
`).join('\n')}

ESTATÍSTICAS GERAIS:
- Pontuação média: ${avgScore.toFixed(1)}/10
- Perguntas respondidas: ${answeredQuestions.length}/${questions.length}
- Dados comportamentais: ${allFaceData.length} pontos coletados
- Emoção dominante: ${faceStats.dominantEmotion}
- Confiança média: ${faceStats.avgConfidence}%

Gere um relatório no formato JSON:
{
  "overallScore": 8.5,
  "recommendation": "RECOMENDADO",
  "summary": "Resumo executivo...",
  "strengths": ["Força 1", "Força 2"],
  "weaknesses": ["Fraqueza 1", "Fraqueza 2"],
  "behavioralInsights": "Insights comportamentais...",
  "nextSteps": "Próximos passos recomendados...",
  "confidence": 90
}`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em avaliação de candidatos. Responda APENAS com JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no relatório: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      try {
        const report = JSON.parse(content);
        return {
          success: true,
          report: report
        };
      } catch (parseError) {
        return this.getFallbackReport(avgScore, answeredQuestions.length, questions.length);
      }

    } catch (error) {
      console.error('Erro no relatório final:', error);
      return this.getFallbackReport(0, 0, questions.length);
    }
  }

  // Relatório de fallback
  getFallbackReport(avgScore, answered, total) {
    return {
      success: false,
      error: 'Erro na geração do relatório',
      report: {
        overallScore: avgScore,
        recommendation: avgScore >= 7 ? 'RECOMENDADO' : avgScore >= 5 ? 'NEUTRO' : 'NÃO_RECOMENDADO',
        summary: `Candidato respondeu ${answered}/${total} perguntas com pontuação média de ${avgScore.toFixed(1)}.`,
        strengths: ['Participou da entrevista'],
        weaknesses: ['Análise detalhada indisponível'],
        behavioralInsights: 'Dados comportamentais coletados mas não analisados.',
        nextSteps: 'Revisar respostas manualmente.',
        confidence: 50
      }
    };
  }

  // Calcular estatísticas dos dados faciais
  calculateFaceStatistics(faceData) {
    if (!faceData || faceData.length === 0) {
      return {
        totalDataPoints: 0,
        dominantEmotion: 'neutral',
        emotionDistribution: {},
        avgAge: 0,
        dominantGender: 'unknown',
        avgConfidence: 0
      };
    }

    let totalEmotions = {};
    let totalAge = 0;
    let totalConfidence = 0;
    let genderCounts = {};

    faceData.forEach(data => {
      if (data.dominantEmotion) {
        totalEmotions[data.dominantEmotion] = (totalEmotions[data.dominantEmotion] || 0) + 1;
      }
      if (data.age) totalAge += data.age;
      if (data.confidence) totalConfidence += data.confidence;
      if (data.gender) {
        genderCounts[data.gender] = (genderCounts[data.gender] || 0) + 1;
      }
    });

    return {
      totalDataPoints: faceData.length,
      dominantEmotion: Object.keys(totalEmotions).reduce((a, b) => 
        totalEmotions[a] > totalEmotions[b] ? a : b, 'neutral'),
      emotionDistribution: totalEmotions,
      avgAge: faceData.length > 0 ? Math.round(totalAge / faceData.length) : 0,
      dominantGender: Object.keys(genderCounts).reduce((a, b) => 
        genderCounts[a] > genderCounts[b] ? a : b, 'unknown'),
      avgConfidence: faceData.length > 0 ? Math.round((totalConfidence / faceData.length) * 100) : 0
    };
  }
}

const chatgptService = new ChatGPTService();
export default chatgptService;

