import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Brain, 
  FileText, 
  Linkedin, 
  MessageSquare,
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InterviewRequirementsModal = ({ 
  isOpen, 
  onClose, 
  validationResult,
  onRetry
}) => {
  const navigate = useNavigate();

  if (!isOpen || !validationResult) return null;

  const { isValid, missingRequirements, details } = validationResult;

  const requirements = [
    {
      id: 'bot',
      name: 'Questionário Inicial (Bot)',
      description: 'Complete o questionário inicial para personalizar sua experiência',
      icon: MessageSquare,
      status: details?.bot,
      action: () => {
        navigate('/chat');
        onClose();
      },
      actionText: 'Completar Bot'
    },
    {
      id: 'disc',
      name: 'Teste DISC',
      description: 'Complete o teste psicológico DISC para análise de perfil',
      icon: Brain,
      status: details?.disc,
      action: () => {
        navigate('/teste-disc');
        onClose();
      },
      actionText: 'Fazer Teste DISC'
    },
    {
      id: 'curriculo',
      name: 'Currículo',
      description: 'Anexe seu currículo para análise pelas empresas',
      icon: FileText,
      status: details?.curriculo,
      action: () => {
        navigate('/profile');
        onClose();
      },
      actionText: 'Anexar Currículo'
    },
    {
      id: 'linkedin',
      name: 'Perfil do LinkedIn',
      description: 'Adicione o link do seu perfil do LinkedIn',
      icon: Linkedin,
      status: details?.linkedin,
      action: () => {
        navigate('/profile');
        onClose();
      },
      actionText: 'Adicionar LinkedIn'
    }
  ];

  const getStatusIcon = (status) => {
    if (status === true) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === false) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === true) {
      return 'border-green-500/20 bg-green-500/5';
    } else if (status === false) {
      return 'border-red-500/20 bg-red-500/5';
    } else {
      return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const completedCount = Object.values(details || {}).filter(status => status === true).length;
  const totalCount = requirements.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isValid ? 'Requisitos Atendidos!' : 'Requisitos Pendentes'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isValid 
                    ? 'Todos os requisitos foram atendidos. Você pode realizar a entrevista!'
                    : 'Complete os requisitos abaixo para realizar entrevistas'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Progresso dos Requisitos</span>
              <span>{completedCount}/{totalCount} completos</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-white">Requisitos Necessários</h4>
            
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                className={`p-4 border rounded-lg transition-all ${getStatusColor(requirement.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <requirement.icon className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-white">{requirement.name}</h5>
                        {getStatusIcon(requirement.status)}
                      </div>
                      <p className="text-gray-400 text-sm">{requirement.description}</p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {requirement.status !== true && (
                    <Button
                      onClick={requirement.action}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 ml-4"
                    >
                      {requirement.actionText}
                      {requirement.id === 'linkedin' ? (
                        <ExternalLink className="h-3 w-3" />
                      ) : (
                        <ArrowRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  
                  {requirement.status === true && (
                    <div className="ml-4 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Completo
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Missing Requirements Summary */}
          {!isValid && missingRequirements.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <h5 className="font-medium text-red-400 mb-2">Requisitos Pendentes:</h5>
              <ul className="space-y-1">
                {missingRequirements.map((requirement, index) => (
                  <li key={index} className="text-red-300 text-sm flex items-center gap-2">
                    <XCircle className="h-3 w-3 flex-shrink-0" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1"
            >
              Fechar
            </Button>
            
            {onRetry && (
              <Button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Verificar Novamente
              </Button>
            )}

            {isValid && (
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                Continuar com Entrevista
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-500/20 rounded">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-300 text-sm">
                  <strong>Por que são necessários?</strong>
                </p>
                <p className="text-blue-200 text-xs mt-1">
                  Estes requisitos ajudam as empresas a te conhecer melhor e criar uma experiência de entrevista personalizada e mais eficaz.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewRequirementsModal;