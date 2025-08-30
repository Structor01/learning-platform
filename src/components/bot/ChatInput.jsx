import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { Send, Loader2, Upload, FileText } from 'lucide-react';

const ChatInput = forwardRef(({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Digite sua mensagem...", 
  actionCommand = null,
  onFileUpload = null
}, ref) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Usar a ref externa se fornecida, ou a local se não
  const inputRef = ref || textareaRef;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isLoading) {
      return;
    }

    const messageToSend = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Restaurar mensagem em caso de erro
      setMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0] && onFileUpload) {
      const file = e.target.files[0];
      setIsLoading(true);
      
      try {
        await onFileUpload(file);
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [inputRef]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Focar no textarea quando estiver habilitado
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, inputRef]);

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={actionCommand === 'send-cv' 
              ? "Digite seu nome completo..." 
              : placeholder}
            disabled={disabled || isLoading}
            className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            rows={1}
          />
        </div>
        
        {actionCommand === 'send-cv' ? (
          // Botão para upload de CV quando actionCommand é 'send-cv'
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
              className="flex-shrink-0 bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Anexar CV</span>
                </>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFileChange(e)}
              accept=".pdf,.doc,.docx"
              className="hidden" 
            />
            <button
              type="submit"
              disabled={!message.trim() || disabled || isLoading}
              className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        ) : (
          // Botão padrão para enviar mensagem
          <button
            type="submit"
            disabled={!message.trim() || disabled || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        )}
      </form>
    </div>
  );
});

export default ChatInput;
