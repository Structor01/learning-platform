import { API_URL } from '@/components/utils/api';

class DiscApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_URL}/api/disc`;
    console.log(`[DiscApiService] API_URL: ${API_URL}`);
    console.log(`[DiscApiService] BaseURL: ${this.baseURL}`);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    console.log(`[DiscApiService] Fazendo requisição para: ${url}`);
    console.log(`[DiscApiService] Method: ${config.method || 'GET'}`);
    console.log(`[DiscApiService] BaseURL: ${this.baseURL}`);
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DiscApiService] Erro ${response.status}:`, errorText);
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[DiscApiService] Resposta:`, data);
    return data;
  }

  // ===== DISC API METHODS =====

  /**
   * Busca todas as perguntas do teste DISC
   */
  async getQuestions(): Promise<any> {
    return await this.makeRequest<any>('/questions');
  }

  /**
   * Submete as respostas do teste DISC
   */
  async submitDiscTest(userId: number, answers: { questionId: number; optionId: string }[]): Promise<any> {
    const response = await this.makeRequest<any>('/submit-test', {
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        answers: answers
      })
    });
    return response;
  }


  /**
   * Busca o perfil DISC do usuário
   */
  async getUserDiscProfile(userId: number): Promise<any> {
    try {
      const response = await this.makeRequest<any>(`/user/${userId}/profile`);

      if (!response) return null;

      // Retornar resposta do backend diretamente
      return response;
    } catch (error) {
      console.error('Erro ao buscar perfil DISC:', error);
      return null;
    }
  }

  /**
   * Busca todos os testes DISC do usuário
   */
  async getUserDISCTests(userId: number): Promise<any[]> {
    try {
      return await this.makeRequest<any[]>(`/user/${userId}/tests`);
    } catch (error) {
      console.error('Erro ao buscar testes DISC:', error);
      return [];
    }
  }

  /**
   * Busca teste DISC por ID
   */
  async getDISCTestById(testId: number): Promise<any> {
    try {
      return await this.makeRequest<any>(`/test/${testId}`);
    } catch (error) {
      console.error('Erro ao buscar teste por ID:', error);
      throw error;
    }
  }

  /**
   * Busca a porcentagem de preenchimento do perfil
   */
  async getProfilePercentage(userId: number): Promise<{ percentage: number }> {
    try {
      const profile = await this.getUserDiscProfile(userId);
      return { percentage: profile ? 100 : 0 };
    } catch (error) {
      console.error('Erro ao buscar porcentagem do perfil:', error);
      return { percentage: 0 };
    }
  }

  // ===== COMPATIBILITY METHODS (mantidos para não quebrar o código existente) =====

  /**
   * Busca resultado DISC do usuário (compatibilidade)
   */
  async getUserDiscResult(userId: number): Promise<any> {
    return await this.getUserDiscProfile(userId);
  }

  // ===== UTILITY METHODS =====

  /**
   * Converte dados da API para o formato do perfil local
   */
  convertApiDataToProfile(apiData: any): any {
    console.log('🔍 [convertApiDataToProfile] Dados recebidos:', apiData);

    if (!apiData) {
      console.log('❌ [convertApiDataToProfile] Nenhum dado recebido, usando perfil padrão');
      return this.getDefaultProfile();
    }

    // Formato novo da API DISC: {testId, result: {disc: {counts, perfil}}}
    if (apiData.result?.disc?.perfil) {
      console.log('✅ [convertApiDataToProfile] Encontrou formato novo da API DISC');
      const type = apiData.result.disc.perfil;
      const counts = apiData.result.disc.counts;
      console.log('🔍 [convertApiDataToProfile] Tipo:', type, 'Counts:', counts);

      const totalAnswers = Object.values(counts).reduce((sum: number, count: any) => sum + count, 0);
      const percentage = totalAnswers > 0 ? Math.round((counts[type] / totalAnswers) * 100) : 75;

      const profile = {
        type,
        name: this.getDiscName(type),
        description: this.getDiscDescription(type),
        percentage,
        counts,
        characteristics: this.getDiscCharacteristics(type),
        strengths: this.getDiscStrengths(type),
        improvements: this.getDiscImprovements(type)
      };

      console.log('✅ [convertApiDataToProfile] Perfil convertido:', profile);
      return profile;
    }

    // Se tem disc_scores direto (formato antigo)
    if (apiData.disc_scores) {
      console.log('✅ [convertApiDataToProfile] Encontrou formato antigo (disc_scores)');
      const type = apiData.disc_scores.type;
      const percentage = apiData.disc_scores.percentage || 75;

      return {
        type,
        name: this.getDiscName(type),
        description: this.getDiscDescription(type),
        percentage,
        characteristics: this.getDiscCharacteristics(type),
        strengths: this.getDiscStrengths(type),
        improvements: this.getDiscImprovements(type)
      };
    }

    console.log('❌ [convertApiDataToProfile] Nenhum formato reconhecido, usando perfil padrão');
    console.log('🔍 [convertApiDataToProfile] Estrutura dos dados:', Object.keys(apiData));
    return this.getDefaultProfile();
  }


  private getDefaultProfile(): any {
    return {
      type: 'D',
      name: 'Dominante',
      description: this.getDiscDescription('D'),
      percentage: 75,
      characteristics: this.getDiscCharacteristics('D'),
      strengths: this.getDiscStrengths('D'),
      improvements: this.getDiscImprovements('D')
    };
  }

  private mapProfileNameToType(profileName: string): string {
    if (profileName.includes('Dominante')) return 'D';
    if (profileName.includes('Influente')) return 'I';
    if (profileName.includes('Estável')) return 'S';
    if (profileName.includes('Conforme') || profileName.includes('Consciencioso')) return 'C';
    return 'D';
  }

  private getDiscName(type: string): string {
    const names = {
      'D': 'Dominante',
      'I': 'Influente',
      'S': 'Estável',
      'C': 'Consciencioso'
    };
    return names[type] || 'Dominante';
  }

  private getDiscDescription(type: string): string {
    const descriptions = {
      'D': 'As pessoas com o perfil Dominante são orientadas para resultados, diretas e determinadas. São líderes naturais que gostam de desafios, assumem riscos calculados e tomam decisões rápidas.',
      'I': 'As pessoas com o perfil Influente são extrovertidas, gostam de interagir com os outros, de estar no centro das atenções e são altamente comunicativas.',
      'S': 'As pessoas com o perfil Estável são pacientes, leais e colaborativas. Valorizam a harmonia no ambiente de trabalho, são excelentes ouvintes e preferem ambientes previsíveis e estáveis.',
      'C': 'As pessoas com o perfil Consciencioso são analíticas, precisas e sistemáticas. Prezam pela qualidade, seguem procedimentos e são muito detalhistas.'
    };
    return descriptions[type] || descriptions['D'];
  }

  private getDiscCharacteristics(type: string): string[] {
    const characteristics = {
      'D': ['Determinado', 'Competitivo', 'Direto', 'Orientado a resultados', 'Confiante', 'Decisivo'],
      'I': ['Entusiástico', 'Comunicativo', 'Otimista', 'Persuasivo', 'Sociável', 'Inspirador'],
      'S': ['Paciente', 'Leal', 'Colaborativo', 'Estável', 'Confiável', 'Empático'],
      'C': ['Analítico', 'Preciso', 'Sistemático', 'Detalhista', 'Organizado', 'Criterioso']
    };
    return characteristics[type] || characteristics['D'];
  }

  private getDiscStrengths(type: string): string[] {
    const strengths = {
      'D': ['Liderança natural', 'Tomada de decisão rápida', 'Orientação para resultados', 'Iniciativa', 'Competitividade saudável'],
      'I': ['Comunicação eficaz', 'Motivação de equipes', 'Networking', 'Criatividade', 'Otimismo contagiante'],
      'S': ['Trabalho em equipe', 'Estabilidade emocional', 'Lealdade', 'Paciência', 'Resolução de conflitos'],
      'C': ['Análise detalhada', 'Qualidade no trabalho', 'Organização', 'Planejamento', 'Precisão técnica']
    };
    return strengths[type] || strengths['D'];
  }

  private getDiscImprovements(type: string): string[] {
    const improvements = {
      'D': ['Desenvolver paciência', 'Melhorar escuta ativa', 'Considerar opinião da equipe', 'Controlar impulsividade'],
      'I': ['Focar nos detalhes', 'Melhorar organização', 'Cumprir prazos', 'Ser mais analítico'],
      'S': ['Tomar iniciativa', 'Aceitar mudanças', 'Expressar opiniões', 'Ser mais assertivo'],
      'C': ['Ser mais flexível', 'Melhorar relacionamento interpessoal', 'Aceitar riscos calculados', 'Comunicar-se mais']
    };
    return improvements[type] || improvements['D'];
  }
}

const discApiService = new DiscApiService();
export default discApiService;