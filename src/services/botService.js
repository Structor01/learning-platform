// Serviço para comunicação com a API do Bot
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class BotService {
  constructor() {
    this.baseURL = `${API_URL}/api/bot`;
  }

  async startChat(userId) {
    try {
      console.log('🚀 Iniciando chat para usuário:', userId);
      
      const response = await fetch(`${this.baseURL}/start-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao iniciar chat');
      }

      console.log('✅ Chat iniciado:', data.data);
      return data.data;

    } catch (error) {
      console.error('❌ Erro ao iniciar chat:', error);
      throw error;
    }
  }

  async sendMessage(sessionId, message) {
    try {
      console.log('💬 Enviando mensagem:', { sessionId, message: message.substring(0, 50) });
      
      const response = await fetch(`${this.baseURL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, message })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      console.log('✅ Resposta recebida:', data.data);
      return data.data;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId) {
    try {
      console.log('📋 Buscando histórico da sessão:', sessionId);
      
      const response = await fetch(`${this.baseURL}/chat-history/${sessionId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar histórico');
      }

      console.log('✅ Histórico carregado:', data.data);
      return data.data;

    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      throw error;
    }
  }

  async getUserSessions(userId) {
    try {
      console.log('👤 Buscando sessões do usuário:', userId);
      
      const response = await fetch(`${this.baseURL}/user-sessions?userId=${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar sessões');
      }

      console.log('✅ Sessões carregadas:', data.data);
      return data.data;

    } catch (error) {
      console.error('❌ Erro ao buscar sessões:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('❌ Erro no health check:', error);
      return false;
    }
  }
}

export default new BotService();

