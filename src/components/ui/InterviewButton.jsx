import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader, ExternalLink } from 'lucide-react';

const InterviewButton = ({ 
  job, 
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
  buttonText = "Fazer Entrevista",
  candidaturaId = null,
  onInterviewStart,
  onInterviewComplete
}) => {
  const [loading, setLoading] = useState(false);

  // Função para abrir entrevista em nova aba
  const handleStartInterview = async () => {
    if (!job) {
      console.error('❌ Dados da vaga não encontrados');
      return;
    }

    try {
      setLoading(true);
      
      // Callback opcional quando entrevista inicia
      if (onInterviewStart) {
        onInterviewStart(job);
      }

      // Preparar dados para passar via URL
      const jobData = encodeURIComponent(JSON.stringify(job));
      let interviewUrl = `/entrevista?job=${jobData}`;
      
      // Adicionar ID da candidatura se disponível
      if (candidaturaId) {
        interviewUrl += `&candidatura=${candidaturaId}`;
      }

      // Abrir em nova aba
      const newWindow = window.open(interviewUrl, '_blank');
      
      if (!newWindow) {
        // Fallback se popup foi bloqueado
        console.warn('⚠️ Popup bloqueado, redirecionando na mesma aba');
        window.location.href = interviewUrl;
      } else {
        console.log('🎬 Entrevista aberta em nova aba:', job.title);
        
        // Opcional: escutar quando a aba é fechada
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed);
            console.log('📝 Aba de entrevista foi fechada');
            
            // Callback opcional quando entrevista é fechada/completa
            if (onInterviewComplete) {
              onInterviewComplete(null, job);
            }
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Erro ao abrir entrevista:', error);
      alert('❌ Erro ao abrir entrevista. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartInterview}
      disabled={loading}
      variant={variant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <Loader className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Video className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Abrindo...' : buttonText}
      {!loading && <ExternalLink className="h-3 w-3 ml-2 opacity-70" />}
    </Button>
  );
};

export default InterviewButton;

