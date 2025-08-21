import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/bot/MessageBubble';
import ChatInput from '@/components/bot/ChatInput';
import botService from '@/services/botService';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import {useAuth} from "@/contexts/AuthContext.jsx";

const PublicChatPage = () => {
  const { login } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Inicializar sessão do chat
  useEffect (() => {
    try {
      // Gerar um sessionId único para usuários não logados
      const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(guestSessionId);

      // Mensagem de boas-vindas
      botService.startChat(null, guestSessionId)
          .then(startChat => {
            setUserId(startChat.userId);
            setSessionId(startChat.sessionId);

            const welcomeMessage = {
              id: Date.now(),
              content: startChat.message,
              isBot: true,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          });
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isMinimized) {
      // Aguarda render para garantir que o elemento exista
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [isMinimized]);

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

    try {
      // Enviar mensagem para o bot (sem autenticação)
      const response = await botService.sendMessage(sessionId, content, userId); // false = não autenticado

      console.log(response);
      if (response.collectedData.email) {
        await login(response.collectedData.email, '123456');
      }
      
      // Adicionar resposta do bot
      const botMessage = {
        id: Date.now() + 1,
        content: response.message,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/1.png"
            alt="Logo AgroSkills"
            className="mx-auto w-32 h-32 mb-4 object-contain"
          />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Converse com a nossa Recrutadora IZA e descubra como podemos ajudar
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
                  <div className="w-10 h-10 bg-white/20 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/iza.png"
                      alt="Iza Recrutadora"
                      className="w-200% h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">IZA</h3>
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
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message.content}
                      isBot={message.isBot}
                      timestamp={message.timestamp}
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
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                    placeholder="Digite sua mensagem..."
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

