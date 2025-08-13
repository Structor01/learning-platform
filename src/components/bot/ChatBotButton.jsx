import React from 'react';
import { MessageCircle, X } from 'lucide-react';

const ChatBotButton = ({ onClick, isOpen, hasUnreadMessages = false }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 z-40 ${
        isOpen 
          ? 'bg-gray-600 hover:bg-gray-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      title={isOpen ? "Fechar chat" : "Abrir assistente virtual"}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        
        {hasUnreadMessages && !isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      
      {!isOpen && (
        <div className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Assistente Virtual
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </button>
  );
};

export default ChatBotButton;

