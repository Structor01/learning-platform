import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/bot/MessageBubble';
import ChatInput from '@/components/bot/ChatInput';
import botService from '@/services/botService';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';

const PublicChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [actionCommand, setActionCommand] = useState(null);
  const expirationHours = 24;
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);



  // Função para rolar para o final da conversa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rolar para o final sempre que as mensagens mudarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focar no input quando o carregamento terminar
  useEffect(() => {
    if (!isLoading && chatInputRef.current?.focus) {
      // Pequeno timeout para garantir que o DOM esteja atualizado
      setTimeout(() => {
        chatInputRef.current.focus();
      }, 100);
    }
  }, [isLoading]);

  // Inicializar sessão do chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        
        // Verificar se existe uma sessão armazenada e se ainda é válida
        let sessionData;
        try {
          sessionData = JSON.parse(localStorage.getItem('agroskills:guestSession'));
        } catch {
          // Se houver erro ao fazer parse do JSON, sessionData será null
          sessionData = null;
        }
        
        let guestSessionId;
        
        if (sessionData && new Date(sessionData.expiresAt) > new Date()) {
          // Sessão ainda é válida
          guestSessionId = sessionData.id;
          console.log('🔄 Usando sessão existente:', guestSessionId);
        } else {
          // Criar nova sessão com timestamp
          guestSessionId = `agroskill_${Date.now()}`;
          console.log('🆕 Criando nova sessão:', guestSessionId);
          
          // Calcular data de expiração
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + expirationHours);
          
          // Salvar no localStorage com data de expiração
          localStorage.setItem('agroskills:guestSession', JSON.stringify({
            id: guestSessionId,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
          }));
        }

        setSessionId(guestSessionId);
        
        // Determinar se é uma sessão existente (para mensagem de boas-vindas)
        let isReturningUser = sessionData && sessionData.id === guestSessionId;
        
        // Aguardar resposta do bot para mostrar como primeira mensagem
        try {
          setIsLoading(true);
          const initialResponse = await botService.sendMessage(guestSessionId, 
            "oi");
          
          // Tentar fazer parse do JSON que vem no campo message
          let parsedMessage;
          try {
            parsedMessage = JSON.parse(initialResponse.message);
          } catch {
            // Se não for JSON válido, usar como string normal
            parsedMessage = { pergunta: initialResponse.message };
          }
          
          // Adicionar resposta do bot como primeira mensagem
          const botMessage = {
            id: Date.now(),
            content: parsedMessage.pergunta || parsedMessage.message || initialResponse.message,
            options: parsedMessage.opcoes || null,
            isBot: true,
            timestamp: new Date()
          };
          
          setMessages([botMessage]);
          
          // Verificar se há actionCommands na resposta inicial
          if(initialResponse.actionCommands){
            const sendCvCommand = initialResponse.actionCommands.find(cmd => cmd.name === 'send-cv');
            const sendBooleanCommand = initialResponse.actionCommands.find(cmd => cmd.name === 'send-boolean');

            if(sendCvCommand){
              setActionCommand('send-cv');
            }

            if(sendBooleanCommand){
              setActionCommand('send-boolean');
            }
          }
        } catch (error) {
          console.error("Erro ao obter saudação inicial:", error);
          
          // Se falhar, usar mensagem padrão
          let content = isReturningUser
            ? "Olá, prazer em vê-lo novamente! Sou o assistente virtual da AgroSkills. Estou aqui para te ajudar a descobrir mais sobre suas habilidades e interesses profissionais no agronegócio. Vamos conversar?"
            : "Olá! Sou o assistente virtual da AgroSkills. Estou aqui para te ajudar a descobrir mais sobre suas habilidades e interesses profissionais no agronegócio. Vamos conversar?"
          
          const welcomeMessage = {
            id: Date.now(),
            content: content,
            isBot: true,
            timestamp: new Date()
          };
          
          setMessages([welcomeMessage]);
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      content,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Limpar actionCommand se for uma resposta booleana
    if (actionCommand === 'send-boolean') {
      setActionCommand(null);
    }

    try {
      // Enviar mensagem para o bot (sem autenticação)
      const response = await botService.sendMessage(sessionId, content);

      console.log('Resposta do bot:', response);
      
      // Tentar fazer parse do JSON que vem no campo message
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(response.message);
      } catch {
        // Se não for JSON válido, usar como string normal
        parsedMessage = { pergunta: response.message };
      }
      
      // Adicionar resposta do bot
      const botMessage = {
        id: Date.now() + 1,
        content: parsedMessage.pergunta || parsedMessage.message || response.message,
        options: parsedMessage.opcoes || null,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      if(response.actionCommands){
        const sendCvCommand = response.actionCommands.find(cmd => cmd.name === 'send-cv');
        const sendBooleanCommand = response.actionCommands.find(cmd => cmd.name === 'send-boolean');

        if(sendCvCommand){
          setActionCommand('send-cv');
        }

        if(sendBooleanCommand){
          setActionCommand('send-boolean');
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem de erro
      const errorMessage = {
        id: Date.now() + 1,
        content: "Desculpe, ocorreu um erro. Tente novamente em alguns instantes.",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (selectedOption) => {
    // Enviar a opção selecionada como uma mensagem normal
    await handleSendMessage(selectedOption);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsLoading(true);

    try {
      // Adicionar mensagem do usuário indicando que um arquivo foi enviado
      const userMessage = {
        id: Date.now(),
        content: `Enviado CV: ${file.name}`,
        isBot: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Criar um objeto FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('type', 'cv');

     
      
      // Simular um atraso
      // vou add o currriculo aki onde o arthur quiser
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Adicionar resposta do bot confirmando recebimento do CV
      const confirmationMessage = {
        id: Date.now() + 1,
        content: "Recebi seu currículo! Estou analisando as informações...",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, confirmationMessage]);
      
      // Enviar mensagem por baixo dos panos 
      const hiddenResponse = await botService.sendMessage(
        sessionId, 
        "SISTEMA: Currículo enviado pelo usuário. Continue a conversa analisando o perfil e oferecendo opções relevantes."
      );
      
      // Adicionar a resposta real do bot após a análise
      const analysisMessage = {
        id: Date.now() + 2,
        content: hiddenResponse.message ,
        isBot: true,
        timestamp: new Date(Date.now() + 1000) // Timestamp ligeiramente posterior para garantir ordem
      };
      
      // Adicionar uma pequena pausa entre as mensagens para simular análise
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessages(prev => [...prev, analysisMessage]);
      
      // Limpar o comando após o upload ser concluído
      setActionCommand(null);

    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      
      // Mensagem de erro
      const errorMessage = {
        id: Date.now() + 1,
        content: "Desculpe, ocorreu um erro ao processar seu arquivo. Tente novamente em alguns instantes.",
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Chat AgroSkills
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Converse com nosso assistente virtual e descubra como podemos ajudar 
            a acelerar sua carreira no agronegócio
          </p>
        </div>

        {/* Chat Container */}
        <Card className="w-full max-w-3xl mx-auto shadow-xl">
          <CardContent className="p-0">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Assistente AgroSkills</h3>
                    <p className="text-sm opacity-90">Online agora</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            {!isMinimized && (
              <>
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50" id="chat-messages">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message.content}
                      isBot={message.isBot}
                      timestamp={message.timestamp}
                      options={message.options}
                      onSelectOption={handleOptionSelect}
                      disabled={isLoading}
                    />
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <ChatInput
                    ref={chatInputRef}
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    placeholder="Digite sua mensagem..."
                    actionCommand={actionCommand}
                    onFileUpload={handleFileUpload}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Gostou da conversa? Crie sua conta para ter acesso completo à plataforma!
          </p>
          <div className="space-x-4">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/register'}
            >
              Criar Conta
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/login'}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicChatPage;