// Serviço para comunicação com a API do Bot
const API_URL = import.meta.env.VITE_API_URL;

class BotService {
  constructor() {
    this.baseURL = `https://aurora.foxgraos.com.br/agroskills`;
  }

  async sendMessage(sessionId, message, isSilent = false) {
    try {
      const headers = {
         'Content-Type': 'application/json',
         'X-Api-Key': 'foxchatbot'
      };
      
      // isSilent indica que é uma mensagem que não deve mostrar saudação
      const response = await fetch(`${this.baseURL}/send-message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          sessionId, 
          message,
          prompt: isSilent 
            ? 'Responda normalmente sem saudações, pois é parte da conversa já iniciada'
            : ''
        })
      });

      const data = await response.json();
      
      if (!data) {
        throw new Error(data.message || 'Erro ao enviar mensagem');
      }

      console.log('✅ Resposta recebida:', data.message);
      return data;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}

export default new BotService();

