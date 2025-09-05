import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message, isBot, timestamp, isTyping = false }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isTyping) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 mb-4 ${!isBot ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isBot ? 'bg-blue-600' : 'bg-green-600'
      }`}>
        {isBot ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={`max-w-xs lg:max-w-md ${!isBot ? 'text-right' : ''}`}>
        <div className={`rounded-lg px-4 py-3 ${
          isBot 
            ? 'bg-gray-100 text-gray-800' 
            : 'bg-blue-600 text-white'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        
        {timestamp && (
          <p className={`text-xs text-gray-500 mt-1 ${!isBot ? 'text-right' : ''}`}>
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

