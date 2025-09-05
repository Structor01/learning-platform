import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ChatBot from './ChatBot';
import ChatBotButton from './ChatBotButton';

const ChatBotContext = createContext();

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot deve ser usado dentro de ChatBotProvider');
  }
  return context;
};

export const ChatBotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user } = useAuth();

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <ChatBotContext.Provider value={{
      isOpen,
      isMinimized,
      openChat,
      closeChat,
      minimizeChat,
      toggleChat
    }}>
      {children}
      
      {/* Renderizar o botão flutuante apenas se o usuário estiver logado */}
      {user && (
        <>
          <ChatBotButton 
            onClick={toggleChat}
            isOpen={isOpen}
          />
          
          <ChatBot
            userId={user.id}
            isOpen={isOpen}
            onClose={closeChat}
            onMinimize={minimizeChat}
            isMinimized={isMinimized}
          />
        </>
      )}
    </ChatBotContext.Provider>
  );
};

