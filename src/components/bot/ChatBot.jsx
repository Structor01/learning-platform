import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import botService from '../../services/botService';

const ChatBot = ({ userId, isOpen, onClose, onMinimize, isMinimized }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && userId && !sessionId) {
      initializeChat();
    }
  }, [isOpen, userId]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Inicializando chat para usuário:', userId);
      
      const chatData = await botService.startChat(userId);
      
      setSessionId(chatData.sessionId);
      setMessages([{
        id: Date.now(),
        content: chatData.message,
        isBot: true,
        timestamp: new Date(),
        step: chatData.step
      }]);

    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error);
      setError('Erro ao iniciar conversa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent) => {
    if (!sessionId || isCompleted) {
      return;
    }

    try {
      setError(null);
      
      // Adicionar mensagem do usuário
      const userMessage = {
        id: Date.now(),
        content: messageContent,
        isBot: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Enviar mensagem para o bot
      const response = await botService.sendMessage(sessionId, messageContent);
      
      setIsTyping(false);
      
      // Adicionar resposta do bot
      const botMessage = {
        id: Date.now() + 1,
        content: response.message,
        isBot: true,
        timestamp: new Date(),
        step: response.step,
        collectedData: response.collectedData
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Verificar se a conversa foi concluída
      if (response.isCompleted) {
        setIsCompleted(true);
        console.log('✅ Conversa concluída. Dados coletados:', response.collectedData);
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setIsTyping(false);
      setError('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const resetChat = async () => {
    try {
      setMessages([]);
      setSessionId(null);
      setIsCompleted(false);
      setError(null);
      await initializeChat();
    } catch (error) {
      console.error('❌ Erro ao reiniciar chat:', error);
      setError('Erro ao reiniciar conversa.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    } z-50`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistente Virtual</h3>
            <p className="text-xs text-blue-100">
              {isCompleted ? 'Conversa concluída' : 'Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isCompleted && (
            <button
              onClick={resetChat}
              className="p-1 hover:bg-blue-500 rounded transition-colors"
              title="Reiniciar conversa"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-blue-500 rounded transition-colors"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 h-[480px]">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bot className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600">Iniciando conversa...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message.content}
                    isBot={message.isBot}
                    timestamp={message.timestamp}
                  />
                ))}
                
                {isTyping && (
                  <MessageBubble isBot={true} isTyping={true} />
                )}
                
                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
                    <p className="text-sm font-semibold">✅ Pré-entrevista concluída!</p>
                    <p className="text-xs mt-1">Seu perfil foi atualizado e você receberá sugestões de vagas personalizadas.</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {sessionId && !isCompleted && (
            <ChatInput
              onSendMessage={sendMessage}
              disabled={isLoading || isTyping}
              placeholder={isTyping ? "O assistente está digitando..." : "Digite sua resposta..."}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatBot;

