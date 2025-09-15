import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  Video,
  TrendingUp,
  MessageCircle,
  Award,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

const InterviewPromptModal = ({
  isOpen,
  onClose,
  onStartInterview,
  onDismissPermanently
}) => {
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      await onStartInterview();
    } finally {
      setIsStarting(false);
    }
  };

  const benefits = [
    {
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      title: "Feedback Personalizado",
      description: "Receba análise detalhada da sua postura e comunicação"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      title: "Melhore suas Habilidades",
      description: "Identifique pontos de melhoria para futuras entrevistas"
    },
    {
      icon: <Award className="w-5 h-5 text-yellow-500" />,
      title: "Certificado de Participação",
      description: "Comprove sua dedicação ao desenvolvimento profissional"
    },
    {
      icon: <Target className="w-5 h-5 text-purple-500" />,
      title: "Prepare-se para o Mercado",
      description: "Pratique cenários reais do mercado de trabalho"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl bg-white border-gray-200 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 rounded-t-lg text-white">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">
                  Pronto para sua Entrevista Simulada?
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  Desenvolva suas habilidades de entrevista com feedback personalizado
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Main Message */}
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
                🚀 Acelere seu Desenvolvimento Profissional
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Nossa entrevista simulada utiliza inteligência artificial para analisar
                sua postura, comunicação e respostas, oferecendo feedback detalhado
                para você brilhar em entrevistas reais.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it Works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 mr-2" />
                Como Funciona:
              </h4>
              <ol className="space-y-2 text-xs sm:text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0">1</span>
                  <span><strong>Candidate-se a vagas:</strong> Acesse "Vagas Disponíveis" e se candidate às posições de seu interesse</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0">2</span>
                  <span><strong>Aguarde aprovação:</strong> Suas candidaturas passarão por análise para liberação da entrevista</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0">3</span>
                  <span><strong>Faça a entrevista:</strong> Quando aprovada, o botão "Fazer Entrevista" ficará disponível</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0">4</span>
                  <span><strong>Receba feedback:</strong> Após concluir, você receberá um relatório completo com análise de IA</span>
                </li>
              </ol>
            </div>

            {/* Time Estimate */}
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4 sm:mb-6">
              <Clock className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Duração estimada: 2-5 minutos</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <Button
                onClick={handleStartInterview}
                disabled={isStarting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 sm:py-3 h-auto text-sm sm:text-base"
              >
                {isStarting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5" />
                    <span>Iniciar Entrevista Simulada</span>
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2 sm:py-3 h-auto text-sm sm:text-base"
              >
                Talvez Depois
              </Button>
            </div>

            {/* Dismiss Option */}
            <div className="mt-3 sm:mt-4 text-center">
              <button
                onClick={onDismissPermanently}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Não mostrar novamente
              </button>
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-lg"></div>
        </div>
      </Card>
    </div>
  );
};

export default InterviewPromptModal;