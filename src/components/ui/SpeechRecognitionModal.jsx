import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

const SpeechRecognitionModal = ({ isOpen, onClose, onTranscriptionComplete, questionText }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="modal" style={{ display: isOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <p>Seu navegador não suporta reconhecimento de fala.</p>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    );
  }

  const startListening = () => {
    resetTranscript();
    setFinalTranscript('');
    setIsRecording(true);
  };

  const stopListening = () => {
    setIsRecording(false);
    setFinalTranscript(transcript);
  };

  const handleConfirm = () => {
    if (finalTranscript.trim()) {
      onTranscriptionComplete(finalTranscript);
      resetTranscript();
      setFinalTranscript('');
      onClose();
    }
  };

  const handleClear = () => {
    resetTranscript();
    setFinalTranscript('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Cabeçalho */}
        <h2 style={{
          margin: '0 0 10px 0',
          fontSize: '22px',
          fontWeight: '600',
          color: '#333'
        }}>
          Fale sua resposta
        </h2>

        {/* Pergunta */}
        <p style={{
          color: '#666',
          fontSize: '14px',
          marginBottom: '20px',
          backgroundColor: '#f5f5f5',
          padding: '12px',
          borderRadius: '8px',
          borderLeft: '4px solid #007bff'
        }}>
          <strong>Pergunta:</strong> {questionText}
        </p>

        {/* Status de Escuta */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: listening ? '#e3f2fd' : '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {listening ? (
            <>
              <div style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: '#ff4444',
                borderRadius: '50%',
                marginRight: '8px',
                animation: 'pulse 1.5s infinite'
              }} />
              <span style={{ color: '#d32f2f', fontWeight: '600' }}>🎤 Escutando...</span>
            </>
          ) : (
            <span style={{ color: '#666' }}>Pronto para começar</span>
          )}
        </div>

        {/* Área de Transcrição */}
        <div style={{
          minHeight: '120px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          border: '2px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#333',
          overflowY: 'auto',
          maxHeight: '200px'
        }}>
          {finalTranscript || transcript || <span style={{ color: '#999' }}>Sua transcrição aparecerá aqui...</span>}
        </div>

        {/* Indicador Live */}
        {listening && transcript && (
          <div style={{
            fontSize: '13px',
            color: '#1976d2',
            marginBottom: '15px',
            fontStyle: 'italic'
          }}>
            ✨ Transcrevendo em tempo real...
          </div>
        )}

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={isRecording ? stopListening : startListening}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: isRecording ? '#ff9800' : '#4CAF50',
              color: 'white',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = isRecording ? '#f57c00' : '#45a049';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = isRecording ? '#ff9800' : '#4CAF50';
            }}
          >
            {isRecording ? '⏹️ Parar Gravação' : '🎤 Iniciar Gravação'}
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: '#666',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
            }}
          >
            🔄 Limpar
          </button>
        </div>

        {/* Botões Finais */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '15px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: '#666'
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={!finalTranscript && !transcript}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: finalTranscript || transcript ? 'pointer' : 'not-allowed',
              backgroundColor: finalTranscript || transcript ? '#2196F3' : '#ccc',
              color: 'white'
            }}
          >
            ✅ Confirmar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default SpeechRecognitionModal;
